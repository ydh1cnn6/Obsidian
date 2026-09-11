---
title: treacode控制台乱码
tags:
  - 笔记
  - treacode控制台乱码
author: BigSea
email: 2834637197@qq.com
封面: ""
createDate: 2026-09-11 13:13:15
updateDate: 2026-09-11 13:16:52
week: 第37周｜星期五
icon: notebook-pen
iconColor: orange
coordinates: 32.05838, 118.79647
IP: 2409:8924:433:635:9c8e:4527:390c:99af
IP归属地: 中国
IP归属城市: 南京市
Country: China
City: NanJing
Weather: 🌧️
uvIndex(1-15): 1
Temperature(℃): 21
CurrentWeatherTime: 12:00 AM
GetWeatherTime: 2026-09-11 13:13:17
Feels Like(℃): 21
Pressure(hPa): 1022
Humidity(%): 79
WindSpeed: 2
WindSpeedDesc: 轻风
TempRange(℃): 17-23
SunHour: 4.0h
Sunrise: 05:46 AM
Sunset: 06:17 PM
---
### **问题描述**：

### **根本原因**：
根本原因通常是 Windows 终端默认使用 GBK 编码，而你的程序或文件输出的是 UTF-8 编码，两者不匹配

### **解决方案**：
按下 `Ctrl + Shift + P`，输入 `Open User Settings (JSON)` 并打开，然后添加或修改以下配置：
(Trae 顶部菜单栏中，点击 **“查看” (View)**--下拉菜单中找到并点击 **“命令面板” (Command Palette)**--`Open User Settings (JSON)`)

```JOSN title="treacode控制台乱码"
{
  // 1. 定义一个UTF-8的PowerShell终端配置文件
  "terminal.integrated.profiles.windows": {
    "PowerShell (UTF-8)": {
      "source": "PowerShell",
      "args": [
        "-NoExit",
        "/c",
        "chcp 65001"
      ]
    }
  },
  // 2. 将这个UTF-8终端设为默认
  "terminal.integrated.defaultProfile.windows": "PowerShell (UTF-8)",
  // 3. 统一文件编码为UTF-8 (可选但建议)
  "files.encoding": "utf8",
  "files.autoGuessEncoding": true,
  // 4. 使用支持Unicode的字体 (可选，避免方块乱码)
  "terminal.integrated.fontFamily": "'Microsoft YaHei Mono', Consolas, monospace"
}
```