---
typora-root-url: images
title: spring cloud
---

# Spring cloud

Spring Cloud是一个基于Spring boot实现的微服务架构开发工具,微服务架构是SOA架构的发展。它为微服务架构中提供配置管理、服务治理、智能路由、断路器以及集群状态管理等等。Spring cloud是基于HTTP协议的架构。

Springboot只用来开发单个服务

Springcloud可以开发多个服务

核心组件：

​	注册中心：**Eureka ，Nacos**，Consul

​	负载均衡：Ribbon，**sentinel， loadbalancer**

​	容错保护：Hystrix，**resilience4j，sentinel**

​	服务调用：feign，**openfeign**

​	网关：Zuul，**Gateway**

​	配置中心：config，**Nacos**

>[!tip] IDEA启动微服务
>[SpringCloud服务批量启动](SpringCloud服务批量启动.md#Idea批量启动)


# 入门案例

有一个服务（提供者），提供图书的检索功能。

有另外一个服务（消费者），需要买书时，按照编号查看书的信息。

## 公共模块---
title: spring cloud
author: BigSea
email: 2834637197@qq.com
wather: 🌦   +25°C
createDate: 2025-06-06 15:13:12
updateDate: 2025-08-01 11:16:58
week: 第31周｜星期五
---


创建普通maven工程base00-common，并编写实体类

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Book {
    String isbn;
    String name;
    String author;
    double price;
}
```

## 服务提供者

创建一个spring boot的web工程，并增加base00-common的依赖

### 依赖文件

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>net.wanho</groupId>
    <artifactId>base00-common</artifactId>
	<version>1.0</version>
</dependency>
```

### service

```java
@Service
public class BookService {

    static Map<String,Book> map = new HashMap<>();
    static {
        map.put("SB1001",new Book("SB1001","随便","佚名",50));
        map.put("SB1002",new Book("SB1002","浮士德","歌德",60));
        map.put("SB1003",new Book("SB1003","我们仨","杨绛",25));
    }


    public Book findByIsbn(String isbn) {
        //查询数据库
        return map.get(isbn);
    }
}
```



### controller

```java
@Resource
BookService bookService;

@GetMapping("book/{isbn}")
public Book findBookByIsbn(@PathVariable("isbn") String isbn){
	return bookService.findByIsbn(isbn);
}
```



## 服务的调用者

创建一个普通springboot的web工程，并增加base00-common的依赖

用户服务

### 依赖文件

```java
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>net.wanho</groupId>
    <artifactId>base00-common</artifactId>c
	<version>1.0</version>
</dependency>c
```



### 注册RestTemplate

```java
@Bean
    public RestTemplate restTemplate(){
        return new RestTemplate();
    }
```



### 编写Service，调用别人提供的服务

```java
@Service
public class UserService {

    //服务提供者的服务URL
    //String host = "http://localhost:8080";

    @Resource
    RestTemplate restTemplate;

    public Book searchBook(String isbn){
        System.out.println("用户查找图书");
        String url = host + "/book/" + isbn;
        Book book = restTemplate.getForObject(url, Book.class);
        return book;
    }
}
```



### 编写控制器测试

```java
@RestController
public class UserController {

    @Resource
    UserService userService;

    @GetMapping("borrow/{isbn}")
    public Book searchBook(@PathVariable("isbn") String isbn) {
        return userService.searchBook(isbn);
    }
}
```



## Eureka（注册中心）

是Spring cloud中的一个服务治理模块。

NetFlix公司一系列开源产品中的其中之一，它的主要作用是服务的注册和发现。

服务器端：也称为服务注册中心，提供服务的注册和发现。Eureka支持高可用的配置，当集群当中有节点（分片）出现故障时，Eureka会自动进入自我保护模式，它允许故障期间提供服务的发现和注册，当故障分片（节点）恢复后，集群的其他节点（分片）会把数据同步过来。

客户端：主要包含服务的生产者和服务消费者。服务的提供者要和服务器端维持心跳，来更新它的服务租约。可以将服务器端的注册信息缓存到本地，并周期性的更新服务状态。

![eureka.png|600](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-08-01-eureka.png)


### 服务端

创建一个普通springboot工程base01-eureka，**注意不要选择web依赖**，增加Eureka服务端依赖

#### 依赖

```xml
<parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.9</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>net.wanho</groupId>
    <artifactId>base01-eureka</artifactId>
    <version>1.0</version>
    <name>base01-eureka</name>
    <description>Demo project for Spring Boot</description>
    <properties>
        <java.version>1.8</java.version>
        <spring-cloud.version>2021.0.6</spring-cloud.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
```



#### 配置文件

```yaml
server:
  port: 7100
spring:
  application:
    name: eureka-server
eureka:
  client:
    service-url:
      defaultZone: http://localhost:7100/eureka
      #是否从注册中心拉取信息，本身就是注册中心，不需要拉取信息
    fetch-registry: false
    #当前工程是否要到注册中心去注册， 本身就是注册中心，所以不需要
    register-with-eureka: false
  instance:
    hostname: localhost
```



#### 启动类

增加@EnableEurekaServer注解

```java
@SpringBootApplication
@EnableEurekaServer  //启用Eureka的服务器端
public class Base01EurekaApplication {

    public static void main(String[] args) {
        SpringApplication.run(Base01EurekaApplication.class, args);
    }

}

```



### 服务提供者

在原来的base01-provider上进行修改

#### 增加依赖

在各自的节点内，增加以下相关内容，注意不要覆盖

```xml
<properties>
        <spring-cloud.version>Hoxton.SR9</spring-cloud.version>
    </properties>
    
    <dependencies>

        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
        
    </dependencies>
     <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            
        </dependencies>
    </dependencyManagement>

```



#### 配置文件

```yaml
server:
  port: 8090
spring:
  application:
    name: bookapp
eureka:
  client:
    service-url:
      defaultZone: http://localhost:7100/eureka
    register-with-eureka: true
    fetch-registry: true
```



#### 修改主启动类

增加@EnableEurekaClient注解或者@EnableDiscoveryClient 

```java
@SpringBootApplication
@EnableEurekaClient  //启用Eureka的客户端
//@EnableDiscoveryClient  //使用于Eureka以及其他非Eureka的卡护短
public class Base01ProviderApplication {

    public static void main(String[] args) {
        SpringApplication.run(Base01ProviderApplication.class, args);
    }

}

```



### 服务消费者

在原来的base01-consumer上进行修改

#### 增加依赖

参考服务提供者

#### 配置文件

```yaml
server:
  port: 8081
spring:
  application:
    name: userapp
eureka:
  client:
    service-url:
      defaultZone: http://localhost:7100/eureka
    register-with-eureka: true
    fetch-registry: true
```



#### 修改主启动类

增加@EnableEurekaClient注解

```java
@SpringBootApplication
@EnableEurekaClient
public class Base01ConsumerApplication {

    public static void main(String[] args) {
        SpringApplication.run(Base01ConsumerApplication.class, args);
    }

    @Bean
    @LoadBalanced  //启用ribbon的负载均衡
    public RestTemplate restTemplate(){
        return new RestTemplate();
    }

}
```



#### 修改RestTemplate

增加负载均衡

```java
@Bean
@LoadBalanced  //启用ribbon的负载均衡
public RestTemplate restTemplate(){
    return new RestTemplate();
}
```

#### 修改调用host

用服务名替换原来的具体节点URL

```JAVA
@Service
public class UserService {

    //服务提供者的服务URL
    //String host = "http://localhost:8080";
    //用服务名替换具体的服务器的URL
    String host = "http://BOOKAPP";

    @Resource
    RestTemplate restTemplate;
 
    public Book searchBook(String isbn){
        System.out.println("用户查找图书");
        String url = host + "/book/" + isbn;
        Book book = restTemplate.getForObject(url, Book.class);
        return book;
    }
}
```



## 指定服务的IP地址

使用eureka.instance.prefer-ip-address=true显示ip

eureka.instance.ip-address=127.0.0.1来指定ip地址

```yaml
server:
  port: 8070
spring:
  application:
    name: bookapp
eureka:
  client:
    service-url:
      defaultZone: http://localhost:7100/eureka
    register-with-eureka: true
    fetch-registry: true
  instance:
    prefer-ip-address: true
    ip-address: 127.0.0.1
```



## 取消刷新

默认情况下，Eureka client是可以刷新的。当刷新客户端时，客户端暂时从服务器中取消注册，可能在短暂的时间内不提供给定的服务实例。设置配置：eureka.client.refresh.enable=false ，则不刷新客户端

## 自我保护

默认情况下，Eureka服务器端在一定的时间内如没有接收某个服务端实例的心跳，EurekaServer将会注销该实例。当网络发生故障的时候，微服务就可能无法正常通信。Eureka通过自我保护来解决这个，在短时间内失去过多的客户端的时候，进入自我保护模式，一但进入该模式，就会保护服务列表，不再删除服务注册列表中的数据。当故障恢复以后，退出自我保护模式。





# 负载均衡器

## LoadBalancer

客户端的负载均衡器，进程内部的负载均衡器。默认的策略是轮询，还有一个是随机。可以自定义策略。

使用方式，在RestTemplate对象上加入@LoadBalanced

### 随机策略

定义一个类（不能使用@Configuration注解），在此类当中增加一个@Bean注解的方法。返回RactorLoadbalancer接口的对象。

在配置类或者主启动类上使用@@LoadBalancerClients或者@LoadBalancerClient，指定上述定义的类为配置类

#### 定义配置

**注意：千万不要增加@Configuration注解**

```java
public class LoadBalancerConfig {

    @Bean
    ReactorLoadBalancer<ServiceInstance> randomLoadBalancer(Environment environment,
                                                            LoadBalancerClientFactory loadBalancerClientFactory) {
        String name = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
        return new RandomLoadBalancer(loadBalancerClientFactory
                .getLazyProvider(name, ServiceInstanceListSupplier.class),
                name);
    }
}
```

#### 启动类修改

```java
@SpringBootApplication
@EnableEurekaClient
//配置单个服务的负载均衡策略
//@LoadBalancerClient(value = "GOODS",configuration = LoadBalancerConfig.class)
//多个服务，采用同一个策略
@LoadBalancerClients(defaultConfiguration = LoadBalancerConfig.class)

//@LoadBalancerClients(value = {@LoadBalancerClient(value = "GOODS",configuration =LoadBalancerConfig.class )}
//                , defaultConfiguration = LoadBalancerConfig.class)
public class Base01OrderApplication {

    public static void main(String[] args) {
        SpringApplication.run(Base01OrderApplication.class, args);
    }


    @Bean
    @LoadBalanced
    public RestTemplate restTemplate(){
        return new RestTemplate();
    }

}
```



### 自定义负载均衡策略

需求：使用轮询方式访问服务器，每个服务器访问三次之后换下一个服务器

需要两个属性：1）用来记录当前的服务器被调用了几次 

​						 2）记录当前服务器是第几台服务器



如果当前的服务器已经被调用三次，换下一台服务器（i ）

#### 编写负载均衡策略类

```java
public class MyRRLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    private static final Log log = LogFactory.getLog(RoundRobinLoadBalancer.class);
    final AtomicInteger position;
    final String serviceId;
    ObjectProvider<ServiceInstanceListSupplier> serviceInstanceListSupplierProvider;
    int count=0;
    int MAX=3;

    public MyRRLoadBalancer(String serviceId, ObjectProvider<ServiceInstanceListSupplier> serviceInstanceListSupplierProvider) {
        this((new Random()).nextInt(1000),serviceId,serviceInstanceListSupplierProvider);
    }

    public MyRRLoadBalancer(int position, String serviceId, ObjectProvider<ServiceInstanceListSupplier> serviceInstanceListSupplierProvider) {
        this.position = new AtomicInteger(position);;
        this.serviceId = serviceId;
        this.serviceInstanceListSupplierProvider = serviceInstanceListSupplierProvider;
    }

    public Mono<Response<ServiceInstance>> choose(Request request) {
        ServiceInstanceListSupplier supplier = (ServiceInstanceListSupplier)this.serviceInstanceListSupplierProvider.getIfAvailable(NoopServiceInstanceListSupplier::new);
        return supplier.get(request).next().map((serviceInstances) -> {
            return this.processInstanceResponse(supplier, serviceInstances);
        });
    }

    private Response<ServiceInstance> processInstanceResponse(ServiceInstanceListSupplier supplier, List<ServiceInstance> serviceInstances) {
        Response<ServiceInstance> serviceInstanceResponse = this.getInstanceResponse(serviceInstances);
        if (supplier instanceof SelectedInstanceCallback && serviceInstanceResponse.hasServer()) {
            ((SelectedInstanceCallback)supplier).selectedServiceInstance((ServiceInstance)serviceInstanceResponse.getServer());
        }

        return serviceInstanceResponse;
    }

    private Response<ServiceInstance> getInstanceResponse(List<ServiceInstance> instances) {
        if (instances.isEmpty()) {
            if (log.isWarnEnabled()) {
                log.warn("No servers available for service: " + this.serviceId);
            }

            return new EmptyResponse();
        } else if (instances.size() == 1) {
            return new DefaultResponse((ServiceInstance)instances.get(0));
        } else {
            int pos;
            if(count<MAX) {
               pos =  this.position.get();
            } else {
               pos = this.position.incrementAndGet() & 2147483647;
               count=0;
            }
            ServiceInstance instance = (ServiceInstance)instances.get(pos % instances.size());
            count++;
            return new DefaultResponse(instance);
        }
    }
}
```



#### 配置类修改

```java
public class LoadBalancerConfig {

    //@Bean
    //ReactorLoadBalancer<ServiceInstance> randomLoadBalancer(Environment environment,
    //                                                        LoadBalancerClientFactory loadBalancerClientFactory) {
    //    String name = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
    //    return new RandomLoadBalancer(loadBalancerClientFactory
    //            .getLazyProvider(name, ServiceInstanceListSupplier.class),
    //            name);
    //}

    @Bean
    ReactorLoadBalancer<ServiceInstance> randomLoadBalancer(Environment environment,
                                                            LoadBalancerClientFactory loadBalancerClientFactory) {
        String name = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
        return new MyRRLoadBalancer(name,loadBalancerClientFactory
                .getLazyProvider(name, ServiceInstanceListSupplier.class)
                );
    }
}
```



## Ribbon（旧）

Ribbon是NetFlix发布的客户端负载均衡器，主要是用来控制HTTP和TCP客户端的行为。为Ribbon配置了服务提供者的地址列表后，Ribbon就可以基于某种负载均衡算法，自动地帮助服务消费者去请求对应的服务实例。Ribbon提供很多的负载均衡策略：轮询，随机，最少使用等。

Nginx和Ribbon的区别：

Nginx：是集中式的负载均衡设备（软件），Ribbon是进程内的负载均衡器，只是一个类库，集成在消费方的进程当中，消费方通过它来获取服务提供者的位置。

Nignx是服务器端负载均衡器，客户端的请求都是交给Nginx，然后由Nginx进行转发。

Ribbon：在调用微服务接口的时候，会在注册中心上获取注册的服务列表，缓存到本地。



### 如何负载均衡策略

```java
@Configuration
public class AppConfig {

    @Bean
    public IRule iRule(){
        return new RandomRule();
    }
}

```

### 自带的负载均衡策略

RoundRobinRule：轮询，尝试超过10次以后，直接不提供服务。

RandomRule: 随机策略

Retry：先按照轮询的策略获取服务，如果服务失败，则在指定的时间内进行重试，获取可用的服务

WeightedResponseTimeRule：是对轮询策略的扩展，每30秒钟计算一次服务器的响应时间，以响应时间作为权重，响应时间越短，响应速度越快的服务器被选中的概率越大。

BestAvailableRule：先过滤掉由于多次访问故障而处于断路器跳闸状态的服务，在可用列表中选择一个并发量最小的服务实例。

AvailabilityFilteringRule：：先过滤掉由于多次访问故障而处于断路器跳闸状态的服务，再选择一个相对并发量较小的实例。

ZoneAvoidanceRule：根据服务提供者实例的所在区域以及响应的可用性选择服务器。



### 自定义负载均衡策略

需求：使用轮询方式访问服务器，每个服务器访问三次之后换下一个服务器



需要两个属性：1）用来记录当前的服务器被调用了几次 

​						 2）记录当前服务器是第几台服务器



如果当前的服务器已经被调用三次，换下一台服务器（i ）

#### 定义策略

```java
public class CustomizeRule extends AbstractLoadBalancerRule {
    //当前服务器索引的访问次数
    private  int total=0;
    //当前的服务器索引
    private  int currentIndex = 0;
    @Override
    public void initWithNiwsConfig(IClientConfig iClientConfig) {

    }

    @Override
    public Server choose(Object o) {
        return choose(getLoadBalancer(),o);
    }

    public Server choose(ILoadBalancer lb,Object key) {
        if(lb == null) {
            return null;
        }
        Server server = null;
        //隐形风险：如果一直找不到可用的服务器实例，导致死循环
        while (server==null){
            //获取可用的服务器列表
            List<Server> reachableServers = lb.getReachableServers();
            //获取所有的服务器列表
            List<Server> allServers = lb.getAllServers();
            int upCount = reachableServers.size();
            int serverCount = allServers.size();
            //没有可用的服务器实例，直接返回
            if (upCount==0) {
                return null;
            }
            if(total < 3) {
                server=reachableServers.get(currentIndex);
                if (server==null) {
                    Thread.yield();
                    continue;
                }
                total++;
            } else {
                currentIndex = (currentIndex + 1) % upCount;
                //currentIndex++;
                //if (currentIndex== upCount) {
                //    currentIndex=0;
                //}
                server = reachableServers.get(currentIndex);
                if (server==null) {
                    Thread.yield();
                    continue;
                }
                total =1;
            }


        }
        return server;
    }
}
```



#### 配置

```java
@Configuration
public class AppConfig {

    @Bean
    public IRule iRule(){
        //return new RandomRule();
        return new CustomizeRule();
    }
}
```



# OpenFeign（Http服务调用）

OpenFeign是NetFlix开发的声明式、模板化的HTTP客户端，用于HTTP请求调用的轻量级的框架，以Java接口注解的方式调用HTTP请求。OpenFeign支持SpringMVC注解，可以和Eureka整合一起使用

使用步骤

导入依赖

在消费者端编写Openfeign的客户端（接口）

## 导入依赖

增加以下依赖

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```



## 编写接口

使用@FeignClient注解

```java
@Service
//name指定要调用的服务名
@FeignClient(name="bookapp")
public interface UserServiceFeign {

    @RequestMapping(value = "book/{isbn}")
    Book findByIsbn(@PathVariable("isbn") String isbn);
}

```



## 修改控制器调用接口

```
@RestController
public class UserController {


    @Resource
    UserServiceFeign userServiceFeign;

    @GetMapping("borrow/{isbn}")
    public Book searchBook(@PathVariable("isbn") String isbn) {
        return userServiceFeign.findByIsbn(isbn);
    }


}
```



## 修改主启动类

增加@EnableFeignClients注解

```java
@SpringBootApplication
@EnableEurekaClient
@EnableFeignClients
public class Base01ConsumerApplication {

    public static void main(String[] args) {
        SpringApplication.run(Base01ConsumerApplication.class, args);
    }

    @Bean
    @LoadBalanced  //启用ribbon的负载均衡
    public RestTemplate restTemplate(){
        return new RestTemplate();
    }

}
```



## 特殊属性说明

fallback和fallbackFactory，主要用于熔断机制，调用失败时，走的回退方法，可以用来抛出异常或者给出默认的数据。

decode404:配置响应状态为404时，是否抛出FeignException



## 调用的原理

OpenFeign基于JDK的动态代理。

@EnableFeignClients：加上该注解，Springboot启动的时候，会导入FeignClientsRegistrar，扫描所有带有@FeignClient注解的接口

解析到@FeignClient的配置属性后，扩展Spring Bean Definition的注册逻辑上面，最终注册一个FeignClientFactoryBean，此对象会产生一个代理类对象。



## 设置超时时间

可以参考在FeignClientProperties中的数据，主要是其内部类FeignClientConfiguration

```yml
feign:
  client:
    config:
      GOODS:  #指定服务
        connectTimeout: 1000
        readTimeout: 1000
```







# Hystrix（容错保护、断路器）

## 背景

在微服务的架构当中，原本一个大的服务会拆分成多个小服务单元，服务单元之间无法避免会有相互的依赖关系。由于这种依赖关系，当某一个服务单元出现故障，容易引起故障的蔓延，最终有可能导致整个系统的瘫痪。

雪崩效应：当某一个服务单元出现故障，容易引起故障的蔓延，顺着调用链向上传递，最终有可能导致整个系统的瘫痪的现象。

**产生场景**

硬件故障：服务器宕机，机房断电，光纤被挖断...

流量激增：异常流量激增

缓存问题：由于缓存的问题，导致服务提供者的负荷增加了，引起服务的不可用。

程序BUG:  程序逻辑错误导致内存泄漏，JVM长时间进行FullGC。

同步等待：服务间采用同步调用机制，同步等待导致资源的耗尽。

Hystrix的目标：在于通过控制哪些远程访问、服务以及第三方的节点，从而对延迟或者故障提供更强大的容错能力。

## Hystrix是干什么的

NetFlix公司开源的，用于分布式系统的延迟和容错处理的开源库。用于隔离远程访问、服务以及第三方的库，防止级联失败，从而提升系统的可用性以及容错性。

CAP:
	C: 一致性。分布式集群中节点（broker）上的数据要保持一致。

   A：可用性，要求服务端能够在指定的时间快速响应用户。

   P:  分区容错性，当集群或者分布式系统中的某一个节点（服务）出现问题后，整个集群或分布式系统的使用不能收到影响。

要么是CP，要么AP

**服务降级**： 假设系统比较忙或者不可用的情况下，给一个友好提示或者默认处理。触发降级的场合：程序运行异常、超时、服务熔断触发服务降级，线程池当中并发量达到阈值也可能导致服务降级。

**服务熔断**：达到最大服务访问量以后，直接拒绝访问，然后调用服务降级的方法给出友好提示。

**服务限流**：秒杀，抢红包等一系列高并发操作，严控一窝蜂的过来拥挤，让大家排队有序进行。



## RestTemplate方法

**依赖**

```xml
<dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
 </dependency>
```

**service中的方法**

降级方法的参数和返回值要和原来方法一致

```java
@Service
public class UserService {

    //服务提供者的服务URL
    //String host = "http://localhost:8080";
    //用服务名替换具体的服务器的URL
    String host = "http://BOOKAPP";

    @Resource
    RestTemplate restTemplate;

    @HystrixCommand(fallbackMethod = "fallback")
    public Book searchBook(String isbn){
        System.out.println("用户查找图书");
        String url = host + "/book/" + isbn;
        Book book = restTemplate.getForObject(url, Book.class);
        return book;
    }

    public String getServer(){
        String url = host + "/server";
        String server = restTemplate.getForObject(url, String.class);
        return server;
    }

    public Book fallback(String isbn){
        return new Book("XXXX","服务器出现异常","",0.0);
    }


}
```

**启动类**

增加@EnableHystrix或者@EnableCircuitBreaker注解

```java
@SpringBootApplication
@EnableEurekaClient
@EnableFeignClients
@EnableHystrix  //启动Hystrix断路器
//@EnableCircuitBreaker   //启用容错保护组件（）
public class Base01ConsumerApplication {

    public static void main(String[] args) {
        SpringApplication.run(Base01ConsumerApplication.class, args);
    }

    @Bean
    @LoadBalanced  //启用ribbon的负载均衡
    public RestTemplate restTemplate(){
        return new RestTemplate();
    }

}
```



## 统一处理

在Service类上使用@DefaultProperties注解，指定默认的服务降级的方法。

全局降级的方法，不能带有参数。

需要降级处理的方法上，不指定降级目标方法（回退方法），但是@HystrixCommand注解需要保留



## OpenFeign方式

[OpenFeign设置Hystrix详解](https://blog.csdn.net/2301_79354153/article/details/134642873)

### 开启Hystrix

```yaml
feign:
  httpclient:
    connection-timeout: 2000  #连接服务端的时间 + 实际读取的时间
  hystrix:
    enabled: true #开启容错保护组件
```



### fallback属性

使用@FeignClient的fallback属性，设置成指定的类

处理降级的类，需要实现对应的接口

```java
@Component
public class UserServiceFeignException implements UserServiceFeign {
    @Override
    public Book findByIsbn(String isbn) {
        return new Book("110","我是服务器，现在挂机中","",0.0);
    }
}
```



### fallbackFactory属性

使用@FeignClient的fallbackFactory属性，设置成指定的类

处理降级的类，实现FallbackFactory接口

```java
@Component
public class UserServiceFeignFactory implements FallbackFactory<UserServiceFeign> {
    @Override
    public UserServiceFeign create(Throwable throwable) {
        return new UserServiceFeign() {
            @Override
            public Book findByIsbn(String isbn) {
                return new Book("666","光纤被挖断了","",0.0);
            }
        };
    }
}
```



## 熔断演示

HystrixCommandProperties：普通参数
HystrixThreadPoolProperties：和线程池相关参数





## 看板（仪表盘）

### 仪表盘项目

创建一个web项目，要把web依赖去掉，增加hystrix-dashboard的依赖

配置项目增加hystrix.dashboard.proxy-stream-allow-list=*

在主启动类上要增@EnableHystrixDash注解

配置HystrixMetricsStreamServlet （可以使用配置文件，也可以在启动类当中注册）



### 被监控项目

增加两个依赖

hystrix-dashboard

actuator依赖

配置项目

```
management:
  endpoints:
    web:
      exposure:
        include: hystrix.stream
```



启动项目测试

启动dashboard，输入localhost:端口号/hystrix

启动被监控项目，在前面的页面窗口，输入  localhost:被监控项目端口号/actuator/hystrix.stream



# Resilience4J

## 依赖

增加springboot-aop以及actuator依赖

```
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-circuitbreaker-resilience4j</artifactId>
</dependency>
```

## 配置服务

可用的配置项目：CircuitBreakerConfig当中，可以去参考



## 使用断路器

# 网关Gateway

Gateway 是 Spring Clo·1111ud 的子项目，Spring2.X 提供的，Spring1.X 用的是 zuul（已经停更，进入维护期），提供简单有效的 API 路由管理方式。

Gateway作为zuul的替代品，是Springcloud生态中的网管。是基于WebFlux，高效能的Reactor模式。

Gateway的特点：

​	支持动态路由：能够匹配路由的任何请求属性

​	集成Spring Cloud的服务发现功能

​	支持限流功能

​	支持路径重写

​	提供断言（Predicate）以及过滤器（Filter），可以设置路由的一些条件

## 功能

服务网关：路由转发 + 过滤器

路由转发：接收客户端的请求，将请求转发到指定的微服务上。

过滤器：可以帮助网关实现一些类似于AOP可以完成的一些操作，认证，服务的监控，限流。

案例： 有四个微服务，每个微服务都需要权限的认证

​          方案一：每个微服务都实现一下权限认证的代码===>基本不会使用

​           方案二：将认证服务写成一个公共的服务，每个业务相关的微服务都来调用公共的服务。

​            方案三：将认证服务写到网关的过滤器

## 核心概念

路由（Route）：路由是构建网关的基本模块。它由ID,目标URI,一系列的断言和过滤器组成。

断言（Predicate）：开发人员可以通过断言的相关设置，匹配HTTP请求中的参数内容，设置访问路由的条件

过滤器（Filter）：通过过滤器，可以在路由前后进行一些修改



## 如何编写网关

创建一个springcloud项目

增加网关依赖，eureka客户端

配置相应的网关



## 动态路由

```
spring:
  application:
    name: base03-gateway
  cloud:
    gateway:
      routes:
        - id: gt-bookapp  #id值需要位置
#          uri: http://localhost:8070
          uri: lb://bookapp  #lb为固定值，表示负载均衡，bookapp为服务名
          predicates:
            - Path=/**
      discovery:
        locator:
          enabled: true #开启从注册中心动态创建路由的功能，利用微服务名进行路由
server:
  port: 10000
  #作为eureka的客户端的配置
eureka:
  client:
    service-url:
      defaultZone: http://localhost:7100/eureka
    register-with-eureka: true
    fetch-registry: true
```



## 断言

断言（Predicates）是一组匹配规则，请求只有和规则相匹配时才可以访问

-Path : 匹配路径

-After ：  - After=时间 （在某个时间之后可以访问）**由于是ZoneDateTime， 时间需要带有时区**

​		 - After=2021-11-24T11:35:57.557+08:00[Asia/Shanghai]

- Before： - Before=时间 （在某个时间之前可以访问）

-Between: - Before=时间1, 时间2

-Cookie,   -Cookie=phone,15911111111  phone为key，15911111111  

-Header： 表示请求头当中，需要包含某些内容，请求才可以访问

​	-Header=authenticator, 1111

-Method: 匹配请求方式，如 -Method=POST,GET

-Query：匹配请求的参数   -Query=price,\d+  : 请求当中需要携带price参数，且值必须数字才可以访问



## 过滤器

Spring cloud通过过滤器在请求的前后进行一部分分更新

抽象类AbstractGatewayFilterFactory的子类对象，配置的时候，去掉GatewayFilterFactory后缀



```yaml
spring:
  application:
    name: base03-gateway
  cloud:
    gateway:
      routes:
        - id: gt-bookapp  #id值需要位置
#          uri: http://localhost:8070
          uri: lb://bookapp  #lb为固定值，表示负载均衡，bookapp为服务名
          predicates:
            - Path=/book/**  #限制访问的路径
            - After=2021-11-24T11:35:57.557+08:00[Asia/Shanghai]
          filters:
            - AddRequestHeader=username,xiaoming
            - RedirectTo=302,http://www.baidu.com

      discovery:
        locator:
          enabled: true #开启从注册中心动态创建路由的功能，利用微服务名进行路由
```

```
全局过滤器的顺序
OrderedFilter
```

## 自定义全局过滤器

实现GlobalFilter接口，对所有的路由均有效。

```java
@Component
public class MyGlobalFilter implements GlobalFilter {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        //要求访问网关时，必须带有user参数，如果为null，则不放行，拒绝，不为null，则放行
        String user = exchange.getRequest().getQueryParams().getFirst("user");
        if (user == null) {
            System.out.println("===用户参数user没有设置");
            exchange.getResponse().setStatusCode(HttpStatus.NOT_ACCEPTABLE);
            exchange.getResponse().setComplete();  //设置拒绝
        }
        return chain.filter(exchange);  //放行
    }
}
```



## 局部过滤器

实现AbstractGatewayFilterFactory，要以GatewayFilterFactory作为类的后缀名

在指定路由的filters下定义对应的过滤器即可。

```java
//定义过滤器
@Component
public class MyTestGatewayFilterFactory extends AbstractGatewayFilterFactory {
    @Override
    public GatewayFilter apply(Object config) {

        return new GatewayFilter() {
            @Override
            public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
                System.out.println("=========局部过滤器=====================");
                return chain.filter(exchange);
            }
        };
    }
}
```

配置过滤器

```yaml
spring:
  application:	
    name: base03-gateway
  cloud:
    gateway:
      routes:
        - id: gt-bookapp  #id值需要位置
#          uri: http://localhost:8070
          uri: lb://bookapp  #lb为固定值，表示负载均衡，bookapp为服务名
          predicates:
            - Path=/book/**  #限制访问的路径
            - After=2021-11-24T11:35:57.557+08:00[Asia/Shanghai]
          filters:
            - MyTest
            #- AddRequestHeader=username,xiaoming
            #- RedirectTo=302,http://www.baidu.com

      discovery:
        locator:
          enabled: true #开启从注册中心动态创建路由的功能，利用微服务名进行路由
```



# nacos

Naming Configuration Service： 注册中心 + 配置中心 + 配置总线的组合组件

中文官网：https://nacos.io/zh-cn/index.html

英文spring： spring.io

下载：https://github.com/alibaba/nacos

使用nacos，不需要单独在编写一个nacos服务器端，已经提供。nacos是基于java代码实现。阿里出品。

## 步骤

增加依赖

配置

在主启动类增加@EnableDiscoveryClient注解

## 依赖

```xml
<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
            <version>2021.0.4.0</version>
        </dependency>
		
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
            <version>2021.0.4.0</version>
        </dependency>
        <!-- springcloud 2020.x只用去掉了bootstrap，需要重新加上 -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-bootstrap</artifactId>
            <version>3.0.3</version>
        </dependency>
```



## 配置中心

bootstrap.yml ：会在application.yml读取之前先读，其中的内容是不会被覆盖





### 文件名的命名规则

在nacos配置中心设置配置文件时，文件的dataId由三个部分组成，prefix，profile（dev，test，prod），file-extension（yaml或者properties，根据选择的文件类型来决定）

​	prefix-profile.file-extension

prefix: 默认为spring.application.name的值(例：项目：nacos-config)，也可以通过配置项spring.cloud.nacos.config.prefix

profile: spring.profiles.active对应的环境，如果没有设置多环境，则文件名  prefix.file-extension

file-extension: 目前只支持properties和yaml

namespace：项目隔离的作用

# sentinel

Sentinel是alibaba提供的用于实时监控、流量控制、异常熔断等管理工具，它可以于nacos进行组合使用，可以对项目进行图形化的配置和管理。

运行启动sentinel，可以通过--server.port指定端口号

```shell
java -jar sentinel-dashboard-1.8.2.jar --server.port=8081
```

## 依赖



## 流量控制

<img src="/流控规则.png" alt="流控规则" style="zoom:80%;" />

![流控规则.png](https://raw.githubusercontent.com/ydh1cnn6/pic/master/流控规则.png)

资源名：唯一名称，默认为请求路径

针对来源：sentinel可以针对调用者进行限流，不填写则默认为default，对所有来源的总和进行限流，如果设置的话，则设置调用者的服务名。

QPS: 每秒钟请求的数量，当每秒钟的请求数量达到阈值的时候，进行限流处理。

并发线程数：调用资源的并发线程量达到阈值，进行限流

单机阈值/集群阈值/均摊阈值：单机的情况下设置单机阈值，集群的情况可以选择集群阈值或者均摊阈值

流控模式：

​	直接：达到阈值的时候，进行直接限流（快速失败，warm up，链路）

​	关联：当关联的资源达到阈值，就限流我自己。

​	链路：当达到阈值的时候，限制某个入口对应链路上的处理（限流）

流控效果：

​	直接失败：服务降级，提示服务限流的消息

​	warm up： 有一个冷加载因子（默认是3），经过预热时常后，达到QPS

```java
	@GetMapping("test") // /test
    //@SentinelResource(value = "test",fallback = "fallbackMethod")
    @SentinelResource(value = "test",fallback = "fallbackMethod"
            ,fallbackClass = InfoFallBackComponent.class)
    public String test(){
        System.out.println("test: "  + LocalDateTime.now());
        return "game over";
    }

    //public String fallbackMethod(Throwable e){
    //    return "方法被限流";
    //}
```



## 熔断降级

Sentinel熔断降级主要是适用某个资源请求处理不稳定的情况下，对此资源进行调用限制。

不稳定的因素：调用时间比较常，异常出现的频率高

<img src="/熔断规则.png" alt="熔断规则" style="zoom:80%;" />

统计1秒种（1000ms）时间内，如果请求的次数达到2次以上（最小请求数），慢调用（请求的时间超过100猫喵）的比例，达到0.5的情况，就会熔断20秒。



## 热点key设置

调用后端接口的参数，根据方法上来，0为第一个参数，1为第二个参数。

资源名：可以是请求的url，也可以是@SentinelResource的value值。

blockHandler对应的方法，除了参数以及返回值之外，还需要增加一个BlockException参数

sentinel和openfeign进行整合，如何进行服务降级处理。

```java
@GetMapping("/testHotkey")
    @SentinelResource(value = "/testHotkey",blockHandler = "blockHandler")
    public String testHotKey(String p1,String p2) {
        return "success";
    }
    public String blockHandler(String p1, String p2, BlockException ex) {
        return "blockHandler";
    }
```



