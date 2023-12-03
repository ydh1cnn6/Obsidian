---
typora-root-url: image
---

# SpringMVC入门案例

## 开发步骤

### 依赖

```xml
<dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>javax.servlet-api</artifactId>
            <version>3.1.0</version>
            <scope>provided</scope>
 </dependency>
  <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-webmvc</artifactId>
            <version>5.3.18</version>
 </dependency>
        
```



### 创建一个控制器

```java
public class UserController implements Controller {
    @Override
    public ModelAndView handleRequest(HttpServletRequest request, HttpServletResponse response) throws Exception {
        return new ModelAndView("/user.jsp");
    }
}
```



### 创建一个JSP页面

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Title</title>
</head>
<body>
    springMVC success
</body>
</html>
```



### 配置web.xml

```xml
<servlet>
        <servlet-name>springMVC</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>springMVC</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>
```



### 配置springmvc的配置文件

```xml
<bean id="/test" class="net.wanho.UserController"/>
```

### 测试运行

## 修改springMVC的配置文件

ApplicationContext的实现类：

​	AnnotationConfigApplicationContext

​	ClassopathXmlApplicationContext

​	FileSystemXmlApplicationContext

​	WebApplicationContext

WebApplicationContext的配置文件的默认命名规则： dispatcherServlet的Servletnname -servlet.xml
(FrameworkServlet和XmlWebApplicationContext当中)

想要修改，web.xml当中增加dispatcherServlet的初始化参数即可。





# 工作流程

![01.springMVC运行流程](/01.springMVC运行流程.png)



# 基于注解的开发方式

## 开发流程

### 配置文件

置扫描路径以及开启mvc注解

```
<context:component-scan base-package="net.wanho"/>
    <context:annotation-config/>

<!--    启用mvc的注解，使用RequestMappingHandlerAdapter适配器-->
    <mvc:annotation-driven />
```

### 控制器

```
@RequestMapping("test")
    public ModelAndView doTest(){
        ModelAndView mv = new ModelAndView();
        mv.setViewName("/user.jsp");
        return mv;
    }
```



## @RequestMapping注解

@RequestMapping可以放在类上，也可以放在方法上面。如果放在类上，其下面的所有控制器方法在访问的时候，都需要使用此前缀。命名空间

### value

用来映射请求的url

ant风格，可以设置通配符，在rest风格上，可以设置参数。

*：匹配任意个字符，但是只能匹配一层

**：匹配任意个字符，但是可以匹配多层

？：匹配任意一个字符

```java
@RequestMapping("test/*")
    public ModelAndView doTest(){
        ModelAndView mv = new ModelAndView();
        mv.setViewName("/user.jsp");
        return mv;
    }

    @RequestMapping("add/**")
    public ModelAndView add(){
        ModelAndView mv = new ModelAndView();
        mv.setViewName("/useradd.jsp");
        return mv;
    }

    @RequestMapping(value = "index/ab?d" )
    public ModelAndView index(){
        ModelAndView mv = new ModelAndView();
        mv.setViewName("/index.jsp");
        return mv;
    }
```



### method属性

method属性限制方法能够处理的请求方式，不设置的时候，只要url即可

只能处理post方法请求，其他方式不能处理

```
 @RequestMapping(value = "index/ab" ,method = RequestMethod.POST)
    public ModelAndView index(){
        ModelAndView mv = new ModelAndView();
        mv.setViewName("/index.jsp");
        return mv;
    }
```



### 其他属性

params：用来限制请求的参数  params={"username"}

headers:  限制请求头

consumes：限制请求的content-type类型

produces：设置response的Content-type类型，经常用来解决JSON字符集问题。

```java
@RequestMapping(value = "params",params = {"username"})
    public ModelAndView param(){
        ModelAndView mv = new ModelAndView();
        mv.setViewName("/index.jsp");
        return mv;
    }
```



# 数据处理模型

## 控制器接收参数

### 单个接收

```java
@RequestMapping("m1")
    public ModelAndView m1(String username,String password){
        System.out.println("username:" + username + ",password:" + password);
        return new ModelAndView("/param.jsp");
    }
```



### @RequestParam注解

命名纠正，当参数名和形式参数名不一致的时候，可以使用此注解来纠正命名。

用来指定参数是否必须以及默认值

```java
 @RequestMapping("m2")
    public ModelAndView m2(@RequestParam("userName") String username
            ,@RequestParam(value = "count",required = false,defaultValue = "0") int count){
        System.out.println("username:" + username + ",count:" + count);
        return new ModelAndView("/param.jsp");
    }
