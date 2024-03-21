# Springboot基础

## 出现背景

Springboot是Spring家族的一部分。

随着功能的复杂度增加，Spring的配置也会变得越来越复杂，配置带来的烦恼越来越来。Springboot伴随着配置的烦恼就出现，主要使得编码更加简单，配置也简单，还提供监控以及相关部署的辅助功能。Springboot的出现主要是为了解决Spring新项目的搭建和开发过程，使用特定的约定方式来进行配置，从而使开发人员不再需要定义模板化的配置，不再需要配置web.xml, SpringMVC.xml以及application.xml。

Springboot是基于Spring进行开发的，简化了Spring的配置和开发过程，通过集成大量的框架，减少依赖包之间的冲突，可以减少引用的不稳定而引起的问题。

## Springboot的特点

1：可以创建独立的Spring程序，并且是基于Maven和Gradle

2：内嵌Servlet容器（tomcat，jetty以及undertow），可以不依赖容器直接运行

3：提供可以自动配置的starter项目模型（POM），可以避免各种maven导入依赖包的冲入。

4：尽可能地自动配置Spring容器，采用“约定优先于配置”的策略，在指定的结构中添加相关的设计内容。

5：基本不用xml文件，web项目也不需要配置web.xml

6：提供了一些辅助功能，比如指标，健康检查等

## Springboot的应用场景

Spring项目（能用spring的地方就能用springboot）

J2EE/web项目

微服务

## Spring boot和SpringMVC的关系

Springboot可以认为是Spring以及SpringMVC的合体升级版。可以不学习springMVC直接学习springboot。

Springboot简化架构的依赖和配置过程，但是在web开发成面，仍然沿用的是SpringMVC的开发方式，SpringMVC当中最重要组件就是Controller，Springboot的web开发依旧是以Controller为重点。



# 工程的创建方式

## 使用官网创建

https://start.spring.io/

