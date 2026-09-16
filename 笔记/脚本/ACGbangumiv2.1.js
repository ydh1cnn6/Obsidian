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

// ========== 存储键名 ==========
// 本地存储键名（存储清洗后的 Cookie）
const COOKIE_STORAGE_KEY = "bangumi_to_obsidian_user_cookie";
// 本地存储键名（存储个人访问令牌）
const TOKEN_STORAGE_KEY = "bangumi_to_obsidian_access_token";

// ========== 模板名常量 ==========
// 批量模式下使用的 QuickAdd 模板名（需与你 QuickAdd 里配置的动画模板名一致）
const TEMPLATE_NAME_ANIME = "Bangumi动画-批量";

// ========== 默认值常量 ==========
// 用户在 Bangumi 未评分时的默认分（可改成你想要的默认值，比如 "0" 或 ""）
// 注意：模板里必须用 {{score}} 而不是 {{VALUE:score}}，否则仍会弹窗
const DEFAULT_SCORE_IF_EMPTY = "";

// ========== 收藏状态映射 ==========
// Bangumi 收藏类型：1=想看, 2=在看, 3=看过, 4=搁置, 5=抛弃
const COLLECTION_TYPE_MAP = {
    1: "想看",
    2: "在看",
    3: "看过",
    4: "搁置",
    5: "抛弃",
};
// 反向映射：中文名 → 数字
const COLLECTION_LABEL_TO_TYPE = {
    "想看": 1,
    "在看": 2,
    "看过": 3,
    "搁置": 4,
    "抛弃": 5,
};

// ========== 认证凭据初始化 ==========
// 优先从 Obsidian 本地存储读取已保存的 Cookie；读不到时使用下方默认值。
// 用户粘贴新 Cookie 成功后，promptAndUpdateCookie 会自动写回本地存储。
let USER_COOKIE = (() => {
    try {
        const saved = app?.loadLocalStorage?.(COOKIE_STORAGE_KEY);
        if (saved && typeof saved === "string" && saved.trim()) {
            return saved.trim();
        }
    } catch (e) {
        // 读取失败时静默回退到默认值
    }
    return `chii_sec_id=OiNqAzd7lqHFA%2Fig3Iyk9N6i8RIhX5L2Pgk; chii_theme=light; chii_cookietime=2592000; prg_display_mode=normal; chii_auth=dQRpmdawWIVmE6xbdzTrOC1dQidZnrir6Z%2BBOcjjiszaUjbY3IKgV5EAwFLBpbvM132oe1XYsaGAcdzBRAMihqXarji99MAoG7qPWg; chii_sid=PSRaW0`;
})();

// 优先从 Obsidian 本地存储读取已保存的 Access Token；读不到时为空串（表示未配置令牌）。
// 用户粘贴新令牌成功后，promptAndUpdateToken 会自动写回本地存储。
let USER_TOKEN = (() => {
    try {
        const saved = app?.loadLocalStorage?.(TOKEN_STORAGE_KEY);
        if (saved && typeof saved === "string" && saved.trim()) {
            return saved.trim();
        }
    } catch (e) {
        // 读取失败时静默回退到空串
    }
    return "";
})();

// 当前登录用户名（批量拉取收藏时需要），由 validateAccessToken 自动填充
let USER_NAME = "";

// 批量导入的中断标志：点击「中断导入」按钮后置为 true
// 每次循环迭代都会检查，为 true 则跳出循环输出汇总
let BATCH_ABORT = false;

// 中断按钮的 DOM id（避免和页面其他元素冲突）
const ABORT_BTN_ID = "bangumi-batch-abort-btn";

//附加有效的参考样式：`chii_sec_id=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx; chii_theme=light; _tea_utm_cache_10000007=undefined; chii_cookietime=2592000; chii_auth=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx; chii_searchDateLine=0; chii_sid=xxxxxx`

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
	// 注意：Cookie 与 Authorization 会在 requestGet 中动态注入，这里只是占位
	'Cookie': USER_COOKIE,
};




// 主入口：普通单作品模式
module.exports = bangumi;

// 辅助入口：批量拉取收藏模式（需要在 QuickAdd 里另建一个命令指向这个函数）
module.exports.bangumiBatch = bangumiBatch;
// 兼容旧调用名：清除凭据
module.exports.resetBangumiAuth = resetBangumiAuth;
module.exports.resetBangumiCookie = resetBangumiAuth;

let QuickAdd;
let pageNum = 1;

// ============================== 通用工具函数封装 ==============================
/**
 * 通用HTTP GET请求
 * 动态注入当前的认证凭据：
 *  - 若配置了 Access Token，优先使用 Authorization: Bearer 头
 *  - 否则使用 Cookie 请求头
 * 保证运行时更新凭据后立即生效
 * @param {string} url - 请求地址
 * @param {object} [customHeaders=null] - 自定义请求头（可选，会与认证信息合并）
 * @returns {Promise<string|null>} 响应内容或null
 */
