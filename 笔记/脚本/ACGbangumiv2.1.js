//by 月涟Luvian
//github链接：https://github.com/luvian114/Bangumi-to-obsidian/tree/main
//脚本v2.1可以直接通过Bangumi选择搜索动画 漫画 游戏，进而抓取信息字段。
//参考作者：@Lumos Cuman 永皓yh 风吹走记忆 
//特别鸣谢：@ 鬼头明里单推人 及热心观众
// 感谢 @北漠海 的优化思路及部分代码~
//modify: 莺空_栩白（解决章节目录部分展示不全问题【非登录状态：章节全量展示；登录状态：筛选已观看章节】、动画导演概率不展示）
//modify: 新增自动登录功能，移除硬编码 Cookie，改为动态获取并保存

// ============================== 自动登录配置区 ==============================
// 请填写你的 Bangumi 账号信息（邮箱和密码），用于 Cookie 失效时自动重新登录。
// 如果担心安全，可以留空，改为手动在下方 MANUAL_COOKIE 中填入临时 Cookie。
const BANGUMI_EMAIL = "2834637197@qq.com";      // 你的 Bangumi 登录邮箱
const BANGUMI_PASSWORD = "qwertasd123";   // 你的 Bangumi 登录密码

// 如果自动登录失败（例如遇到验证码），可以手动填入 Cookie 作为兜底。
// 格式示例：chii_sec_id=xxx; chii_theme=light; chii_auth=xxx; chii_sid=xxx
const MANUAL_COOKIE = "";

// Cookie 在 Obsidian 本地存储中的键名
const COOKIE_STORAGE_KEY = "bangumi_auto_cookies";

// ============================== 全局变量 ==============================
let QuickAdd;
let pageNum = 1;

// 注意：这里不再包含硬编码的 Cookie 字段，Cookie 会在 requestGet 中动态添加
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

const notice = (msg) => new Notice(msg, 5000);
const log = (msg) => console.log(msg);

module.exports = bangumi;

// ============================== 自动登录模块 ==============================

/**
 * 从 Obsidian 本地存储中读取已保存的 Cookie
 */
function loadSavedCookies() {
    try {
        return localStorage.getItem(COOKIE_STORAGE_KEY) || null;
    } catch (e) {
        return null;
    }
}

/**
 * 将 Cookie 保存到 Obsidian 本地存储
 */
function saveCookies(cookieString) {
    try {
        localStorage.setItem(COOKIE_STORAGE_KEY, cookieString);
    } catch (e) {
        console.error("保存 Cookie 失败:", e);
    }
}

/**
 * 验证 Cookie 是否仍然有效
 */
async function validateCookies(cookieString) {
    if (!cookieString) return false;
    try {
        const response = await requestUrl({
            url: "https://bgm.tv/",
            method: "GET",
            headers: {
                ...COMMON_HEADERS,
                "Cookie": cookieString,
            },
        });
        const html = response.text || "";
        // 登录后页面会包含用户相关的元素
        return html.includes("chii_auth") || html.includes("退出") || (html.includes("user/") && html.includes("nav"));
    } catch (e) {
        return false;
    }
}

/**
 * 获取登录页，提取 CSRF Token（字段名 at）和初始会话 Cookie
 */
async function fetchLoginPage() {
    // 第一步：先访问一次首页，获取初始会话 Cookie
    const initResponse = await requestUrl({
        url: "https://bgm.tv/",
        method: "GET",
        headers: COMMON_HEADERS,
    });

    const initSetCookie = initResponse.headers["set-cookie"] || [];
    const initCookieArray = Array.isArray(initSetCookie) ? initSetCookie : [initSetCookie];
    const initCookies = initCookieArray
        .map(c => c.split(";")[0])
        .join("; ");

    // 第二步：携带初始 Cookie 请求登录页
    const response = await requestUrl({
        url: "https://bgm.tv/login",
        method: "GET",
        headers: {
            ...COMMON_HEADERS,
            "Cookie": initCookies,
        },
    });

    const html = response.text || "";

    // 解析 CSRF Token
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const atInput = doc.querySelector('input[name="at"]');
    const csrfToken = atInput ? atInput.value : null;

    if (!csrfToken) {
        // 调试：输出部分 HTML 内容，方便查看实际结构
        console.error("登录页 HTML 片段（前2000字符）:", html.substring(0, 2000));
        throw new Error("无法解析 CSRF Token，登录页结构可能已变化。请查看控制台输出的 HTML 片段。");
    }

    // 合并初始 Cookie 和登录页返回的 Cookie
    const setCookieHeaders = response.headers["set-cookie"] || [];
    const cookieArray = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
    const loginPageCookies = cookieArray
        .map(c => c.split(";")[0])
        .join("; ");

    // 合并去重
    const cookieMap = new Map();
    for (const c of [...initCookies.split("; "), ...loginPageCookies.split("; ")]) {
        const [key, value] = c.split("=");
        if (key && value) cookieMap.set(key.trim(), value.trim());
    }
    const allCookies = Array.from(cookieMap.entries())
        .map(([k, v]) => `${k}=${v}`)
        .join("; ");

    // 检查验证码
    const captchaImg = doc.querySelector('img[src*="captcha"], img[src*="verify"], #captcha_img');
    if (captchaImg) {
        throw new Error("登录需要验证码，请手动登录后将 Cookie 填入 MANUAL_COOKIE");
    }

    return { csrfToken, initialCookies: allCookies };
}
/**
 * 执行登录 POST 请求，拦截重定向并提取新的 Cookie
 */
