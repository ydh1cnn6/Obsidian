//by 月涟Luvian
//github链接：https://github.com/luvian114/Bangumi-to-obsidian/tree/main
//脚本v2.1可以直接通过Bangumi选择搜索动画 漫画 游戏，进而抓取信息字段。
//参考作者：@Lumos Cuman 永皓yh 风吹走记忆 
//特别鸣谢：@ 鬼头明里单推人 及热心观众
// 感谢 @北漠海 的优化思路及部分代码~
//modify: 莺空_栩白（解决章节目录部分展示不全问题、动画导演概率不展示问题）
//modify: 增加登录检测 + 浏览器跳转 + 粘贴 Cookie 自动提取拼接流程
//modify: Cookie 持久化到 Obsidian 本地存储，重启后无需重新粘贴
//modify: 优先使用 Bangumi 个人访问令牌（Access Token）认证，令牌无效/未配置时回退 Cookie 流程
//modify: 新增批量模式（bangumiBatch）
//modify: HTML 页面请求只走 Cookie，API 请求只走 Token
//modify: getParagraph 双分支：优先 API 已看集合，无则回退 HTML <small>
//modify: ★ 纯 DOM 凭据弹窗
//modify: ★ fetchWatchedEpisodes 路径改为 /v0/users/-/collections/{subject_id}/episodes
//modify: ★ requestGet 合并 COMMON_HEADERS 与 customHeaders
//modify: ★ BangumiMultiSelectDialog 勾选弹窗
//modify: ★ 多选弹窗支持「上一步」返回重选收藏类型；收藏结果缓存避免重复拉取
//modify: ★ 新增 clearToken / clearCookie / setToken / setCookie / setTokenAndCookie 接口
//modify: ★ showCredentials 状态查看页面
//modify: ★ getTokenExpiryInfo 正确区分 expires 是时间戳还是剩余秒数
//modify: ★ Token 即将过期时（<30 天）自动提醒
//modify: ★ debugAuthState 同时输出控制台日志和弹窗状态
//modify: ★ extractBaseInfo 输出 name / name_cn 字段；getAnimeByurl 支持 API 名优先
//modify: ★【本次】token_status 解析 name 字段（应用名），在状态窗口展示

// ========== 存储键名 ==========
const COOKIE_STORAGE_KEY = "bangumi_to_obsidian_user_cookie";
const TOKEN_STORAGE_KEY = "bangumi_to_obsidian_access_token";
const TOKEN_SAVED_AT_KEY = "bangumi_to_obsidian_token_saved_at";

// ========== 模板名常量 ==========
const TEMPLATE_NAME_ANIME = "Bangumi动画批量";

// ========== 默认值常量 ==========
const DEFAULT_SCORE_IF_EMPTY = "";
const TOKEN_WARNING_DAYS = 30;

// ========== 收藏状态映射 ==========
const COLLECTION_TYPE_MAP = {
    1: "想看",
    2: "在看",
    3: "看过",
    4: "搁置",
    5: "抛弃",
};
const COLLECTION_LABEL_TO_TYPE = {
    "想看": 1,
    "在看": 2,
    "看过": 3,
    "搁置": 4,
    "抛弃": 5,
};

const BACK_SIGNAL = "__BANGUMI_BACK__";

// ========== 认证凭据初始化 ==========
let USER_COOKIE = (() => {
    try {
        const saved = app?.loadLocalStorage?.(COOKIE_STORAGE_KEY);
        if (saved && typeof saved === "string" && saved.trim()) return saved.trim();
    } catch (e) {}
    return ``;
})();

let USER_TOKEN = (() => {
    try {
        const saved = app?.loadLocalStorage?.(TOKEN_STORAGE_KEY);
        if (saved && typeof saved === "string" && saved.trim()) return saved.trim();
    } catch (e) {}
    return "";
})();

let TOKEN_SAVED_AT = (() => {
    try {
        const saved = app?.loadLocalStorage?.(TOKEN_SAVED_AT_KEY);
        if (saved && typeof saved === "string" && saved.trim()) {
            return parseInt(saved.trim(), 10) || 0;
        }
    } catch (e) {}
    return 0;
})();

let USER_NAME = "";
let BATCH_ABORT = false;
const ABORT_BTN_ID = "bangumi-batch-abort-btn";
const CRED_DIALOG_ID = "bangumi-credentials-dialog";
const CONFIRM_DIALOG_ID = "bangumi-confirm-dialog";
const MULTISELECT_DIALOG_ID = "bangumi-multiselect-dialog";
const STATUS_DIALOG_ID = "bangumi-status-dialog";

const notice = (msg) => new Notice(msg, 5000);
const log = (msg) => console.log(msg);
const COMMON_HEADERS = {
    "Content-Type": "text/html; charset=utf-8",
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.100.4758.11 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="98", "Google Chrome";v="98"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'no-cors',
    'Sec-Fetch-User': '?1',
    'Sec-Fetch-Dest': 'script',
    'Referer': 'https://bgm.tv/',
    'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
};

module.exports = bangumi;
module.exports.bangumiBatch = bangumiBatch;
module.exports.resetBangumiAuth = resetBangumiAuth;
module.exports.resetBangumiCookie = resetBangumiAuth;
module.exports.updateCookieOnly = updateCookieOnly;
module.exports.updateTokenOnly = updateTokenOnly;
module.exports.ensureBatchCredentials = ensureBatchCredentials;
module.exports.debugAuthState = debugAuthState;
module.exports.clearToken = clearToken;
module.exports.clearCookie = clearCookie;
module.exports.setToken = setToken;
module.exports.setCookie = setCookie;
module.exports.setTokenAndCookie = setTokenAndCookie;
module.exports.showCredentials = showCredentials;

let QuickAdd;
let pageNum = 1;

// ============================== 通用工具函数 ==============================
async function requestGet(url, customHeaders = null) {
    try {
        const finalURL = new URL(url);
        const headers = customHeaders
            ? { ...COMMON_HEADERS, ...customHeaders }
            : { ...COMMON_HEADERS };
        const isApiRequest = finalURL.hostname === 'api.bgm.tv';

        if (isApiRequest) {
            delete headers['Content-Type'];
            if (USER_TOKEN && USER_TOKEN.trim()) {
                headers['Authorization'] = `Bearer ${USER_TOKEN.trim()}`;
                delete headers['Cookie'];
            } else {
                headers['Cookie'] = USER_COOKIE;
            }
        } else {
            headers['Cookie'] = USER_COOKIE;
            delete headers['Authorization'];
        }

        const res = await request({
            url: finalURL.href,
            method: "GET",
            cache: "no-cache",
            headers: headers,
        });
        return res || null;
    } catch (err) {
        log(`请求失败: ${err.message}`);
        notice(`请求失败: ${err.message}`);
        return null;
    }
}

async function requestGetJson(url) {
    const raw = await requestGet(url, { "Accept": "application/json" });
    if (!raw) return null;
    try { return JSON.parse(raw); }
    catch (e) { log(`JSON 解析失败: ${e.message}`); return null; }
}

function parseHtmlToDom(html) {
    if (!html || typeof html !== "string") {
        log("无效的HTML字符串，无法解析DOM");
        return new DOMParser().parseFromString("<html></html>", "text/html");
    }
    const p = new DOMParser();
    return p.parseFromString(html, "text/html");
}

