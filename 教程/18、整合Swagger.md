# 整合Swagger

Swagger 是一个规范和完整的框架，用于生成、描述、调用和可视化 RESTful 风格的 Web 服务，用于文档管理的工具。。

总体目标是使客户端和文件系统作为服务器以同样的速度来更新。文件的方法、参数和模型紧密集成到服务器端的代码，允许 API 来始终保持同步。Swagger 让部署管理和使用功能强大的 API 从未如此简单。



## 常用的注解

### 实体类上的注解

@ApiModel： 用来标注实体类的作用

@ApiModelProperty：用在实体类的属性上，添加一些自定义的属性属性

### 控制器上的注解

@Api(tags="用户管理"):定义在类上

@Tag(name="" ,descipt=""):定义在类上，说明控制器的作用，和@Api注解作用基本类型，是3新增加的注解

@ApiOperation("说明"):定义在方法上，用来表明此方法是干什么的

@ApiParam()定义在参数上

## 依赖

```
<dependency>
            <groupId>io.springfox</groupId>
            <artifactId>springfox-boot-starter</artifactId>
            <version>3.0.0</version>
        </dependency>
```



## 修改主启动类

增加@EnableOpenApi注解

## 主配置文件中修改pathPattern属性

spring2.6.X的以后版本需要



## 访问路径

http://localhost:8080/swagger-ui/index.html

## 编写控制器接口使用注解

**使用在控制器接口上注解**

@Api(tags="") :定义控制器类上，用于说明当前控制器的模块

@ApiOperation("获取。。。数据")：定义在方法上

@ApiParam(valu3="角色id"，required=true，example="1001")



**使用在Entity上的注解**

@ApiModel

@ApiModelProperty



## 使用第三方UI

整合下面两个ui后，访问路径变成 http://localhost:8080/doc.html

### 整合swagger-bootstrap-ui

```xml
<dependency>
    <groupId>com.github.xiaoymin</groupId>
    <artifactId>swagger-bootstrap-ui</artifactId>
    <version>1.9.6</version>
</dependency>
```

### 整合knife4j

```xml
<dependency>
    <groupId>com.github.shijingsh</groupId>
    <artifactId>knife4j-spring-boot-starter</artifactId>
    <version>3.1.0</version>
</dependency>
```



## 配置类上

```java
@Configuration
public class AppConfig {

    @Bean
    public Docket apiDocket(){
        return new Docket(DocumentationType.OAS_30)
                .groupName("admin")
                .apiInfo(addApiInfo())
                .select()
                //.paths(Predicates.and(PathSelectors.regex("/user/.*")))  //配置路由，可以只显示一部分接口
                .build();
    }

    /**
     * 配置Api信息
     * @return
     */
    private ApiInfo addApiInfo(){
        return new ApiInfoBuilder()
                .title("万和物美后台管理系统")
                .description("万物智联项目")
                .version("1.0")
                .contact(new Contact("小万","http://helper.wanho.net","helper@wanho.net"))
                .build();
    }
}
```



# logback

## 日志

项目中操作的记录信息，可以通过日志查看程序的运行信息以及异常信息等。

## 日志级别

trace，debug，info，warn，error，all或off

## 配置文件

springboot的内部使用logback作为日志实现的框架

在resouces中创建logback-spring.xml或者logback.xml文件（两个默认的文件名）

如果不是上述两个文件名，则需要进行修改。使用logging.config

```

```



