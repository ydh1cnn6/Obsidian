---
typora-root-url: images
---

# Spring基本概念

## 什么是Spring

Spring框架是一个[开放源代码](https://baike.baidu.com/item/开放源代码/114160?fromModule=lemma_inlink)的[J2EE](https://baike.baidu.com/item/J2EE/110838?fromModule=lemma_inlink)应用程序框架，由[Rod Johnson](https://baike.baidu.com/item/Rod Johnson/1423612?fromModule=lemma_inlink)发起，是针对bean的生命周期进行管理的轻量级容器（lightweight container）。 Spring解决了开发者在J2EE开发中遇到的许多常见的问题，提供了功能强大IOC、[AOP](https://baike.baidu.com/item/AOP/1332219?fromModule=lemma_inlink)及Web MVC等功能。Spring可以单独应用于构筑应用程序，也可以和Struts、Webwork、Tapestry等众多Web框架组合使用，并且可以与 Swing等[桌面应用程序](https://baike.baidu.com/item/桌面应用程序/2331979?fromModule=lemma_inlink)AP组合。因此， Spring不仅仅能应用于J2EE应用程序之中，也可以应用于桌面应用程序以及小应用程序之中。Spring框架主要由七部分组成，分别是 Spring Core、 Spring AOP、 Spring ORM、 Spring DAO、Spring Context、 Spring Web和 Spring Web MVC。



## 为什么要使用Spring

1：提供了IOC容器，降低组件之间的耦合度

2：提供了AOP技术，可以将一些通用的功能，比如说日志，权限，系统运行的监控，事务等抽象出来，使用AOP来实现，提升开发的效率，降低运维的工作量

3：支持声明式的事务，既可以使用xml方式来配置，也可以使用注解，事务的管理非常方便

4：测试比较容易，并且提供了很多其他的辅助功能，jdbcTemplate，消息服务等

5：兼容性较好，对于主流的框架都提供了支持。hibernate，mybatis，struts，shiro，redis，Quartz



## spring的框架体系

<img src="/01.spring架构体系.png" alt="01.spring架构体系" style="zoom:80%;" />

# 入门案例

## 增加依赖

```xml
<dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>5.3.18</version>
        </dependency>
```



## 创建HelloWorld类

```java
public class HelloWorld {
    public void sayHello(){
        System.out.println("hello spring");
    }
}
```



## 配置容器

```xml
<bean id="helloWorld" class="net.wanho.HelloWorld"/>
```



## 创建容器获取bean对象

```java
public class Sample01 {
    public static void main(String[] args) {
        //传统方式
        //HelloWorld helloWorld = new HelloWorld();
        //        //helloWorld.sayHello();
        ApplicationContext ctx = new ClassPathXmlApplicationContext("bean.xml");
        HelloWorld helloWorld = (HelloWorld)ctx.getBean("helloWorld");
        helloWorld.sayHello();
    }
}
```



# 控制反转和依赖注入

## 控制反转（IOC）

IOC(Inversion of Control) ：传统方式下，对象的创建的控制权以及管理都是程序员通过代码去实现的。使用了Spring之后，对象的创建以及管理权都由程序员转移给Spring容器去进行管理。Spring容器会根据配置文件去创建bean实例以及管理各个bean之间的依赖关系。对象与对象之间是松耦合。

## 配置bean的方式

基于xml文件方式

基于注解的方式：在xml文件当中指定扫描包的位置，通过注解告诉spring容器哪些需要创建

基于java代码进行配置  ，主要是使用@Configuration注解进行配置

## 容器中如何获取bean

通过bean的名称获取

通过bean的class类型获取，如果同类型的bean存在多个的话，会出现异常。

通过名称和类型同时指定方式

## bean的实例化方式

### 构造器（构造方法)

```
<bean id="helloWorld" class="net.wanho.HelloWorld"/>
```

### 工厂方法

水果：桃子，梨子，苹果，葡萄

加工==》罐头==》加工工厂

静态工厂方法和实例工厂方法



### FactoryBean接口

FactoryBean接口的实现类创建的对象，并不是实现类的类型，而是getObjectType指定的类型，其对象的创建，在getObject方法当中进行处理



## 依赖注入（DI）

依赖注入（Dependency Injection):实现IOC的一种手段，对于对象的属性进行自动配置。