// ============================== 认证相关函数 ==============================
async function validateAccessToken(token) {
    if (!token || !token.trim()) return "";
    try {
        const res = await request({
            url: "https://api.bgm.tv/v0/me",
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token.trim()}`,
                "User-Agent": COMMON_HEADERS["User-Agent"],
                "Accept": "application/json",
            },
        });
        if (!res) return "";
        try {
            const data = JSON.parse(res);
            if (data && data.username) {
                USER_NAME = data.username;
                return data.username;
            }
        } catch (e) {}
        return "";
    } catch (err) {
        log(`Token 校验失败: ${err.message}`);
        return "";
    }
}

async function checkCookieLoginOnly() {
    if (!USER_COOKIE || !USER_COOKIE.trim()) return false;
    return await checkCookieLoginTemp(USER_COOKIE);
}

async function checkCookieLoginTemp(cookieStr) {
    if (!cookieStr || !cookieStr.trim()) return false;
    try {
        const res = await request({
            url: "https://bgm.tv/",
            method: "GET",
            cache: "no-cache",
            headers: { ...COMMON_HEADERS, "Cookie": cookieStr },
        });
        if (!res) return false;
        const doc = parseHtmlToDom(res);
        const hasPanel = !!doc.querySelector('#badgeUserPanel');
        const hasLoginLink = !!doc.querySelector('a[href="/login"]');
        return hasPanel && !hasLoginLink;
    } catch (e) {
        log(`Cookie 校验失败: ${e.message}`);
        return false;
    }
}

async function openBangumiLoginPage() {
    const loginUrl = "https://bgm.tv/login";
    try {
        const { shell } = require('electron');
        await shell.openExternal(loginUrl);
    } catch (e) { window.open(loginUrl, '_blank'); }
}

async function openBangumiTokenPage() {
    const tokenUrl = "https://next.bgm.tv/demo/access-token";
    try {
        const { shell } = require('electron');
        await shell.openExternal(tokenUrl);
    } catch (e) { window.open(tokenUrl, '_blank'); }
}

function isBangumiRelevantCookie(name) {
    if (!name) return false;
    return /^chii_/i.test(name) || /^_tea_/i.test(name);
}

function sanitizeCookieInput(raw) {
    if (!raw) return "";
    let s = String(raw);
    s = s.replace(/^[\s"'`]+|[\s"'`]+$/g, "");
    s = s.replace(/^cookie\s*[:：]\s*/i, "");
    const re = /(chii_[A-Za-z0-9_]+|_tea_[A-Za-z0-9_]+)[=\s\u00a0]+([^\s\u00a0;]+)/g;
    const pairs = [];
    const seen = new Set();
    let m;
    while ((m = re.exec(s)) !== null) {
        const name = m[1];
        const value = m[2];
        if (!isBangumiRelevantCookie(name)) continue;
        if (seen.has(name)) continue;
        seen.add(name);
        pairs.push(`${name}=${value}`);
    }
    return pairs.join("; ");
}

function isValidBangumiCookie(cookieStr) {
    if (!cookieStr) return false;
    return cookieStr.includes("chii_auth=");
}

// ---- Token 到期时间 ----

function buildExpiryDesc(remainingSec, expiryTs, source) {
    const sourceLabel = source === 'api' ? '官方接口' : '估算';
    if (remainingSec <= 0) {
        const d = expiryTs ? new Date(expiryTs).toLocaleDateString() : '';
        return `⚠️ 已过期${d ? `（${d}）` : ''}`;
    }
    const days = Math.floor(remainingSec / 86400);
    const hours = Math.floor((remainingSec % 86400) / 3600);
    const dateStr = expiryTs ? `，到期 ${new Date(expiryTs).toLocaleDateString()}` : '';
    if (days > 0) return `约剩余 ${days} 天 ${hours} 小时（${sourceLabel}${dateStr}）`;
    return `约剩余 ${hours} 小时（${sourceLabel}）`;
}

async function getTokenExpiryInfo(token) {
    const tk = token || USER_TOKEN;
    if (!tk || !tk.trim()) return { ok: false, description: "未设置" };

    try {
        const url = `https://bgm.tv/oauth/token_status?access_token=${encodeURIComponent(tk.trim())}`;
        const res = await request({
            url: url,
            method: "POST",
            headers: {
                "User-Agent": COMMON_HEADERS["User-Agent"],
                "Accept": "application/json",
            },
        });
        if (res) {
            try {
                const data = JSON.parse(res);
                if (data && typeof data.expires === "number") {
                    let remainingSec, expiryTs = null;
                    if (data.expires > 1e9) {
                        remainingSec = data.expires - Math.floor(Date.now() / 1000);
                        expiryTs = data.expires * 1000;
                    } else {
                        remainingSec = data.expires;
                        expiryTs = Date.now() + remainingSec * 1000;
                    }

                    // ★ 解析 info 字段（JSON 字符串）
                    let name = null;
                    let createdAt = null;
                    if (data.info) {
                        try {
                            const infoObj = typeof data.info === "string"
                                ? JSON.parse(data.info)
                                : data.info;
                            if (infoObj) {
                                name = infoObj.name || null;
                                createdAt = infoObj.created_at || null;
                            }
                        } catch (e) {
                            log(`Token info 字段解析失败: ${e.message}`);
                        }
                    }

                    return {
                        ok: true,
                        remainingSec,
                        expiryTs,
                        source: 'api',
                        name,
                        createdAt,
                        userId: data.user_id || null,
                        clientId: data.client_id || null,
                        scope: data.scope || null,
                        description: buildExpiryDesc(remainingSec, expiryTs, 'api'),
                    };
                }
            } catch (e) {
                log(`Token 状态解析失败: ${e.message}`);
            }
        }
    } catch (e) {
        log(`Token 状态 API 查询失败: ${e.message}`);
    }

    if (!TOKEN_SAVED_AT) return { ok: false, description: "未记录保存时间（估算不可用）" };
    const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
    const remainingMs = ONE_YEAR_MS - (Date.now() - TOKEN_SAVED_AT);
    const remainingSec = Math.floor(remainingMs / 1000);
    const expiryTs = TOKEN_SAVED_AT + ONE_YEAR_MS;
    return {
        ok: true,
        remainingSec,
        expiryTs,
        source: 'estimate',
        name: null,
        createdAt: null,
        userId: null,
        clientId: null,
        scope: null,
        description: buildExpiryDesc(remainingSec, expiryTs, 'estimate'),
    };
}

async function getTokenExpiryEstimate(token) {
    const info = await getTokenExpiryInfo(token);
    return info.description;
}

async function checkTokenExpiryWarning() {
    try {
        const info = await getTokenExpiryInfo();
        if (!info.ok) return;
        if (info.remainingSec <= 0) {
            new Notice(`⚠️ Token 估算已过期，请尽快重新生成。\n${info.description}`, 8000);
            return;
        }
        const days = info.remainingSec / 86400;
        if (days < TOKEN_WARNING_DAYS) {
            new Notice(
                `⚠️ Token 剩余不足 ${TOKEN_WARNING_DAYS} 天，建议尽快重新生成。\n${info.description}`,
                8000
            );
        }
    } catch (e) {
        log(`Token 到期提醒检查失败: ${e.message}`);
    }
}

// ============================== 凭据持久化 ==============================
function persistCookie(cookieStr) {
    try { if (app?.saveLocalStorage) app.saveLocalStorage(COOKIE_STORAGE_KEY, cookieStr); }
    catch (e) { log(`保存 Cookie 失败：${e.message}`); }
}

function clearPersistedCookie() {
    try { if (app?.saveLocalStorage) app.saveLocalStorage(COOKIE_STORAGE_KEY, ""); }
    catch (e) { log(`清除 Cookie 失败：${e.message}`); }
}

function persistToken(token) {
    try {
        if (app?.saveLocalStorage) {
            app.saveLocalStorage(TOKEN_STORAGE_KEY, token);
            app.saveLocalStorage(TOKEN_SAVED_AT_KEY, String(Date.now()));
            TOKEN_SAVED_AT = Date.now();
        }
    } catch (e) { log(`保存 Token 失败：${e.message}`); }
}

function clearPersistedToken() {
    try {
        if (app?.saveLocalStorage) {
            app.saveLocalStorage(TOKEN_STORAGE_KEY, "");
            app.saveLocalStorage(TOKEN_SAVED_AT_KEY, "");
            TOKEN_SAVED_AT = 0;
        }
    } catch (e) { log(`清除 Token 失败：${e.message}`); }
}

// ============================== 剪贴板读取 ==============================
function readClipboardTextSync() {
    try {
        const { clipboard } = require('electron');
        if (clipboard && typeof clipboard.readText === 'function') {
            const t = clipboard.readText();
            if (t && t.trim()) return t.trim();
        }
    } catch (e) {}
    return "";
}

// ============================== ★ 通用确认弹窗 ==============================
class BangumiConfirmDialog {
    constructor(options = {}) {
        this.title = options.title || '确认';
        this.message = options.message || '';
        this.confirmText = options.confirmText || '确定';
        this.cancelText = options.cancelText || '取消';
        this.confirmColor = options.confirmColor || '#4caf50';
        this.resolveFn = null;
        this.resolved = false;
        this.overlay = null;
        this.escHandler = null;
    }

    openAndWait() {
        return new Promise((resolve) => {
            this.resolveFn = resolve;
            this.render();
        });
    }

    finish(result) {
        if (this.resolved) return;
        this.resolved = true;
        if (this.escHandler) {
            document.removeEventListener('keydown', this.escHandler);
            this.escHandler = null;
        }
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
        if (this.resolveFn) this.resolveFn(result);
    }

    render() {
        const old = document.getElementById(CONFIRM_DIALOG_ID);
        if (old) old.remove();

        const overlay = document.createElement('div');
        overlay.id = CONFIRM_DIALOG_ID;
        overlay.style.cssText = [
            'position: fixed', 'inset: 0', 'z-index: 999998',
            'background: rgba(0,0,0,0.55)',
            'display: flex', 'align-items: center', 'justify-content: center',
            'font-family: system-ui, -apple-system, "Segoe UI", sans-serif',
        ].join(';');
        this.overlay = overlay;

        const panel = document.createElement('div');
        panel.style.cssText = [
            'background: var(--background-primary, #fff)',
            'color: var(--text-normal, #333)',
            'border-radius: 10px',
            'box-shadow: 0 8px 30px rgba(0,0,0,.35)',
            'padding: 22px 26px',
            'width: 540px',
            'max-width: 92vw',
            'max-height: 88vh',
            'overflow-y: auto',
        ].join(';');
        overlay.appendChild(panel);

        const h2 = document.createElement('h2');
        h2.textContent = this.title;
        h2.style.cssText = 'margin: 0 0 14px 0;';
        panel.appendChild(h2);

        const msg = document.createElement('div');
        msg.style.cssText = 'white-space: pre-wrap; line-height: 1.65; font-size: 0.95em; margin: 0 0 22px 0;';
        msg.textContent = this.message;
        panel.appendChild(msg);

        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display: flex; justify-content: flex-end; gap: 10px;';

        const cancelBtn = this._makeButton(this.cancelText, () => this.finish(false), '#757575');
        btnRow.appendChild(cancelBtn);

        const confirmBtn = this._makeButton(this.confirmText, () => this.finish(true), this.confirmColor);
        confirmBtn.style.fontWeight = '600';
        btnRow.appendChild(confirmBtn);

        panel.appendChild(btnRow);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.finish(false);
        });

        this.escHandler = (e) => {
            if (e.key === 'Escape') this.finish(false);
        };
        document.addEventListener('keydown', this.escHandler);

        document.body.appendChild(overlay);

        setTimeout(() => {
            try { confirmBtn.focus(); } catch (e) {}
        }, 50);
    }

    _makeButton(text, onClick, bgColor) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.style.cssText = [
            'padding: 8px 20px', 'cursor: pointer',
            'border-radius: 6px',
            `background: ${bgColor}`,
            'color: #fff',
            'border: none',
            'font-size: 0.92em',
        ].join(';');
        btn.onmouseenter = () => { btn.style.opacity = '0.88'; };
        btn.onmouseleave = () => { btn.style.opacity = '1'; };
        btn.onclick = onClick;
        return btn;
    }
}

// ============================== ★ 多选弹窗 ==============================
class BangumiMultiSelectDialog {
    constructor(options = {}) {
        this.title = options.title || '选择';
        this.message = options.message || '';
        this.items = options.items || [];
        this.confirmText = options.confirmText || '确定';
        this.cancelText = options.cancelText || '取消';
        this.backButtonText = options.backButtonText || '';
        this.confirmColor = options.confirmColor || '#4caf50';
        this.selected = new Set(this.items.map(it => it.id));
        this.resolveFn = null;
        this.resolved = false;
        this.overlay = null;
        this.escHandler = null;
        this.countEl = null;
        this.checkboxEls = null;
    }

    openAndWait() {
        return new Promise((resolve) => {
            this.resolveFn = resolve;
            this.render();
        });
    }

    finish(result) {
        if (this.resolved) return;
        this.resolved = true;
        if (this.escHandler) {
            document.removeEventListener('keydown', this.escHandler);
            this.escHandler = null;
        }
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
        if (this.resolveFn) this.resolveFn(result);
    }

    updateCount() {
        if (this.countEl) {
            this.countEl.textContent = `已选 ${this.selected.size} / ${this.items.length}`;
        }
    }

    _refreshCheckboxes() {
        if (!this.checkboxEls) return;
        for (const [id, cb] of this.checkboxEls) {
            cb.checked = this.selected.has(id);
        }
    }