```



### 整体接收

使用pojo对象来接收参数。pojo的属性名需要和参数的key一致

```java
 @RequestMapping("m3")
    public ModelAndView m3(User user){
        System.out.println("username:" + user.getName() + ",age:" + user.getAge());
        return new ModelAndView("/param.jsp");
    }
    
 @RequestMapping("m4")
    public ModelAndView m4(User user,int count){
        System.out.println("username:" + user.getName()
                + ",age:" + user.getAge()
                + ",count:" +count );
        return new ModelAndView("/param.jsp");
    }
```



### 使用Request对象接收

```java
@RequestMapping("m6")
    public ModelAndView m6(HttpServletRequest request){
        System.out.println(request.getParameter("username"));
        return new ModelAndView("/param.jsp");
    }

```



### @PathVariable接收路径参数

```java
 @RequestMapping("m7/{idx}")
    public ModelAndView m7(@PathVariable("idx") int id){
        System.out.println("id=" + id);
        return new ModelAndView("/param.jsp");
    }
```



### 特殊的日期类型

**解决方案一（较老）**

@InitBinder + @DateTimeFormat

```java
@InitBinder
    protected void init(HttpServletRequest request, ServletRequestDataBinder binder){
        SimpleDateFormat dateFormat= new SimpleDateFormat("yyyy-MM-dd");
        dateFormat.setLenient(false);
        binder.registerCustomEditor(Date.class,new CustomDateEditor(dateFormat,false));
    }
    
     @RequestMapping("m8")
    public ModelAndView m8(@DateTimeFormat(pattern = "yyyy-MM-dd") Date birthday){
        System.out.println("id=" + birthday);
        return new ModelAndView("/param.jsp");
    }
```

**方案二**

开启mvc注解 + @DateTimeFormat注解

```xml
<mvc:annotation-driven />
```

测试代码

```java
 @RequestMapping("m8")
    public ModelAndView m8(@DateTimeFormat(pattern = "yyyy-MM-dd") Date birthday){
        System.out.println("id=" + birthday);
        return new ModelAndView("/param.jsp");
    }
```



## 控制前向jsp传递参数

无论使用ModelAndView，还是Model，ModelMap或者Map接口对象，Spring都会将数据整合到request对象当中

### ServletAPI对象

```java
 @RequestMapping("m1")
    public String m1(HttpServletRequest request) {
        request.setAttribute("message","success !");
        return "/result.jsp";
    }
```



### ModelAndView

```java
@RequestMapping("m2")
    public ModelAndView m2() {
        ModelAndView mv = new ModelAndView("/result.jsp");
        mv.addObject("message","ModelAndView success");
        return mv;
    }
```



### Model接口，ModelMap以及Map

```java
@RequestMapping("m3")
    public String m3(Model model, ModelMap modelMap, Map<String,Object> map) {
        model.addAttribute("message","model success");
        modelMap.addAttribute("info","modelmap info");
        map.put("mapInfo","map message");
        return "/result.jsp";
    }
```





# 视图解析器

## 视图解析器的使用

## 重定向和转发

重定向：客户端行为，多次请求，数据不共享

转发：服务器端行为，一次请求

springMVC当中默认是转发，如果需要重定向的话，则使用redirect:关键字放在逻辑视图名之前，视图解析器默认重定向的视图名即为物理视图名。重定向不能访问WEB-INF下的所有资源。

转发也可以指定关键字forword，使用关键字之后，视图解析器会和redirect关键字一样的处理，直接默认为物理视图名。

### 参数传递方式



### RedirectAttributes

# 乱码问题

Spring提供了字符过滤器CharacterEncodingFilter.

如果CharacterEncodingFilter配置的字符集和jsp的contentType不一致的话，是无法解决乱码问题的。

```java
@Override
	protected void doFilterInternal(
			HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		//获取字符集参数
		String encoding = getEncoding();
		//不为null
		if (encoding != null) {
			//forceRequestEncoding为true，或者request没有设置字符集，则使用我们设置的字符集
			if (isForceRequestEncoding() || request.getCharacterEncoding() == null) {
				request.setCharacterEncoding(encoding);
			}
            //forceResponseEncoding:
			if (isForceResponseEncoding()) {
				response.setCharacterEncoding(encoding);
			}
		}
		filterChain.doFilter(request, response);
	}
```



# JSON处理

## 静态资源的处理

```
<!--    解决方案一：使用默认的处理器-->
<!--    <mvc:default-servlet-handler />-->
<!--    方案二：使用mvc:resources指定资源文件的映射关系-->
        <mvc:resources mapping="/images/**" location="/images/"></mvc:resources>
