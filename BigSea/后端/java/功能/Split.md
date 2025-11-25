---
tags: [split, 分割, 字符串, 字符串处理]
title: Split
updateDate: 2025-11-11 15:26:22
---
# 分割长度问题
#split #分割 #字符串 #字符串处理
```java
String[] split = "||".split("\\|");//lenth=0
String[] split = "a||".split("\\|");//lenth=1
String[] split = "a||a".split("\\|");//lenth=3
String[] split = "a| |".split("\\|");//lenth=2
String[] split = "a| | ".split("\\|");//lenth=3
```


```java
String str = "|||||||||";
String[] split = str.split("\\|");//limit默认=0，split按
```