UserService类的脆响，有UserDao类型的dao对象，如果需要调用dao对象的方法，先要给dao进行赋值处理。传统方式下，需要在代码中new一个UserDao对象。spring当中，对象是交给容器去管理，容器当中是有userService对象和UserDao对象，属性的设置也由spring通过注入的方式进行配置。这种过程称为依赖注入。

### 使用setter方法

Pet类需要定义setter方法

```xml
<!--    使用setter方法注入属性-->
    <bean id="dog" class="net.wanho.base03.Pet">
        <property name="type" value="dog"/>
        <property name="color" value="white"/>
    </bean>
```



### 使用构造方法

需要和构造方法一致

```xml
<!--    使用构造方法进行注入-->
    <bean id="cat" class="net.wanho.base03.Pet">
        <constructor-arg name="type" value="cat"/>
        <constructor-arg name="color" value="white"/>
    </bean>
```



### 属性注入

留到注解时说明

### 复杂bean的注入

使用ref属性不能使用value

## bean的作用域

singleton：单例，每次通过getBean获取的时候，都是同一个对象。ApplicationContext容器在启动的时候默认会创建单例的对象（默认作用）

prototype：原型，每次通过getBean获取的时候都会创建新的对象，ApplicationContext容器启动时不会创建此对象，后期也不管理其生命周期。可以在xml文件当中使用scope属性或者@Scope注解进行修改

request：在request作用域范围内（web）

session：在session作用域范围内（web）

application ：在application 作用域范围内（web）

websocket：在websocket作用域范围内（web）

global session（老版本有的，新版本是没有作用域）

## bean的生命周期

### 基本流程

![02.bean生命周期](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-05-2002.bean生命周期.png)

### BeanPostProcessor

#### 实例化扩展



#### 初始化扩展

```java
public class PersonBeanPostProcessor implements BeanPostProcessor {

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        if("person".equals(beanName)) {
            System.out.println("person对象即将被修改");
            ((Person)bean).setName("蒋俊");
        }
        return bean;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        System.out.println("初始化后方法");
        return null;
    }
}
```

#### 销毁前扩展



## 自动装配

spring容器在属性注入的时候，可以启用自动装配的方式，autowire属性。只针对复杂的引用类型（bean），对于简单数据类型不能自动装配

no ：默认值，不进行自动装配

default：采用默认的自动装配方式，启用配置文件全局的配置，采用beans根节点上default-autowire属性的值

byType：根据类型进行匹配，同一个类型有多个对象，会抛出异常

byName：根据名称进行匹配

constuctor：根据构造方法推断进行匹配

## 基于注解方式的配置

### 定义组件的组件

定义组件的常用注解：

@Controller：用在表现层的控制器主键上，放在类上

@Service：用在BL（Business Logic）层的组件，放在类上

@Repository：用在DAO(Data Access Object)层的组件，放在类上

@Component：上述之外的一些通用，公用的组件，放在类上

@PostContruct：用在组件的初始化方法上

@PreDestroy：用在定义销毁前方法

@Scope：用来指定bean的作用域

#### 案例

定义容器的配置文件，需要定义在哪些范围内使用注解 basePackage

启用注解

定义bean（使用注解）

编写测试类

### 属性的注入

#### 使用@Autowired注解

是由spring提供的注解，可以放在属性，构造方法或者Setter方法上。默认使用类型进行装配，如果同一类型存在多个对象的话，则使用名称再次匹配，如果匹配不上，则抛出异常。

如果想要匹配指定名称的bean，则可以联合@Qulifier注解一起使用

```java
@Controller
public class UserController {

    @Autowired
            @Qualifier("userServiceImpl1")
    UserService userService;

    //@Autowired  //使用构造器注入
    //public UserController(UserService userService) {
    //    this.userService = userService;
    //}

    public UserController() {
        System.out.println("创建controller对象");
    }

    public void findUser(){
        userService.findUser();
    }

    //@Autowired  //使用Setter方法注入
    //public void setUserService(UserService userService) {
    //    this.userService = userService;
    //}
}

```



