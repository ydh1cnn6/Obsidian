# poi

主要用来完成excel的读写操作。

## 依赖

## 常用的接口和对象

### 工作簿

WorkBook：代表一个Excel对象接口

​	HSSFWorkbook：操作excel2003以前的版本，扩展名为.xls, 导出的行数的65536，超出此行数，系统会抛出异常。

​	XSSFWorkbook：操作2007以后的版本，扩展名.xlsx, 导出行数大概是104(1048575)万多一点。如果数据量较大的情况下，有可能会导致OOM. 原因就是所有的行数数据都在内存当中，没有进行存储并清除。

​	SXSSFWorkbook：操作2007以后的版本，导出行数和XSSFWorkbook，性能上有所提升，降低OOM的概率。

### Sheet

用来表示excel当中的sheet，使用index或者名称来定位。

### Row

代表excel当中的某一行

### Cell

代表excel当中的某个单元格

### CellStyle

表格样式对象

## 写Excel

### 基本写操作

```
public static void main(String[] args) throws IOException {
        //创建一个工作薄
        Workbook workbook = new XSSFWorkbook();
        //创建sheet
        Sheet sheet = workbook.createSheet("test");

        //创建一个行
        Row row = sheet.createRow(0);
        //创建单元格
        Cell cell = row.createCell(0);
        //写入数据
        cell.setCellValue("java180-测试");

        //写入文件
        try(FileOutputStream out = new FileOutputStream("base01.xlsx")){
            workbook.write(out);
            workbook.close();

        } catch (IOException ex) {
        }
    }
```

### 数据类型的处理

```java
public static void main(String[] args) throws IOException {
        //创建一个工作薄
        Workbook workbook = new XSSFWorkbook();
        //创建sheet
        Sheet sheet = workbook.createSheet("test");

        //创建一个行
        Row row = sheet.createRow(0);
        //创建单元格
        Cell cell = row.createCell(0);
        //写入数据
        cell.setCellValue("java180-测试");

        CellStyle moneyStyle = workbook.createCellStyle();
        DataFormat moneyFormat = workbook.createDataFormat();
        moneyStyle.setDataFormat(moneyFormat.getFormat("###,##0.000"));
        Cell cell1 = row.createCell(1);
        cell1.setCellValue(230002.58);
        cell1.setCellStyle(moneyStyle);


        CellStyle dateStyle = workbook.createCellStyle();
        DataFormat dateFormat = workbook.createDataFormat();
        dateStyle.setDataFormat(moneyFormat.getFormat("yyyy-MM-dd"));

        cell = row.createCell(2);
        cell.setCellValue(new Date());
        cell.setCellStyle(dateStyle);
    

        //写入文件
        try(FileOutputStream out = new FileOutputStream("base02.xlsx")){
            workbook.write(out);
            workbook.close();

        } catch (IOException ex) {
        }
    }
```



# easyPoi

基于poi，使用简答的数据的导入导出。使用的注解方式，支持excel模板的处理，还支持word的导出



## 注解

@Excel ：放在属性上面，设置表头的列名，也可以用来设置格式

# easyExcel