    render() {
        const old = document.getElementById(MULTISELECT_DIALOG_ID);
        if (old) old.remove();

        const overlay = document.createElement('div');
        overlay.id = MULTISELECT_DIALOG_ID;
        overlay.style.cssText = [
            'position: fixed', 'inset: 0', 'z-index: 999998',
            'background: rgba(0,0,0,0.55)',
            'display: flex', 'align-items: center', 'justify-content: center',
            'font-family: system-ui, -apple-system, "Segoe UI", sans-serif',
        ].join(';');
        this.overlay = overlay;

        const panel = document.createElement('div');
        panel.style.cssText = [
            'background: var(--background-primary, #fff)',
            'color: var(--text-normal, #333)',
            'border-radius: 10px',
            'box-shadow: 0 8px 30px rgba(0,0,0,.35)',
            'padding: 22px 26px',
            'width: 600px',
            'max-width: 92vw',
            'max-height: 88vh',
            'display: flex', 'flex-direction: column',
        ].join(';');
        overlay.appendChild(panel);

        const h2 = document.createElement('h2');
        h2.textContent = this.title;
        h2.style.cssText = 'margin: 0 0 10px 0;';
        panel.appendChild(h2);

        if (this.message) {
            const msg = document.createElement('div');
            msg.textContent = this.message;
            msg.style.cssText = 'color: var(--text-muted, #888); font-size: 0.9em; margin: 0 0 12px 0; line-height: 1.5;';
            panel.appendChild(msg);
        }

        const toolbar = document.createElement('div');
        toolbar.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex: 0 0 auto;';

        const selectAllBtn = this._makeSmallButton('全选', () => {
            this.selected = new Set(this.items.map(it => it.id));
            this._refreshCheckboxes();
            this.updateCount();
        });
        toolbar.appendChild(selectAllBtn);

        const deselectAllBtn = this._makeSmallButton('全不选', () => {
            this.selected.clear();
            this._refreshCheckboxes();
            this.updateCount();
        });
        toolbar.appendChild(deselectAllBtn);

        const invertBtn = this._makeSmallButton('反选', () => {
            const newSelected = new Set();
            for (const it of this.items) {
                if (!this.selected.has(it.id)) newSelected.add(it.id);
            }
            this.selected = newSelected;
            this._refreshCheckboxes();
            this.updateCount();
        });
        toolbar.appendChild(invertBtn);

        const countEl = document.createElement('div');
        countEl.style.cssText = 'margin-left: auto; color: var(--text-muted, #888); font-size: 0.9em;';
        countEl.textContent = `已选 ${this.selected.size} / ${this.items.length}`;
        this.countEl = countEl;
        toolbar.appendChild(countEl);

        panel.appendChild(toolbar);

        const listBox = document.createElement('div');
        listBox.style.cssText = [
            'flex: 1 1 auto',
            'overflow-y: auto',
            'border: 1px solid var(--background-modifier-border, #ccc)',
            'border-radius: 6px',
            'padding: 6px 8px',
            'margin-bottom: 16px',
            'min-height: 160px',
            'max-height: 55vh',
            'background: var(--background-secondary, #f8f8f8)',
        ].join(';');
        this.listBox = listBox;

        this.checkboxEls = new Map();
        for (const it of this.items) {
            const row = document.createElement('label');
            row.style.cssText = [
                'display: flex', 'align-items: center', 'gap: 8px',
                'padding: 6px 8px', 'border-radius: 4px', 'cursor: pointer',
                'font-size: 0.92em',
            ].join(';');
            row.onmouseenter = () => { row.style.background = 'var(--background-modifier-hover, #eee)'; };
            row.onmouseleave = () => { row.style.background = 'transparent'; };

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = true;
            cb.style.cssText = 'cursor: pointer; flex: 0 0 auto;';
            cb.onchange = () => {
                if (cb.checked) this.selected.add(it.id);
                else this.selected.delete(it.id);
                this.updateCount();
            };
            row.appendChild(cb);

            const label = document.createElement('span');
            label.textContent = it.label;
            label.style.cssText = 'flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
            label.title = it.label;
            row.appendChild(label);

            this.checkboxEls.set(it.id, cb);
            listBox.appendChild(row);
        }

        panel.appendChild(listBox);

        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; gap: 10px; flex: 0 0 auto;';

        const leftGroup = document.createElement('div');
        leftGroup.style.cssText = 'display: flex; gap: 10px;';

        if (this.backButtonText) {
            const backBtn = this._makeButton(this.backButtonText, () => this.finish(BACK_SIGNAL), '#607d8b');
            leftGroup.appendChild(backBtn);
        }

        btnRow.appendChild(leftGroup);

        const rightGroup = document.createElement('div');
        rightGroup.style.cssText = 'display: flex; gap: 10px;';

        const cancelBtn = this._makeButton(this.cancelText, () => this.finish(null), '#757575');
        rightGroup.appendChild(cancelBtn);

        const confirmBtn = this._makeButton(this.confirmText, () => {
            this.finish(Array.from(this.selected));
        }, this.confirmColor);
        confirmBtn.style.fontWeight = '600';
        rightGroup.appendChild(confirmBtn);

        btnRow.appendChild(rightGroup);
        panel.appendChild(btnRow);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.finish(null);
        });

        this.escHandler = (e) => {
            if (e.key === 'Escape') this.finish(null);
        };
        document.addEventListener('keydown', this.escHandler);

        document.body.appendChild(overlay);

        setTimeout(() => {
            try { confirmBtn.focus(); } catch (e) {}
        }, 50);
    }

    _makeSmallButton(text, onClick) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.style.cssText = [
            'padding: 5px 12px', 'cursor: pointer',
            'border-radius: 5px',
            'background: var(--background-secondary, #eee)',
            'color: var(--text-normal, #333)',
            'border: 1px solid var(--background-modifier-border, #ccc)',
            'font-size: 0.85em',
        ].join(';');
        btn.onmouseenter = () => { btn.style.background = 'var(--background-modifier-hover, #ddd)'; };
        btn.onmouseleave = () => { btn.style.background = 'var(--background-secondary, #eee)'; };
        btn.onclick = onClick;
        return btn;
    }

    _makeButton(text, onClick, bgColor) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.style.cssText = [
            'padding: 8px 20px', 'cursor: pointer',
            'border-radius: 6px',
            `background: ${bgColor}`,
            'color: #fff',
            'border: none',
            'font-size: 0.92em',
        ].join(';');
        btn.onmouseenter = () => { btn.style.opacity = '0.88'; };
        btn.onmouseleave = () => { btn.style.opacity = '1'; };
        btn.onclick = onClick;
        return btn;
    }
}

// ============================== ★ 凭据弹窗 ==============================
class BangumiCredentialsDialog {
    constructor(options = {}) {
        this.requireBoth = options.requireBoth !== false;
        this.focusField = options.focusField || 'auto';
        this.resolveFn = null;
        this.resolved = false;
        this.tokenValid = false;
        this.cookieValid = false;
        this.tokenUsername = "";
        this.overlay = null;
        this.tokenInputEl = null;
        this.cookieInputEl = null;
        this.tokenStatusEl = null;
        this.cookieStatusEl = null;
        this.escHandler = null;
    }

    openAndWait() {
        return new Promise((resolve) => {
            this.resolveFn = resolve;
            this.render();
        });
    }

    finish(result) {
        if (this.resolved) return;
        this.resolved = true;
        if (this.escHandler) {
            document.removeEventListener('keydown', this.escHandler);
            this.escHandler = null;
        }
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
        if (this.resolveFn) this.resolveFn(result);
    }