![官网方式配置](https://raw.githubusercontent.com/ydh1cnn6/pic/master/image-20240220164528686.png)



## 使用手工创建

### 创建一个空的maven项目

### 配置pom.xml文件

#### 配置parent

集成spring-boot-dependencies，定义了依赖的版本号，解决maven（gradle）的版本冲突问题

定义了Java的版本号

定义字符编码为UTF-8

定义打包操作的位置

定义资源过滤

定义自动化插件

### 编写主启动类

## 使用Spring initiliazr

default: https://start.spring.io

aliyun:   https://start.aliyun.com

# 启动方式

## 在idea中运行主程序

## 使用maven启动

需要确认maven的环境变量

进入项目目录，运行下述命令

```
mvn spring-boot:run
```

## 先打成jar，再运行jar

无论是web还是非web项目，都可以打成jar包运行

在控制台

进入项目目录

使用mvn package 进行打包

使用cd target 进入target目录

使用java命令执行jar

```
cd  项目目录
mvn package
cd target
java  -jar  xxx.jar
```



# 配置文件

## YAML文件

YAML:不是一种标记语言，用来表现数据的。扩展名: yaml或者yml

springboot中常见的配置文件就是yaml和propertis.

### 基本语法

key:空格value，表示一个键值对

以缩进控制层级关系，缩进只能使用空白符，不能使用tab，同一个层次左边对齐。



### 数据类型

**字面量**：单个不能再拆分的值（字符串，数字，布尔）

​	字符串：默认情况下既不需要使用单引号，也不需要使用双引号，如果有特殊的转义字符，需要使用单引号或者双引号

​	双引号：包含的转义字符有效"abc\ndef"，输出的时候，abc和def是在两行上显示

​	单引号：包含的转义字符无效，按照原有字符输出，‘abc\ndef’ 输出‘abc\ndef’

**数组和list**

​	单行配置方式： names:[zhangsan,lisi,wangwu]

​	多行配置方式：使用中横线表示数组的元素

```
menu:
	children:
		- menu1
		- menu2
```



**对象和map**

​	单行配置方式： clsInfo: {name: java173, id: 100}

​	多行配置方式：

​		以缩进的形式来表现

​		clsInfo:

​				name:  java173

​				id: 100

### 配置案例	

```yaml
student:
  name: zhangsan
  sex: 男
  prof: "计算机工程系\n 软件工程专业"
  finished: false
  subjects: [java,web,c,'c#']
  scores:
    - 90
    - 80
    - 100
  teacher: {id: 1003, name: 张恨水}
  girlfriend:
    name: 张宇
    age: 18
```



## 读取配置文件（记忆）

### @Value注解

使用在读取单个，简单数据类型的数据

```java
@Data
@Component
public class Student {

    @Value("${student.name}")
    private String name;
    @Value("${student.sex}")
    private String sex;
}
```



### 使用Environment对象

主要用于简单数据类型数据的获取

```java
@Component
@Data
public class SeniorStudent {
    private String name;
    private String prof;
    @Resource
    private Environment environment;

    public void setBeanProperties(){
        this.name = environment.getProperty("name");
        this.prof=environment.getProperty("prof");
        System.out.println(environment.getProperty("student.name"));
        System.out.println(environment.getProperty("student.prof"));
    }
}
```



### 使用@ConfigurationProperties

#### 基本使用

```java
@Data
@Component
//prefix:只能使用中横线 以及 小写字母（数字）
//不能使用大写字母i
@ConfigurationProperties(prefix = "student")
public class CollegeStudent {
    String name;
    String sex;
    boolean finished;
    String prof;
    String[] subjects;
    List<Integer> scores;
    Teacher teacher;
    GirlFriend girlfriend;
}
```



#### 松散绑定

Relaxed Binding: 松散绑定，绑定的属性不严格要求和配置文件当中一致。

@ConfigurationProperties的prefix（value）只能使用中横线和小写字母（数字），中横线不能是开头

配置文件则可以是大写字母，小写字母，中横线，下划线或者空格

**配置**

```yaml
tomcatServer:
  host-name: localhost
  host_ip: 192.168.66.211
  HOST_PORT: 8090
  "HOST DESC": tomcat server descript
```

**绑定**

```java
@Data
@Component
@ConfigurationProperties(prefix = "tomcat-server")
public class TomcatServer {
    private String hostName;
    private String hostIp;
    private int hostPort;
    private String hostDesc;
}

```



### @PropertySource注解

读取非application.properties的属性文件的数据。

Springboot提供@PropertySource和@PropertySources注解，用来读取此类配置文件当中的数据

#### 配置文件

在resources目录下增加一个jdbc.properties文件

```properties
db.driver=com.mysql.cj.jdbc.Driver
db.url=jdbc:mysql://localhost:3306/sb
db.username=root
db.password=1111
```



#### 配置对象

```java
@Data
@Component
@ConfigurationProperties(value = "db")
//@PropertySource(value = "classpath:jdbc.properties",encoding = "utf-8")
@PropertySources(@PropertySource(value = "classpath:jdbc.properties",encoding = "utf-8"))
public class DBServer {
    String driver;
    String url;
    String username;
    String password;
}
```



### @ImportResource注解

此注解的作用：用来导入Spring原生的xml配置文件。此注解只能放在主启动类上。

一般用在spring项目到springboot的移植上面。

```java
@SpringBootApplication
@ImportResource(locations = "classpath:bean.xml")
public class Base01ConfigApplication {

    public static void main(String[] args) {
        ApplicationContext ctx = SpringApplication.run(Base01ConfigApplication.class, args);
        //Student bean = ctx.getBean(Student.class);
        //System.out.println(bean);

        //SeniorStudent seniorStudent = ctx.getBean(SeniorStudent.class);
        //System.out.println(seniorStudent);
        //seniorStudent.setBeanProperties();

        CollegeStudent student = ctx.getBean(CollegeStudent.class);
        System.out.println(student);

        TomcatServer tomcatServer = ctx.getBean(TomcatServer.class);
        System.out.println(tomcatServer);

        DBServer dbServer = ctx.getBean(DBServer.class);
        System.out.println(dbServer);

        SpringBean bean = ctx.getBean(SpringBean.class);
        System.out.println(bean);

    }

}
```



# 整合web

## 静态资源的位置

Springboot当中默认的静态资源位置可以如下几个：

classpath:/META-INF/resources/

classpath: /resources/

classpath:/static/

classpath:/public/

可以在配置文件当中使用spring.web.resource.static-locations来进行配置，指定特殊的位置

```yaml
spring:
  web:
    resources:
      static-locations: classpath:/templates/
```

## 公用的静态资源

对于JQuery这类的资源，已经有人帮我们打好jar包，可以直接利用

使用：引入依赖，和普通js一样使用script标签引入

### 依赖

```xml
<dependency>
    <groupId>org.webjars</groupId>
    <artifactId>jquery</artifactId>
    <version>3.6.4</version>
</dependency>
```



### 引入并测试

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script src="webjars/jquery/3.6.4/jquery.js"></script>
</head>
<body>
    <button id="testJquery">test</button>
    <script>
        $(function () {
            $("#testJquery").click(()=>{
                alert("jquery有效")
            })
        })
    </script>
</body>
</html>
```



## ajax请求

### 前端发送请求

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script src="webjars/jquery/3.6.4/jquery.js"></script>
</head>
<body>
    <button id="testJquery">test</button>
    <script>
        $(function () {
            $("#testJquery").click(()=>{
                $.ajax({
                    url:'testAjax',
                    type:'get',
                    success: function (data) {
                        console.log(data)
                    }
                })
            })
        })
    </script>
</body>
</html>
```



### 后端处理请求

```java
@RestController
public class AjaxController {

    @GetMapping("testAjax")
    public Map<String,String> doTest(){
        Map<String, String> map = new HashMap<>();
        map.put("name","xiaoming");
        map.put("age","13");
        return map;
    }

}
```



## 文件上传

在Spring当中如果进行文件上传的话，需要增加commons-fileupload依赖，同时配置multipartResolver

在Springboot当中进行文件上传，不需要程序员手动增加commons-fileupload，而是由springboot自动装配了，我们只需要设置multipartResolver（默认时1MB，大部分情况下都需要修改）

### 配置

```yaml
spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 50MB
      location: d:/temp
app:
  upload:
    direct: d:/upload
     
```

### 前端

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script src="webjars/jquery/3.6.4/jquery.js"></script>
</head>
<body>
    <input type="file" id="file01">
    <button id="upload">upload</button>
    <script>
        $(function () {
            $("#upload").click(()=>{
                //
                var form = $("<form></form>")[0];
                var formData = new FormData(form);
                formData.append("file",$("#file01")[0].files[0])
                $.ajax({
                    url:'upload',
                    type:'post',
                    data: formData,
                    async:false,
                    cache: false,
                    processData: false,
                    contentType: false,
                    success(data){
                        alert(data);
                    }
                })
            })
        })
    </script>
</body>
</html>
```



### 后端

```java
@RestController
public class UploadController {

    @Value("${app.upload.direct}")
    String dir;

    @PostMapping("upload")
    public String doUpload(MultipartFile file) throws IOException {
        //判断上传的目录是否存在，如果不存在，则创建
        File destDirFile = new File(dir);
        if (!destDirFile.exists()) {
            destDirFile.mkdirs();
        }
        //上传文件
        File destFile = new File(dir,file.getOriginalFilename());
        file.transferTo(destFile);
        return "文件上传成功";
    }
}

```



## servlet组件注册

Springboot当中，配置Servlet对象，可有两种方式：

1：在配置类当中，使用ServletRegistrationBean，更使用第三方提供的Servlet组件

2：使用@WebServlet + @ServletComponentScan注解。@ServletComponentScan必须放在主启动类上，指定其basePackage属性，如果servlet的package是主启动类所在的package或者其子package，则可以省略此属性。

### ServletRegistrationBean

#### 定义servlet

```java
public class SchoolServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.getWriter().write("<html><body> <h3>school title</h3></body></html>");
        resp.getWriter().close();
    }
}

