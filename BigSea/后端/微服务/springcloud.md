---
date: 2025-07-03T14:24:00
name: 闫大海
---


1、SOA 服务治理
2、Dubbo 基于rpc 协议，面向接口远程调用、负载均衡、服务注册和发现
	springcloud 基于 http 协议
3、SpringBoot 、SpringCloud版本控制
[[maven.md#版本依赖]]



4、默认只开启了 health, 所以 404 
[localhost:6104/actuator/info](http://localhost:6104/actuator/info)
```yml 开启所有端点
#开启所有端点  
management:  
  endpoints:  
    web:  
      exposure:  
        include: "*"
```


# Gateway 
也要注册到注册中心
主要功能：路由、断言、过滤
```yml title="多模块配置"
spring:  
  application:  
    name: GATEWAY  
  cloud:  
    gateway:  
      routes:  
        - id: goods-route  
          uri: lb://GOODS  
          predicates:  
            - Path=/goods/**  
        - id: order-route  
          uri: lb://ORDER  
          predicates:  
            - Path=/order/**
```
## 断言
[Spring Cloud Gateway-断言谓词](https://docs.spring.io/spring-cloud-gateway/docs/3.1.9/reference/html/#the-after-route-predicate-factory)
### After
After: `After= datetime ZonedDateTime`
### Before
Before: `Before datetime ZonedDateTime`
### Between
Between: `Between datetime1 ZonedDateTime, datetime2 ZonedDateTime`
### Cookie
Cookie: `Cookie name,regexp`
### Header
Header:  `Header header regexp`

### Host
Host: ``
### Method
Method：`Method=GET,POST`
### Path
Path： ``
### <font color="#ff0000">Query</font>
Query：``
### RemoteAddr

## 过滤
### AbstractGatewayFilterFactory
### GlobalFilter
```
```

### Servlet 的filter（原始）
```java
package javax.servlet;
import java.io.IOException;
public interface Filter {  
    default void init(FilterConfig filterConfig) throws ServletException {  
    }  
  
    void doFilter(ServletRequest var1, ServletResponse var2, FilterChain var3) throws IOException, ServletException;  
  
    default void destroy() {  
    }  
}
```


# Nacos
1、引入依赖
```xml
<dependency>  
    <groupId>com.alibaba.cloud</groupId>  
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>  
    <version>2023.0.3.2</version>  
</dependency>
```
>[!tip]
> [版本依赖关系]( https://github.com/alibaba/spring-cloud-alibaba/blob/2023.x/README-zh.md## 如何构建)

 (![Nacos](BigSea/后端/微服务/Nacos.md#^版本依赖2) 
)
[springCloud](BigSea/后端/微服务/springCloud.md) 


2、配置文件
```yml
spring:
 cloud:  
  nacos:  
    discovery:  
     server-addr: http://169.254.83.107:8848/
```

3、启动类
```java
@SpringBootApplication
@EnableDiscoveryClient
public class NacosGoodsApplication {
	.....
}
```

