//by 月涟Luvian
//github链接：https://github.com/luvian114/Bangumi-to-obsidian/tree/main
//脚本v2.1可以直接通过Bangumi选择搜索动画 漫画 游戏，进而抓取信息字段。
//参考作者：@Lumos Cuman 永皓yh 风吹走记忆 
//特别鸣谢：@ 鬼头明里单推人 及热心观众
// 感谢 @北漠海 的优化思路及部分代码~
//modify: 莺空_栩白（解决章节目录部分展示不全问题【非登录状态：章节全量展示；登录状态：勾选已观看章节】、动画导演概率不展示问题）
//modify: 增加登录检测 + 浏览器跳转 + 粘贴 Cookie 自动提取拼接流程
//modify: Cookie 持久化到 Obsidian 本地存储，重启后无需重新粘贴
//modify: 优先使用 Bangumi 个人访问令牌（Access Token）认证，令牌无效/未配置时回退 Cookie 流程
//modify: 新增批量模式（bangumiBatch）——按收藏状态一次性拉取动画并批量生成笔记
//modify: 批量模式支持中断按钮；批量模式不再弹 score 输入框，改用 Bangumi 已有评分或默认值
//modify: 批量模式通过 API 精确获取用户已看剧集（GET /v0/users/{u}/collections/{id}/episodes）
//modify: HTML 页面请求只走 Cookie，API 请求只走 Token（修复 400）
//modify: Token 认证成功后保留 Cookie，使 HTML 页面请求亦可用作兜底
//modify: getParagraph 双分支：优先 API 已看集合，无则回退 HTML <small>

// ========== 存储键名 ==========
const COOKIE_STORAGE_KEY = "bangumi_to_obsidian_user_cookie";
const TOKEN_STORAGE_KEY = "bangumi_to_obsidian_access_token";

// ========== 模板名常量 ==========
const TEMPLATE_NAME_ANIME = "Bangumi动画批量";

// ========== 默认值常量 ==========
const DEFAULT_SCORE_IF_EMPTY = "";

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

// ========== 认证凭据初始化 ==========
let USER_COOKIE = (() => {
    try {
        const saved = app?.loadLocalStorage?.(COOKIE_STORAGE_KEY);
        if (saved && typeof saved === "string" && saved.trim()) {
            return saved.trim();
        }
    } catch (e) {}
    return ``;
})();

let USER_TOKEN = (() => {
    try {
        const saved = app?.loadLocalStorage?.(TOKEN_STORAGE_KEY);
        if (saved && typeof saved === "string" && saved.trim()) {
            return saved.trim();
        }
    } catch (e) {}
    return "";
})();

let USER_NAME = "";
let BATCH_ABORT = false;
const ABORT_BTN_ID = "bangumi-batch-abort-btn";

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

let QuickAdd;
let pageNum = 1;