    render() {
        const old = document.getElementById(CRED_DIALOG_ID);
        if (old) old.remove();

        const overlay = document.createElement('div');
        overlay.id = CRED_DIALOG_ID;
        overlay.style.cssText = [
            'position: fixed', 'inset: 0', 'z-index: 999998',
            'background: rgba(0,0,0,0.55)',
            'display: flex', 'align-items: center', 'justify-content: center',
            'font-family: system-ui, -apple-system, "Segoe UI", sans-serif',
        ].join(';');
        this.overlay = overlay;

        const panel = document.createElement('div');
        panel.style.cssText = [
            'background: var(--background-primary, #fff)',
            'color: var(--text-normal, #333)',
            'border-radius: 10px',
            'box-shadow: 0 8px 30px rgba(0,0,0,.35)',
            'padding: 22px 26px',
            'width: 620px',
            'max-width: 92vw',
            'max-height: 88vh',
            'overflow-y: auto',
        ].join(';');
        overlay.appendChild(panel);

        const h2 = document.createElement('h2');
        h2.textContent = '🔐 Bangumi 凭据';
        h2.style.cssText = 'margin: 0 0 12px 0;';
        panel.appendChild(h2);

        const info = document.createElement('p');
        info.textContent = this.requireBoth
            ? '需要 Token 和 Cookie 同时有效才能继续。'
            : '需要至少一项凭据有效（建议两者都配置）。';
        info.style.cssText = 'color: var(--text-muted, #888); font-size: 0.9em; margin: 0 0 16px 0;';
        panel.appendChild(info);

        // Token 区
        const tokenSec = document.createElement('div');
        tokenSec.style.marginBottom = '16px';
        const tokenLabel = document.createElement('div');
        tokenLabel.textContent = 'Access Token';
        tokenLabel.style.cssText = 'font-weight: 600; margin-bottom: 6px;';
        tokenSec.appendChild(tokenLabel);

        const tokenRow = document.createElement('div');
        tokenRow.style.cssText = 'display: flex; gap: 8px;';

        const tokenInput = document.createElement('input');
        tokenInput.type = 'text';
        tokenInput.value = USER_TOKEN || '';
        tokenInput.placeholder = '在此粘贴 Access Token';
        tokenInput.style.cssText = [
            'flex: 1', 'padding: 7px 9px',
            'border-radius: 6px',
            'border: 1px solid var(--background-modifier-border, #ccc)',
            'background: var(--background-modifier-form-field, var(--background-primary, #fff))',
            'color: var(--text-normal, #333)',
            'font-size: 0.9em',
        ].join(';');
        this.tokenInputEl = tokenInput;
        tokenRow.appendChild(tokenInput);

        const tokenCheckBtn = this._makeButton('校验', async () => await this.checkToken(), '#2196f3');
        tokenRow.appendChild(tokenCheckBtn);

        const tokenOpenBtn = this._makeButton('🔗 获取', () => openBangumiTokenPage(), '#607d8b');
        tokenRow.appendChild(tokenOpenBtn);

        tokenSec.appendChild(tokenRow);

        const tokenStatus = document.createElement('div');
        tokenStatus.style.cssText = 'font-size: 0.85em; margin-top: 5px; color: var(--text-muted, #888);';
        this.tokenStatusEl = tokenStatus;
        if (USER_TOKEN) {
            tokenStatus.textContent = `已保存 | 正在查询到期时间…`;
            getTokenExpiryInfo().then(info => {
                if (this.tokenStatusEl === tokenStatus) {
                    const parts = [`已保存`];
                    if (info.name) parts.push(`应用：${info.name}`);
                    parts.push(info.description);
                    tokenStatus.textContent = parts.join(' | ');
                }
            }).catch(() => {
                if (this.tokenStatusEl === tokenStatus) {
                    tokenStatus.textContent = `已保存`;
                }
            });
        } else {
            tokenStatus.textContent = '未设置';
        }
        tokenSec.appendChild(tokenStatus);

        panel.appendChild(tokenSec);

        // Cookie 区
        const cookieSec = document.createElement('div');
        cookieSec.style.marginBottom = '16px';
        const cookieLabel = document.createElement('div');
        cookieLabel.textContent = 'Cookie';
        cookieLabel.style.cssText = 'font-weight: 600; margin-bottom: 6px;';
        cookieSec.appendChild(cookieLabel);

        const cookieRow = document.createElement('div');
        cookieRow.style.cssText = 'display: flex; gap: 8px; align-items: flex-start;';

        const cookieInput = document.createElement('textarea');
        cookieInput.value = USER_COOKIE || '';
        cookieInput.placeholder = 'chii_auth=...; chii_sec_id=...; chii_sid=...';
        cookieInput.style.cssText = [
            'flex: 1', 'padding: 7px 9px', 'min-height: 76px',
            'border-radius: 6px',
            'border: 1px solid var(--background-modifier-border, #ccc)',
            'background: var(--background-modifier-form-field, var(--background-primary, #fff))',
            'color: var(--text-normal, #333)',
            'font-family: monospace', 'font-size: 0.82em',
            'resize: vertical',
        ].join(';');
        this.cookieInputEl = cookieInput;
        cookieRow.appendChild(cookieInput);

        const cookieBtnCol = document.createElement('div');
        cookieBtnCol.style.cssText = 'display: flex; flex-direction: column; gap: 6px;';

        const cookieCheckBtn = this._makeButton('校验', async () => await this.checkCookie(), '#2196f3');
        cookieBtnCol.appendChild(cookieCheckBtn);

        const cookieOpenBtn = this._makeButton('🔗 获取', () => openBangumiLoginPage(), '#607d8b');
        cookieBtnCol.appendChild(cookieOpenBtn);

        cookieRow.appendChild(cookieBtnCol);
        cookieSec.appendChild(cookieRow);

        const cookieStatus = document.createElement('div');
        cookieStatus.style.cssText = 'font-size: 0.85em; margin-top: 5px; color: var(--text-muted, #888);';
        cookieStatus.textContent = USER_COOKIE ? '已保存' : '未设置';
        this.cookieStatusEl = cookieStatus;
        cookieSec.appendChild(cookieStatus);

        panel.appendChild(cookieSec);

        // 按钮区
        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'margin-top: 22px; display: flex; justify-content: flex-end; gap: 10px;';

        const cancelBtn = this._makeButton('取消', () => this.finish(false), '#757575', true);
        btnRow.appendChild(cancelBtn);

        const saveBtn = this._makeButton('保存并继续', async () => await this.saveAndContinue(), '#4caf50', true);
        saveBtn.style.fontWeight = '600';
        btnRow.appendChild(saveBtn);

        panel.appendChild(btnRow);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.finish(false);
        });

        this.escHandler = (e) => {
            if (e.key === 'Escape') this.finish(false);
        };
        document.addEventListener('keydown', this.escHandler);

        document.body.appendChild(overlay);

        setTimeout(() => {
            try {
                if (this.focusField === 'token') tokenInput.focus();
                else if (this.focusField === 'cookie') cookieInput.focus();
                else {
                    if (!USER_TOKEN) tokenInput.focus();
                    else if (!USER_COOKIE) cookieInput.focus();
                }
            } catch (e) {}
        }, 50);
    }

    _makeButton(text, onClick, bgColor, outlined = false) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.style.cssText = [
            'padding: 7px 14px', 'cursor: pointer',
            'border-radius: 6px',
            `background: ${bgColor}`,
            'color: #fff',
            'border: none',
            'font-size: 0.88em',
        ].join(';');
        if (outlined) btn.style.padding = '7px 18px';
        btn.onmouseenter = () => { btn.style.opacity = '0.88'; };
        btn.onmouseleave = () => { btn.style.opacity = '1'; };
        btn.onclick = onClick;
        return btn;
    }

    async checkToken() {
        const token = this.tokenInputEl.value.trim();
        if (!token) {
            this.tokenStatusEl.textContent = '未填写';
            this.tokenValid = false;
            new Notice('Token 未填写', 3000);
            return false;
        }
        this.tokenStatusEl.textContent = '正在校验…';
        const username = await validateAccessToken(token);
        if (username) {
            this.tokenValid = true;
            this.tokenUsername = username;
            const info = await getTokenExpiryInfo(token);
            const parts = [`✅ 有效（用户：${username}）`];
            if (info.name) parts.push(`应用：${info.name}`);
            parts.push(info.description);
            this.tokenStatusEl.textContent = parts.join(' | ');
            new Notice(`Token 校验通过 ✅ 用户：${username}\n${info.description}`, 4000);
            return true;
        }
        this.tokenValid = false;
        this.tokenStatusEl.textContent = '❌ 无效';
        new Notice('Token 校验失败 ❌', 4000);
        return false;
    }

    async checkCookie() {
        const raw = this.cookieInputEl.value.trim();
        if (!raw) {
            this.cookieStatusEl.textContent = '未填写';
            this.cookieValid = false;
            new Notice('Cookie 未填写', 3000);
            return false;
        }
        const cleaned = sanitizeCookieInput(raw);
        if (!isValidBangumiCookie(cleaned)) {
            this.cookieStatusEl.textContent = '❌ 缺少 chii_auth';
            this.cookieValid = false;
            new Notice('Cookie 缺少 chii_auth 字段 ❌', 4000);
            return false;
        }
        this.cookieStatusEl.textContent = '正在校验…';
        const ok = await checkCookieLoginTemp(cleaned);
        if (ok) {
            this.cookieValid = true;
            this.cookieStatusEl.textContent = '✅ 有效';
            new Notice('Cookie 校验通过 ✅', 4000);
            return true;
        }
        this.cookieValid = false;
        this.cookieStatusEl.textContent = '❌ 无效';
        new Notice('Cookie 校验失败 ❌', 4000);
        return false;
    }

    async saveAndContinue() {
        const token = this.tokenInputEl.value.trim();
        const rawCookie = this.cookieInputEl.value.trim();

        new Notice('正在校验并保存…', 2500);

        if (token) {
            const username = await validateAccessToken(token);
            this.tokenValid = !!username;
            if (this.tokenValid) this.tokenUsername = username;
        } else {
            this.tokenValid = false;
        }

        const cleanedCookie = rawCookie ? sanitizeCookieInput(rawCookie) : "";
        if (cleanedCookie && isValidBangumiCookie(cleanedCookie)) {
            this.cookieValid = await checkCookieLoginTemp(cleanedCookie);
        } else {
            this.cookieValid = false;
        }

        if (this.tokenStatusEl) {
            this.tokenStatusEl.textContent = this.tokenValid
                ? `✅ 有效（用户：${this.tokenUsername}）`
                : (token ? '❌ 无效' : '未填写');
        }
        if (this.cookieStatusEl) {
            this.cookieStatusEl.textContent = this.cookieValid
                ? '✅ 有效'
                : (rawCookie ? '❌ 无效' : '未填写');
        }

        const ok = this.requireBoth
            ? (this.tokenValid && this.cookieValid)
            : (this.tokenValid || this.cookieValid);

        if (!ok) {
            const msg = this.requireBoth
                ? '需要 Token 和 Cookie 同时有效。'
                : '需要至少一项凭据有效。';
            new Notice(
                `${msg}\nToken：${this.tokenValid ? '✅' : '❌'}\nCookie：${this.cookieValid ? '✅' : '❌'}`,
                6000
            );
            return;
        }

        if (this.tokenValid && token) {
            USER_TOKEN = token;
            USER_NAME = this.tokenUsername;
            persistToken(token);
        }
        if (this.cookieValid && cleanedCookie) {
            USER_COOKIE = cleanedCookie;
            persistCookie(cleanedCookie);
        }

        const parts = [];
        if (this.tokenValid) parts.push(`Token ✅（${this.tokenUsername}）`);
        if (this.cookieValid) parts.push('Cookie ✅');
        new Notice(`凭据已保存：${parts.join(' | ')}`, 5000);

        this.finish(true);
    }
}

// ============================== ★ 状态查看弹窗 ==============================
class BangumiStatusDialog {
    constructor(options = {}) {
        this.resolveFn = null;
        this.resolved = false;
        this.overlay = null;
        this.escHandler = null;
    }

    openAndWait() {
        return new Promise((resolve) => {
            this.resolveFn = resolve;
            this.render();
        });
    }

    finish(result) {
        if (this.resolved) return;
        this.resolved = true;
        if (this.escHandler) {
            document.removeEventListener('keydown', this.escHandler);
            this.escHandler = null;
        }
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
        if (this.resolveFn) this.resolveFn(result);
    }

    render() {
        const old = document.getElementById(STATUS_DIALOG_ID);
        if (old) old.remove();

        const overlay = document.createElement('div');
        overlay.id = STATUS_DIALOG_ID;
        overlay.style.cssText = [
            'position: fixed', 'inset: 0', 'z-index: 999998',
            'background: rgba(0,0,0,0.55)',
            'display: flex', 'align-items: center', 'justify-content: center',
            'font-family: system-ui, -apple-system, "Segoe UI", sans-serif',
        ].join(';');
        this.overlay = overlay;

        const panel = document.createElement('div');
        panel.style.cssText = [
            'background: var(--background-primary, #fff)',
            'color: var(--text-normal, #333)',
            'border-radius: 10px',
            'box-shadow: 0 8px 30px rgba(0,0,0,.35)',
            'padding: 22px 26px',
            'width: 620px',
            'max-width: 92vw',
            'max-height: 88vh',
            'overflow-y: auto',
        ].join(';');
        overlay.appendChild(panel);

        const h2 = document.createElement('h2');
        h2.textContent = '📋 Bangumi 凭据状态';
        h2.style.cssText = 'margin: 0 0 14px 0;';
        panel.appendChild(h2);

        // Token 状态
        const tokenSec = document.createElement('div');
        tokenSec.style.cssText = [
            'padding: 12px 14px',
            'background: var(--background-secondary, #f8f8f8)',
            'border-radius: 8px',
            'margin-bottom: 12px',
        ].join(';');

        const tokenTitle = document.createElement('div');
        tokenTitle.textContent = '🔑 Access Token';
        tokenTitle.style.cssText = 'font-weight: 600; margin-bottom: 8px;';
        tokenSec.appendChild(tokenTitle);

        const tokenInfoEl = document.createElement('div');
        tokenInfoEl.style.cssText = 'font-size: 0.9em; line-height: 1.7;';
        tokenInfoEl.textContent = '查询中…';
        tokenSec.appendChild(tokenInfoEl);

        panel.appendChild(tokenSec);

        // Cookie 状态
        const cookieSec = document.createElement('div');
        cookieSec.style.cssText = [
            'padding: 12px 14px',
            'background: var(--background-secondary, #f8f8f8)',
            'border-radius: 8px',
            'margin-bottom: 16px',
        ].join(';');

        const cookieTitle = document.createElement('div');
        cookieTitle.textContent = '🍪 Cookie';
        cookieTitle.style.cssText = 'font-weight: 600; margin-bottom: 8px;';
        cookieSec.appendChild(cookieTitle);

        const cookieInfoEl = document.createElement('div');
        cookieInfoEl.style.cssText = 'font-size: 0.9em; line-height: 1.7;';
        cookieInfoEl.textContent = '查询中…';
        cookieSec.appendChild(cookieInfoEl);

        panel.appendChild(cookieSec);

        // 按钮区
        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display: flex; justify-content: space-between; gap: 10px;';

        const leftGroup = document.createElement('div');
        leftGroup.style.cssText = 'display: flex; gap: 10px;';

        const editBtn = this._makeButton('✏️ 编辑凭据', () => {
            this.finish('edit');
        }, '#2196f3');
        leftGroup.appendChild(editBtn);

        const refreshBtn = this._makeButton('🔄 刷新', () => {
            this.finish('refresh');
        }, '#607d8b');
        leftGroup.appendChild(refreshBtn);

        btnRow.appendChild(leftGroup);

        const closeBtn = this._makeButton('关闭', () => {
            this.finish('close');
        }, '#757575');
        btnRow.appendChild(closeBtn);

        panel.appendChild(btnRow);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.finish('close');
        });

        this.escHandler = (e) => {
            if (e.key === 'Escape') this.finish('close');
        };
        document.addEventListener('keydown', this.escHandler);

        document.body.appendChild(overlay);

        (async () => {
            if (USER_TOKEN && USER_TOKEN.trim()) {
                const username = await validateAccessToken(USER_TOKEN);
                const expiryInfo = await getTokenExpiryInfo();
                const tokenDisplay = USER_TOKEN.slice(0, 8) + "..." + USER_TOKEN.slice(-6);

                tokenInfoEl.innerHTML = '';
                tokenInfoEl.appendChild(this._makeLine('状态', username ? `✅ 有效` : `❌ 无效`));
                if (username) {
                    tokenInfoEl.appendChild(this._makeLine('用户', username));
                }
                // ★ 新增：应用名
                if (expiryInfo.name) {
                    tokenInfoEl.appendChild(this._makeLine('应用', expiryInfo.name));
                }
				// ★ 新增：Token 创建时间
				if (expiryInfo.createdAt) {
					const createdStr = (() => {
						try { return new Date(expiryInfo.createdAt).toLocaleString(); }
						catch (e) { return expiryInfo.createdAt; }
					})();
					tokenInfoEl.appendChild(this._makeLine('创建', createdStr));
				}
                // client_id
                if (expiryInfo.clientId) {
                    tokenInfoEl.appendChild(this._makeLine('Client ID', String(expiryInfo.clientId)));
                }
                // scope
                if (expiryInfo.scope) {
                    tokenInfoEl.appendChild(this._makeLine('Scope', String(expiryInfo.scope)));
                }

                const expiryLine = this._makeLine('到期', expiryInfo.description);
                if (expiryInfo.ok) {
                    const days = expiryInfo.remainingSec / 86400;
                    if (expiryInfo.remainingSec <= 0) {
                        expiryLine.style.color = '#c62828';
                        expiryLine.style.fontWeight = '600';
                    } else if (days < TOKEN_WARNING_DAYS) {
                        expiryLine.style.color = '#e65100';
                        expiryLine.style.fontWeight = '600';
                    } else {
                        expiryLine.style.color = '#2e7d32';
                    }
                }
                tokenInfoEl.appendChild(expiryLine);
                tokenInfoEl.appendChild(this._makeLine('令牌', tokenDisplay));
            } else {
                tokenInfoEl.textContent = '❌ 未设置';
                tokenInfoEl.style.color = 'var(--text-muted, #888)';
            }

            if (USER_COOKIE && USER_COOKIE.trim()) {
                const ok = await checkCookieLoginOnly();
                const cookieDisplay = USER_COOKIE.length > 60
                    ? USER_COOKIE.slice(0, 60) + "..."
                    : USER_COOKIE;
                cookieInfoEl.innerHTML = '';
                cookieInfoEl.appendChild(this._makeLine('状态', ok ? '✅ 有效' : '❌ 无效'));
                cookieInfoEl.appendChild(this._makeLine('长度', `${USER_COOKIE.length} 字符`));
                const preview = document.createElement('div');
                preview.style.cssText = 'margin-top: 6px; font-family: monospace; font-size: 0.8em; word-break: break-all; color: var(--text-muted, #888);';
                preview.textContent = cookieDisplay;
                cookieInfoEl.appendChild(preview);
            } else {
                cookieInfoEl.textContent = '❌ 未设置';
                cookieInfoEl.style.color = 'var(--text-muted, #888)';
            }
        })();
    }

    _makeLine(label, value) {
        const row = document.createElement('div');
        row.style.cssText = 'display: flex; gap: 10px;';
        const l = document.createElement('span');
        l.textContent = label + '：';
        l.style.cssText = 'color: var(--text-muted, #888); flex: 0 0 auto;';
        row.appendChild(l);
        const v = document.createElement('span');
        v.textContent = value;
        v.style.cssText = 'flex: 1; word-break: break-all;';
        row.appendChild(v);
        return row;
    }

    _makeButton(text, onClick, bgColor) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.style.cssText = [
            'padding: 8px 20px', 'cursor: pointer',
            'border-radius: 6px',
            `background: ${bgColor}`,
            'color: #fff',
            'border: none',
            'font-size: 0.92em',
        ].join(';');
        btn.onmouseenter = () => { btn.style.opacity = '0.88'; };
        btn.onmouseleave = () => { btn.style.opacity = '1'; };
        btn.onclick = onClick;
        return btn;
    }
}