async function requestGet(url, customHeaders = null) {
    try {
        const finalURL = new URL(url);
        // 构建基础请求头
        const headers = customHeaders
            ? { ...customHeaders }
            : { ...COMMON_HEADERS };

        // 优先使用 Access Token 认证
        if (USER_TOKEN && USER_TOKEN.trim()) {
            headers['Authorization'] = `Bearer ${USER_TOKEN.trim()}`;
            // 使用 Token 时不再发送 Cookie，避免冲突
            delete headers['Cookie'];
        } else {
            // 回退到 Cookie 认证
            headers['Cookie'] = USER_COOKIE;
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

/**
 * 通用HTTP GET请求（返回 JSON 对象）
 * 认证逻辑与 requestGet 相同，但会解析 JSON
 * @param {string} url - 请求地址
 * @returns {Promise<object|null>} 解析后的 JSON 对象，失败返回 null
 */
async function requestGetJson(url) {
    const raw = await requestGet(url, {
        "Accept": "application/json",
        // 让 requestGet 里逻辑判断照旧走 Token / Cookie
    });
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (e) {
        log(`JSON 解析失败: ${e.message}`);
        return null;
    }
}

/**
 * 解析HTML字符串为DOM对象
 * @param {string} html - HTML字符串
 * @returns {Document} DOM文档对象
 */
function parseHtmlToDom(html) {
    if (!html || typeof html !== "string") {
        log("无效的HTML字符串，无法解析DOM");
        return new DOMParser().parseFromString("<html></html>", "text/html");
    }
    const p = new DOMParser();
    return p.parseFromString(html, "text/html");
}

// ============================== 认证相关函数 ==============================

/**
 * 校验 Access Token 是否有效
 * 通过 Bangumi API 的 GET /v0/me 端点验证令牌
 * 成功返回用户名，失败返回空串
 * @param {string} token - 待校验的 Access Token
 * @returns {Promise<string>} 用户名，失败返回空串
 */
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
        // 尝试解析 JSON，获取用户名
        try {
            const data = JSON.parse(res);
            if (data && data.username) {
                // 顺便缓存用户名，批量模式要用
                USER_NAME = data.username;
                return data.username;
            }
        } catch (e) {
            // 解析失败，认为令牌无效
        }
        return "";
    } catch (err) {
        log(`Token 校验失败: ${err.message}`);
        return "";
    }
}

/**
 * 检测 Bangumi 登录状态
 * 优先尝试 Access Token，其次检查 Cookie 登录态
 * @returns {Promise<boolean>} 是否已登录
 */
async function checkBangumiLogin() {
    // 1. 优先尝试 Access Token
    if (USER_TOKEN && USER_TOKEN.trim()) {
        const username = await validateAccessToken(USER_TOKEN);
        if (username) {
            log(`Token 认证成功，用户: ${username}`);
            return true;
        }
        // Token 无效，清除已保存的 Token 并回退到 Cookie 流程
        log("Token 已失效，将回退到 Cookie 登录流程");
        new Notice("Access Token 已失效，将回退到 Cookie 登录流程。", 4000);
        clearPersistedToken();
        USER_TOKEN = "";
        USER_NAME = "";
    }

    // 2. 回退到 Cookie 登录检测
    const html = await requestGet("https://bgm.tv/");
    if (!html) return false;

    const doc = parseHtmlToDom(html);
    // 已登录通常有用户面板；未登录会有 /login 链接
    return !!doc.querySelector('#badgeUserPanel') && !doc.querySelector('a[href="/login"]');
}

/**
 * 打开系统默认浏览器跳转到 Bangumi 登录页
 * 优先使用 electron 的 shell.openExternal，兜底用 window.open
 * @returns {Promise<void>}
 */
async function openBangumiLoginPage() {
    const loginUrl = "https://bgm.tv/login";
    try {
        const { shell } = require('electron');
        await shell.openExternal(loginUrl);
    } catch (e) {
        // 兜底：有些环境 require electron 不可用
        window.open(loginUrl, '_blank');
    }
}

/**
 * 打开系统默认浏览器跳转到 Bangumi Access Token 生成页
 * @returns {Promise<void>}
 */
async function openBangumiTokenPage() {
    const tokenUrl = "https://next.bgm.tv/demo/access-token";
    try {
        const { shell } = require('electron');
        await shell.openExternal(tokenUrl);
    } catch (e) {
        window.open(tokenUrl, '_blank');
    }
}

/**
 * 判断某个 cookie 名是否需要保留
 * 参考有效样式：
 *   chii_sec_id; chii_theme; _tea_utm_cache_10000007; chii_cookietime;
 *   chii_auth; chii_searchDateLine; chii_sid
 * 即：只保留 chii_* 与 _tea_*，其它（_ga / _ga_xxx / _fbp / _gid 等）全部丢弃。
 * @param {string} name - cookie 名称
 * @returns {boolean} 是否保留
 */
function isBangumiRelevantCookie(name) {
    if (!name) return false;
    return /^chii_/i.test(name) || /^_tea_/i.test(name);
}

/**
 * 清洗用户粘贴的 Cookie 输入
 * 不依赖换行 / 制表符，直接从整段文本里用正则抽取 chii_* 与 _tea_* 的 name 与 value。
 * 兼容以下格式：
 *  1) DevTools「Application → Cookies」表格（name 与 value 之间是制表符）
 *  2) DevTools 表格被压成一整行、列间只剩空格的情况
 *  3) 直接复制的 Cookie 字符串 "k1=v1; k2=v2"
 *  4) Request Headers 里的 "Cookie: k1=v1; k2=v2"
 * 关键点：name 与 value 之间的分隔符允许是 `=`、制表符、空格或换行；
 *        value 终止于空白字符或分号。
 * 其它 cookie（_ga / _ga_xxx / prg_* 等）自动丢弃；同名去重。
 * @param {string} raw - 用户粘贴的原始文本
 * @returns {string} 清洗后可直接使用的 Cookie 字符串
 */
function sanitizeCookieInput(raw) {
    if (!raw) return "";
    let s = String(raw);

    // 去掉首尾空白、外层引号 / 反引号
    s = s.replace(/^[\s"'`]+|[\s"'`]+$/g, "");
    // 去掉 "Cookie:" / "Cookie：" 前缀
    s = s.replace(/^cookie\s*[:：]\s*/i, "");

    // 同时兼容：
    //   a) 字符串格式  chii_auth=xxxx
    //   b) DevTools 表格  chii_auth<TAB>xxxx（粘贴时 tab 也可能被压成空格）
    // name 与 value 之间的分隔符：=、制表符、空格、换行，都可以。
    // value 终止于：空白字符 或 分号。
    const re = /(chii_[A-Za-z0-9_]+|_tea_[A-Za-z0-9_]+)[=\s\u00a0]+([^\s\u00a0;]+)/g;

    const pairs = [];
    const seen = new Set();
    let m;
    while ((m = re.exec(s)) !== null) {
        const name = m[1];
        const value = m[2];
        if (!isBangumiRelevantCookie(name)) continue; // 二次保险
        if (seen.has(name)) continue;                 // 同名去重（保留首次出现）
        seen.add(name);
        pairs.push(`${name}=${value}`);
    }

    return pairs.join("; ");
}

/**
 * 校验 Cookie 是否含有必要字段
 * 至少要包含 chii_auth（其他字段缺失不阻塞，但通常也建议一并带上）
 * @param {string} cookieStr - 清洗后的 Cookie 字符串
 * @returns {boolean} 是否通过校验
 */
function isValidBangumiCookie(cookieStr) {
    if (!cookieStr) return false;
    // 至少要有 chii_auth；如果你希望更严格，可把下面数组改成 ['chii_sec_id', 'chii_auth', 'chii_sid']
    const requiredKeys = ["chii_auth"];
    return requiredKeys.every(k => cookieStr.includes(k + "="));
}

// ============================== 凭据持久化 ==============================

/**
 * 把清洗后的 Cookie 持久化到 Obsidian 本地存储
 * 失败时只记录日志，不影响主流程
 * @param {string} cookieStr - 清洗后的 Cookie 字符串
 */
function persistCookie(cookieStr) {
    try {
        if (app?.saveLocalStorage) {
            app.saveLocalStorage(COOKIE_STORAGE_KEY, cookieStr);
        }
    } catch (e) {
        log(`保存 Cookie 到本地存储失败：${e.message}`);
    }
}

/**
 * 清除本地存储中的 Cookie（用于 Cookie 失效后强制重新登录）
 */
function clearPersistedCookie() {
    try {
        if (app?.saveLocalStorage) {
            app.saveLocalStorage(COOKIE_STORAGE_KEY, "");
        }
    } catch (e) {
        log(`清除本地存储 Cookie 失败：${e.message}`);
    }
}

/**
 * 把 Access Token 持久化到 Obsidian 本地存储
 * @param {string} token - 清洗后的 Access Token
 */
function persistToken(token) {
    try {
        if (app?.saveLocalStorage) {
            app.saveLocalStorage(TOKEN_STORAGE_KEY, token);
        }
    } catch (e) {
        log(`保存 Token 到本地存储失败：${e.message}`);
    }
}

/**
 * 清除本地存储中的 Access Token
 */
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

/**
 * 同步读取剪贴板（优先 Electron clipboard，Obsidian 里最稳）
 * @returns {string} 剪贴板文本（去空白），读不到返回 ""
 */
function readClipboardTextSync() {
    try {
        const { clipboard } = require('electron');
        if (clipboard && typeof clipboard.readText === 'function') {
            const t = clipboard.readText();
            if (t && t.trim()) return t.trim();
        }
    } catch (e) {
        // require electron 失败 → 静默忽略
    }
    return "";
}

/**
 * 异步读取剪贴板（Electron 同步读失败时，退回 navigator.clipboard）
 * @returns {Promise<string>} 剪贴板文本，读不到返回 ""
 */
async function readClipboardTextAsync() {
    // 1) Electron clipboard（同步，几乎总能成功）
    const syncText = readClipboardTextSync();
    if (syncText) return syncText;

    // 2) navigator.clipboard（需要权限 / 用户手势，不一定成功）
    try {
        if (navigator?.clipboard?.readText) {
            const t = await navigator.clipboard.readText();
            if (t && t.trim()) return t.trim();
        }
    } catch (e) {
        // 权限被拒 / 无用户手势，忽略
    }
    return "";
}

// ============================== 凭据输入流程 ==============================

/**
 * 让用户输入 Access Token 并校验，成功后更新全局 USER_TOKEN + 写入本地存储
 * 支持从剪贴板自动预填
 * @returns {Promise<boolean>} 是否成功更新
 */
async function promptAndUpdateToken() {
    // 先从剪贴板读取，若已是有效 Token 格式，直接使用
    const fromClipboard = await readClipboardTextAsync();

    const message = "Bangumi 个人访问令牌（Access Token）\n在 https://next.bgm.tv/demo/access-token 生成，约 1 年有效。\n优先使用令牌认证，可省去频繁获取 Cookie。";
    const placeholder = "在此粘贴你的 Access Token";

    // 若剪贴板内容看起来像 Token（无空格、长度 > 20），作为默认值
    const clipboardIsToken = fromClipboard && fromClipboard.length > 20 && !fromClipboard.includes(' ') && !fromClipboard.includes('=') && !fromClipboard.includes(';');

    while (true) {
        const defaultValue = (clipboardIsToken ? fromClipboard : "") || placeholder;
        let input = await QuickAdd.quickAddApi.inputPrompt(message, defaultValue);

        // 用户取消
        if (input === null) return false;

        // 空输入
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

        // 校验通过
        USER_TOKEN = token;
        persistToken(token);
        // Token 认证成功时清空 Cookie，避免冲突
        USER_COOKIE = "";
        persistCookie("");
        new Notice(`Token 校验成功 ✅ 用户: ${username}\n已保存，下次运行无需重新输入。`, 5000);
        return true;
    }
}

/**
 * 弹出输入框让用户粘贴新的 Bangumi Cookie，并更新全局 USER_COOKIE
 * 改进点：
 *  - 先从剪贴板读取，若已是有效 Cookie，直接使用，不弹输入框
 *  - 只有剪贴板无效时，才弹输入框让用户手动粘贴
 *  - 成功后写入本地存储，下次启动无需重新粘贴
 * @returns {Promise<boolean>} 是否成功更新
 */
async function promptAndUpdateCookie() {
    // ---- 第一步：先尝试从剪贴板直接取 ----
    const fromClipboard = await readClipboardTextAsync();
    if (fromClipboard) {
        const cleanedFromClipboard = sanitizeCookieInput(fromClipboard);
        if (isValidBangumiCookie(cleanedFromClipboard)) {
            USER_COOKIE = cleanedFromClipboard;
            COMMON_HEADERS.Cookie = cleanedFromClipboard;
            persistCookie(cleanedFromClipboard);
            new Notice("已从剪贴板读取并保存 Cookie，正在校验登录状态…", 3000);
            return true;
        }
    }

    // ---- 第二步：剪贴板无效 / 为空 → 弹输入框让用户手动粘贴 ----
    let clipboardText = fromClipboard || "";
    const message = fromClipboard
        ? "剪贴板内容未识别到 chii_auth，请手动粘贴完整 Cookie（支持 DevTools 表格整段粘贴）"
        : "未从剪贴板读到 Cookie，请手动粘贴（支持 DevTools 表格整段粘贴）";
    const placeholder = "chii_sec_id=...; chii_theme=light; _tea_utm_cache_10000007=undefined; chii_cookietime=2592000; chii_auth=...; chii_searchDateLine=0; chii_sid=...";

    while (true) {
        // 注意：inputPrompt 第二个参数是 placeholder（灰色提示），不是默认值
        const defaultValue = clipboardText || placeholder;
        let input = await QuickAdd.quickAddApi.inputPrompt(message, defaultValue);

        // 用户取消
        if (input === null) {
            const retry = await QuickAdd.quickAddApi.yesNoPrompt("已取消", "未输入 Cookie，是否重新输入？");
            if (!retry) return false;
            continue;
        }

        // 空输入（用户没敲任何内容，直接点确认）
        if (!input || input.trim() === "") {
            const retry = await QuickAdd.quickAddApi.yesNoPrompt(
                "输入为空",
                "输入框里那串 chii_sec_id=... 是占位提示，不是已填好的内容。\n请手动粘贴 Cookie 后再点确认。是否重新输入？"
            );
            if (!retry) return false;
            continue;
        }

        const cleaned = sanitizeCookieInput(input);
        if (!isValidBangumiCookie(cleaned)) {
            new Notice("Cookie 缺少必要字段（至少包含 chii_auth=...），请重新复制粘贴。", 5000);
            // 保留上次输入作为参考，方便修正
            clipboardText = cleaned || input;
            continue;
        }

        // 更新全局 Cookie
        USER_COOKIE = cleaned;
        COMMON_HEADERS.Cookie = cleaned;
        persistCookie(cleaned);
        new Notice("已更新 Cookie 并保存，正在校验登录状态…", 3000);
        return true;
    }
}

/**
 * 交互式认证流程（普通模式 / 批量模式共用）
 * 未登录 → 清旧凭据 → 询问认证方式 → 打开浏览器 → 让用户粘贴 → 校验 → 循环直到成功或取消
 * @returns {Promise<void>}
 */
async function ensureAuthenticated() {
    let logged = await checkBangumiLogin();
    while (!logged) {
        // 本地存储里的凭据已失效，先清掉，避免下次又拿旧值
        clearPersistedCookie();
        clearPersistedToken();
        USER_COOKIE = "";
        USER_TOKEN = "";
        USER_NAME = "";

        // 询问用户选择认证方式
        const useToken = await QuickAdd.quickAddApi.yesNoPrompt(
            "Bangumi 未登录",
            "检测到未登录或凭据已失效。\n\n" +
            "推荐使用「个人访问令牌（Access Token）」——一次配置，约 1 年有效，无需频繁获取 Cookie。\n\n" +
            "选择「是」：打开浏览器生成 Access Token（推荐）\n" +
            "选择「否」：打开浏览器登录后复制 Cookie"
        );

        if (useToken) {
            // ---- 路线 A：使用 Access Token ----
            await openBangumiTokenPage();
            new Notice("已打开 Bangumi Token 生成页。请在浏览器中登录并生成个人令牌，然后复制令牌回到 Obsidian。", 8000);

            const tokenUpdated = await promptAndUpdateToken();
            if (!tokenUpdated) {
                throw new Error("未更新 Token，已中止");
            }
        } else {
            // ---- 路线 B：使用 Cookie ----
            await openBangumiLoginPage();
            new Notice("已打开 Bangumi 登录页。登录完成后，请复制浏览器中的 Cookie（DevTools → Application → Cookies → https://bgm.tv，可直接整段复制），随后回到 Obsidian。", 8000);

            const cookieUpdated = await promptAndUpdateCookie();
            if (!cookieUpdated) {
                throw new Error("未更新 Cookie，已中止");
            }
        }

        // 用新凭据重新校验
        logged = await checkBangumiLogin();
        if (!logged) {
            new Notice("凭据校验失败，请检查是否复制完整或令牌是否有效。", 5000);
        }
    }
}

// ============================== 收藏批量拉取 ==============================

/**
 * 获取当前登录用户的用户名（批量模式需要）
 * 优先使用已缓存的 USER_NAME；未缓存时通过 /v0/me 拉取
 * @returns {Promise<string>} 用户名，失败返回空串
 */
async function getCurrentUsername() {
    if (USER_NAME) return USER_NAME;
    if (!USER_TOKEN || !USER_TOKEN.trim()) return "";
    const name = await validateAccessToken(USER_TOKEN);
    return name || "";
}

/**
 * 拉取指定收藏类型的所有条目（自动分页）
 * @param {number} subjectType - 作品类型：1=书籍, 2=动画, 3=音乐, 4=游戏, 6=三次元
 * @param {number} collectionType - 收藏类型：1=想看, 2=在看, 3=看过, 4=搁置, 5=抛弃
 * @returns {Promise<Array>} 条目数组（原始 API 数据）
 */
async function fetchAllCollections(subjectType, collectionType) {
    const username = await getCurrentUsername();
    if (!username) {
        throw new Error("无法获取用户名（批量模式需要有效的 Access Token）");
    }

    const allItems = [];
    const limit = 50;
    let offset = 0;
    let total = Infinity;
    const maxPages = 200; // 保险上限：最多 10000 条

    for (let page = 0; page < maxPages; page++) {
        // 中断拉取
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

        // 已拉完（本页不满 limit 或累计数已到 total）
        if (items.length < limit || allItems.length >= total) break;
    }

    return allItems;
}

// ============================== 批量中断按钮 ==============================

/**
 * 显示「中断导入」悬浮按钮
 * 点击后设置 BATCH_ABORT = true，循环会在当前作品处理完后停止
 * 多次调用只会创建一个按钮
 */
function showAbortButton() {
    // 已存在则先移除，避免重复
    const old = document.getElementById(ABORT_BTN_ID);
    if (old) old.remove();

    const btn = document.createElement('button');
    btn.id = ABORT_BTN_ID;
    btn.textContent = '⏹ 中断导入';
    btn.style.cssText = [
        'position: fixed',
        'right: 24px',
        'bottom: 24px',
        'z-index: 999999',
        'padding: 12px 18px',
        'background: #c62828',
        'color: #fff',
        'border: none',
        'border-radius: 8px',
        'font-size: 15px',
        'font-weight: 600',
        'cursor: pointer',
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

/**
 * 移除「中断导入」悬浮按钮
 */
function hideAbortButton() {
    const btn = document.getElementById(ABORT_BTN_ID);
    if (btn) btn.remove();
}

// ============================== 批量生成主流程 ==============================
/**
 * 批量模式：一次拉取指定收藏状态的动画，逐个生成笔记（跳过所有交互）
 * - 认证成功后弹出多选框选择要拉取的状态
 * - 对每个收藏项走 getAnimeByurl 解析
 * - 直接调用 QuickAdd 模板生成，跳过标签选择、评分等交互
 * - 批量过程中显示「中断导入」按钮，可随时中止
 * - 已存在的文件是否覆盖，取决于 QuickAdd 模板设置（"Overwrite existing file"）
 * @param {object} QuickAddInstance - QuickAdd 实例
 */
async function bangumiBatch(QuickAddInstance) {
    QuickAdd = QuickAddInstance;
    pageNum = 1;
    BATCH_ABORT = false; // 每次进入批量模式都重置中断标志

    // ===== 认证 =====
    await ensureAuthenticated();

    // 批量模式必须使用 Token 才能读取用户收藏
    if (!USER_TOKEN || !USER_TOKEN.trim()) {
        const ok = await QuickAdd.quickAddApi.yesNoPrompt(
            "需要 Access Token",
            "批量拉取收藏需要 Access Token。\n是否现在打开 Token 生成页？\n（生成后粘贴到 Obsidian，即可使用批量模式）"
        );
        if (!ok) return;

        await openBangumiTokenPage();
        new Notice("已打开 Token 生成页。生成后请复制令牌回到 Obsidian。", 8000);

        const tokenUpdated = await promptAndUpdateToken();
        if (!tokenUpdated) return;
    }

    // 拉一次用户名，确保 USER_NAME 已缓存
    const username = await getCurrentUsername();
    if (!username) {
        new Notice("无法获取用户名，批量模式已中止。", 5000);
        return;
    }

    // ===== 让用户勾选要拉取的收藏状态 =====
    const allLabels = ["想看", "在看", "看过", "搁置", "抛弃"];
    const defaultChecked = ["想看", "在看", "看过"];
    const selectedLabels = await QuickAdd.quickAddApi.checkboxPrompt(allLabels, defaultChecked);
    if (!selectedLabels || selectedLabels.length === 0) {
        new Notice("未选择任何收藏类型，已中止。", 4000);
        return;
    }
    const typesToFetch = selectedLabels.map(l => COLLECTION_LABEL_TO_TYPE[l]).filter(Boolean);

    new Notice(`正在拉取收藏（${selectedLabels.join("、")}）…`, 4000);

    // ===== 拉取全部收藏 =====
    const subjectMap = new Map(); // subject_id -> { subject_id, subject, collectionType, tags, rate }
    for (const t of typesToFetch) {
        // 中断拉取
        if (BATCH_ABORT) break;

        try {
            const items = await fetchAllCollections(2, t); // subject_type=2 表示动画
            for (const item of items) {
                // 同一作品通常只在一个状态里；若重复，以先遇到的为准
                if (!subjectMap.has(item.subject_id)) {
                    subjectMap.set(item.subject_id, {
                        subject_id: item.subject_id,
                        subject: item.subject || {},
                        collectionType: t,
                        userTags: Array.isArray(item.tags) ? item.tags : [],
                        // API 里 rate 是用户对该作品的评分（0 表示未评分）
                        rate: item.rate || 0,
                    });
                }
            }
        } catch (e) {
            new Notice(`拉取「${COLLECTION_TYPE_MAP[t]}」失败：${e.message}`, 6000);
            log(`拉取失败: ${e.message}`);
        }
    }

    // 中断检查
    if (BATCH_ABORT) {
        new Notice("已在拉取阶段中断，未生成任何笔记。", 5000);
        return;
    }

    const subjects = Array.from(subjectMap.values());
    if (subjects.length === 0) {
        new Notice("没有拉取到任何动画收藏，已中止。", 5000);
        return;
    }

    // ===== 二次确认 =====
    const proceed = await QuickAdd.quickAddApi.yesNoPrompt(
        "准备批量生成笔记",
        `共拉取到 ${subjects.length} 部动画。\n` +
        `即将逐个生成笔记（是否覆盖已存在的文件，取决于 QuickAdd 模板设置）。\n\n` +
        `过程中右下角会出现「中断导入」按钮，可随时中止。\n\n` +
        `是否开始？`
    );
    if (!proceed) return;

    // ===== 显示中断按钮 =====
    showAbortButton();

    // ===== 逐个生成 =====
    let success = 0;
    let failed = 0;
    let aborted = false;
    const failedList = [];

    try {
        for (let i = 0; i < subjects.length; i++) {
            // 每轮循环检查中断标志
            if (BATCH_ABORT) {
                aborted = true;
                break;
            }

            const item = subjects[i];
            const subjectUrl = `https://bgm.tv/subject/${item.subject_id}`;
            const displayName = item.subject?.name_cn || item.subject?.name || String(item.subject_id);

            new Notice(`[${i + 1}/${subjects.length}] 正在处理：${displayName}`, 3000);

            try {
                const Info = await getAnimeByurl(subjectUrl);

                // 批量模式跳过标签勾选：
                // 优先用用户自己在 Bangumi 上打的标签；没有则回退到推荐的标签
                if (Array.isArray(item.userTags) && item.userTags.length > 0) {
                    Info.tags = item.userTags;
                } else {
                    Info.tags = Info.tagsRecommendArray || [];
                }
                Info.url = subjectUrl;

                // 评分处理：优先用用户在 Bangumi 上的评分（API 返回的 rate，0 表示未评分）
                // 没有评分就用默认值，绝不弹窗让用户输入
                if (item.rate && Number(item.rate) > 0) {
                    Info.score = String(item.rate);
                } else {
                    Info.score = DEFAULT_SCORE_IF_EMPTY;
                }

                // 附带收藏状态，供模板中使用
                Info.collectionType = item.collectionType;
                Info.collectionTypeName = COLLECTION_TYPE_MAP[item.collectionType];

                // 直接调用模板生成笔记，跳过所有交互
                await QuickAdd.quickAddApi.executeChoice(TEMPLATE_NAME_ANIME, Info);

                success++;
            } catch (e) {
                failed++;
                failedList.push(`${item.subject_id} ${displayName}：${e.message}`);
                console.error(`[批量] 处理失败`, item.subject_id, e);
            }
        }
    } finally {
        // 无论成功、失败还是异常，都要移除中断按钮
        hideAbortButton();
    }

    // ===== 输出统计 =====
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

/**
 * 提取作品基础信息
 * @param {Document} doc - DOM文档对象
 * @param {string} type - 作品类型（anime/book/game）
 * @returns {object} 基础信息对象
 */
function extractBaseInfo(doc, type) {
    const $ = (s) => doc.querySelector(s);
    const workinginfo = {};

    // 名称解析
    const workingname = $("meta[name='keywords']")?.content || "";
    const regex = /[\*"\\\/<>:\|?]/g;
    const nameArr = workingname.split(",");
    workinginfo.CN = (nameArr[0]?.replace(regex, ' ') || " ").trim() || " ";
    workinginfo.JP = (nameArr[1]?.replace(regex, ' ') || " ").trim() || " ";
    workinginfo.fileName = `${workinginfo.CN}_${workinginfo.JP}`.trim() || "未知作品";

    // 类型与评分
    workinginfo.type = ($("small.grey")?.textContent || " ").trim() || " ";
    workinginfo.rating = ($("span[property='v:average']")?.textContent || "未知").trim() || "未知";

    // 封面图片
    const regPoster = $("div[align='center'] > a")?.href || "";
    let Poster = String(regPoster).replace("app://", "http://").trim();
    if (Poster) {
        workinginfo.Poster = Poster.startsWith("http") ? Poster : `https://${Poster.replace(/^https?:\/\//, "")}`;
    } else {
        workinginfo.Poster = "https://via.placeholder.com/300x450?text=无封面";
    }

    // 简介
    let summary = $("#subject_summary")?.textContent || '暂无简介';
	const nbspReg = /&nbsp;/gm;
	summary = summary.replace(nbspReg, "\n").trim();
	const multiSpaceReg = /\s{4,}/gm;
	summary = summary.replace(multiSpaceReg, "\n");
	const multiLineReg = /\n+/g;
	summary = summary.replace(multiLineReg, "\n");
	summary = summary || "暂无简介";
	workinginfo.summary = summary;


    // 标签
    const TagBox = $("div.subject_tag_section > div.inner");
    workinginfo.tagsArray = TagBox 
        ? Array.from(TagBox.querySelectorAll('a > span')).map(span => span.textContent.trim()).filter(Boolean)
        : [];
	workinginfo.tagsArray = TagBox 
    ? (() => {
        const allTagLinks = TagBox.querySelectorAll('a:has(span)');
        // 提取“标签文本”和“对应数字”，生成[{text: 标签名, number: 数字}]结构
        const tagsWithNumber = Array.from(allTagLinks).map(link => {
            const textSpan = link.querySelector('span');
            const tagText = textSpan ? textSpan.textContent.trim() : '';
            // 提取数字（默认0，避免无数字时排序异常）
            const numberSmall = link.querySelector('small.grey');
            const tagNumber = numberSmall 
                ? parseInt(numberSmall.textContent.trim(), 10) || 0 
                : 0;
            return { text: tagText, number: tagNumber };
        })
        .filter(tag => tag.text && tag.number > 0);
        const sortedTags = tagsWithNumber.sort((a, b) => b.number - a.number);
        return sortedTags.map(tag => tag.text);
    })()
    : [];
	workinginfo.tagsRecommendArray = TagBox 
    ? (() => {
        // 筛选出所有同时包含"l"和"meta"类的<a>标签
        const allMetaLinks = TagBox.querySelectorAll('a.l.meta');
        return Array.from(allMetaLinks).map(link => {
            const span = link.querySelector('span');
            return span ? span.textContent.trim() : '';
        }).filter(Boolean); 
    })()
    : [];


    // 别名
    const infobox = doc.querySelectorAll("#infobox > li");
    const str = Array.from(infobox).map(li => li.innerText.trim()).join("\n");
    const regaliases = /别名:\s*(.*?)(?=\n|$)/gm; 
    const aliasMatches = str.match(regaliases) || [];
    const alias = aliasMatches.map(match => match.replace(/^别名:\s*/, "").trim()).filter(Boolean);
    workinginfo.alias = alias.length > 0 ? alias.join(",") : "无";

    // 空值兜底
    for (const key in workinginfo) {
        if (!workinginfo[key] || workinginfo[key] === "null" || workinginfo[key] === "undefined") {
            workinginfo[key] = " ";
        }
    }

    return workinginfo;
}

/**
 * 解析角色列表
 * @param {Document} doc - DOM文档对象
 * @param {string} type - 作品类型（anime/book/game）
 * @returns {object} 角色信息对象（含列表和单个角色字段）
 */
function parseCharacterList(doc, type) {
    const $ = (s) => doc.querySelector(s);
    const characterList = [];
    let CharacterBox, EachCharaNumber;
    // 根据类型选择角色容器和字段数量
	CharacterBox = doc.querySelectorAll("#browserItemList > li.item");
    if (type === "anime") {
        EachCharaNumber = 3; // 动画：名称+CV+头像
    } else {
        EachCharaNumber = 2; // 漫画/游戏：名称+头像
    }

    const regCharacterArray = Array.from(CharacterBox || []);
    regCharacterArray.forEach(item => {
        const row = [];
        // 角色解析
        const charaType = item.querySelector("span.badge_job_tip")?.textContent.trim() || "--";
        const charaCnName = item.querySelector("a.thumbTip")?.getAttribute("title")?.trim() || "暂无角色";
        const charaJpName = item.querySelector("p.title > a.title")?.textContent.trim() || "暂无日文名";
        const charaCV = item.querySelector("p.badge_actor > a")?.textContent.trim() || "暂无CV";
        
        // 角色图片解析
        const charaPhotoStyle = item.querySelector("span.avatarNeue")?.getAttribute("style") || "";
        const regCharacterPhoto = /background-image:\s*url\('([^']*)'\)/gi; // 忽略大小写和空格
        const photoMatch = regCharacterPhoto.exec(charaPhotoStyle);
        const charaPhoto = photoMatch ? `https:${photoMatch[1].replace(/^https?:\/\//, "")}` : "";

        // 按类型组装角色信息
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

    // 组装角色信息
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

/**
 * 提取信息框文本并解析指定字段
 * @param {Document} doc - DOM文档对象
 * @param {object} rules - 解析规则（key: 字段名, value: 正则表达式）
 * @returns {object} 解析后的字段对象
 */
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

    // ===== 认证流程（普通模式 / 批量模式共用） =====
    await ensureAuthenticated();

    // 输入作品名称
    const name = await QuickAdd.quickAddApi.inputPrompt("输入查询的作品名称");
    if (!name || name.trim() === "") throw new Error("没有输入任何内容");

    // 选择作品类型
    const source = await QuickAdd.quickAddApi.suggester(
        ["请选择筛选作品类型：全部", "动画(含剧场版及OVA)", "漫画", "游戏"],
        ["all", "2", "1", "4"]
    ) || "all";

    // 搜索作品
    const encodedName = encodeURIComponent(name.trim());
    let url = `https://bgm.tv/subject_search/${encodedName}?cat=${source}`;
    let searchResult = await searchBangumi(url);
    if (!searchResult) throw new Error("找不到你搜索的内容");

    // 选择作品
    let choice;
    while (true) {
        choice = await QuickAdd.quickAddApi.suggester(
            (obj) => obj.text,
            searchResult
        );
        if (!choice) throw new Error("没有选择内容");

        if (choice.typeId === 8) {
            // 加载下一页
            new Notice("加载下一页");
            searchResult = await searchBangumi(choice.link);
            if (!searchResult) throw new Error("找不到你搜索的内容");
        } else {
            break;
        }
    }

    // 获取作品详情
    let Info, sourceName;
    try {
        switch (choice.type) {
            case "book":
                Info = await getComicByurl(choice.link);
                new Notice("正在生成漫画笔记📚");
                sourceName = "漫画";
                break;
            case "anime":
                Info = await getAnimeByurl(choice.link);
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

    // 标签选择与评分输入
    Info.tags = await QuickAdd.quickAddApi.checkboxPrompt(Info.tagsArray, Info.tagsRecommendArray) || [];
    // 不弹评分输入框：直接给默认值（如需手动输入，把这行改成 await getValidScoreInput()）
    Info.score = DEFAULT_SCORE_IF_EMPTY;
    Info.url = choice.link || " ";

    // 生成笔记
    const TemplateName = `Bangumi${sourceName}`;
    await QuickAdd.quickAddApi.executeChoice(TemplateName, Info);
}

/**
 * 获取有效的评分输入（0-10分）
 * @returns {string} 评分字符串（含null处理）
 */
async function getValidScoreInput() {
	let score;
    while (true) {
        score = await QuickAdd.quickAddApi.inputPrompt("请给这部作品评分", "0-10分");
        if (score === null || score.trim() === "") {
            const retry = await QuickAdd.quickAddApi.yesNoPrompt("错误", "未输入评分。是否再次输入？");
            if (!retry) return "null";
            continue;
        }
		// ---- 自动替换中文/中英文常见标点为半角点 ----
        // 替换：中文句号/点号/中文逗号/英文逗号/顿号 中英文等成半角点
        // 这些字符 -> '.': '。' '．' '，' ',' '、'
        score = String(score).trim();
        score = score.replace(/[。，、．,]/g, '.');
        // 合并连续多个点为单个
        score = score.replace(/\.{2,}/g, '.');
		// 输入校验
        let scoreNum = parseFloat(score);
        if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 10) {
            new Notice("请输入1.0到10.0之间的数字!", 3000);
            continue;
        }
        // 格式化评分（保留一位小数）
        if (scoreNum === 10) {
            score = "10.0";
        } else {
            score = scoreNum.toFixed(1);
        }
        break;
    }
	return score
}

/**
 * 搜索Bangumi作品
 * @param {string} url - 搜索地址
 * @returns {Promise<Array|null>} 搜索结果列表
 */
async function searchBangumi(url) {
    const res = await requestGet(url);
    if (!res) return null;

    const doc = parseHtmlToDom(res);
    const $ = (s) => doc.querySelector(s);
    const re = $("#browserItemList");
    if (!re) return null;

    // 初始化结果列表
    const itemList = [{
        text: "❔ 没找到想要的作品 \n下一页",
        link: url.includes("&page=") ? url.replace(/&page=\d+/, `&page=${++pageNum}`) : `${url}&page=${++pageNum}`,
        type: "none",
        typeId: 8
    }];

    // 解析搜索结果
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

        // 修复链接拼接
        const href = titleElem.getAttribute("href") || "";
        link = href.startsWith("http") ? href : `https://bgm.tv${href.replace(/^\/+/, "/")}`;
        itemList.push({ text, link, type, typeId });
    }

    // 排序并返回
    itemList.sort((a, b) => a.typeId - b.typeId);
    return itemList.length > 1 ? itemList : null; // 排除仅含"下一页"的情况
}

// ============================== 作品详情解析 ==============================
/**
 * 获取动画信息
 * @param {string} url - 动画详情页地址
 * @returns {Promise<object>} 动画信息对象
 */
async function getAnimeByurl(url) {
	console.log("URL:"+ url );
    const page = await requestGet(url);
    if (!page) {
        notice("No results found.");
        throw new Error("No results found.");
    }

    const doc = parseHtmlToDom(page);
    const $ = (s) => doc.querySelector(s);
    const $$ = (s) => doc.querySelectorAll(s);

    // 验证类型
    const Type = $("#headerSubject")?.getAttribute('typeof');
    const validAnimeTypes = ["v:Movie", "v:Video"]; // Bangumi动画类型可能为v:Video
    if (!validAnimeTypes.includes(Type)) {
        new Notice("您输入的作品不是动画！");
        throw new Error("Not An Anime Information Input");
    }

    // 1. 基础信息
    const workinginfo = extractBaseInfo(doc, "anime");

    // 2. 信息框字段解析
	
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
        from: /原作:\s*([^\n]*)/
    };
    const infoboxFields = extractInfoboxFields(doc, infoboxRules);

    // 3. 日期解析
    const str = Array.from($$("#infobox > li")).map(li => li.innerText.trim()).join("\n");
    const dateRegMap = {
        "TV": /放送开始:\s*([^\n]*)/,
        "OVA": /发售日:\s*([^\n]*)/,
        "剧场版": /上映年度:\s*([^\n]*)/,
        "OAD": /发售日:\s*([^\n]*)/
    };
    const regstartdate = dateRegMap[workinginfo.type] || /放送开始:\s*([^\n]*)/;
    const startdateMatch = regstartdate.exec(str);
    const startdate = startdateMatch ? startdateMatch[1].trim().replace(/\n|\r/g, "").replace(/\ +/g, "") : "未知";

	let season = "未知季度";let seasonYear;
    if (startdate && startdate.includes("年")) {
        const year = startdate.split("年")[0];
        const monthPart = startdate.split("年")[1];
        if (monthPart && monthPart.includes("月")) {
            const month = parseInt(monthPart.split("月")[0]);
            // 处理跨年问题：12月归为下一年度的01月新番
            seasonYear = year;
            if (month === 12) {
                seasonYear = (parseInt(year) + 1).toString();
            }
            // 确定季度分类
            if ([12, 1, 2].includes(month)) {
                season = "01月新番";
            } else if ([3, 4, 5].includes(month)) {
                season = "04月新番";
            } else if ([6, 7, 8].includes(month)) {
                season = "07月新番";
            } else if ([9, 10, 11].includes(month)) {
                season = "10月新番";
            }
        }
	}

    // 4. 章节列表解析 
	
	const detailUrl = url + "/ep"
	const contentLists = await getParagraph(detailUrl);
	

	
	let paraList = []; // 正篇章节列表
	let opedList = []; // SP/OP/ED列表
	
	paraList = contentLists.paraList;
	opedList = contentLists.opedList;
	
	
    // 角色列表
    const characterInfo = parseCharacterList(doc, "anime");

    // 最终结果
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

    // 最终兜底
    for (const key in finalInfo) {
        if (!finalInfo[key] || finalInfo[key] === "null" || finalInfo[key] === "undefined") {
            finalInfo[key] = " ";
        }
    }
    return finalInfo;
}


/**
 * 封装目录信息
 */
async function getParagraph(detailUrl) {
    const detailPage = await requestGet(detailUrl);
    if (!detailPage) {
        notice("No results found.");
        throw new Error("No results found.");
    }
	
	
	const paraList = []; // 正篇章节列表
	const opedList = []; // SP/OP/ED列表

    const detailDoc = parseHtmlToDom(detailPage);
    const $ = (s) => detailDoc.querySelector(s);
    const $$ = (s) => detailDoc.querySelectorAll(s);
	const paragraphbox = $$(".line_list li");
	
	let currentType = ""; // 当前章节类型（SP/OP/ED）
	let TypeNum = 1; // 正篇章节计数

	paragraphbox.forEach(li => {
		// 识别章节类型标记（"SP"、"OP"、"ED"）
		// 1. 判断 class 是否包含 'cat'
		const hasCatClass = li.classList.contains('cat');

		// 2. 获取元素文本内容（去除前后空格，避免空格影响判断）
		const liText = li.textContent.trim();
		if (hasCatClass) {
			currentType = li.textContent.trim(); 
			TypeNum = 1; 
			return;
		}

		// 提取章节标题元素（无标题则跳过）
		const titleElem = li.querySelector('h6');
		if (!titleElem) return;
		//console.log("h6:"+titleElem.textContent)
		//标记是否看过
		let alreadyView = false;		
		const small = li.querySelector('small');
		if(small){
			//console.log("small:"+small.textContent)	//
			if(small.textContent.trim() !== ''){
				alreadyView = true;
			}
		}
		
		
		// 获取 a 标签文本
		const aEl = titleElem.querySelector('a');
		const aText = aEl ? aEl.textContent.trim() : '';
		// 日文标题
		//const titleAttr = titleElem.getAttribute('title') || "";
		const titleParts = aText.split('.').filter(Boolean); 
		//const episodeNum = titleParts[0]?titleParts[0] || ""; // 集数
		const episodeNum = titleParts[0] ? titleParts[0].match(/\d+/)?.[0] || "" : "";
		const jpTitle = titleParts.slice(1).join(' ') || ""; // 日文标题



		// 获取第二个 span 文本
		const spans = titleElem.querySelectorAll('span');
		//console.log("spans:"+spans);
		//console.log("pans.length:"+spans.length);
		//console.log("spans[0]:"+spans[0].textContent.trim());
		const secondSpanText = spans.length >= 1 ? spans[spans.length-1].textContent.trim() : '';  
		
		// 中文标题
		//const titleRel = titleElem.getAttribute('rel');
		//const cnTitleElem = titleRel ? $(titleRel) : null;
		//const cnTitleRaw = cnTitleElem?.innerText || "";
		// 提取"中文标题:"后的内容
		//const cnTitleMatch = cnTitleRaw.match(/中文标题:\s*([\s\S]*?)(?=首播:|$)/);
		const cnTitle = secondSpanText ? secondSpanText.trim() : ""; 

		// 按类型组装列表（区分正篇/SP/OP/ED）
		if (currentType === "本篇" || currentType === "正篇") {
			// 无类型标记 → 正篇章节
			let fullTitle = ``;
			if(alreadyView){
				fullTitle +=`- [x] `;
			}else{
				fullTitle +=`- [ ] `;
			}
			fullTitle += `第${episodeNum}话 ${jpTitle} ${cnTitle}`.trim();
			
			paraList.push(fullTitle || `- [ ] 第${episodeNum}话 无标题`);
		} else {
			// 有类型标记 → SP/OP/ED
			let fullTitle = ``;
			if(alreadyView){
				fullTitle +=`- [x] `;
			}else{
				fullTitle +=`- [ ] `;
			}
			
			fullTitle += `${currentType}-${episodeNum}: ${jpTitle}${cnTitle}`.trim();
			opedList.push(fullTitle || `${currentType}-${episodeNum}: 无标题`);
		}
	});
  return {
    paraList: paraList,
    opedList: opedList
  };
}


/**
 * 获取漫画信息
 * @param {string} url - 漫画详情页地址
 * @returns {Promise<object>} 漫画信息对象
 */
async function getComicByurl(url) {
    const page = await requestGet(url);
    if (!page) {
        notice("No results found.");
        throw new Error("No results found.");
    }

    const doc = parseHtmlToDom(page);
    const $ = (s) => doc.querySelector(s);

    // 验证类型
    const Type = $("#headerSubject")?.getAttribute('typeof');
    if (Type !== "v:Book") {
        new Notice("您输入的作品不是书籍！");
        throw new Error("Not A Book Information Input");
    }

    // 基础信息
    const workinginfo = extractBaseInfo(doc, "book");

    // 信息框字段解析
    const infobox = doc.querySelectorAll("#infobox > li");
    const str = Array.from(infobox).map(li => li.innerText.trim()).join("\n");
	
    

    
    // 作者（优先级：作者 > 原作）
    const authorMatch = /作者:\s*([^\n]*)/.exec(str) || /原作:\s*([^\n]*)/.exec(str);
    const author = authorMatch ? authorMatch[1].trim().replace(/\n|\r/g, "").replace(/\ +/g, "") : "未知";
 
	console.log("authorMatch"+authorMatch);
	
    // 作画（优先级：作画 > 作者）
    const staffMatch = /作画:\s*([^\n]*)/.exec(str);
    const staff = staffMatch ? staffMatch[1].trim().replace(/\n|\r/g, "").replace(/\ +/g, "") : (author !== "未知" ? author : "未知");
	console.log("staffMatch"+staffMatch);

    const infoboxFields = {
        episode: /话数:\s*(\d*)/g.exec(str) ? /话数:\s*(\d*)/g.exec(str)[1].trim() : "0",
        author: author,
        staff: staff,
        Publish: /出版社:\s*([^\n]*)/.exec(str) ? /出版社:\s*([^\n]*)/.exec(str)[1].trim().replace(/\n|\r/g, "").replace(/\ +/g, "") : "未知",
        Journal: /连载杂志:\s*([^\n]*)/.exec(str) ? /连载杂志:\s*([^\n]*)/.exec(str)[1].trim().replace(/\n|\r/g, "").replace(/\ +/g, "") : "未知",
        ReleaseDate: /发售日:\s*([^\n]*)/.exec(str) ? /发售日:\s*([^\n]*)/.exec(str)[1].trim().replace(/\n|\r/g, "").replace(/\ +/g, "") : "未知",
        Start: /开始:\s*([^\n]*)/.exec(str) ? /开始:\s*([^\n]*)/.exec(str)[1].trim().replace(/\n|\r/g, "").replace(/\ +/g, "") : "未知"
    };

    // 状态
    const endMatch = /结束:\s*([^\n]*)/.exec(str);
    infoboxFields.End = endMatch ? endMatch[1].trim().replace(/\n|\r/g, "").replace(/\ +/g, "") : "未知";
    infoboxFields.status = endMatch && endMatch[1].trim() ? "已完结" : "连载中";

    // 角色列表
    const characterInfo = parseCharacterList(doc, "book");

    // 最终结果
    const finalInfo = {
        ...workinginfo,
        ...infoboxFields,
        ...characterInfo
    };

    // 最终兜底
    for (const key in finalInfo) {
        if (!finalInfo[key] || finalInfo[key] === "null" || finalInfo[key] === "undefined") {
            finalInfo[key] = " ";
        }
    }

    return finalInfo;
}

/**
 * 获取游戏信息
 * @param {string} url - 游戏详情页地址
 * @returns {Promise<object>} 游戏信息对象
 */
async function getGameByurl(url) {
    const page = await requestGet(url);
    if (!page) {
        notice("No results found.");
        throw new Error("No results found.");
    }

    const doc = parseHtmlToDom(page);
    const $ = (s) => doc.querySelector(s);
    const $$ = (s) => doc.querySelectorAll(s);

    // 验证类型
    const Type = $("#headerSubject")?.getAttribute('typeof');
    if (Type !== "v:Game") {
        new Notice("您输入的作品不是游戏！");
        throw new Error("Not A Game Information Input");
    }

    // 基础信息
    const workinginfo = extractBaseInfo(doc, "game");

    // 信息框字段
    const infobox = $$("#infobox > li");
    const str = Array.from(infobox).map(li => li.innerText.trim()).join("\n");
    
    // 平台
	const platformMatch = /平台:\s*([\s\S]*?)(?:\s*展开\+|$)/.exec(str);
    // log(`[调试] platformMatch 完整结果:${JSON.stringify(platformMatch)}`);
    // if (platformMatch) {
    // log(`[调试] 整个匹配到的字符串:${JSON.stringify(platformMatch[0])}`); 
    // log(`[调试] 平台信息捕获组:${JSON.stringify(platformMatch[1])}`);
    // }
    let platform = "未知";
    if (platformMatch && platformMatch[1]) {
    let lines = platformMatch[1].split('\n')
        .map(line => line.trim()) 
        .filter(line => line !== ''); 
    const firstInvalidIndex = lines.findIndex(line => line.includes(':'));
    const validPlatformLines = firstInvalidIndex > -1 
        ? lines.slice(0, firstInvalidIndex) 
        : lines;
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

    // 官方网站URL
    if (infoboxFields.website && !infoboxFields.website.startsWith("http")) {
        infoboxFields.website = `https://${infoboxFields.website.replace(/^https?:\/\//, "")}`;
    }

    // 角色列表
    const characterInfo = parseCharacterList(doc, "game");

    // 最终结果
    const finalInfo = {
        ...workinginfo,
        ...infoboxFields,
        ...characterInfo
    };

    // 最终兜底
    for (const key in finalInfo) {
        if (!finalInfo[key] || finalInfo[key] === "null" || finalInfo[key] === "undefined") {
            finalInfo[key] = " ";
        }
    }

    return finalInfo;
}


/**
 * 清除已保存的 Bangumi Cookie 和 Access Token（供 QuickAdd 手动调用）
 * 用法：在 QuickAdd 里新建一个 Macro / Template，执行 module.exports 时调用 resetBangumiAuth
 */
async function resetBangumiAuth() {
    clearPersistedCookie();
    clearPersistedToken();
    USER_COOKIE = "";
    USER_TOKEN = "";
    USER_NAME = "";
    new Notice("已清除保存的 Bangumi Cookie 和 Access Token，下次运行会要求重新认证。", 5000);
}

// 兼容旧调用名
async function resetBangumiCookie() {
    return resetBangumiAuth();
}