#### @Resource注解

@Resource注解，是由java提供的扩展注解，注解提供了name和type属性，可以按照名称或者指定类型进行匹配。如果都不指定的情况下，默认使用名称，如果名称匹配不上，则再次使用类型去匹配。

```java
@Service  //默认名字：userServiceImpl
public class UserServiceImpl implements UserService {


    @Resource
    UserDao userDao;

    public UserServiceImpl() {
        System.out.println("创建Service对象");
    }

    @Override
    public void findUser() {
        userDao.selectUser();
    }
}
```



#### 简单数据类型注入

@Value注解

```
    @Value("userDao")
    String daoName;
```



## 基于java方式的配置

### @Configuration注解

基于java配置，是完全不需要xml文件，所有的bean配置都是基于注解。@Configuration注解，用于定义容器的入口，作为读取数据的base。

### @Bean注解

1：@Bean放在方法上，用于告诉方法，产生一个bean对象，交给spring容器去管理

2：相对比较灵活的获取bean，根据参数设置，动态配置对象

3：@Bean标记的方法，Spring会调用一次，将配置信息放入到容器当中

4：@Bean的name问题，不指定的情况下默认使用方法名，可以使用name或者value属性进行指定。

5：@Bean方法创建的bean，默认的作用域是单例，可以使用@Scope进行指定成原型

6：@Bean同样可以扩展初始化和销毁前方法，可以使用initMethod和destroyMethod进行指定。

### @ComponentScan注解

和xml文件<context:component-scan>作用相同。用来扫描组件。

对于已经使用了@Controller，@Service，@Repository，@Component的类都可以直接扫描并创建对象。

### @Import注解

@Import用在类上，用于快速导入类以及接口中指定类。主要用于地方组件的导入。

使用方式有三种

#### 直接导入指定的class

```java
public class UserBean01 {
    public UserBean01() {
        System.out.println("UserBean01");
    }
}


@Configuration
@Import({UserBean01.class})
public class AppConfig {
}
```



#### 导入ImportSelector接口的实现

导入的对象并不是ImportSelector的对象

```java
public class UserBean02 {
    public UserBean02() {
        System.out.println("UserBean02");
    }
}

public class MyImportSelector implements ImportSelector {
    @Override
    public String[] selectImports(AnnotationMetadata importingClassMetadata) {
        return new String[]{"net.wanho.base07.UserBean02"};
    }
}

@Configuration
@Import({UserBean01.class,MyImportSelector.class})
public class AppConfig {
}
```



#### 导入ImportBeanDefinitionRegistrar接口的实现类

```java
public class UserBean03 {
    public UserBean03() {
        System.out.println("UserBean03");
    }
}

public class MyImportBeanDefinitionReg implements ImportBeanDefinitionRegistrar {
    @Override
    public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata
            , BeanDefinitionRegistry registry
            , BeanNameGenerator importBeanNameGenerator) {

        //<bean id="userBean03" class="net.wanho.base07.userBean03"/>
        BeanDefinition beanDefinition = new RootBeanDefinition(UserBean03.class);
        beanDefinition.setScope("singleton");
        registry.registerBeanDefinition("userBean03",beanDefinition);

    }
}

@Configuration
@Import({UserBean01.class,MyImportSelector.class,MyImportBeanDefinitionReg.class})
public class AppConfig {
}
```



# AOP

## 什么是AOP