```

#### 配置servlet

```java
@Configuration
public class ServletConfig {

    @Bean
    public ServletRegistrationBean registrationBean(){
        ServletRegistrationBean<SchoolServlet> bean = new ServletRegistrationBean();
        bean.setName("schoolServlet");
        bean.setServlet(new SchoolServlet());
        bean.addUrlMappings("/school");
        return bean;
    }
}
```



### @WebServlet + @ServletComponentScan

#### 定义servlet

```java
@WebServlet("/student")
public class StudentServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.getWriter().write("student java178");
        resp.getWriter().close();
    }
}
```



#### 主启动类

添加@ServletComponentScan注解

```java
@SpringBootApplication
@ServletComponentScan
public class Base02WebApplication {

    public static void main(String[] args) {
        SpringApplication.run(Base02WebApplication.class, args);
    }

}
```



## Filter组件

Springboot也可能用Filter。创建Filter依旧是实现javax.servlet.Filter接口，并将过滤器注册到容器当中。

1：使用@WebFilter + @ServletComponentScan注解

2：使用FilterRegistrationBean方式来配置

### 定义Filter

```java
//@WebFilter("/*")
public class CharacterFilter implements Filter {
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {

        System.out.println("过滤器执行");
        servletRequest.setCharacterEncoding("UTF-8");
        servletResponse.setCharacterEncoding("UTF-8");
        filterChain.doFilter(servletRequest,servletResponse);
    }
}
```



### 配置

```java
@Configuration
public class FilterConfig {

