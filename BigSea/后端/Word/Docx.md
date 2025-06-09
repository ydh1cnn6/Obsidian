## XWPFTemplate
1、添加依赖

```xml
<dependency>
  <groupId>com.deepoove</groupId>
  <artifactId>poi-tl</artifactId>
  <version>1.12.1</version>
</dependency>
<dependency>
  <groupId>org.apache.poi</groupId>
  <artifactId>poi-scratchpad</artifactId>
  <version>5.2.3</version>
</dependency>
```

2、处理Docx文件

```java
String path = "D:\\wanhe\\MyLearn\\src\\main\\resources\\template\\test.docx";
XWPFTemplate compie = XWPFTemplate.compile(path);

Map map = new HashMap();
map.put("title","致歉信");
map.put("to","魏新浩");
map.put("from","小李");
map.put("date", LocalDate.now());
compie.render(map);
String toPath= "D:\\wanhe\\MyLearn\\src\\main\\resources\\desc\\"+"致歉信"+".doc";
compie.writeToFile(toPath);
compie.close();
```







[轻松学会Java导出word---基础](https://blog.csdn.net/qq_45979629/article/details/131559238))

[11.java程序员必知必会类库之word处理库_java word工具类-进阶](https://blog.csdn.net/wlyang666/article/details/130246576)