// ============================== ★ 统一凭据保障 ==============================
async function ensureCredentials() {
    let tokenOk = false;
    let cookieOk = false;
    let tokenUsername = "";

    if (USER_TOKEN && USER_TOKEN.trim()) {
        tokenUsername = await validateAccessToken(USER_TOKEN);
        tokenOk = !!tokenUsername;
        if (!tokenOk) {
            clearPersistedToken();
            USER_TOKEN = "";
            USER_NAME = "";
        }
    }

    if (USER_COOKIE && USER_COOKIE.trim()) {
        cookieOk = await checkCookieLoginOnly();
    }

    const tokenPart = tokenOk ? `Token ✅（${tokenUsername}）` : "Token ❌";
    const cookiePart = cookieOk ? "Cookie ✅" : "Cookie ❌";
    new Notice(`凭据校验：${tokenPart} | ${cookiePart}`, 4500);
    log(`[凭据校验] tokenOk=${tokenOk} cookieOk=${cookieOk}`);

    if (tokenOk) {
        await checkTokenExpiryWarning();
        return true;
    }

    log("[凭据校验] Token 无效，弹出凭据输入窗口");
    const dialog = new BangumiCredentialsDialog({ requireBoth: false });
    return await dialog.openAndWait();
}

// ============================== 独立命令 ==============================
async function updateCookieOnly(QuickAddInstance) {
    QuickAdd = QuickAddInstance;
    if (USER_TOKEN && USER_TOKEN.trim()) {
        const username = await validateAccessToken(USER_TOKEN);
        if (username) USER_NAME = username;
        else { clearPersistedToken(); USER_TOKEN = ""; USER_NAME = ""; }
    }
    await openBangumiLoginPage();
    new Notice("已打开登录页。登录后复制 Cookie 回到 Obsidian。", 8000);
    const dialog = new BangumiCredentialsDialog({ requireBoth: false, focusField: 'cookie' });
    const ok = await dialog.openAndWait();
    if (!ok) new Notice("操作已取消。", 4000);
}

async function updateTokenOnly(QuickAddInstance) {
    QuickAdd = QuickAddInstance;
    if (USER_COOKIE && USER_COOKIE.trim()) {
        new Notice("当前已有 Cookie，本次更新会保留。", 4000);
    }
    await openBangumiTokenPage();
    new Notice("已打开 Token 生成页。生成后复制令牌回到 Obsidian。", 8000);
    const dialog = new BangumiCredentialsDialog({ requireBoth: false, focusField: 'token' });
    const ok = await dialog.openAndWait();
    if (!ok) new Notice("操作已取消。", 4000);
}

async function ensureBatchCredentials() {
    return ensureCredentials();
}

// ============================== ★ 独立接口：查看 / 设置 / 清理 ==============================

async function showCredentials() {
    await checkTokenExpiryWarning();

    while (true) {
        const action = await new BangumiStatusDialog().openAndWait();
        if (action === 'edit') {
            const dialog = new BangumiCredentialsDialog({ requireBoth: false });
            await dialog.openAndWait();
            continue;
        }
        if (action === 'refresh') {
            await checkTokenExpiryWarning();
            continue;
        }
        break;
    }
    return true;
}

async function setToken() {
    const dialog = new BangumiCredentialsDialog({
        requireBoth: false,
        focusField: 'token',
    });
    return await dialog.openAndWait();
}

async function setCookie() {
    const dialog = new BangumiCredentialsDialog({
        requireBoth: false,
        focusField: 'cookie',
    });
    return await dialog.openAndWait();
}

async function setTokenAndCookie() {
    const dialog = new BangumiCredentialsDialog({
        requireBoth: false,
        focusField: 'auto',
    });
    return await dialog.openAndWait();
}

async function clearToken() {
    if (!USER_TOKEN || !USER_TOKEN.trim()) {
        new Notice("当前没有保存 Token。", 3000);
        return false;
    }
    const confirmed = await new BangumiConfirmDialog({
        title: '清理 Access Token',
        message: '确定要清除已保存的 Access Token 吗？\n\n清除后下次运行需要重新输入。',
        confirmText: '🗑️ 清除',
        cancelText: '取消',
        confirmColor: '#c62828',
    }).openAndWait();

    if (!confirmed) {
        new Notice("已取消清理。", 3000);
        return false;
    }

    clearPersistedToken();
    USER_TOKEN = "";
    new Notice("✅ 已清除 Access Token。", 4000);
    log("[clearToken] Token 已清除");
    return true;
}

async function clearCookie() {
    if (!USER_COOKIE || !USER_COOKIE.trim()) {
        new Notice("当前没有保存 Cookie。", 3000);
        return false;
    }
    const confirmed = await new BangumiConfirmDialog({
        title: '清理 Cookie',
        message: '确定要清除已保存的 Cookie 吗？\n\n清除后下次运行需要重新输入。',
        confirmText: '🗑️ 清除',
        cancelText: '取消',
        confirmColor: '#c62828',
    }).openAndWait();

    if (!confirmed) {
        new Notice("已取消清理。", 3000);
        return false;
    }

    clearPersistedCookie();
    USER_COOKIE = "";
    new Notice("✅ 已清除 Cookie。", 4000);
    log("[clearCookie] Cookie 已清除");
    return true;
}

// ============================== 调试 ==============================
async function debugAuthState() {
    console.log("=== Bangumi 凭据状态 ===");
    console.log("Token:", USER_TOKEN ? `已设置 (${USER_TOKEN.slice(0, 8)}...)` : "空");
    console.log("Token 保存时间:", TOKEN_SAVED_AT ? new Date(TOKEN_SAVED_AT).toLocaleString() : "未知");
    const info = await getTokenExpiryInfo();
    console.log("Token 过期查询:", info.description);
    if (info.name) console.log("Token 应用名:", info.name);
    if (info.clientId) console.log("Token Client ID:", info.clientId);
    if (info.scope) console.log("Token Scope:", info.scope);
    console.log("Cookie:", USER_COOKIE ? `已设置 (${USER_COOKIE.slice(0, 30)}...)` : "空");
    console.log("USER_NAME:", USER_NAME || "空");
    try {
        const cookieOk = await checkCookieLoginOnly();
        console.log("Cookie 登录态:", cookieOk);
    } catch (e) {
        console.log("Cookie 校验异常:", e.message);
    }

    await showCredentials();

    return {
        hasToken: !!USER_TOKEN,
        hasCookie: !!USER_COOKIE,
        tokenSavedAt: TOKEN_SAVED_AT,
        expiryEstimate: info.description,
        tokenName: info.name,
    };
}

// ============================== 收藏批量拉取 ==============================
async function getCurrentUsername() {
    if (USER_NAME) return USER_NAME;
    if (!USER_TOKEN || !USER_TOKEN.trim()) return "";
    const name = await validateAccessToken(USER_TOKEN);
    return name || "";
}