    @Bean
    public FilterRegistrationBean filterRegistrationBean(){
        FilterRegistrationBean bean = new FilterRegistrationBean();
        bean.setName("characterFilter");
        bean.setFilter(new CharacterFilter());
        bean.addUrlPatterns("/*");
        //bean.setOrder(2);
        return bean;
    }
}

```



## 拦截器

定义实现HandlerInterceptor接口，注册使用接口 WebMvcConfigurer

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    //user/m1, user/m2,user/m3
    //拦截user下面除了m3之外的所有的请求
    //@Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new MessageInterceptor())
                .addPathPatterns("/user/**")
                .excludePathPatterns("/user/m3");
    }


}
```



## 跨域请求

1：在指定的控制器上增加@CrossOrigin注解

2：使用CorsFilter过滤器

3：使用WebMvcConfigurer接口，实现addCorsMappings。此种方式，如果项目当中有拦截器，有可能导致冲突，跨域无效。

### CorsFilter

```java
 @Bean
    public CorsFilter corsFilter(){
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedMethod("*");
        config.addExposedHeader("*");
        config.addAllowedOriginPattern("*");
        //是否允许设置Cookie信息
        config.setAllowCredentials(true);
        source.registerCorsConfiguration("/**",config);
        return new CorsFilter(source);
    }
```



### WebMvcConfigurer

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("*")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```







# 整合Mybatis和Druid

## 整合mybatis

### 增加相关依赖

```xml
<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
            <version>2.3.0</version>
        </dependency>

        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
```

### 定义配置文件

配置数据库以及mybatis的相关特性

```yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/school?serverTimezone=Asia/Shanghai&useSSL=false
    username: root
    password: root
