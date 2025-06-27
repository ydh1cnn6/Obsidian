1、
## 二、服务的注册与发现

‌常见的服务注册与发现框架包括 Eureka 、 Nacos 、 Consul 、 Zookeeper 和 etcd 。
### 1、搭建服务注册中心
启动类：@EnableEurekaServer
```yml
# SpringCloud问题解决：spring-cloud-eureka启动出错Cannot execute request on any known server
# https://www.cnblogs.com/shea/p/8675439.html
# Spring Cloud Eureka 常用配置及说明：https://www.cnblogs.com/li3807/p/7282492.html
spring:
    application:
        name: eureka
# VM options 设置端口方法： -DServer.port=8763, 可用此方法同时启动 N 个 eureka 服务
#server:
      ##    port: 8762
eureka:
  # 注册中心的保护机制，Eureka 会统计15分钟之内心跳失败的比例低于85%将会触发保护机制，不剔除服务提供者，如果关闭服务注册中心将不可用的实例正确剔除
# enable-self-preservation: false开发环境使用，生产环境设置为true
  server:
    enable-self-preservation: false
  client:
      # 注册中心，只提供给其他服务，不需要自己注册自己
      register-with-eureka: false
      fetch-registry: false
      service-url:
          # 高可用：向其他eureka实例注册自己
#           defaultZone: http://localhost:8761/eureka/,http://localhost:8762/eureka/
          defaultZone: http://localhost:${server.port}/${spring.application.name}/
```
@EnableEurekaClient
```yml
# Eureka客户端
spring:
    application:
        name: client
server:
    port: 8081
eureka:
#  instance:
#    hostname: client
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/,http://localhost:8762/eureka/,http://localhost:8763/eureka/
```