async function doLogin(email, password, csrfToken, initialCookies) {
    const formData = new URLSearchParams();
    formData.append("at", csrfToken);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("com", "account");
    formData.append("t", "submitLogin");
    formData.append("login", "登录");

    const response = await requestUrl({
        url: "https://bgm.tv/login",
        method: "POST",
        headers: {
            ...COMMON_HEADERS,
            "Content-Type": "application/x-www-form-urlencoded",
            "Cookie": initialCookies,
            "Referer": "https://bgm.tv/login",
            "X-Requested-With": "XMLHttpRequest",
        },
        body: formData.toString(),
        redirect: "manual", // 关键：手动处理重定向
    });

    const setCookieHeaders = response.headers["set-cookie"] || [];
    const cookieArray = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];

    if (cookieArray.length === 0) {
        throw new Error("登录失败：未收到新的 Cookie，请检查账号密码是否正确");
    }

    // 合并所有 Cookie（去重）
    const cookieMap = new Map();
    const allCookies = [...initialCookies.split("; "), ...cookieArray.map(c => c.split(";")[0])];
    for (const c of allCookies) {
        const [key, value] = c.split("=");
        if (key && value) {
            cookieMap.set(key.trim(), value.trim());
        }
    }

    const cookieString = Array.from(cookieMap.entries())
        .map(([k, v]) => `${k}=${v}`)
        .join("; ");

    if (!cookieString.includes("chii_auth") && !cookieString.includes("chii_sid")) {
        throw new Error("登录后未找到会话 Cookie，可能登录失败或需要验证码");
    }

    return cookieString;
}

/**
 * 获取有效的 Cookie：优先使用已保存的，失效则自动登录
 */
async function getOrRefreshCookies() {
    // 1. 先尝试已保存的 Cookie
    let cookies = loadSavedCookies();
    if (cookies && await validateCookies(cookies)) {
        console.log("使用已保存的 Cookie");
        return cookies;
    }

    // 2. 如果手动配置了 MANUAL_COOKIE，优先使用它
    if (MANUAL_COOKIE && MANUAL_COOKIE.trim() !== "") {
        if (await validateCookies(MANUAL_COOKIE)) {
            saveCookies(MANUAL_COOKIE);
            console.log("使用手动配置的 MANUAL_COOKIE");
            return MANUAL_COOKIE;
        } else {
            console.warn("MANUAL_COOKIE 已失效");
        }
    }

    // 3. 已保存的 Cookie 无效，检查账号配置
    if (!BANGUMI_EMAIL || !BANGUMI_PASSWORD) {
        throw new Error(
            "Cookie 已失效且未配置账号密码。\n" +
            "请在脚本开头的配置区填写 BANGUMI_EMAIL 和 BANGUMI_PASSWORD，或填写 MANUAL_COOKIE。"
        );
    }

    // 4. 执行自动登录
    new Notice("正在登录 Bangumi...");
    try {
        const { csrfToken, initialCookies } = await fetchLoginPage();
        const newCookies = await doLogin(BANGUMI_EMAIL, BANGUMI_PASSWORD, csrfToken, initialCookies);

        // 5. 验证新 Cookie 是否有效
        if (await validateCookies(newCookies)) {
            saveCookies(newCookies);
            new Notice("Bangumi 登录成功，Cookie 已保存");
            return newCookies;
        } else {
            throw new Error("登录后 Cookie 验证失败");
        }
    } catch (err) {
        new Notice(`Bangumi 自动登录失败: ${err.message}`, 6000);
        throw err;
    }
}

// ============================== 通用工具函数封装 ==============================
/**
 * 通用HTTP GET请求
 * @param {string} url - 请求地址
 * @param {object} [customHeaders=null] - 自定义请求头（不传则自动添加 Cookie）
 * @returns {Promise<string|null>} 响应内容或null
 */
async function requestGet(url, customHeaders = null) {
    try {
        // 如果没有传入自定义请求头，则使用默认头并动态添加 Cookie
        const headers = customHeaders || {
            ...COMMON_HEADERS,
            "Cookie": await getOrRefreshCookies(), // 动态获取 Cookie
        };
        const finalURL = new URL(url);
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

// ============================== 业务逻辑函数 ==============================
async function bangumi(QuickAddInstance) {
    QuickAdd = QuickAddInstance;
    pageNum = 1;

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
    //Info.score = await getValidScoreInput();
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