async function fetchAllCollections(subjectType, collectionType) {
    const username = await getCurrentUsername();
    if (!username) throw new Error("无法获取用户名（批量模式需要有效的 Access Token）");

    const allItems = [];
    const limit = 50;
    let offset = 0;
    let total = Infinity;
    const maxPages = 200;

    for (let page = 0; page < maxPages; page++) {
        if (BATCH_ABORT) break;
        const url = `https://api.bgm.tv/v0/users/${encodeURIComponent(username)}/collections` +
            `?subject_type=${subjectType}&type=${collectionType}&limit=${limit}&offset=${offset}`;
        const data = await requestGetJson(url);
        if (!data) break;
        const items = Array.isArray(data.data) ? data.data : [];
        total = typeof data.total === "number" ? data.total : items.length;
        if (items.length === 0) break;
        allItems.push(...items);
        offset += limit;
        if (items.length < limit || allItems.length >= total) break;
    }
    return allItems;
}

async function fetchWatchedEpisodes(subjectId) {
    const result = new Set();
    if (!subjectId) return result;
    try {
        let offset = 0;
        const limit = 100;
        const maxPages = 50;

        for (let page = 0; page < maxPages; page++) {
            if (BATCH_ABORT) break;

            const url = `https://api.bgm.tv/v0/users/-/collections/${subjectId}/episodes` +
                `?limit=${limit}&offset=${offset}`;

            const data = await requestGetJson(url);
            if (!data) { log(`获取已看剧集失败：API 无响应 subject=${subjectId}`); break; }
            if (!Array.isArray(data.data)) { log(`获取已看剧集失败：返回结构异常 subject=${subjectId}`); break; }

            for (const item of data.data) {
                if (item.type !== 2) continue;
                const ep = item.episode || {};
                if (ep.id   != null) result.add(String(ep.id));
                if (ep.ep   != null) result.add(String(ep.ep));
                if (ep.sort != null) result.add(String(ep.sort));
            }

            offset += limit;
            if (data.data.length < limit) break;
        }
    } catch (e) {
        log(`获取已看剧集失败: ${e.message}`);
    }

    log(`[API已看] subject=${subjectId} 已看集合大小=${result.size}`);
    return result;
}

// ============================== 批量中断按钮 ==============================
function showAbortButton() {
    const old = document.getElementById(ABORT_BTN_ID);
    if (old) old.remove();
    const btn = document.createElement('button');
    btn.id = ABORT_BTN_ID;
    btn.textContent = '⏹ 中断导入';
    btn.style.cssText = [
        'position: fixed', 'right: 24px', 'bottom: 24px', 'z-index: 999999',
        'padding: 12px 18px', 'background: #c62828', 'color: #fff', 'border: none',
        'border-radius: 8px', 'font-size: 15px', 'font-weight: 600', 'cursor: pointer',
        'box-shadow: 0 4px 14px rgba(0,0,0,.35)',
        'font-family: system-ui, -apple-system, "Segoe UI", sans-serif',
    ].join(';');
    btn.onmouseenter = () => (btn.style.background = '#b71c1c');
    btn.onmouseleave = () => (btn.style.background = '#c62828');
    btn.addEventListener('click', () => {
        BATCH_ABORT = true;
        btn.disabled = true;
        btn.textContent = '⏳ 正在中断…';
        btn.style.background = '#616161';
        btn.style.cursor = 'not-allowed';
        new Notice("已请求中断，将在当前作品处理完后停止。", 4000);
    });
    document.body.appendChild(btn);
}

function hideAbortButton() {
    const btn = document.getElementById(ABORT_BTN_ID);
    if (btn) btn.remove();
}

// ============================== 批量生成主流程 ==============================
async function bangumiBatch(QuickAddInstance) {
    QuickAdd = QuickAddInstance;
    pageNum = 1;
    BATCH_ABORT = false;

    const credOk = await ensureCredentials();
    if (!credOk) return;

    const username = await getCurrentUsername();
    if (!username) {
        new Notice("无法获取用户名，批量模式已中止。", 5000);
        return;
    }

    const allLabels = ["想看", "在看", "看过", "搁置", "抛弃"];
    const defaultChecked = ["想看", "在看", "看过"];

    const collectionCache = new Map();
    let subjects = null;

    while (true) {
        const selectedLabels = await QuickAdd.quickAddApi.checkboxPrompt(allLabels, defaultChecked);
        if (!selectedLabels || selectedLabels.length === 0) {
            new Notice("未选择任何收藏类型，已中止。", 4000);
            return;
        }
        const typesToFetch = selectedLabels.map(l => COLLECTION_LABEL_TO_TYPE[l]).filter(Boolean);

        const needFetch = typesToFetch.filter(t => !collectionCache.has(t));

        if (needFetch.length === 0) {
            new Notice(`正在使用已缓存的收藏（${selectedLabels.join("、")}）…`, 3000);
        } else {
            new Notice(`正在拉取收藏（${selectedLabels.join("、")}）…`, 4000);
        }

        const subjectMap = new Map();
        for (const t of typesToFetch) {
            if (BATCH_ABORT) break;
            let items;
            if (collectionCache.has(t)) {
                items = collectionCache.get(t);
                log(`[缓存命中] type=${t}，共 ${items.length} 条`);
            } else {
                try {
                    items = await fetchAllCollections(2, t);
                    collectionCache.set(t, items);
                    log(`[拉取完成] type=${t}，共 ${items.length} 条`);
                } catch (e) {
                    new Notice(`拉取「${COLLECTION_TYPE_MAP[t]}」失败：${e.message}`, 6000);
                    log(`拉取失败: ${e.message}`);
                    continue;
                }
            }
            for (const item of items) {
                if (!subjectMap.has(item.subject_id)) {
                    subjectMap.set(item.subject_id, {
                        subject_id: item.subject_id,
                        subject: item.subject || {},
                        collectionType: t,
                        userTags: Array.isArray(item.tags) ? item.tags : [],
                        rate: item.rate || 0,
                    });
                }
            }
        }

        if (BATCH_ABORT) {
            new Notice("已在拉取阶段中断，未生成任何笔记。", 5000);
            return;
        }

        const allSubjects = Array.from(subjectMap.values());
        if (allSubjects.length === 0) {
            new Notice("没有拉取到任何动画收藏，返回上一步。", 5000);
            continue;
        }

        const result = await new BangumiMultiSelectDialog({
            title: '选择要生成的动画',
            message: `共 ${allSubjects.length} 部，默认全选。取消勾选不需要的条目。`,
            items: allSubjects.map(s => ({
                id: s.subject_id,
                label: s.subject?.name_cn || s.subject?.name || String(s.subject_id),
            })),
            confirmText: '✅ 开始生成',
            cancelText: '❌ 取消',
            backButtonText: '⬅ 上一步',
            confirmColor: '#4caf50',
        }).openAndWait();

        if (result === null) {
            new Notice("操作已取消。", 4000);
            return;
        }

        if (result === BACK_SIGNAL) {
            log("[多选弹窗] 用户点击上一步，返回收藏类型选择");
            continue;
        }

        if (Array.isArray(result) && result.length > 0) {
            const chosenSet = new Set(result);
            subjects = allSubjects.filter(s => chosenSet.has(s.subject_id));
            break;
        }

        new Notice("未选择任何动画，请重新选择或取消。", 4000);
        continue;
    }

    if (!subjects || subjects.length === 0) {
        new Notice("未选择任何动画，已中止。", 4000);
        return;
    }

    showAbortButton();

    let success = 0;
    let failed = 0;
    let aborted = false;
    const failedList = [];

    try {
        for (let i = 0; i < subjects.length; i++) {
            if (BATCH_ABORT) { aborted = true; break; }

            const item = subjects[i];
            const subjectUrl = `https://bgm.tv/subject/${item.subject_id}`;
            const displayName = item.subject?.name_cn || item.subject?.name || String(item.subject_id);

            new Notice(`[${i + 1}/${subjects.length}] 正在处理：${displayName}`, 3000);

            try {
                const watchedSet = await fetchWatchedEpisodes(item.subject_id);
                const Info = await getAnimeByurl(subjectUrl, {
                    watchedSet,
                    apiName: item.subject?.name || "",
                    apiNameCn: item.subject?.name_cn || "",
                });

                if (Array.isArray(item.userTags) && item.userTags.length > 0) {
                    Info.tags = item.userTags;
                } else {
                    Info.tags = Info.tagsRecommendArray || [];
                }
                Info.url = subjectUrl;

                if (item.rate && Number(item.rate) > 0) {
                    Info.score = String(item.rate);
                } else {
                    Info.score = DEFAULT_SCORE_IF_EMPTY;
                }

                Info.collectionType = item.collectionType;
                Info.collectionTypeName = COLLECTION_TYPE_MAP[item.collectionType];

                await QuickAdd.quickAddApi.executeChoice(TEMPLATE_NAME_ANIME, Info);
                success++;
            } catch (e) {
                failed++;
                failedList.push(`${item.subject_id} ${displayName}：${e.message}`);
                console.error(`[批量] 处理失败`, item.subject_id, e);
            }
        }
    } finally {
        hideAbortButton();
    }

    const summary =
        (aborted ? `已中断（用户主动停止）\n\n` : `批量生成完成\n`) +
        `成功：${success}\n` +
        `失败：${failed}` +
        (aborted ? `\n未处理：${subjects.length - success - failed}` : "") +
        (failedList.length > 0 ? `\n\n失败列表：\n${failedList.join("\n")}` : "");
    new Notice(summary, 10000);
    log(summary);
}