mybatis:
  mapper-locations: classpath:mappers/*.xml
  type-aliases-package: net.wanho.base03mybatis.entity
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
    map-underscore-to-camel-case: true
```

### mapper

在每一个mapper接口上使用@Mapper注解

在主启动类上增加@MapperScan(basePackage="")

### mapper.xml

### service

### controller



## 整合druid

默认的连接池：hikaripool，如果需要调整成druid，需要添加相关依赖以及配置

druid提供了一个管理界面，可以查看连接池的运行状况。

### 依赖

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid-spring-boot-starter</artifactId>
    <version>1.2.16</version>
</dependency>
```



### 配置

```yaml
server:
  port: 8080
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/school?serverTimezone=Asia/Shanghai&useSSL=false
    username: root
    password: root
    type: com.alibaba.druid.pool.DruidDataSource
    druid:
      max-active: 8
      min-idle: 2
      max-wait: 1000
      max-evictable-idle-time-millis: 2000000 #长连接时间（半个小时~7个小时之间）
mybatis:
  mapper-locations: classpath:mappers/*.xml
  type-aliases-package: net.wanho.base03mybatis.entity
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
    map-underscore-to-camel-case: true
```



### 配置监控Servlet

```java
@Configuration
public class AppConfig {

    @Bean
    public ServletRegistrationBean registrationBean(){
        ServletRegistrationBean bean = new ServletRegistrationBean();
        bean.setName("druid");
        bean.setServlet(new StatViewServlet());
        bean.addUrlMappings("/druid/*");
        bean.addInitParameter("loginUsername","admin");
        bean.addInitParameter("loginPassword","admin");
        //拒绝访问的IP
        bean.addInitParameter("deny","192.168.66.10");
        return bean;
    }
}
```



# 自动配置原理

Springboot的自动配置原理：基于SPI机制。Springboot的主启动类上包含一个注解@SpringbootApplication，此注解由三个功能性注解组成，@SpringbootConfiguration，@ComponentScan，@EnableAutoConfiguration。@SpringbootConfiguration标记主启动类也是配置类，@ComponentScan指定扫描包的位置，没有指定basepackage的情况下，其实就是使用此注解的类所在包以及子包。@EnableAutoConfiguration启用自动配置，利用SPI机制，确定哪些需要进行自动配置，并且根据指定的条件进行注入。

## 注解

### @Import注解

此注解主要是用来导入java的类，可以是本工程当中的类，也可以是第三方的类，并且创建其对象，放入容器当中

使用方式：

​	直接导入类

​	导入ImportSelector接口的实现类

​	导入ImportBeanDefinitionRegistrar接口的实现类

具体代码请参考Spring笔记

### @SpringbootApplication

```java
//@SpringBootConfiguration是springboot2.x出现的新注解，作用和springboot1.x的@Configuration注解是一样的，标记此注解的类是一个配置类
@SpringBootConfiguration
@EnableAutoConfiguration
//和spring当中的配置<context conponent-scan basepackages=""/>作用是相同。
//标记工程扫描的路径，不指定basepackages的情况下，则为标记此注解的类所在的package以及子package
@ComponentScan(
    excludeFilters = {@Filter(
    type = FilterType.CUSTOM,
    classes = {TypeExcludeFilter.class}
), @Filter(
    type = FilterType.CUSTOM,
    classes = {AutoConfigurationExcludeFilter.class}
)}
)
public @interface SpringBootApplication {
    @AliasFor(
        annotation = EnableAutoConfiguration.class
    )
    ...
   }
```



### @EnableAutoConfiguration

```java
//添加此注解的类所在的package以及子package作为自动配置的包进行扫描
//导入AutoConfigurationPackages.Registrar，读取@SpringbootApplication注解中的扫描路径，
// 如果没有配置，则默认当前类下
@AutoConfigurationPackage
//利用SPI机制，加载META-INF/spring.factories以及
// META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
//当中的类
@Import({AutoConfigurationImportSelector.class})
public @interface EnableAutoConfiguration {
    String ENABLED_OVERRIDE_PROPERTY = "spring.boot.enableautoconfiguration";

    Class<?>[] exclude() default {};

    String[] excludeName() default {};
}

```



自动配置的条件

```
@ConditionalOnClass：当前的classpath下有指定的类才进行加载
@ConditionalOnMissingClass：当前的classpath下没有指定的类才进行加载
@ConditionalOnBean：当前的容器当中有指定的类的对象才进行加载
@ConditionalOnMissingBean：当前的容器当中没有指定的类的对象才进行加载
@ConditionalOnProperty：环境条件注解，配置文件中指定与此prefix相同的配置项时，才会进行加载
@ConditionalOnResource：当包含指定的资源文件时进行加载
@ConditionalOnWebApplication：当前的工程是web工程时进行加载
@ConditionalOnExpression：负荷指定的SPEL表达式才进行加载。
```



## java的SPI机制

SPI(Service Provider Interface),服务提供接口，是JDK内置的一种服务提供发现机制。SPI是一种动态替换发现机制，基于一种非常优秀的解耦思想。它是一种扩展机制，是JDK提供给“服务提供厂商”或者“插件开发者”使用的接口

简单来说：由服务的提供方定义一个接口规范，由不同的服务提供商进行实现。调用方能够通过某种机制来发现服务的提供方，并且有能力通过接口来调用服务。它强调的是服务的调用者对服务实现的一种规范（约束），服务的提供者根据这些约束来实现服务，可以被调用者发现。

应用案例：数据库驱动，Slf4j日志

案例：空调的遥控器能做的事情：空调型号，开关处理，调节温度，变更模式（制冷，制热、通风）

![SPI机制](https://raw.githubusercontent.com/ydh1cnn6/pic/master/SPI机制.png)



### SPI

1: 工程一，定义一个接口/抽象类

2：工程二，工程三

​	实现接口

​	实现方的META-INF/services目录下，创建一个接口的全限定名的名称的文件，内容是提供接口的实现类的全限定名

4：工程四：作为服务的调用方，使用java.util.ServiceLoader去动态加载具体的实现类到JVM当中

#### 接口工程airconditioner

```java
package net.wanho;

/**
 * @author 马美平
 * @Date 2023/5/23
 **/
