---
title: obsidian操作手册
tags:
  - 笔记
  - obsidian操作手册
author: BigSea
email: 2834637197@qq.com
createDate: 2025-08-04 09:27:20
updateDate: 2025-11-20 23:43:55
week: 第45周｜星期三
Country: China
City: Beijing
Weather: ☀️
uvIndex(1-15): 1
Temperature(℃): 11
CurrentWeatherTime: 09:00 AM
GetWeatherTime: 2025-11-05 10:51:58
Feels Like(℃): 12
Pressure(hPa): 1023
Humidity(%): 65
WindSpeed: 1
WindSpeedDesc: 软风
TempRange(℃): 9-17
SunHour: 10.6h
Sunrise: 06:48 AM
Sunset: 05:08 PM
---

```base
formulas:
  未命名: file()
views:
  - type: cards
    name: 首页视图
    filters:
      or:
        - file.basename == "开发进度"
        - file.name == "学车笔记"
    order:
      - file.basename
    image: note.封面
    cardSize: 160
    imageFit: contain

```
```base
views:
  - type: cards
    name: 最近阅读
    filters:
      or:
        - and:
            - file.basename != "obsidian操作手册"
            - '!file.path.startsWith("笔记")'
            - '!file.path.startsWith("动漫")'
            - '!file.path.startsWith("images")'
            - file.ext == "md"
    order:
      - file.basename
      - tags
    sort:
      - property: file.mtime
        direction: DESC
    limit: 6
    cardSize: 170
    imageFit: contain
  - type: cards
    name: 最近阅读 2
    filters:
      or:
        - and:
            - file.basename != "obsidian操作手册"
            - '!file.path.startsWith("笔记")'
            - '!file.path.startsWith("动漫")'
            - '!file.path.startsWith("images")'
            - file.ext == "md"
            - file.ctime > "2025-06-30"
    order:
      - file.basename
      - tags
    sort:
      - property: file.mtime
        direction: DESC
    limit: 10
    cardSize: 170
    imageFit: contain

```


![数据地图](数据地图.base)


新街口：32.04418, 118.77981



# 反向链接 ：
1、链接 `[name](url)` [obsidian搭建](obsidian搭建.md)
2、`[[url]]` [[obsidian搭建]]

# 脚注
`[^1]`或者`^[脚注内容]`