// ============================== 作品信息解析 ==============================
function extractBaseInfo(doc, type) {
    const $ = (s) => doc.querySelector(s);
    const workinginfo = {};

    const workingname = $("meta[name='keywords']")?.content || "";
    const regex = /[\*"\\\/<>:\|?]/g;
    const nameArr = workingname.split(",");
    workinginfo.CN = (nameArr[0]?.replace(regex, ' ') || " ").trim() || " ";
    workinginfo.JP = (nameArr[1]?.replace(regex, ' ') || " ").trim() || " ";
    // ★ 新增别名：name/name_cn 分别映射到 JP/CN，方便模板统一使用
    workinginfo.name_cn = workinginfo.CN;
    workinginfo.name = workinginfo.JP;
    workinginfo.fileName = `${workinginfo.CN}_${workinginfo.JP}`.trim() || "未知作品";

    workinginfo.type = ($("small.grey")?.textContent || " ").trim() || " ";
    workinginfo.rating = ($("span[property='v:average']")?.textContent || "未知").trim() || "未知";

    const regPoster = $("div[align='center'] > a")?.href || "";
    let Poster = String(regPoster).replace("app://", "http://").trim();
    if (Poster) {
        workinginfo.Poster = Poster.startsWith("http") ? Poster : `https://${Poster.replace(/^https?:\/\//, "")}`;
    } else {
        workinginfo.Poster = "https://via.placeholder.com/300x450?text=无封面";
    }

    let summary = $("#subject_summary")?.textContent || '暂无简介';
    summary = summary.replace(/&nbsp;/gm, "\n").trim();
    summary = summary.replace(/\s{4,}/gm, "\n");
    summary = summary.replace(/\n+/g, "\n");
    summary = summary || "暂无简介";
    workinginfo.summary = summary;

    const TagBox = $("div.subject_tag_section > div.inner");
    workinginfo.tagsArray = TagBox
        ? (() => {
            const allTagLinks = TagBox.querySelectorAll('a:has(span)');
            const tagsWithNumber = Array.from(allTagLinks).map(link => {
                const textSpan = link.querySelector('span');
                const tagText = textSpan ? textSpan.textContent.trim() : '';
                const numberSmall = link.querySelector('small.grey');
                const tagNumber = numberSmall ? parseInt(numberSmall.textContent.trim(), 10) || 0 : 0;
                return { text: tagText, number: tagNumber };
            }).filter(tag => tag.text && tag.number > 0);
            return tagsWithNumber.sort((a, b) => b.number - a.number).map(tag => tag.text);
        })()
        : [];

    workinginfo.tagsRecommendArray = TagBox
        ? (() => {
            const allMetaLinks = TagBox.querySelectorAll('a.l.meta');
            return Array.from(allMetaLinks).map(link => {
                const span = link.querySelector('span');
                return span ? span.textContent.trim() : '';
            }).filter(Boolean);
        })()
        : [];

    const infobox = doc.querySelectorAll("#infobox > li");
    const str = Array.from(infobox).map(li => li.innerText.trim()).join("\n");
    const regaliases = /别名:\s*(.*?)(?=\n|$)/gm;
    const aliasMatches = str.match(regaliases) || [];
    const alias = aliasMatches.map(match => match.replace(/^别名:\s*/, "").trim()).filter(Boolean);
    workinginfo.alias = alias.length > 0 ? alias.join(",") : "无";

    for (const key in workinginfo) {
        if (!workinginfo[key] || workinginfo[key] === "null" || workinginfo[key] === "undefined") {
            workinginfo[key] = " ";
        }
    }
    return workinginfo;
}

function parseCharacterList(doc, type) {
    const characterList = [];
    let CharacterBox, EachCharaNumber;
    CharacterBox = doc.querySelectorAll("#browserItemList > li.item");
    EachCharaNumber = (type === "anime") ? 3 : 2;

    const regCharacterArray = Array.from(CharacterBox || []);
    regCharacterArray.forEach(item => {
        const row = [];
        const charaType = item.querySelector("span.badge_job_tip")?.textContent.trim() || "--";
        const charaCnName = item.querySelector("a.thumbTip")?.getAttribute("title")?.trim() || "暂无角色";
        const charaJpName = item.querySelector("p.title > a.title")?.textContent.trim() || "暂无日文名";
        const charaCV = item.querySelector("p.badge_actor > a")?.textContent.trim() || "暂无CV";

        const charaPhotoStyle = item.querySelector("span.avatarNeue")?.getAttribute("style") || "";
        const regCharacterPhoto = /background-image:\s*url\('([^']*)'\)/gi;
        const photoMatch = regCharacterPhoto.exec(charaPhotoStyle);
        const charaPhoto = photoMatch ? `https:${photoMatch[1].replace(/^https?:\/\//, "")}` : "";

        if (type === "anime") {
            row.push(`${charaType}: ${charaCnName}<br>${charaJpName}`);
            row.push(`CV: ${charaCV}`);
            row.push(charaPhoto ? `![bookcover](${charaPhoto})` : "");
        } else {
            row.push(`${charaType}: ${charaCnName}<br>${charaJpName}`);
            row.push(charaPhoto ? `![bookcover](${charaPhoto})` : "");
        }
        characterList.push(...row);
    });

    const characterInfo = { characterList: characterList.join("\n") || " " };
    for (let i = 0; i < 9; i++) {
        const baseIndex = i * EachCharaNumber;
        characterInfo[`character${i+1}`] = characterList[baseIndex] || " ";
        if (type === "anime") {
            characterInfo[`characterCV${i+1}`] = characterList[baseIndex + 1] || " ";
            characterInfo[`characterPhoto${i+1}`] = characterList[baseIndex + 2] || " ";
        } else {
            characterInfo[`characterPhoto${i+1}`] = characterList[baseIndex + 1] || " ";
        }
    }
    return characterInfo;
}

function extractInfoboxFields(doc, rules) {
    const infobox = doc.querySelectorAll("#infobox > li");
    const str = Array.from(infobox).map(li => li.innerText.trim()).join("\n");
    const result = {};
    for (const [key, reg] of Object.entries(rules)) {
        const match = reg.exec(str);
        result[key] = match ? match[1].trim().replace(/\n|\r/g, "").replace(/\ +/g, "") : "未知";
        if (!result[key] || result[key] === "null") result[key] = "未知";
    }
    return result;
}

// ============================== 业务逻辑函数（普通模式） ==============================
async function bangumi(QuickAddInstance) {
    QuickAdd = QuickAddInstance;
    pageNum = 1;

    const credOk = await ensureCredentials();
    if (!credOk) return;

    const name = await QuickAdd.quickAddApi.inputPrompt("输入查询的作品名称");
    if (!name || name.trim() === "") throw new Error("没有输入任何内容");

    const source = await QuickAdd.quickAddApi.suggester(
        ["请选择筛选作品类型：全部", "动画(含剧场版及OVA)", "漫画", "游戏"],
        ["all", "2", "1", "4"]
    ) || "all";

    const encodedName = encodeURIComponent(name.trim());
    let url = `https://bgm.tv/subject_search/${encodedName}?cat=${source}`;
    let searchResult = await searchBangumi(url);
    if (!searchResult) throw new Error("找不到你搜索的内容");

    let choice;
    while (true) {
        choice = await QuickAdd.quickAddApi.suggester((obj) => obj.text, searchResult);
        if (!choice) throw new Error("没有选择内容");
        if (choice.typeId === 8) {
            new Notice("加载下一页");
            searchResult = await searchBangumi(choice.link);
            if (!searchResult) throw new Error("找不到你搜索的内容");
        } else break;
    }

    let Info, sourceName;
    try {
        switch (choice.type) {
            case "book":
                Info = await getComicByurl(choice.link);
                new Notice("正在生成漫画笔记📚");
                sourceName = "漫画";
                break;
            case "anime": {
                let watchedSet = null;
                if (USER_TOKEN && USER_TOKEN.trim()) {
                    const m = choice.link.match(/subject\/(\d+)/);
                    if (m) watchedSet = await fetchWatchedEpisodes(m[1]);
                }
                Info = await getAnimeByurl(choice.link, { watchedSet });
                new Notice("正在生成动画笔记🎞");
                sourceName = "动画";
                break;
            }
            case "game":
                Info = await getGameByurl(choice.link);
                new Notice("正在生成游戏笔记🎮");
                sourceName = "游戏";
                break;
            default:
                throw new Error("不支持的作品类型");
        }
    } catch (err) {
        notice(`获取详情失败: ${err.message}`);
        throw err;
    }

    Info.tags = await QuickAdd.quickAddApi.checkboxPrompt(Info.tagsArray, Info.tagsRecommendArray) || [];
    Info.score = DEFAULT_SCORE_IF_EMPTY;
    Info.url = choice.link || " ";

    const TemplateName = `Bangumi${sourceName}`;
    await QuickAdd.quickAddApi.executeChoice(TemplateName, Info);
}

async function getValidScoreInput() {
    let score;
    while (true) {
        score = await QuickAdd.quickAddApi.inputPrompt("请给这部作品评分", "0-10分");
        if (score === null || score.trim() === "") {
            const retry = await QuickAdd.quickAddApi.yesNoPrompt("错误", "未输入评分。是否再次输入？");
            if (!retry) return "null";
            continue;
        }
        score = String(score).trim();
        score = score.replace(/[。，、．,]/g, '.').replace(/\.{2,}/g, '.');
        let scoreNum = parseFloat(score);
        if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 10) {
            new Notice("请输入1.0到10.0之间的数字!", 3000);
            continue;
        }
        score = scoreNum === 10 ? "10.0" : scoreNum.toFixed(1);
        break;
    }
    return score;
}

async function searchBangumi(url) {
    const res = await requestGet(url);
    if (!res) return null;
    const doc = parseHtmlToDom(res);
    const $ = (s) => doc.querySelector(s);
    const re = $("#browserItemList");
    if (!re) return null;

    const itemList = [{
        text: "❔ 没找到想要的作品 \n下一页",
        link: url.includes("&page=") ? url.replace(/&page=\d+/, `&page=${++pageNum}`) : `${url}&page=${++pageNum}`,
        type: "none",
        typeId: 8
    }];

    const result = re.querySelectorAll(".inner");
    for (const temp of result) {
        const spanElem = temp.querySelector("h3 span");
        if (!spanElem) continue;
        const value = spanElem.getAttribute("class") || "";
        const titleElem = temp.querySelector("h3 a");
        const infoElem = temp.querySelector(".info.tip");
        if (!titleElem || !infoElem) continue;

        let text, type, typeId, link;
        const title = titleElem.textContent.trim() || "未知作品";
        const info = infoElem.textContent.trim() || "无信息";

        if (value.includes("ico_subject_type subject_type_2")) {
            text = `🎞️ 《${title}》 \n${info}`; type = "anime"; typeId = 2;
        } else if (value.includes("ico_subject_type subject_type_1")) {
            text = `📚 《${title}》 \n${info}`; type = "book"; typeId = 1;
        } else if (value.includes("ico_subject_type subject_type_4")) {
            text = `🎮 《${title}》 \n${info}`; type = "game"; typeId = 4;
        } else continue;

        const href = titleElem.getAttribute("href") || "";
        link = href.startsWith("http") ? href : `https://bgm.tv${href.replace(/^\/+/, "/")}`;
        itemList.push({ text, link, type, typeId });
    }

    itemList.sort((a, b) => a.typeId - b.typeId);
    return itemList.length > 1 ? itemList : null;
}