AOP为Aspect Oriented Programming的缩写，意为：面向切面编程，通过预编译方式和运行期间动态代理实现程序功能的统一维护的一种技术。AOP是[OOP](https://baike.baidu.com/item/OOP/1152915?fromModule=lemma_inlink)的延续，是[软件开发](https://baike.baidu.com/item/软件开发/3448966?fromModule=lemma_inlink)中的一个热点，也是[Spring](https://baike.baidu.com/item/Spring?fromModule=lemma_inlink)框架中的一个重要内容，是[函数式编程](https://baike.baidu.com/item/函数式编程/4035031?fromModule=lemma_inlink)的一种衍生范型。利用AOP可以对[业务逻辑](https://baike.baidu.com/item/业务逻辑/3159866?fromModule=lemma_inlink)的各个部分进行隔离，从而使得业务逻辑各部分之间的[耦合度](https://baike.baidu.com/item/耦合度/2603938?fromModule=lemma_inlink)降低，提高程序的[可重用性](https://baike.baidu.com/item/可重用性/53650612?fromModule=lemma_inlink)，同时提高了开发的效率。

Spring当中，将影响多个模块的通用功能抽取出来，定义成一个新的可重用的模块，称之为切面。目的是减少重复代码，降低耦合度。公用的功能：权限认证，日志，事务处理。

## 技术原理

设计模式：代理

动态代理：并不是直接操作目标对象，而是通过代理去调用。分为JDK动态代理和CGLIB代理。

JDK动态代理和CGLIB代理的区别：

​	JDK动态代理用于面向接口编程

​	CGLIB代理：可以对普通的类进行增强

首先默认选择jdk动态代理，可以通过配置进行修改，配置的情况下，目标对象实现接口的话，还是使用JDK,否则使用CGLIB

## 代理实现

### JDK动态代理

在程序的执行当中，利用反射机制，创建代理类对象，并动态指定代理的目标类。

重要的类和接口：Proxy，Invocationhandler



### CGLIB代理

对于没有实现接口的类，可以使用CGLIB进行代理。

CGLIB的原理是继承，通过继承目标类，创建代理子类，在子类当中重写父类的相关方法，实现功能的修改和增强。要求目标类和方法不能是final。Spring当中已经集成了相关的包，不需要另外增加。

实现MethodInterceptor接口





## AOP的术语

切面 aspect：横切关注点。是通知和切点的组合。包含两个工作：

​	1：如何实现通用代码（通知）

​	2：如何将通用的代码和具体要代理执行的方法连接起来，需要定义切点。

通知advice：通用的功能细节，切面必须完成的工作。切面当中的每一个方法都称之为通知

连接点：程序执行期间具体某个点。可以是方法执行前，或者方法执行后，出现异常时。

切点：匹配连接点的谓词（断言）。匹配连接点的抽象的条件。

目标：被代理的对象。

## 入门案例

### 依赖

```xml
<dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-aspects</artifactId>
            <version>5.3.18</version>
        </dependency>
```



### 配置aop，启用注解

```xml
<context:component-scan base-package="net.wanho.base02"/>
    <context:annotation-config/>
<!--    启用aop注解-->
    <aop:aspectj-autoproxy />
```



### 定义一个类

```java
@Component
public class Computer {

    public int add(int a,int b) {
        System.out.println("add方法被调用");
        return a + b;
    }

}
```



### 定义切面

```java
//切面类也要交给spring容器管理
@Component
//标记当前的类是一个切面类
@Aspect
public class LogAspect {

    @Before("execution(public int net.wanho.base02.Computer.add(int,int))")
    public void beforeLog(){
        System.out.println("方法即将被调用");
    }
}
```



### 测试

```java
public class Sample01 {
    public static void main(String[] args) {
        ApplicationContext ctx = new ClassPathXmlApplicationContext("bean.xml");
        Computer computer = ctx.getBean(Computer.class);
        int a =computer.add(10,5);
        System.out.println(a);
    }
}
```



## 切点表达式

### 切点指示器

指示器通常分为：匹配方法（execution，@annotation），匹配类型（target，this，within，@Target,@Within),

​	匹配参数（args，@Args)

execution(s): 和字符串相匹配的方法的执行（满足字符串条件）

@annotation（x）: 目标方法上需要指定的注解x

target（x）：和x相兼容的类的执行，如果X为接口，则实现类的方法可以执行，如果是一个普通的类，则x以及其子类的方法可以执行此通知

this(x): x是接口类型，x的实现类的执行

within(x): 严格和x匹配

### 通配符

当使用execution时，表示式是可以使用通配符

*：至少匹配一个字符，使用类或者方法名上面

