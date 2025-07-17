---
date: 2025-07-17T14:09:00
tags:
  - 格式化字符串
name: 格式化字符串
---



2、问题：
String.Format ("%05 d"，a)，怎么补 0 的？
String. Format ("%-5 d"，a)，后面补空格
String. Format ("%+5 d"，a)，格式为"   +5"，3 个空格加“+”加数字（总体占 5 位）
String.Format ("%15 d"，a)，前面补空格
```java
来源:Formatter.Java - print (long)
private void print(long value, Locale l) throws IOException {  
  
    StringBuilder sb = new StringBuilder();  
    ...
    ...
     else if (c == Conversion.HEXADECIMAL_INTEGER) {  
       ...
       ...
        //补充"0"的位置
        if (f.contains(Flags.ZERO_PAD))  
            for (int i = 0; i < width - len; i++) sb.append('0');  
        ...
        ...
        sb.append(s);  
    }  
  
    // 补充""的位置justify()
    a.append(justify(sb.toString()));  
}

private String justify(String s) {  
    if (width == -1)  
        return s;  
    StringBuilder sb = new StringBuilder();  
    //f:待插入的格式，不写时f="",0时f=0
    boolean pad = f.contains(Flags.LEFT_JUSTIFY);  
    int sp = width - s.length();  
    if (!pad)  
        for (int i = 0; i < sp; i++) sb.append(' ');  
    sb.append(s);  
    if (pad)  
        for (int i = 0; i < sp; i++) sb.append(' ');  
    return sb.toString();  
}
```


补充 0
![image.png|600](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-06-27-202506271513895.png)

补充空格：（负数：后缀；正数：前缀）
![image.png|600](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-06-27-202506271516687.png)