// ============================== 通用工具函数 ==============================
async function requestGet(url, customHeaders = null) {
    try {
        const finalURL = new URL(url);
        const headers = customHeaders ? { ...customHeaders } : { ...COMMON_HEADERS };
        const isApiRequest = finalURL.hostname === 'api.bgm.tv';

        if (isApiRequest) {
            // API 请求：优先用 Token
            if (USER_TOKEN && USER_TOKEN.trim()) {
                headers['Authorization'] = `Bearer ${USER_TOKEN.trim()}`;
                delete headers['Cookie'];
            } else {
                headers['Cookie'] = USER_COOKIE;
            }
        } else {
            // HTML 页面：只走 Cookie，绝不发送 Bearer Token
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
    try {
        return JSON.parse(raw);
    } catch (e) {
        log(`JSON 解析失败: ${e.message}`);
        return null;
    }
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

async function checkBangumiLogin() {
    if (USER_TOKEN && USER_TOKEN.trim()) {
        const username = await validateAccessToken(USER_TOKEN);
        if (username) {
            log(`Token 认证成功，用户: ${username}`);
            return true;
        }
        log("Token 已失效，将回退到 Cookie 登录流程");
        new Notice("Access Token 已失效，将回退到 Cookie 登录流程。", 4000);
        clearPersistedToken();
        USER_TOKEN = "";
        USER_NAME = "";
    }

    const html = await requestGet("https://bgm.tv/");
    if (!html) return false;
    const doc = parseHtmlToDom(html);
    return !!doc.querySelector('#badgeUserPanel') && !doc.querySelector('a[href="/login"]');
}

async function openBangumiLoginPage() {
    const loginUrl = "https://bgm.tv/login";
    try {
        const { shell } = require('electron');
        await shell.openExternal(loginUrl);
    } catch (e) {
        window.open(loginUrl, '_blank');
    }
}

async function openBangumiTokenPage() {
    const tokenUrl = "https://next.bgm.tv/demo/access-token";
    try {
        const { shell } = require('electron');
        await shell.openExternal(tokenUrl);
    } catch (e) {
        window.open(tokenUrl, '_blank');
    }
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
    const requiredKeys = ["chii_auth"];
    return requiredKeys.every(k => cookieStr.includes(k + "="));
}

// ============================== 凭据持久化 ==============================
function persistCookie(cookieStr) {
    try {
        if (app?.saveLocalStorage) {
            app.saveLocalStorage(COOKIE_STORAGE_KEY, cookieStr);
        }
    } catch (e) {
        log(`保存 Cookie 到本地存储失败：${e.message}`);
    }
}

function clearPersistedCookie() {
    try {
        if (app?.saveLocalStorage) {
            app.saveLocalStorage(COOKIE_STORAGE_KEY, "");
        }
    } catch (e) {
        log(`清除本地存储 Cookie 失败：${e.message}`);
    }
}

function persistToken(token) {
    try {
        if (app?.saveLocalStorage) {
            app.saveLocalStorage(TOKEN_STORAGE_KEY, token);
        }
    } catch (e) {
        log(`保存 Token 到本地存储失败：${e.message}`);
    }
}

function clearPersistedToken() {
    try {
        if (app?.saveLocalStorage) {
            app.saveLocalStorage(TOKEN_STORAGE_KEY, "");
        }
    } catch (e) {
        log(`清除本地存储 Token 失败：${e.message}`);
    }
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

async function readClipboardTextAsync() {
    const syncText = readClipboardTextSync();
    if (syncText) return syncText;
    try {
        if (navigator?.clipboard?.readText) {
            const t = await navigator.clipboard.readText();
            if (t && t.trim()) return t.trim();
        }
    } catch (e) {}
    return "";
}

// ============================== 凭据输入流程 ==============================
async function promptAndUpdateToken() {
    const fromClipboard = await readClipboardTextAsync();
    const message = "Bangumi 个人访问令牌（Access Token）\n在 https://next.bgm.tv/demo/access-token 生成，约 1 年有效。\n优先使用令牌认证，可省去频繁获取 Cookie。";
    const placeholder = "在此粘贴你的 Access Token";
    const clipboardIsToken = fromClipboard && fromClipboard.length > 20 && !fromClipboard.includes(' ') && !fromClipboard.includes('=') && !fromClipboard.includes(';');

    while (true) {
        const defaultValue = (clipboardIsToken ? fromClipboard : "") || placeholder;
        let input = await QuickAdd.quickAddApi.inputPrompt(message, defaultValue);
        if (input === null) return false;
        if (!input || input.trim() === "") {
            const retry = await QuickAdd.quickAddApi.yesNoPrompt("输入为空", "未输入 Token，是否重新输入？");
            if (!retry) return false;
            continue;
        }
        const token = input.trim();
        new Notice("正在校验 Token…", 3000);
        const username = await validateAccessToken(token);
        if (!username) {
            const retry = await QuickAdd.quickAddApi.yesNoPrompt(
                "Token 无效",
                "该 Token 校验失败（可能已过期或复制不完整）。\n是否重新输入？"
            );
            if (!retry) return false;
            continue;
        }
        USER_TOKEN = token;
        persistToken(token);
        // ★ 保留 Cookie 作为 HTML 页面请求的兜底
        new Notice(`Token 校验成功 ✅ 用户: ${username}\n已保存，下次运行无需重新输入。`, 5000);
        return true;
    }
}

async function promptAndUpdateCookie() {
    const fromClipboard = await readClipboardTextAsync();
    if (fromClipboard) {
        const cleanedFromClipboard = sanitizeCookieInput(fromClipboard);
        if (isValidBangumiCookie(cleanedFromClipboard)) {
            USER_COOKIE = cleanedFromClipboard;
            persistCookie(cleanedFromClipboard);
            new Notice("已从剪贴板读取并保存 Cookie，正在校验登录状态…", 3000);
            return true;
        }
    }
    let clipboardText = fromClipboard || "";
    const message = fromClipboard
        ? "剪贴板内容未识别到 chii_auth，请手动粘贴完整 Cookie"
        : "未从剪贴板读到 Cookie，请手动粘贴";
    const placeholder = "chii_sec_id=...; chii_theme=light; chii_cookietime=2592000; chii_auth=...; chii_sid=...";

    while (true) {
        const defaultValue = clipboardText || placeholder;
        let input = await QuickAdd.quickAddApi.inputPrompt(message, defaultValue);
        if (input === null) {
            const retry = await QuickAdd.quickAddApi.yesNoPrompt("已取消", "未输入 Cookie，是否重新输入？");
            if (!retry) return false;
            continue;
        }
        if (!input || input.trim() === "") {
            const retry = await QuickAdd.quickAddApi.yesNoPrompt("输入为空", "请手动粘贴 Cookie 后再点确认。是否重新输入？");
            if (!retry) return false;
            continue;
        }
        const cleaned = sanitizeCookieInput(input);
        if (!isValidBangumiCookie(cleaned)) {
            new Notice("Cookie 缺少必要字段（至少包含 chii_auth=...），请重新复制粘贴。", 5000);
            clipboardText = cleaned || input;
            continue;
        }
        USER_COOKIE = cleaned;
        persistCookie(cleaned);
        new Notice("已更新 Cookie 并保存，正在校验登录状态…", 3000);
        return true;
    }
}

async function ensureAuthenticated() {
    let logged = await checkBangumiLogin();
    while (!logged) {
        clearPersistedCookie();
        clearPersistedToken();
        USER_COOKIE = "";
        USER_TOKEN = "";
        USER_NAME = "";

        const useToken = await QuickAdd.quickAddApi.yesNoPrompt(
            "Bangumi 未登录",
            "检测到未登录或凭据已失效。\n\n" +
            "推荐使用「个人访问令牌（Access Token）」——一次配置，约 1 年有效。\n\n" +
            "选择「是」：打开浏览器生成 Access Token（推荐）\n" +
            "选择「否」：打开浏览器登录后复制 Cookie"
        );

        if (useToken) {
            await openBangumiTokenPage();
            new Notice("已打开 Bangumi Token 生成页。请在浏览器中登录并生成个人令牌，然后复制令牌回到 Obsidian。", 8000);
            const tokenUpdated = await promptAndUpdateToken();
            if (!tokenUpdated) throw new Error("未更新 Token，已中止");
        } else {
            await openBangumiLoginPage();
            new Notice("已打开 Bangumi 登录页。登录完成后，请复制浏览器中的 Cookie，随后回到 Obsidian。", 8000);
            const cookieUpdated = await promptAndUpdateCookie();
            if (!cookieUpdated) throw new Error("未更新 Cookie，已中止");
        }

        logged = await checkBangumiLogin();
        if (!logged) new Notice("凭据校验失败，请检查是否复制完整或令牌是否有效。", 5000);
    }
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

/**
 * 通过 Bangumi API 精确获取用户在指定作品下「已看」的剧集集合
 * 端点：GET /v0/users/{username}/collections/{subjectId}/episodes
 * 返回的 Set 同时包含 episode.id、ep、sort 的字符串形式，便于与 HTML 匹配。
 *
 * Bangumi v0 API 中单集收藏 type 语义：
 *   0 = 未收藏
 *   1 = 想看
 *   2 = 看过
 *   3 = 抛弃
 * 只有 type === 2（看过）才计入已看集合。
 *
 * @param {string} username - 用户名
 * @param {number|string} subjectId - 作品 ID
 * @returns {Promise<Set<string>>} 已看剧集标识集合（字符串）
 */
async function fetchWatchedEpisodes(username, subjectId) {
    const result = new Set();
    if (!username || !subjectId) return result;
    try {
        let offset = 0;
        const limit = 100;
        const maxPages = 50;

        for (let page = 0; page < maxPages; page++) {
            if (BATCH_ABORT) break;

            const url = `https://api.bgm.tv/v0/users/${encodeURIComponent(username)}` +
                `/collections/${subjectId}/episodes?limit=${limit}&offset=${offset}`;

            const data = await requestGetJson(url);

            if (!data) {
                log(`获取已看剧集失败：API 无响应 subject=${subjectId}`);
                break;
            }
            if (!Array.isArray(data.data)) {
                log(`获取已看剧集失败：返回结构异常 subject=${subjectId}`);
                break;
            }

            for (const item of data.data) {
                const type = item.type;
                if (type !== 2) continue;

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

    await ensureAuthenticated();

    if (!USER_TOKEN || !USER_TOKEN.trim()) {
        const ok = await QuickAdd.quickAddApi.yesNoPrompt(
            "需要 Access Token",
            "批量拉取收藏需要 Access Token。\n是否现在打开 Token 生成页？"
        );
        if (!ok) return;
        await openBangumiTokenPage();
        new Notice("已打开 Token 生成页。生成后请复制令牌回到 Obsidian。", 8000);
        const tokenUpdated = await promptAndUpdateToken();
        if (!tokenUpdated) return;
    }

    const username = await getCurrentUsername();
    if (!username) {
        new Notice("无法获取用户名，批量模式已中止。", 5000);
        return;
    }

    const allLabels = ["想看", "在看", "看过", "搁置", "抛弃"];
    const defaultChecked = ["想看", "在看", "看过"];
    const selectedLabels = await QuickAdd.quickAddApi.checkboxPrompt(allLabels, defaultChecked);
    if (!selectedLabels || selectedLabels.length === 0) {
        new Notice("未选择任何收藏类型，已中止。", 4000);
        return;
    }
    const typesToFetch = selectedLabels.map(l => COLLECTION_LABEL_TO_TYPE[l]).filter(Boolean);

    new Notice(`正在拉取收藏（${selectedLabels.join("、")}）…`, 4000);

    const subjectMap = new Map();
    for (const t of typesToFetch) {
        if (BATCH_ABORT) break;
        try {
            const items = await fetchAllCollections(2, t);
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
        } catch (e) {
            new Notice(`拉取「${COLLECTION_TYPE_MAP[t]}」失败：${e.message}`, 6000);
            log(`拉取失败: ${e.message}`);
        }
    }

    if (BATCH_ABORT) {
        new Notice("已在拉取阶段中断，未生成任何笔记。", 5000);
        return;
    }

    const subjects = Array.from(subjectMap.values());
    if (subjects.length === 0) {
        new Notice("没有拉取到任何动画收藏，已中止。", 5000);
        return;
    }

    const proceed = await QuickAdd.quickAddApi.yesNoPrompt(
        "准备批量生成笔记",
        `共拉取到 ${subjects.length} 部动画。\n` +
        `即将逐个生成笔记（是否覆盖已存在的文件，取决于 QuickAdd 模板设置）。\n\n` +
        `过程中右下角会出现「中断导入」按钮，可随时中止。\n\n` +
        `是否开始？`
    );
    if (!proceed) return;

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
                // ★ 通过 API 获取该作品的精确已看剧集集合
                const watchedSet = await fetchWatchedEpisodes(username, item.subject_id);

                const Info = await getAnimeByurl(subjectUrl, { watchedSet });

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
    const nbspReg = /&nbsp;/gm;
    summary = summary.replace(nbspReg, "\n").trim();
    const multiSpaceReg = /\s{4,}/gm;
    summary = summary.replace(multiSpaceReg, "\n");
    const multiLineReg = /\n+/g;
    summary = summary.replace(multiLineReg, "\n");
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
            const sortedTags = tagsWithNumber.sort((a, b) => b.number - a.number);
            return sortedTags.map(tag => tag.text);
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
    if (type === "anime") {
        EachCharaNumber = 3;
    } else {
        EachCharaNumber = 2;
    }

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

    await ensureAuthenticated();

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
        choice = await QuickAdd.quickAddApi.suggester(
            (obj) => obj.text,
            searchResult
        );
        if (!choice) throw new Error("没有选择内容");
        if (choice.typeId === 8) {
            new Notice("加载下一页");
            searchResult = await searchBangumi(choice.link);
            if (!searchResult) throw new Error("找不到你搜索的内容");
        } else {
            break;
        }
    }

    let Info, sourceName;
    try {
        switch (choice.type) {
            case "book":
                Info = await getComicByurl(choice.link);
                new Notice("正在生成漫画笔记📚");
                sourceName = "漫画";
                break;
            case "anime":
                // ★ 普通模式也尝试用 API 精确获取已看（如果 Token 存在）
                {
                    let watchedSet = null;
                    if (USER_TOKEN && USER_TOKEN.trim()) {
                        const u = await getCurrentUsername();
                        const m = choice.link.match(/subject\/(\d+)/);
                        if (u && m) {
                            watchedSet = await fetchWatchedEpisodes(u, m[1]);
                        }
                    }
                    Info = await getAnimeByurl(choice.link, { watchedSet });
                }
                new Notice("正在生成动画笔记🎞");
                sourceName = "动画";
                break;
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
        score = score.replace(/[。，、．,]/g, '.');
        score = score.replace(/\.{2,}/g, '.');
        let scoreNum = parseFloat(score);
        if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 10) {
            new Notice("请输入1.0到10.0之间的数字!", 3000);
            continue;
        }
        if (scoreNum === 10) {
            score = "10.0";
        } else {
            score = scoreNum.toFixed(1);
        }
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
            text = `🎞️ 《${title}》 \n${info}`;
            type = "anime";
            typeId = 2;
        } else if (value.includes("ico_subject_type subject_type_1")) {
            text = `📚 《${title}》 \n${info}`;
            type = "book";
            typeId = 1;
        } else if (value.includes("ico_subject_type subject_type_4")) {
            text = `🎮 《${title}》 \n${info}`;
            type = "game";
            typeId = 4;
        } else {
            continue;
        }

        const href = titleElem.getAttribute("href") || "";
        link = href.startsWith("http") ? href : `https://bgm.tv${href.replace(/^\/+/, "/")}`;
        itemList.push({ text, link, type, typeId });
    }

    itemList.sort((a, b) => a.typeId - b.typeId);
    return itemList.length > 1 ? itemList : null;
}

/**
 * 获取动画信息
 * @param {string} url - 动画详情页地址
 * @param {object} [options={}] - 可选参数
 * @param {Set<string>} [options.watchedSet] - 用户已看剧集标识集合（批量模式传入）
 * @returns {Promise<object>} 动画信息对象
 */
async function getAnimeByurl(url, options = {}) {
    console.log("URL:" + url);
    const page = await requestGet(url);
    if (!page) {
        notice("No results found.");
        throw new Error("No results found.");
    }

    const doc = parseHtmlToDom(page);
    const $ = (s) => doc.querySelector(s);
    const $$ = (s) => doc.querySelectorAll(s);

    const Type = $("#headerSubject")?.getAttribute('typeof');
    const validAnimeTypes = ["v:Movie", "v:Video"];
    if (!validAnimeTypes.includes(Type)) {
        new Notice("您输入的作品不是动画！");
        throw new Error("Not An Anime Information Input");
    }

    const workinginfo = extractBaseInfo(doc, "anime");

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
            if (month === 12) {
                seasonYear = (parseInt(year) + 1).toString();
            }
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

/**
 * 封装目录信息
 * @param {string} detailUrl - 剧集列表页地址（.../ep）
 * @param {Set<string>} [watchedSet=null] - 用户已看剧集标识集合（API 结果）
 *   - 传入且非空：用 API 结果判断（Token 模式推荐）
 *   - 未传或为空：回退到 HTML <small> 判断（Cookie 模式）
 * @returns {Promise<{paraList: string[], opedList: string[]}>}
 */
async function getParagraph(detailUrl, watchedSet = null) {
    const detailPage = await requestGet(detailUrl);
    if (!detailPage) {
        notice("No results found.");
        throw new Error("No results found.");
    }

    const paraList = [];
    const opedList = [];

    const detailDoc = parseHtmlToDom(detailPage);
    const $$ = (s) => detailDoc.querySelectorAll(s);
    const paragraphbox = $$(".line_list li");

    let currentType = "";
    let TypeNum = 1;

    paragraphbox.forEach(li => {
        const hasCatClass = li.classList.contains('cat');
        if (hasCatClass) {
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
        const secondSpanText = spans.length >= 1 ? spans[spans.length - 1].textContent.trim() : '';
        const cnTitle = secondSpanText ? secondSpanText.trim() : "";

        // ★ 双分支判断已看：
        //   1. 若传入了 API 已看集合，优先用它（Token 模式）
        //   2. 否则回退到 HTML <small>（Cookie 模式）
        let alreadyView = false;
        if (watchedSet && watchedSet.size > 0) {
            if ((epId && watchedSet.has(String(epId))) ||
                (episodeNum && watchedSet.has(String(episodeNum)))) {
                alreadyView = true;
            }
        } else {
            const small = li.querySelector('small');
            if (small && small.textContent.trim() !== '') {
                alreadyView = true;
            }
        }

        if (currentType === "本篇" || currentType === "正篇") {
            let fullTitle = ``;
            if (alreadyView) fullTitle += `- [x] `;
            else fullTitle += `- [ ] `;
            fullTitle += `第${episodeNum}话 ${jpTitle} ${cnTitle}`.trim();
            paraList.push(fullTitle || `- [ ] 第${episodeNum}话 无标题`);
        } else {
            let fullTitle = ``;
            if (alreadyView) fullTitle += `- [x] `;
            else fullTitle += `- [ ] `;
            fullTitle += `${currentType}-${episodeNum}: ${jpTitle}${cnTitle}`.trim();
            opedList.push(fullTitle || `${currentType}-${episodeNum}: 无标题`);
        }
    });
    return { paraList, opedList };
}

async function getComicByurl(url) {
    const page = await requestGet(url);
    if (!page) {
        notice("No results found.");
        throw new Error("No results found.");
    }

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

    const finalInfo = {
        ...workinginfo,
        ...infoboxFields,
        ...characterInfo
    };

    for (const key in finalInfo) {
        if (!finalInfo[key] || finalInfo[key] === "null" || finalInfo[key] === "undefined") {
            finalInfo[key] = " ";
        }
    }
    return finalInfo;
}

async function getGameByurl(url) {
    const page = await requestGet(url);
    if (!page) {
        notice("No results found.");
        throw new Error("No results found.");
    }

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
        let lines = platformMatch[1].split('\n')
            .map(line => line.trim())
            .filter(line => line !== '');
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

    const finalInfo = {
        ...workinginfo,
        ...infoboxFields,
        ...characterInfo
    };

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