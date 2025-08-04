---
title: Sentinel
author: BigSea
email: 2834637197@qq.com
wather: ☀️   +35°C
createDate: 2025-08-04 14:14:01
updateDate: 2025-08-04 14:49:49
week: 第32周｜星期一
---

Sentinel（阿里巴巴开源的流量治理组件）在分布式系统中扮演着“流量防卫兵”的角色，其核心作用是通过多维度机制保障系统稳定性与高可用性。

流量控制：QPS限流、并发线程数控制​​、​​流量整形
熔断降级：
系统负载保护：
热点参数限流：避免单点热点（如爆款商品）耗尽资源


参考文档：[【微服务】Sentinel（流量控制）](https://blog.csdn.net/m0_64637029/article/details/137148074)
# SpringCloud配置过程
## Sentinel启动
java -jar sentinel-dashboard-1.8.0.jar --server.port=8080（默认用的是8080端口）
## 监听指定微服务
### 1、pom.xml引入Sentinel
```xml title="xml"
<!-- 引入sentinel -->
<dependency>
	<groupId>com.alibaba.cloud</groupId>
	<artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>
```
### 2、application.yml 配置sentinel与服务端通信
```yaml 
spring:
  cloud:
	# 配置sentinel
    sentinel:
      transport:
        dashboard: localhost:8080 # 配置sentinel的地址
        port: 8719 # 配置sentinel的端口，当端口冲突时，会自动+1，直到找到可用端口
```


# 限流配置
## QPS限流
1、配置页面
![配置页面|600](https://i-blog.csdnimg.cn/blog_migrate/b7d096e1926b1f05359a10a8307cb88e.png)
2、基本介绍

![描述|600](https://i-blog.csdnimg.cn/blog_migrate/ab7ebc4efe1815ab1d634972f02e5809.png)
### 流控
配置实例
![配置实例|600](https://i-blog.csdnimg.cn/blog_migrate/1ab7c12583efa2ff5e015220827fe780.png)

### URL资源清洗
描述：
![url清洗|600](https://i-blog.csdnimg.cn/blog_migrate/4b9247e79d6b13a784956ffdff465617.png)

1、代码层
```java title="URL资源清洗"
@Component // 注入到spring容器中
public class CustomerUrlCleaner implements UrlCleaner {
    @Override
    public String clean(String originUrl) {
        // 判断是否为空
        if (StringUtils.isBlank(originUrl)) {
            return originUrl;
        }
        // 如果是/member/get开头的url，就将其清洗为/member/get/*
        if (originUrl.startsWith("/member/get")) {
            return "/member/get/*";
        }
        return originUrl;
    }
}
```
2、规则配置：
![规则配置|600](https://i-blog.csdnimg.cn/blog_migrate/46979ebf50ee972b237e840f068db34c.png)



## 并发线程数控制




## 流量控制模式—关联
需求分析：简单来说就是t1关联t2，当t2的QPS超过1，则t1被限流
1、配置
![image.png|400](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-08-04-202508041632251.png)

2、失败场景：（间隔100毫秒同时执行2个请求，哪怕单线程算上延时goods的QPS也在2以上，所以会失败）
![image.png|300](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-08-04-202508041633995.png)


## 流量控制效果—Warm up

阈值一般是一个微服务能承担的最大QPS，但是一个服务刚刚启动时，一切资源尚未初始化（冷启动），如果直接将QPS跑到最大值，可能导致服务瞬间宕机。
warm up也叫预热模式，是应对服务冷启动的一种方案。请求阈值初始值是 maxThreshold / coldFactor，持续指定时长后，**逐渐提高**到maxThreshold值。而coldFactor的默认值是3.

maxThreshold：单机阈值
coldFactor：默认3，用来计算初始阈值
预热时间:几秒内
1、配置
![配置|500](https://i-blog.csdnimg.cn/blog_migrate/7ee3159380972cefecfa93f2ffa003fe.png)
2、效果示意图

![Warm up|500](https://i-blog.csdnimg.cn/blog_migrate/2d82e4055336f06e519fb95ec9f20ea0.png)

## 流量控制效果—排队
效果：**削峰填谷**

当请求超过QPS阈值时，快速失败和warm up 会拒绝新的请求并抛出异常。
而排队等待则是让所有请求进入一个队列中，然后按照阈值允许的时间间隔依次执行。后来的请求必须等待前面执行完成，如果请求预期的等待时间超出最大时长，则会被拒绝。
工作原理：
>例如：QPS = 5，意味着每200ms处理一个队列中的请求；timeout = 2000，意味着预期等待时长超过2000ms的请求会被拒绝并抛出异常。

![效果|500](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-08-04-202508041708613.png)

