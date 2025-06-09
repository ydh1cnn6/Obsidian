

# poi
### <font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">HSSF</font><font style="color:rgb(79, 79, 79);">、</font><font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">XSSF</font>
实现比较复杂，看教程 



# easypoi
easypoi起因就是Excel的导入导出,最初的模板是实体和Excel的对应,model–row,filed–col 这样利用注解我们可以和容易做到excel到导入导出 经过一段时间发展,现在注解有5个类分别是

@Excel 作用到filed上面,是对Excel一列的一个描述

@ExcelCollection 表示一个集合,主要针对一对多的导出,比如一个老师对应多个科目,科目就可以用集合表示

@ExcelEntity 表示一个继续深入导出的实体,但他没有太多的实际意义,只是告诉系统这个对象里面同样有导出的字段

@ExcelIgnore 和名字一样表示这个字段被忽略跳过这个导导出

@ExcelTarget 这个是作用于最外层的对象,描述这个对象的id,以便支持一个对象可以针对不同导出做出不同处理

# easyexcel
会有EasyExcel、监听器，invoke等标志

```java
//写
// 这里 需要指定写用哪个class去写，然后写到第一个sheet，名字为模板 然后文件流会自动关闭
EasyExcel.write(fileName, DemoData.class)
    .sheet("模板")
    .doWrite(() -> {
        // 分页查询数据
        return data();
});
//或者（不用箭头函数了）
EasyExcel.write(fileName, DemoData.class).sheet("模板").doWrite(data());
//或者
try (ExcelWriter excelWriter = EasyExcel.write(fileName, DemoData.class).build()) {
    WriteSheet writeSheet = EasyExcel.writerSheet("模板").build();
    excelWriter.write(data(), writeSheet);
}

//读
EasyExcel.read(fileName, DemoData.class, new PageReadListener<DemoData>(dataList -> {
    for (DemoData demoData : dataList) {
        System.out.println("读取到一条数据{}"+JSON.toJSONString(demoData));
    }
})).sheet().doRead();
//或者（不用箭头函数）
EasyExcel.read(fileName, DemoData.class, new DemoDataListener()).sheet().doRead();

//或者
try (ExcelReader excelReader = EasyExcel.read(fileName, DemoData.class, new DemoDataListener()).build()) {
    // 构建一个sheet 这里可以指定名字或者no
    ReadSheet readSheet = EasyExcel.readSheet(0).build();
    // 读取一个sheet
    excelReader.read(readSheet);
}
```

[JAVA操作Excel（POI、easyPOI、easyExcel）_easypoi easyexcel_我认不到你的博客-CSDN博客](https://blog.csdn.net/qq_57581439/article/details/126006206)