<!--        方案三-->
<!--    配置DispatcherServlet的时候，仅仅配置动态资源需要走DispatcherServlet，-->
<!--    常见的配置方式 *.do-->
```

## Ajax请求使用JSON

### 依赖

```xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.13.5</version>
</dependency>
```

### 静态资源

```
<mvc:default-servlet-handler />
```



### JSP代码

```jsp
<img src="images/fox.jpg" style="width: 200px;height: 200px" />
    <button id="btnAjax">ajax</button>
    <button id="btnAjaxJson">ajaxJSON</button>
    <script src="js/jquery.js"></script>

    <script>
        $(function () {
            $("#btnAjax").click(function () {
                //URL :  ajax01
                //参数： username，password
                let data = {"username":"admin","password":"123456"};
                $.ajax({
                    url: 'ajax01',
                    data,
                    type:'get',
                    success(data){
                        console.log(data);
                    }
                })
            })

            $("#btnAjaxJson").click(function () {
                //URL :  ajax01
                //参数： username，password
                let data = {"username":"admin","password":"123456"};
                $.ajax({
                    url: 'ajax02',
                    data:JSON.stringify(data),
                    type:'post',
                    contentType:'application/json',
                    success(data){
                        console.log(data);
                    }
                })
            })
        })
    </script>
```



### 传递参数

不能直接使用get请求，设置contentType：application/json

使用整体接收，增加@RequestBody注解

```java
@Controller
public class AjaxController {

    //@RequestMapping("ajax01")
    //@ResponseBody
    //public String doAjax01(String username,String password){
    //    System.out.println(username + "," + password);
    //    return "success";
    //}

    @RequestMapping("ajax01")
    @ResponseBody
    public String doAjax01(User user){
        System.out.println(user.getUsername() + "," + user.getPassword());
        return "success";
    }

    //@RequestMapping(value = "ajax02",produces = "text/plain;charset=utf-8")
    //@ResponseBody
    //public String doAjax02(@RequestBody User user){
    //    System.out.println(user.getUsername() + "," + user.getPassword());
    //    return "成功接收";
    //}
    @RequestMapping(value = "ajax02",produces = "application/json;charset=utf-8")
    @ResponseBody
    public User doAjax02(@RequestBody User user){
        User user1 = new User();
        user1.setUsername("java180");
        user1.setPassword("123456789");
        return user1;
    }
}
```



# 文件上传和下载

## 文件上传

SpringMVC的文件上传使用MultipartResolver（实现：CommonsMultipartResolver），CommonsMultipartResolver依旧需要apache的commons-fileupload组件

增加依赖

配置MultipartResolver

编写jsp页面

编写控制器

发布测试



### 增加依赖

```xml
<dependency>
            <groupId>commons-fileupload</groupId>
            <artifactId>commons-fileupload</artifactId>
            <version>1.5</version>
        </dependency>
```



### 配置MultipartResolver

```xml
<bean id="multipartResolver" class="org.springframework.web.multipart.commons.CommonsMultipartResolver">
<!--        配置请求默认的字符集-->
        <property name="defaultEncoding" value="utf-8"/>
<!--        设置单个文件的大小-->
        <property name="maxUploadSizePerFile" value="10245760"/>
<!--        总文件大小-->
        <property name="maxUploadSize" value="102457600"/>
<!--        每次最多读入多少到内存-->
        <property name="maxInMemorySize" value="4096"/>
<!--        <property name="uploadTempDir" value="/temp"/>-->
    </bean>
```

### JSP页面

```html
<form action="upload" method="post" enctype="multipart/form-data">
        <input type="file" name="file01">
        <input type="submit" value="上传">
    </form>
```

### 控制器

```java
@Controller
public class FileController {

    private static String UPLOAD_DIR="/temp";

