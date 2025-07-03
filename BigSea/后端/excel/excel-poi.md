1、文件格式兼容+密码
```java
	FileInputStream fis = new FileInputStream(path_excel);
	Workbook workbook =WorkbookFactory.create(fis);
	if(workbook==null){
		workbook =WorkbookFactory.create(fis,passwd);
	}
```
2、excel 工具类是如何中间操作
```java
函数式编程，把sheet当做入参,扔给外部方法加工完，再写回到excel

```