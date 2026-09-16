---
<%*
// ============================================================
// 以下为各字段的默认值，避免批量导入时逐项弹窗。
// 如需在单作品模式下手动选择，把对应行改回：
//   let state = tp.system.suggester([...显示值...], [...实际值...]);
// 即可。
// ============================================================
let state       = "已看📘";       // 观看状态：想看⏰ / 在看📖 / 已看📘
let subGroup    = "Online";        // 字幕组
let subLanguage = "简中";          // 字幕语言
let catego      = "其它";          // 改编类别
let mediaInfo   = "BD 1080P";      // 本地类型
-%>
笔记ID: "{{DATE:YYYYMMDDHHmmss}}"
别名: "{{alias}}"
tags: [{{tags}}]
观看状态: <% state %>
作品大类: Anime
中文名: "{{CN}}"
日文名: "{{JP}}"
封面: "{{Poster}}"
开播日期: "{{date}}"
开播年份: " {{year}}"
开播月份: " {{month}}"
Bangumi评分: " {{rating}}"
集数: "{{episode}}"
具体类型: "{{type}}"
动画公司: "{{AnimeMake}}"
本地类型: <% mediaInfo %>
字幕语言: <% subLanguage %>
字幕组: "<% subGroup %>"
改编类别: <% catego %>
---

> [!bookinfo|noicon]+ **{{CN}}** 
> ![bookcover|400]({{Poster}})
>
| 日文名 | {{JP}} |
|:------: |:------------------------------------------: |
| 分类 | <% catego %> |
| 新番 | {{year}} 年 {{month}} 月 | 
| 集数 | {{type}} 共{{episode}}话 |
| 官网 | [{{website}}]({{website}})    |
| 制作 | {{AnimeMake}} |
| 导演 | {{director}} |
| 脚本 | {{staff}} |
| 字幕 |<% subGroup %>-<%subLanguage%>    |
| 状态 |<% state %>|
| 评分 | {{score}}|
| 存储 |  [<%mediaInfo %>](file:///E:/luvian114/Videos/追番) |

> [!abstract]+ **简介**
> {{summary}}

> [!tip]+ **章节列表**

{{OpEd}}
{{paraList}}

> [!tip]+ **主要角色**
> 
|  {{character1}} | {{character2}}   |   {{character3}}  |
|:------: |:----------------: | :--------------- : |
|  {{characterCV1}} | {{characterCV2}}   |   {{characterCV3}}  |
|  {{characterPhoto1}} | {{characterPhoto2}}   |   {{characterPhoto3}}  |
| {{character4}}  |  {{character5}}  | {{character6}}  |
|  {{characterCV4}} | {{characterCV5}}   |   {{characterCV6}}  |
| {{characterPhoto4}}  |  {{characterPhoto5}}  | {{characterPhoto6}}  |
| {{character7}}  |  {{character8}}  | {{character9}}  |
|  {{characterCV7}} | {{characterCV8}}   |   {{characterCV9}}  |
| {{characterPhoto7}}  |  {{characterPhoto8}}  | {{characterPhoto9}}  |