    @RequestMapping("upload")
    public String doUpload(@RequestParam("file01")MultipartFile file01) throws IOException {
         //判断上传目录是否存在，如果不存在则先创建
        File dirFile = new File(UPLOAD_DIR);
        if (!dirFile.exists()){
            dirFile.mkdirs();
        }

        //获取文件名
        String filename = file01.getOriginalFilename();
        File destFile = new File(UPLOAD_DIR,filename);
        ////获取输入流
        //InputStream in = file01.getInputStream();
        //byte[] b = new byte[4096];
        //

        //OutputStream out = new FileOutputStream(destFile);
        //int len;
        //while((len=in.read(b)) != -1) {
        //    out.write(b,0,len);
        //}
        //in.close();
        //out.close();
        file01.transferTo(destFile);
        return "/upload.jsp";

    }
}
```



## 文件下载

不能直接使用ajax

```java
 //importTemplate
    @GetMapping("importTemplate")
    public void importTemplate(HttpServletRequest request, HttpServletResponse response) {
        ///文件名可以不是传入resource
        response.addHeader("download-filename","userTemporary.xls");
        //要暴露neader
        response.setHeader("Access-Control-Expose-Headers","download-filename");

        try {
            String fileName = "userTemporary.xls";
            System.out.println(request.getSession().getServletContext().getContextPath());
            //文件在target中
            String realPath = request.getSession().getServletContext().getRealPath("/"+fileName);
            FileInputStream is = new FileInputStream(new File(realPath));
            // 3. 获取响应输出流
            response.setContentType("text/plain;charset=UTF-8");
            // 4. 附件下载 attachment 附件 inline 在线打开(默认值)
            response.setHeader("content-disposition", "attachment;fileName=" +"userTemplate.xls");
            // 5. 处理下载流复制
            ServletOutputStream os = response.getOutputStream();
            int len;
            byte[] b = new byte[1024];
            while(true){
                len = is.read(b);
                if(len == -1) break;
                os.write(b, 0, len);
            }
            // 释放资源
            os.close();
            is.close();


        } catch (Exception e) {
            e.printStackTrace();
        }
    }
```





# REST风格网站设计

随着终端的多样化，应用也越来越复杂。例如小程序，公众号，App等等，不仅仅原来基于电脑端的web应用，接口的设计愈来愈复杂。

在REST应用当中，用户使用相同的url，不同的请求方式来区分请求。在前后端分离的项目当中，前端的开发人员不会对请求的地址产生混淆，形成统一的接口。

C--> POST    R--   GET    U----PUT   D---DELETE

```
传统风格的路径
http：//localhost:8080/user/list
http：//localhost:8080/user/getOne?id=1
http://localhost:8080/user/add?id=2&name=zhangsan
http://localhost:8080/user/update?id=2&name=zhangsan
http://localhost:8080/user/deleteOne?id=1


GET  http：//localhost:8080/users
GET  http：//localhost:8080/users/{id}
POST http://localhost:8080/users
PUT  http://localhost:8080/users
DELETE http://localhost:8080/user/users/{id}
```



@RestController  == @Controller + @ResponseBody : 当前处理器类当中的方法，返回的都是数据，而不是视图

@PathVariable：用于获取路径上的参数

@GetMapping  @PostMapping  @PutMapping  @DeleteMapping

@RestControllerAdvice：用于全局异常处理的控制器通知注解



# 拦截器

SpringMVC的拦截器，主要用来拦截控制器方法的执行，可以用来判断权限等处理。

应用场合：AOP，事务，日志，权限

## 基本使用

SpringMVC如何实现拦截器：实现HandlerInterceptor接口或者继承HandlerInterceptorAdapter类（5.3开始的版本不推荐使用，过时）

拦截器需要注册到容器当中，可以注册全局拦截器，也可以针对局部进行拦截。

user/m1, m2,m3  三个请求的url，拦截user/m1,user/m2 ,其中m3方法不拦截

定义控制器

定义拦截器

配置拦截器



## 源码分析

### HandlerExecutionChain

```java
public class HandlerExecutionChain {

	private static final Log logger = LogFactory.getLog(HandlerExecutionChain.class);

	//处理器
	private final Object handler;
	//拦截器list
	private final List<HandlerInterceptor> interceptorList = new ArrayList<>();
	//用来记录preHandle为true的最大索引
	private int interceptorIndex = -1;
```

### DispatcherServlet



## 拦截器和过滤器的区别

**实现原理**：拦截器是基于java的反射机制，过滤器是基于函数回调的，主要是依靠filterChain.doFilter()

**应用场合**：拦截器可以用于web项目，也可以用于非web项目，springMVC的执行主体是MVC容器

​	过滤器是由servletAPI提供，只能应用于web项目。执行主体由servlet容器调用（目前是tomcat）

**触发时点**：过滤器在进入容器之后，servlet执行之前开始预处理

​		 拦截器实在servlet处理之后，处理器方法执行之前进行预处理，渲染结束之后才结束

**处理的信息**：过滤器只能获取request和response进行处理，

​		拦截器能够对除了request和response的handler的信息进行处理，比如上下文，handler上注解等信息

**作用范围**：

​	过滤器几乎对所有的请求都有静态

​	拦截器只对处理器起作用



# 异常处理

## ExceptionHandler注解

在控制器当中增加一个处理异常的方法，并使用**@ExceptionHandler**注解.

放在一个普通的Controller当中，只对当前的控制器有效，其他的控制器无效。

如果想全局有效，可以定义一个baseController，并在其中定义异常处理的方法，其他的controller继承此baseController。

```java
@ExceptionHandler (Exception.class)
public String doErr(Exception ex){
	return "/error. jsp";
}
```

## ControllerAdvice

**ControllerAdvice**放在一个类上，此类中的方法是用来统一处理异常。

```java
@ControllerAdvice
public class ExceptionControllerAdvice {
	@ExceptionHandLer(Exception. cLass)
    public String doErr(Exception ex){
        return "/error. jsp";
    }
    