public interface AirConditioner {

    /**
     * 获取空调类型
     * @return
     */
    String getType();

    /**
     * 开关处理
     */
    void turnOnOff();

    /**
     * 调节温度
     * @param temperature
     */
    void adjustTemperature(int temperature);

    /**
     * 改变模式
     * @param modeId
     */
    void changeMode(int modeId);
}

```



#### 实现工程airconditioner-floor

增加接口工程airconditioner的依赖，并实现AirConditioner接口

```java
/**
 * @author 马美平
 * @Date 2023/5/23
 **/
public class FloorAirConditioner implements AirConditioner {

    @Override
    public String getType() {
        return "柜式空调";
    }

    @Override
    public void turnOnOff() {
        System.out.println("柜式空调-开关处理");
    }

    @Override
    public void adjustTemperature(int temperature) {
        System.out.println("柜式空调-调节温度");
    }
    @Override
    public void changeMode(int modeId) {
        System.out.println("柜式空调-改变模式");
    }
}

```



#### 工程airconditioner-wall

增加接口工程airconditioner的依赖，并实现AirConditioner接口

```java
public class WallAirConditioner implements AirConditioner {
    @Override
    public String getType() {
        return "挂式空调";
    }

    @Override
    public void turnOnOff() {
        System.out.println("挂式空调-开关处理");
    }

    @Override
    public void adjustTemperature(int temperature) {
        System.out.println("挂式空调-调节温度");
    }

    @Override
    public void changeMode(int modeId) {
        System.out.println("挂式空调-调节模式");
    }
}

```



#### 主工程（调用接口）

添加工程airconditioner-wall和工程airconditioner-floor的依赖，利用ServiceLoader发现实现类

```java
/**
 * @author 马美平
 * @Date 2023/5/23
 **/
