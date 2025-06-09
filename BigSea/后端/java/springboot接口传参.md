### **<font style="color:rgb(79, 79, 79);">@PathVariable</font>**
### **<font style="color:rgb(79, 79, 79);">@RequestParam</font>**
```java
@RequestParam("id") Integer id
@RequestParam String[] name
@RequestParam List name
@RequestParam("myFile") MultipartFile file
```

1、String[],get可以，post可以

2、List，get可以，post可以

### **<font style="color:rgb(79, 79, 79);">@RequestBody</font>**
```java
@RequestBody User user
@RequestBody Map userMap
@RequestBody JSONObject jsonObject
@RequestBody String jsonStr
```

1、String[] ,post可以

2、List,	post不可以	必须指定类型

3、List<类型>	post可以  


### 无注解
```java
 User user
```

### **<font style="color:rgb(79, 79, 79);">@RequestHeader：</font>**
```java
@RequestHeader String token,@RequestHeader String uui
```

### **<font style="color:rgb(79, 79, 79);">HttpServletRequest </font>****<font style="color:rgb(243, 59, 69);">：</font>**
```java
HttpServletRequest request
    Stringid= request.getParameter("id");//方式1

    Map<String, String[]> parameterMap = request.getParameterMap();//方式2
    String[] ids = parameterMap.get("id");

    BufferedReader reader = new BufferedReader(//方式3
        new InputStreamReader(request.getInputStream()));
    String str = "";
    String wholeStr = "";
    //一行一行的读取body体里面的内容
    while((str = reader.readLine()) != null){
        wholeStr += str;
    }
    //转化成JSONObject
    JSONObject jsonObject=JSONObject.parseObject(wholeStr);
    Integer id =  jsonObject.getInteger("id");
```







[Springboot 最细节全面的接口传参接参介绍，总有你喜欢的一种方式_srpingboot getmapping传值-CSDN博客](https://blog.csdn.net/qq_35387940/article/details/100151992)