..: 可以使用在路径上，和*一起使用，表示某个包以及子包下的所有类，还可以使用在参数上，表示参数不定

+：通常用在类型上面，表示当前类型的实现类或者子类



## 获取连接点信息

AOP的通知方法，都可以增加一个JoinPoint类型的参数

```

```



## 通知的类型

前置通知：在方法的执行之前进行的处理

后置通知：在方法结束之后进行的处理，无论正常结束还是异常结束，处理都会进行

正常结束通知：只有在方法正常结束后才会进行的处理

异常结束通知：当方法出现异常之后，会进行的处理

环绕通知：在方法的执行前后，正常或者异常情况下都可以执行的通知

### 前置通知

使用@Before注解

```java
@Before("execution(* net.wanho.base05..*.*(..))")
    public void before(){
        System.out.println("前置通知...a");
    }
```



### 后置通知

@After注解

```java
 @After("execution(* net.wanho.base05..*.*(..))")
    public void after(){
        System.out.println("后置通知");
    }
```



### 正常结束通知

@AfterRetruning注解，可以获取方法的返回值

```java
@AfterReturning(value = "execution(* net.wanho.base05..*.*(..))",returning = "result")
    public void AfterReturning(Object result){
        System.out.println("正常通知, 返回值：" + result );
    }
```



### 异常结束通知

@AfterThrowing ，可以获取异常的相关信息

```java
@AfterThrowing(value = "execution(* net.wanho.base05..*.*(..))",throwing = "ex")
    public void afterThrowing(Throwable ex){
        System.out.println("出现异常。。。。" + ex.getMessage());
    }
```



### 环绕通知

使用@Around注解，需要使用连接点的processed方法手工调用方法。如果使用了环绕通知，并且捕获了异常进行处理，有可能导致事务不起作用。

环绕通知必须要有返回值

```java
 @Around("execution(* net.wanho.base05..*.*(..))")
    public  Object around(ProceedingJoinPoint joinPoint){

        Object result =null;
        System.out.println("前置通知...b");
        try {
            result = joinPoint.proceed();

            System.out.println("方法正常结束----b" + result);

        }  catch (Throwable throwable) {
            System.out.println("方法出现异常---b" + throwable.getMessage());
        } finally {
            System.out.println("方法处理结束---b");
        }
        return result;
    }
```



## 切点方法

将切点表达式抽象成方法，方便重复使用

### 定义切点方法

```java
@Component
@Aspect
public class AOPPointCut {
    @Pointcut("execution(* net.wanho.base05..*.*(..))")
    public void pointcutMethod(){}
}
```

### 使用切点方法

```java
@Component
@Aspect
public class ComputerAop {

    //@Before("execution(* net.wanho.base05..*.*(..))")
    @Before("AOPPointCut.pointcutMethod()")
    public void before(){
        System.out.println("前置通知...a");
    } 

}
```



## 切面的优先级别

切面的优先级别默认为类名的顺序（配置的顺序），可以使用@Order注解进行处理，数据越小，级别越高。没有写order注解的，优先级别最低。

<img src="/03.切面优先级别.png" alt="03.切面优先级别" style="zoom:80%;" />

### 认证切面

```java
@Component
@Aspect
@Order(1)
public class ZuthcAspect {

    @Before("execution(* net.wanho.base06..*.*(..))")
    public void  authenticate(){
        System.out.println("用户认证通过");
    }


    @After("execution(* net.wanho.base06..*.*(..))")
    public void  After(){
        System.out.println("用户退出");
    }
}

```

### 日志切面

```java
@Component
@Aspect
@Order(2)
public class LogAspect {

    @Before("execution(* net.wanho.base06..*.*(..))")
    public void before(){
        System.out.println("即将取钱。。。。before");
    }


    @After("execution(* net.wanho.base06..*.*(..))")
    public void After(){
        System.out.println("即将取钱结束.....after");
    }
}
```



## 使用AOP的注意事项

1：连接点方法不能是private（要求是public），否则不能被增强

2：方法被内部调用时，不会被增强

3：业务类不能是final

<img src="/03.内部调用不会被增强.png" alt="03.内部调用不会被增强" style="zoom:80%;" />

