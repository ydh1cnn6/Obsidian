---
title: JSON
author: BigSea
email: 2834637197@qq.com
wather: 🌦   +25°C
createDate: 2025-07-31 16:41:07
updateDate: 2025-07-31 16:41
week: 第31周｜星期四
---
# 一、JSON字符串修改(结构顺序保持原样)
>[!tip] 注意事项
>如果直接将string转为json修改再转回string，字段顺序会改变

1、用fastjson转为LinkedHashMap
2、用new JsonObject()将hashMap转换为json（这样就是有序的,hutool或者fastjson都可以）
3、修改json
4、转为string