async function getAnimeByurl(url, options = {}) {
    console.log("URL:" + url);
    const page = await requestGet(url);
    if (!page) { notice("No results found."); throw new Error("No results found."); }

    const doc = parseHtmlToDom(page);
    const $ = (s) => doc.querySelector(s);
    const $$ = (s) => doc.querySelectorAll(s);

    const Type = $("#headerSubject")?.getAttribute('typeof');
    if (!["v:Movie", "v:Video"].includes(Type)) {
        new Notice("您输入的作品不是动画！");
        throw new Error("Not An Anime Information Input");
    }

    const workinginfo = extractBaseInfo(doc, "anime");

    // ★ API 优先：如果传入了 API 名字，覆盖 HTML 解析出的名字
    if (options.apiName) workinginfo.JP = options.apiName;
    if (options.apiNameCn) workinginfo.CN = options.apiNameCn;
    // 同步 name/name_cn 别名
    workinginfo.name = workinginfo.JP || " ";
    workinginfo.name_cn = workinginfo.CN || " ";
    workinginfo.fileName = `${workinginfo.CN}_${workinginfo.JP}`.trim() || "未知作品";

    const strTmp = Array.from($$("#infobox > li")).map(li => li.innerText.trim()).join("\n");
    const authorMatchTmp = /导演:\s*([^\n]*)/.exec(strTmp) || /作者:\s*([^\n]*)/.exec(strTmp) || /原作:\s*([^\n]*)/.exec(strTmp);
    const director = authorMatchTmp ? authorMatchTmp[1].trim().replace(/\n|\r/g, "").replace(/\ +/g, "") : "未知";

    const infoboxRules = {
        episode: /话数:\s*(\d*)/g,
        website: /官方网站:\s*(.*?)(?=\n|$)/gm,
        staff: /脚本:\s*([^\n]*)/,
        AudioDirector: /音响监督:\s*([^\n]*)/,
        ArtDirector: /美术监督:\s*([^\n]*)/,
        AnimeChief: /总作画监督:\s*([^\n]*)/,
        MusicMake: /音乐制作:\s*([^\n]*)/,
        AnimeMake: /动画制作:\s*([^\n]*)/,
        from: /原作:\s*([^\n]*)/,
    };
    const infoboxFields = extractInfoboxFields(doc, infoboxRules);

    const str = Array.from($$("#infobox > li")).map(li => li.innerText.trim()).join("\n");
    const dateRegMap = {
        "TV": /放送开始:\s*([^\n]*)/,
        "OVA": /发售日:\s*([^\n]*)/,
        "剧场版": /上映年度:\s*([^\n]*)/,
        "OAD": /发售日:\s*([^\n]*)/,
        "WEB": /放送开始:\s*([^\n]*)/,
        "web": /放送开始:\s*([^\n]*)/,
    };
    const regstartdate = dateRegMap[workinginfo.type] || /放送开始:\s*([^\n]*)/;
    const startdateMatch = regstartdate.exec(str);
    const startdate = startdateMatch ? startdateMatch[1].trim().replace(/\n|\r/g, "").replace(/\ +/g, "") : "未知";

    let season = "未知季度"; let seasonYear;
    if (startdate && startdate.includes("年")) {
        const year = startdate.split("年")[0];
        const monthPart = startdate.split("年")[1];
        if (monthPart && monthPart.includes("月")) {
            const month = parseInt(monthPart.split("月")[0]);
            seasonYear = year;
            if (month === 12) seasonYear = (parseInt(year) + 1).toString();
            if ([12, 1, 2].includes(month)) season = "01月新番";
            else if ([3, 4, 5].includes(month)) season = "04月新番";
            else if ([6, 7, 8].includes(month)) season = "07月新番";
            else if ([9, 10, 11].includes(month)) season = "10月新番";
        }
    }

    const detailUrl = url + "/ep";
    const contentLists = await getParagraph(detailUrl, options.watchedSet || null);

    const paraList = contentLists.paraList;
    const opedList = contentLists.opedList;
    const characterInfo = parseCharacterList(doc, "anime");

    const finalInfo = {
        ...workinginfo,
        ...infoboxFields,
        director: director || "未知",
        date: startdate || " ",
        year: startdate.split("年")[0] || " ",
        month: startdate.split("年")[1]?.split("月")[0] || " ",
        seasonYear: seasonYear,
        season: season,
        fromWho: infoboxFields.from.split("(")[0]?.split("・")[0]?.trim() || " ",
        fromWhere: infoboxFields.from.split("（")[1]?.replace("）", "")?.trim() || " ",
        paraList: paraList.join("\n") || " 无章节信息",
        OpEd: opedList.join("\n") || " 无OP/ED信息",
        ...characterInfo
    };

    for (const key in finalInfo) {
        if (!finalInfo[key] || finalInfo[key] === "null" || finalInfo[key] === "undefined") {
            finalInfo[key] = " ";
        }
    }
    return finalInfo;
}

async function getParagraph(detailUrl, watchedSet = null) {
    const detailPage = await requestGet(detailUrl);
    if (!detailPage) { notice("No results found."); throw new Error("No results found."); }

    const paraList = [];
    const opedList = [];
    const detailDoc = parseHtmlToDom(detailPage);
    const $$ = (s) => detailDoc.querySelectorAll(s);
    const paragraphbox = $$(".line_list li");

    let currentType = "";
    let TypeNum = 1;

    paragraphbox.forEach(li => {
        if (li.classList.contains('cat')) {
            currentType = li.textContent.trim();
            TypeNum = 1;
            return;
        }

        const titleElem = li.querySelector('h6');
        if (!titleElem) return;

        const aEl = titleElem.querySelector('a');
        const aText = aEl ? aEl.textContent.trim() : '';
        const epHref = aEl ? (aEl.getAttribute('href') || '') : '';
        const epIdMatch = epHref.match(/\/ep\/(\d+)/);
        const epId = epIdMatch ? epIdMatch[1] : '';

        const titleParts = aText.split('.').filter(Boolean);
        const episodeNum = titleParts[0] ? titleParts[0].match(/\d+/)?.[0] || "" : "";
        const jpTitle = titleParts.slice(1).join(' ') || "";

        const spans = titleElem.querySelectorAll('span');
        const cnTitle = spans.length >= 1 ? (spans[spans.length - 1].textContent.trim() || "") : "";

        let alreadyView = false;
        if (watchedSet && watchedSet.size > 0) {
            if ((epId && watchedSet.has(String(epId))) ||
                (episodeNum && watchedSet.has(String(episodeNum)))) {
                alreadyView = true;
            }
        } else {
            const small = li.querySelector('small');
            if (small && small.textContent.trim() !== '') alreadyView = true;
        }

        if (currentType === "本篇" || currentType === "正篇") {
            let fullTitle = alreadyView ? `- [x] ` : `- [ ] `;
            fullTitle += `第${episodeNum}话 ${jpTitle} ${cnTitle}`.trim();
            paraList.push(fullTitle || `- [ ] 第${episodeNum}话 无标题`);
        } else {
            let fullTitle = alreadyView ? `- [x] ` : `- [ ] `;
            fullTitle += `${currentType}-${episodeNum}: ${jpTitle}${cnTitle}`.trim();
            opedList.push(fullTitle || `${currentType}-${episodeNum}: 无标题`);
        }
    });
    return { paraList, opedList };
}

async function getComicByurl(url) {
    const page = await requestGet(url);
    if (!page) { notice("No results found."); throw new Error("No results found."); }

    const doc = parseHtmlToDom(page);
    const $ = (s) => doc.querySelector(s);

    const Type = $("#headerSubject")?.getAttribute('typeof');
    if (Type !== "v:Book") {
        new Notice("您输入的作品不是书籍！");
        throw new Error("Not A Book Information Input");
    }

    const workinginfo = extractBaseInfo(doc, "book");
    const infobox = doc.querySelectorAll("#infobox > li");
    const str = Array.from(infobox).map(li => li.innerText.trim()).join("\n");

    const authorMatch = /作者:\s*([^\n]*)/.exec(str) || /原作:\s*([^\n]*)/.exec(str);
    const author = authorMatch ? authorMatch[1].trim().replace(/\n|\r/g, "").replace(/\ +/g, "") : "未知";

    const staffMatch = /作画:\s*([^\n]*)/.exec(str);
    const staff = staffMatch ? staffMatch[1].trim().replace(/\n|\r/g, "").replace(/\ +/g, "") : (author !== "未知" ? author : "未知");

    const infoboxFields = {
        episode: /话数:\s*(\d*)/g.exec(str) ? /话数:\s*(\d*)/g.exec(str)[1].trim() : "0",
        author: author,
        staff: staff,
        Publish: /出版社:\s*([^\n]*)/.exec(str) ? /出版社:\s*([^\n]*)/.exec(str)[1].trim().replace(/\n|\r/g, "").replace(/\ +/g, "") : "未知",
        Journal: /连载杂志:\s*([^\n]*)/.exec(str) ? /连载杂志:\s*([^\n]*)/.exec(str)[1].trim().replace(/\n|\r/g, "").replace(/\ +/g, "") : "未知",
        ReleaseDate: /发售日:\s*([^\n]*)/.exec(str) ? /发售日:\s*([^\n]*)/.exec(str)[1].trim().replace(/\n|\r/g, "").replace(/\ +/g, "") : "未知",
        Start: /开始:\s*([^\n]*)/.exec(str) ? /开始:\s*([^\n]*)/.exec(str)[1].trim().replace(/\n|\r/g, "").replace(/\ +/g, "") : "未知"
    };

    const endMatch = /结束:\s*([^\n]*)/.exec(str);
    infoboxFields.End = endMatch ? endMatch[1].trim().replace(/\n|\r/g, "").replace(/\ +/g, "") : "未知";
    infoboxFields.status = endMatch && endMatch[1].trim() ? "已完结" : "连载中";

    const characterInfo = parseCharacterList(doc, "book");
    const finalInfo = { ...workinginfo, ...infoboxFields, ...characterInfo };

    for (const key in finalInfo) {
        if (!finalInfo[key] || finalInfo[key] === "null" || finalInfo[key] === "undefined") {
            finalInfo[key] = " ";
        }
    }
    return finalInfo;
}

async function getGameByurl(url) {
    const page = await requestGet(url);
    if (!page) { notice("No results found."); throw new Error("No results found."); }

    const doc = parseHtmlToDom(page);
    const $ = (s) => doc.querySelector(s);
    const $$ = (s) => doc.querySelectorAll(s);

    const Type = $("#headerSubject")?.getAttribute('typeof');
    if (Type !== "v:Game") {
        new Notice("您输入的作品不是游戏！");
        throw new Error("Not A Game Information Input");
    }

    const workinginfo = extractBaseInfo(doc, "game");
    const infobox = $$("#infobox > li");
    const str = Array.from(infobox).map(li => li.innerText.trim()).join("\n");

    const platformMatch = /平台:\s*([\s\S]*?)(?:\s*展开\+|$)/.exec(str);
    let platform = "未知";
    if (platformMatch && platformMatch[1]) {
        let lines = platformMatch[1].split('\n').map(l => l.trim()).filter(l => l !== '');
        const firstInvalidIndex = lines.findIndex(line => line.includes(':'));
        const validPlatformLines = firstInvalidIndex > -1 ? lines.slice(0, firstInvalidIndex) : lines;
        platform = validPlatformLines.join('、') || "未知";
    }

    const infoboxRules = {
        type: /游戏类型:\s*([^\n]*)/g,
        playerNum: /游玩人数:\s*(\d*)/g,
        develop: /开发:\s*([^\n]*)/,
        Publish: /发行:\s*([^\n]*)/,
        script: /剧本:\s*([^\n]*)/,
        music: /音乐:\s*([^\n]*)/,
        art: /原画:\s*([^\n]*)/,
        director: /导演:\s*([^\n]*)/,
        producer: /制作人:\s*([^\n]*)/,
        ReleaseDate: /发行日期:\s*([^\n]*)/,
        price: /售价:\s*([^\n]*)/,
        website: /官方网站:\s*(.*?)(?=\n|$)/gm
    };
    const infoboxFields = extractInfoboxFields(doc, infoboxRules);
    infoboxFields.platform = platform;

    if (infoboxFields.website && !infoboxFields.website.startsWith("http")) {
        infoboxFields.website = `https://${infoboxFields.website.replace(/^https?:\/\//, "")}`;
    }

    const characterInfo = parseCharacterList(doc, "game");
    const finalInfo = { ...workinginfo, ...infoboxFields, ...characterInfo };

    for (const key in finalInfo) {
        if (!finalInfo[key] || finalInfo[key] === "null" || finalInfo[key] === "undefined") {
            finalInfo[key] = " ";
        }
    }
    return finalInfo;
}

async function resetBangumiAuth() {
    clearPersistedCookie();
    clearPersistedToken();
    USER_COOKIE = "";
    USER_TOKEN = "";
    USER_NAME = "";
    new Notice("已清除保存的 Bangumi Cookie 和 Access Token，下次运行会要求重新认证。", 5000);
}

async function resetBangumiCookie() {
    return resetBangumiAuth();
}