### 修饰符问题

```java
@Component
public class Person {

    //私有方法不会被增强
     private void sayHello(){
        System.out.println("hello java178");
    }

    public static void main(String[] args) {
        ApplicationContext ctx= new AnnotationConfigApplicationContext(AppConfig.class);
        Person bean = ctx.getBean(Person.class);
        bean.sayHello();

    }
}
```

### 内部调用问题

```java
@Component
public class Person {

     public void sayHello(){
        System.out.println("hello java178");
        //内部调用不会被增强
        jump();
    }

    public void jump(){
        System.out.println("jump....");
    }


    public static void main(String[] args) {
        ApplicationContext ctx= new AnnotationConfigApplicationContext(AppConfig.class);
        Person bean = ctx.getBean(Person.class);
        bean.sayHello();

    }
}
```



# 整合数据库

## 依赖

spring-context，aspects，jdbc，tx，mysql

```java
<dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>6.0.6</version>
        </dependency>

        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-jdbc</artifactId>
            <version>5.3.18</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-tx</artifactId>
            <version>5.3.18</version>
        </dependency>
```



## 增加properties文件

```properties
driver=com.mysql.cj.jdbc.Driver
url=jdbc:mysql://localhost:3306/school?serverTimezone=UTC&useSSL=false
user=root
password=root
```



## 编写配置文件

### 使用property-placeholder进行匹配

```xml
 <context:component-scan base-package="net.wanho"/>
    <context:annotation-config/>
    <aop:aspectj-autoproxy proxy-target-class="true"/>

<!--    使用property-placeholder注入properties文件-->
    <context:property-placeholder location="classpath:jdbc.properties"/>
    <bean id="dataSource" class="org.springframework.jdbc.datasource.DriverManagerDataSource">
        <property name="driverClassName" value="${driver}"/>
        <property name="url" value="${url}"/>
        <property name="username" value="${user}"/>
        <property name="password" value="${password}"/>
    </bean>

<!--    使用模板模式-->
    <bean id="jdbcTemplate" class="org.springframework.jdbc.core.JdbcTemplate">
        <property name="dataSource" ref="dataSource"/>
    </bean>
```

### 使用util命名空间配置

## 编写dao

```java
@Repository
public class StudentDao {

    @Autowired
    JdbcTemplate jdbcTemplate;

    public void queryStudent(){
        String sql = "select * from student";
        List<Student> list = jdbcTemplate.query(sql,new BeanPropertyRowMapper<>(Student.class));
        list.forEach(e-> System.out.println(e));
    }
}

```



## 测试代码

```java
public class Sample {
    public static void main(String[] args) {
        ApplicationContext ctx= new ClassPathXmlApplicationContext("bean.xml");
        StudentDao dao = ctx.getBean(StudentDao.class);
        dao.queryStudent();
    }
}
```





# 整合mybatis

## 依赖

spring-context，aspects，jdbc，tx，mysql，mybatis，mybatis-spring

```xml
<dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>6.0.6</version>
        </dependency>

        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-jdbc</artifactId>
            <version>5.3.18</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-tx</artifactId>
            <version>5.3.18</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.16</version>
            <scope>compile</scope>
        </dependency>
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis</artifactId>
            <version>3.5.3</version>
        </dependency>
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis-spring</artifactId>
            <version>2.0.4</version>
        </dependency>
```



## 配置mybatis

### 使用mybatis和spring分开配置

#### mybatis配置文件

```xml
<configuration>
    <typeAliases>
        <package name="net.wanho.entity"/>
    </typeAliases>
    <mappers>
        <package name="net.wanho.dao"/>
    </mappers>
</configuration>
```



#### spring配置文件

