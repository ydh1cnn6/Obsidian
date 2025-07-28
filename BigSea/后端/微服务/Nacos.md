---
createDate: 2025-07-28T15:48:00
updateDate: 2025-07-28T15:50:00
author: 闫大海
template triggers: 问题
---
# 版本依赖

- 2023.X 分支对应的是 Spring Cloud 2023 与 Spring Boot 3.2. X，最低支持 JDK 17。
- 2022.X 分支对应的是 Spring Cloud 2022 与 Spring Boot 3.0. X，最低支持 JDK 17。
- 2021.X 分支对应的是 Spring Cloud 2021 与 Spring Boot 2.6. X，最低支持 JDK 1.8。
- 2020.0 分支对应的是 Spring Cloud 2020 与 Spring Boot 2.4. X，最低支持 JDK 1.8。
- 2.2. X 分支对应的是 Spring Cloud Hoxton 与 Spring Boot 2.2. X，最低支持 JDK 1.8。
- Greenwich 分支对应的是 Spring Cloud Greenwich 与 Spring Boot 2.1. X，最低支持 JDK 1.8。
- Finchley 分支对应的是 Spring Cloud Finchley 与 Spring Boot 2.0. X，最低支持 JDK 1.8。
- 1. X 分支对应的是 Spring Cloud Edgware 与 Spring Boot 1. X，最低支持 JDK 1.7。
>[!tip]
> [版本依赖关系]( https://github.com/alibaba/spring-cloud-alibaba/blob/2023.x/README-zh.md## 如何构建)

# springboot

## 配置自动刷新
不能使用@value注解，而要使用@nacosvalue注解，且autorefreshed=true
## 注意事项
需要指定nacos的ip端口
需要指定配置文件名，配置文件 ^[写在配置文件中，需要同时开启bootstrap=true]，或启动类上加注解


# springcloud
不能用@nacosvalue，而要用value
如果指定了application.name，可以不要配置文件名
自动刷新：需要注入的类添加@refreshscope注解（一般直接把要注入的属性写在配置类了，直接在配置类上加就行）


# profile优先级
按先后：
1、拉取name配置文件
2、拉取name.properties (若指定yaml则为yaml)
3、拉取name-${==spring.profile.active==}.properties

# 额外指定配置文件
有个参数可以配置，分别指定配置文件名extension-configs：本应用特有
shared-configs：多个应用共享
## 优先级
数组下标从大往小依次读取
优先级（主配置最高）：主配置>extension-configs>shared-configs

## files-extension作用
解析文件时按照files-extension解析，不一致时会报错

# 负载均衡起作用
resttemplate，配置的loadbalance是ribbon提供的轮训。可以加个bean，nacosrule，

# 就近访问
通过在消费者中指定集群名实现

# 集群架构
1、集群要共用一个数据库存储配置信息，否则要在启动命令加参数 -m。。。
2、消费者和提供者把集群所有节点列出来，逗号分隔。或者，集群用NGINX代理，节点使用nginx的ip端口+路径（nginx代理nacos的路径）

# 服务降级
sentinal依赖+指定降级处理类和方法，feith或者resttempl'te调用接口遇到报错，会执行降级处理，比如扔到消息队列，后续做补偿



# 问题合集
Yesterday: <% tp.date.yesterday("YYYY-MM-DD") %>

## 1、启动失败
**问题描述**：
	<font color="#ff0000">Caused by: com.mysql.cj.exceptions.UnableToConnectException: Public Key Retrieval is not allowed</font>
**分析过程**：
	搜索ai
**根本原因**：
	通常是由于MySQL 8.0及以上版本的安全机制导致。
**解决方案**：
	修改JDBC连接参数，为MySQL连接URL添加allowPublicKeyRetrieval=true参数
## 2、写启动脚本
**描述**：
	直接写在项目文件中，执行启动脚本即可直接启动nacos-server
**实现**：
```yaml title="start.cmd"
@echo off
set "NACOS_DIR=D:\devsoft\nacos-server-2.0.1\nacos"
set "BIN_DIR=%NACOS_DIR%\bin"

cd /d "%BIN_DIR%"
call startup.cmd -m standalone
```