public class AirSpi {
    public static void main(String[] args) {
        new AirSpi().turnOnOff("挂式空调");
    }

    public void turnOnOff(String type) {
        ServiceLoader<AirConditioner> load = ServiceLoader.load(AirConditioner.class);

        for(AirConditioner airConditioner: load) {
            System.out.println("检测到：" + airConditioner.getClass().getName());
            if (type.equals(airConditioner.getType())) {
                //调用指定类型的空调
                airConditioner.turnOnOff();
            }
        }
    }
}

```



## springboot的SPI机制

加载 META-INF/spring.factories以及META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports中配置的类，并且进行bean的配置

### 加载顺序

默认按照文件名进行顺序加载，如果想要修改加载顺序，则可以使用@AutoConfigureBefore或者@AutoConfigureAfter进行修改，还可以利用@AutoConfigureOrder指定加载顺序，数字越小，越被优先注入。

如果有依赖关系的，springboot会自动先配置被依赖的对象，然后再配置外层对象。

## 自定义starter

定义一个带有School类的starterr，在应用工程当中，如果没有school对象，则加载类，并创建对象加入到容器当中。

Spring官方starter都是spring-boot-starter-xx命名

第三方的框架（组件） xx-spring-boot-starter

groupid: net.wanho

artifactId: school-spring-boot-starter



创建工程

添加依赖

```xml
 <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-autoconfigure</artifactId>
        </dependency>
<!--    编译时会自动创建相关的json和properties文件-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-autoconfigure-processor</artifactId>
        </dependency>
<!--插件依赖要删除，不然会报错-->
```

自动配置类

```java
@Configuration
@ConditionalOnMissingBean(School.class)
@EnableConfigurationProperties(SchoolProperties.class)
public class SchoolAutoConfiguration {
    @Resource
    SchoolProperties schoolProperties;
    @Bean
    public School school() {
        School school = new School();
        school.setAddress(schoolProperties.getAddress());
        school.setName(schoolProperties.getName());
        school.setDescription(schoolProperties.getDescription());
        System.out.println(school);
        return school;
    }
}
```

定义school

```java
@Data
public class School {
    String name;
    String address;
    String description;
}
```

定义配置文件

```java
@Component
@Data
@ConfigurationProperties(prefix = "wanho.school")
public class SchoolProperties {
    String name;
    String address;
    String description;
}
```



定义spring.factories

```yaml
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
  net.wanho.config.SchoolAutoConfiguration
```



使用maven的install安装到本地仓库

定义测试工程，引入依赖，自动创建对象

如何动态配置属性



# 整合redis

## 引入依赖

配置redis的属性

配置RedisTemplate



# 项目启动后立刻执行模块处理

有些特殊的业务，需要在项目启动之后立刻执行。

## 实现ApplicationListener接口

```java
@Component
public class SpringUtils implements ApplicationListener<ContextRefreshedEvent> {

    @Resource
    DictTypeService dictTypeService;

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        //防止重复调用
        if(event.getApplicationContext().getParent()==null) {
            dictTypeService.initDictCache();
        }

    }
}
```



## 实现CommandLineRunner接口

```java
@Component
public class SpringCommandLineRunner implements CommandLineRunner {
    @Resource
    DictTypeService dictTypeService;

    @Override
    public void run(String... args) throws Exception {
        dictTypeService.initDictCache();
    }
}
```



## ApplicationRunner

```java
@Component
public class SpringApplicationRunner implements ApplicationRunner {

    @Resource
    DictTypeService dictTypeService;
    @Override
    public void run(ApplicationArguments args) throws Exception {
        dictTypeService.initDictCache();
    }
}
```





# 热部署

## 增加依赖

```
<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
        </dependency>
```



## 设置注册属性

compiler.automake.allow.when.app.running 打勾

![image-20230525135359144](C:\Users\mameiping\AppData\Roaming\Typora\typora-user-images\image-20230525135359144.png)





## 在debug模式下启动