```xml
<context:component-scan base-package="net.wanho"/>
    <context:annotation-config/>
    <aop:aspectj-autoproxy proxy-target-class="true"/>

    <util:properties id="db" location="classpath:jdbc.properties"/>
    <bean id="dataSource" class="org.springframework.jdbc.datasource.DriverManagerDataSource">
        <property name="driverClassName" value="#{db.driver}"/>
        <property name="url" value="#{db.url}"/>
        <property name="username" value="#{db.user}"/>
        <property name="password" value="#{db.password}"/>
    </bean>

<!--    配置sqlSessionFactory-->
    <bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
        <property name="dataSource" ref="dataSource"/>
        <property name="configLocation" value="classpath:mybatis-config.xml"/>
    </bean>

<!--    告诉spring，mybatis的dao接口文件在什么地方-->
    <bean id="mapperScanner" class="org.mybatis.spring.mapper.MapperScannerConfigurer">
        <property name="sqlSessionFactoryBeanName" value="sqlSessionFactory"/>
<!--        指定dao接口文件所在位置-->
        <property name="basePackage" value="net.wanho.dao"/>
    </bean>
```



### 全部使用spring方式配置

## 编写dao

```
public interface StudentMapper {
    List<Student> selectAll();
}

```

## 编写Service

```java
@Service
public class StudentServiceImpl {

    @Autowired
    StudentMapper studentMapper;

    public List<Student> findAll(){
        return studentMapper.selectAll();
    }
}
```



## 测试类

```java
public class SampleMybaits {
    public static void main(String[] args) {
        //ApplicationContext ctx= new ClassPathXmlApplicationContext("spring-mybatis.xml");
        ApplicationContext ctx= new ClassPathXmlApplicationContext("spring-all.xml");
        StudentServiceImpl studentService = ctx.getBean(StudentServiceImpl.class);
        List<Student> all = studentService.findAll();
        all.forEach(e-> System.out.println(e));
    }
}

```

## pagehelper整合配置

```xml
<bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
        <property name="dataSource" ref="dataSource"/>
        <property name="configuration">
            <bean class="org.apache.ibatis.session.Configuration">
                <property name="logImpl" value="org.apache.ibatis.logging.stdout.StdOutImpl"/>
                <property name="mapUnderscoreToCamelCase" value="true"/>
            </bean>
        </property>
        <property name="plugins">
            <bean class="com.github.pagehelper.PageInterceptor">
                <property name="properties">
                    <value>
                        helperdialect=mysql
                        reasonable=true
                    </value>
                </property>
            </bean>
        </property>
<!--        配置entity中pojo的别名-->
        <property name="typeAliasesPackage" value="net.wanho.entity"/>
<!--        指定mapper文件所在的位置，此配置方式，mapper.xml文件和接口文件可以不在同一个目录下-->
        <property name="mapperLocations" value="classpath:net/wanho/dao/*.xml"/>
    </bean>
```

# 事务处理

## 事务基本概念

事务就是一系列的工作，他们被当作整体的工作单元，要么全部成功，要么全部不起作用（回滚）。

事务的特点：原子性，一致性，隔离性，持久性

隔离级别：读未提交，读已提交，可重复读，串行化

## spring当中的事务管理

主要接口（org.springframework.transaction下）：

PlatformTransactionManager：用来提交和回滚事务

TransactionStatus：事务的状态，是否需要刷新，是否存在存储点

TransactionDefinition：定义了事务的相关属性（规则），

spring当中的事务本质上是一个拦截器（利用AOP），通过拦截器来调用事务管理器，进行事务管理

实现事务的方式：

​	编程式事务：利用PlatformTransactionManager，TransactionStatus，TransactionDefinition对象来进行编程

​	声明式事务：xml配置或者使用注解

## 配置事务管理器

```xml
<bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="dataSource"/>
    </bean>
```



## 编程式事务

```java
public void save(){


        User user = new User();
        user.setName("java180");
        user.setPassword("111");
        user.setPhone("12345678911");

        //定义事务的TransactionDefinition对象
        TransactionDefinition definition = new DefaultTransactionDefinition();
        TransactionStatus status = transactionManager.getTransaction(definition);
        try {
            userMapper.insertUser(user);

            //模拟程序出异常
            int x = 10/0;

            //
            userRoleMapper.insertUserRole(user.getId(),1);
            transactionManager.commit(status);
        } catch ( Exception ex) {
            transactionManager.rollback(status);
        }


    }
```



## 声明式事务

