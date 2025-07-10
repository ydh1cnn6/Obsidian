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