>[!tip]
>[[回车后被补全成普通链接,解决方案：设置 → 文件与链接 → 打开“使用维基链接”


[springCloud](BigSea/后端/微服务/springCloud.md#After)

打开控制台：Ctrl + Shift + I

# markdown教程
[markdown教程](markdown教程.md)


网页搭建构思
1、转为+nginx代理

2、转为html+serve（用的3000端口），可以再用nginx代理一遍转为80端口



笔记属性处理
日期：templater提供的格式
天气：用户命令从网络获取
更新日期：templater+Front Matter Timestamp(指定需要更新的字段+关闭自动更新，改为关闭文件时更新)
```
	c    Weather condition,
    C    Weather condition textual name,天气状况文本名称
    x    Weather condition, plain-text symbol,天气状况，纯文本符号
    h    Humidity,湿度
    t    Temperature (Actual),温度（实际）
    f    Temperature (Feels Like),温度（体感）
    w    Wind,
    l    Location,
    m    Moon phase 🌑🌒🌓🌔🌕🌖🌗🌘,月相
    M    Moon day,
    p    Precipitation (mm/3 hours),降水量 (毫米/3小时)
    P    Pressure (hPa),气压（h帕）
    u    UV index (1-12),紫外线指数

    D    Dawn*,黎明*
    S    Sunrise*,日出*
    z    Zenith*,顶点*
    s    Sunset*,日落*
    d    Dusk*,黄昏*
    T    Current time*,当前时间*
    Z    Local timezone.当地时区

(*times are shown in the local timezone)
```

```shell


curl wttr.in/London?format=3
London: ⛅️ +7⁰C
curl wttr.in/London?format="%l:+%c+%t\n"
London: ⛅️ +7⁰C

curl wttr.in/London?format="%l:+%c+%t\n"
```


[使用 TemplaterJS wttr.in 的天气数据 ·SilentVoid13/模板 ·讨论 #435](https://github.com/SilentVoid13/Templater/discussions/435)



# webpage-export导出bug
避免加粗行后接换行，这个换行好像会被忽略，同时会导致图片展示有问题。（这次是通过改为H3解决的）

image converter，绝大部分关于图片的功能这个插件全都有，包括图片移动图片大包括图片位置移动，图片大小拖动变化，图片裁剪，图片涂鸦，图片标注，图片压缩，图片连同源文件一起删除，图片格式修改等


quicker
Windows圆形轮盘（相当于打开应用快捷键，类似utools）



Obsidian 插件：Word Splitting for Simplified Chinese in Edit Mode and Vim Mode
中文分词插件（双击时选中中文更合理点）


# 数据库
以文件形式创建，会没有源代码按钮

```base
filters:
    
formulas:
  未命名: ""
views:
  - type: table
    name: 表格
    order:
      - file.name
      - file.ctime
    sort:
      - property: file.ctime
        direction: ASC
    limit: 5

```


# b站时间戳
跳转到2分2秒：`&t=2m3s`或者`&t=123`

[00m28s](https://www.bilibili.com/video/BV1vj5RzcEMv/?t=00m28s)
[00m28s](https://hstream.moe/hentai/kyou-wa-yubiwa-o-hazusu-kara-1?t=00m28s)
[123](https://koneko-str.musume-h.xyz/2025/Kyou.wa.Yubiwa.o.Hazusu.kara/E01/720/chunks/chunk-stream0-00206.webp)
[摘录视频、PDF、PPT到Obsidian和Excalidraw的配置教程 -- 一键摘录内容，点击回链跳回原文_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1qH4y1j7Q6/?spm_id_from=333.999.0.0&vd_source=85201017c48d2579765d85c3db423ab8&t=04m:21s)
https://www.bilibili.com/video/BV17FfRYBE8G/?t=127
[抛弃Media Extended，拥抱最强Potplayer！Obsdian做视频笔记最好的方式，一键生成时间戳和截图，学习效率MAX！_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV17FfRYBE8G/?spm_id_from=333.337.search-card.all.click&vd_source=85201017c48d2579765d85c3db423ab8&t=00:02:02)






# 笔记属性自动修改
作用：文件名修改后，笔记属性中的title自动修改
插件：Linter，设置yaml标题


# T-动画
模板修改内容：
1、封面 ：超链接改为字符串，解决数据库查询时不展示封面问题
2、标签：改为`tags`，后面添加`[]`，解决查询标签问题


js脚本：







# 图片处理插件：
## image-converter  
点击图片，调整边框可手动调节图片大小
## obsidian-image-toolkit
alt大图查看，可旋转等

**图片冲突-插件冲突**：
会生成2个图，一个本地文件一个上传文件
解决方案，给image-converter 添加白名单
`*.jpg,*.jepg,*.png,*.webp`
![image.png|600|309x326](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-11-05-202511051702380.png)




# Template插件
![|422x185](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-11-05-202511051519051.png)


# 图片布局
**media viewer**
2025-12-12  禁用（有点影响图片查看）

```gallery
![image.png|150|103x103](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-11-11-202511112144682.png)
。。。。
```

缺点：
1、和advance image有一点的冲突，advance image识别不了里面的image（alt时可以查看，但下面的列表不展示）
2、不能手动调节图片大小


# 图片拖拽大小冲突
在点击时会有bug，导致图片大小被拖拽或者删除图片部分url或者部分url挪动到其他单元格，解决方案，禁用image-converter的拖拽功能




# 添加笔记属性（使用模板）

```yaml title:"不需要动态添加"
---
coordinates:
  - "32.04418"
  - "118.77981"
icon: notebook-pen
iconColor: orange
---
```

```yaml title:"动态添加"
---
//上面分别定义
coordinates:coordinates、icon、iconColor变量
  - "<%= coordinates[0] %>"
  - "<%= coordinates[1] %>"
icon: "<%= icon %>"
iconColor: "<%= iconColor %>"
---
```

![image.png|400](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-11-13-202511132331215.png)

# 图床设置
![image.png|600|327x157](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-11-05-202511051528678.png)

![image.png|600|324x228](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-11-05-202511051530667.png)

![image.png|600|322x148](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-11-05-202511051530235.png)

![image.png|600|340x239](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-11-05-202511051531553.png)

![image.png|600|336x185](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-11-05-202511051532866.png)

![image.png|600|338x237](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-11-05-202511051533479.png)



# Obsidian Web Clipper
## 获取页面中的信息成markdown
==笔记内容==
思路：1、转为markdown2、给表格多加一行（不然展示不对）3、删除多余空行
```
{{selectionHtml|markdown|trim|replace:"

\|":"


\|"|replace:"

":"
"}}}
```
## 高亮后复制文本



# 笔记大纲
插件 quite outline
效果图：
![image.png|300](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-12-15-202512151013927.png)
打开方式：ctrl+P搜索`quite outline`



# 主题
style seting 插件




# 自定义插件
## 。。。。

## 重新编译
tsc