### xml声明

```xml
<tx:advice id="txAdvice" transaction-manager="transactionManager">
        <tx:attributes>
            <tx:method name="save0*" />
        </tx:attributes>
</tx:advice>
<aop:config>
        <aop:pointcut id="txPointCut" expression="execution(* net.wanho.service.*.*(..))"/>
        <aop:advisor advice-ref="txAdvice" pointcut-ref="txPointCut"/>
</aop:config>
```



### 注解声明

需要开启事务注解，使用@Transactional注解，

此注解可以放在方法上，也可以放在类上，放在类上，表示此类的所有方法都需要事务管理。

```
<!--    开启事务注解-->
<!--    如果事务管理器的bean的名字为transactionManager的话，则不需要配置transaction-manager-->
<!--    否则必须指定transaction-manager属性-->
    <tx:annotation-driven transaction-manager="transactionManager"/>
```



## Spring事务的说明

Spring事务默认只对运行时异常进行回滚，编译时异常不会回滚。如果想要自定义异常，并且事务有效回滚，必须继承RuntimeException或者其子类。如果相对编译时异常进行回滚，可以使用Rollbackfor属性进行设置。

try...catch会让事务失效。如果异常被catch，事务不会回滚。

解决方案：

​	1：在catch代码块当中抛出RuntimeException或者其子类的对象

​	2：使用事务TransactionAspectSupport.currentTransactionStatus().setRollback()手工回滚。



## 事务的属性

```
propagation：事务的传播性
isolation：事务的隔离级别，default：数据源的隔离级别
rollback-for：默认是对运行时异常进行回滚，编译时异常也需要回滚的话，可以利用此属性进行处理
no-rollback-for：对某些异常指定不回滚
readonly：只读事务
timeout：超时时间，第一个sql到一个sql执行过后的时间。
```

### rollbackfor

默认是对运行时异常进行回滚，编译时异常正常情况下是不回滚的。

```
@Transactional(rollbackFor = {BusinessExcepiton.class})
    public void save02(String flag) throws BusinessExcepiton {

        User user = new User();
        user.setName("java180-1");
        user.setPassword("111");
        user.setPhone("12345678911");

        userMapper.insertUser(user);

        if("110".equals(flag)) {
            throw  new BusinessExcepiton("自定义业务异常");
        }

        userRoleMapper.insertUserRole(user.getId(),1);

    }
```



### 事务的传播性

当一个事务被另外一个事务调用的时候，需要指定事务的传播性。例如UserService调用UserRoleService和UserMenuService的时候，UserService当中是有事务的，UserMenuService和UserRoleService的方法也是有事务的。

UserService和UserMenuService以及UserRoleService的方法是否使用同一个事务对象，是由传播性来决定的。

传播性：

```
REQUIRED(0)：默认的传播性，如果外部有事务在运行，则内部的方法不开启新事务，在原有的事务内部执行。如果外部没有事务，则自己开启事务对象。
REQUIRES_NEW(3)：当前的方法必须开启新事务，如果外部有事务在运行，则将外部事务挂起，运行自己的事务，结束后，再次使用外部事务。
SUPPORTS(1)：支持事务。如果外部有事务，则在事务内部运行，如果外部没有事务，不开启新事务。
NOT_SUPPORTED(4)：不支持事务，如果外部有事务，则将外部事务挂起。
NEVER(5)：当前的方法不应该在事务内运行，如果外部有事务，则抛出异常
MANDATORY(2)：当前的方法必须在事务内运行，如果外部没有事务，则抛出异常
NESTED(6): 类似于REQUIRED，如果外部有事务在运行，则内部的方法不开启新事务，在原有的事务内部执行。如果外部没有事务，则自己开启事务对象。需要数据源的savepoint的支持。
```

注意事项：仅仅REQUIRED,REQUIRES_NEW,NESTED传播性是可以开启事务对象的，其他都不会开启事务对象

### 事务失效的几种方式

数据库引擎不支持

没有被Spring管理

方法不是public

间接调用事务

没有配置事务管理器

传播行为配置的为not_supported

异常被处理

回滚异常类型不正确