    @ExceptionHandLer(BusinessException.cLass)
    public String doErr1( BusinessException ex){
    	return "/bsError.jsp";
    }

}

```





# SSM整合

## 依赖

spring-webmvc，spring-jdbc，mysql，mybatis，mybatis-spring，spring-aspects，spring-tx，pageHelper，jackson-databind，co·mmons-fileupload，servlet，druid



## 配置web.xml

```xml
<!--    配置后端上下文-->
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>classpath:application.xml</param-value>
    </context-param>
    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>

<!--配置web上下文-->
    <servlet>
        <servlet-name>springmvc</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>classpath:springmvc.xml</param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>
    <servlet-mapping>
        <servlet-name>springmvc</servlet-name>
        <url-pattern>*.do</url-pattern>
    </servlet-mapping>

```



## 配置springmvc

```xml
<context:component-scan base-package="net.wanho.controller"/>
    <context:annotation-config/>
<--启用mvc的注解，比如requestMapping--></---->
    <mvc:annotation-driven/>

    <bean 
     <--视图解析器-->     class="org.springframework.web.servlet.view.InternalResourceViewResolver">
        <property name="prefix" value="/pages"/>
        <property name="suffix" value=".jsp"/>
    </bean>
    <bean id="multipartResolver" 
 	<--文件上传-->         class="org.springframework.web.multipart.commons.CommonsMultipartResolver">
        <property name="maxUploadSizePerFile" value="10485760"/>
        <property name="maxUploadSize" value="104857600"/>
        <property name="maxInMemorySize" value="4096"/>
        <property name="defaultEncoding" value="UTF-8"/>
    </bean>
```



## 配置spring

```xml
<!--    serveice以及mapper的扫描-->
    <context:component-scan base-package="net.wanho">
        <context:exclude-filter type="annotation" expression="org.springframework.stereotype.Controller"/>
    </context:component-scan>
    <context:annotation-config/>
<!--    开启aop注解-->
    <aop:aspectj-autoproxy proxy-target-class="true"/>

<!--    配置数据源-->
    <util:properties id="db" location="classpath:jdbc.properties"/>
    <bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource">
        <property name="driverClassName" value="#{db.driver}"/>
        <property name="url" value="#{db.url}"/>
        <property name="username" value="#{db.username}"/>
        <property name="password" value="#{db.password}"/>
        <property name="initialSize" value="#{db.initSize}" />
        <property name="maxWait" value="#{db.maxWait}" />
        <property name="maxActive" value="#{db.maxActive}" />
    </bean>
<!--    配置sqlSessionFactory-->
    <bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
        <property name="dataSource" ref="dataSource"/>
        <property name="typeAliasesPackage" value="net.wanho.entity"/>
        <property name="mapperLocations" value="classpath:mappers/*.xml"/>
        <property name="configuration">
            <bean class="org.apache.ibatis.session.Configuration">
                <property name="mapUnderscoreToCamelCase" value="true"/>
                <property name="logImpl" value="org.apache.ibatis.logging.stdout.StdOutImpl"/>
                <property name="cacheEnabled" value="true"/>
              </bean>
        </property>
        <property name="plugins">
            <bean class="com.github.pagehelper.PageInterceptor">
                <property name="properties">
                    <props>
                        <prop key="helperDialect">mysql</prop>
                        <prop key="reasonable">true</prop>
                    </props>
                </property>
            </bean>
        </property>
    </bean>

<!--   配置 mapperScanner-->
    <bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
        <property name="basePackage" value="net.wanho.dao"/>
        <property name="sqlSessionFactoryBeanName" value="sqlSessionFactory"/>
    </bean>
<!--    事务管理器-->
    <bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="dataSource"/>
    </bean>
    <!--    开启事务注解-->
    <tx:annotation-driven transaction-manager="transactionManager"/>

```



## 业务的处理

