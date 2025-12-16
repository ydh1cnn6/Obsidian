---
typora-root-url: ./
title: 8、shiro
---

# 权限管理

## 什么权限系统

基本上所有的系统当中都会涉及到权限的管理（数据的安全问题），需要对访问系统的主体（用户，系统，机器）进行认证和授权。每个相关主体只能访问被授权的资源。

权限管理系统：

​	主体认证--确定是系统的合法用户

​	授权： 使得用户能够匹配和访问到相应的资源

## 认证方式

用户名/密码

指纹刷卡机（刷脸）

动态验证码

硬件刷卡系统

## 授权方式

基于角色

基于资源

基于权限对象

## 表设计

用户表

角色表

角色用户表

权限表

角色权限表

# shiro

## shiro基础知识

shiro是apache旗下的开源项目，将系统当中安全认证流程抽取出来，开发成一个中间件，实现用户认证，授权，加密以及会话管理等，组成一个通用的安全框架。

Shiro可以用在web项目，也可以用在非web项目，可以单独运行，也可以整合spring，springboot等。

SSM + Shiro

Springboot + Spring security

![shiro](https://my-picture-aa.oss-cn-nanjing.aliyuncs.com/img/202308171308938.jpg)

Subject：主体，外部应用程序都是通过和Subject进行交互，类似于用户的概念，可能是通过浏览器发送请求的用户，也可能是一个运行的程序。是shiro的核心接口，定义了很多认证的方法，核心就是login

Security Manager：安全管理器，是shiro的核心部分，对Subject进行认证，授权以及会话管理。

Authenticator：认证器，主要是用于对用户主体身份进行认证的。ModularRealmAuthenticator基本上可以实现大部分的功能，也可以自定义认证器。

Authorizer：授权器，用户可以通过认证后，可以获取授权信息，访问相关资源时，shiro会确认是否有相应的权限。

SessionManager和SessionDao：用来管理用户会话的

Realm：领域，类似于数组源，用户如何认证以及如何授权的资源信息都Realm当中



## 入门程序

### 依赖

```xml
<dependency>
    <groupId>org.apache.shiro</groupId>
    <artifactId>shiro-core</artifactId>
    <version>1.8.0</version>
</dependency>
```

### 配置文件

```ini
[users]
zhangsan=123
xiaoming=111
```



### 验证代码

```java
public class Sample01 {
    public static void main(String[] args) {
        String file = "classpath:shiro.ini";
        //subject.login==>SecurityManager==>Authenticator=>realm
        IniRealm iniRealm = new IniRealm(file);
        SecurityManager defaultSecurityManager = new DefaultSecurityManager(iniRealm);
        SecurityUtils.setSecurityManager(defaultSecurityManager);

        Subject subject = SecurityUtils.getSubject();

        UsernamePasswordToken token = new UsernamePasswordToken("zhangsan111","123");
        try{
            subject.login(token);
        } catch (AuthenticationException ex) {

        }

        System.out.println(subject.isAuthenticated());

    }
}
```



## 自定义realm

定义一个server模仿查询数据库，并在realm中进行调用

### 定义entity

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MockUser {
    String id;
    String username;
    String password;

}
```

### service定义

```java
public class MockService {
    public static Map<String,MockUser> map = new HashMap<>();

    static {
        map.put("1001",new MockUser("1001","admin1","111"));
        map.put("1002",new MockUser("1002","admin2","122"));
        map.put("1003",new MockUser("1003","admim3","333"));
        map.put("1004",new MockUser("1004","admin4","444"));
        map.put("1005",new MockUser("1005","admin5","666"));
        map.put("1006",new MockUser("1006","admin6","777"));
        map.put("1007",new MockUser("1007","admin7","999"));
    }

    public MockUser findUser(String id) {
        return map.get(id);
    }


}

```



### realm中认证处理

```java
public class MyRealm extends AuthorizingRealm {

    MockService mockService = new MockService();

    MockRole mockRole = new MockRole();

    /**
     * 处理授权（获取授权信息）
     * @param principals
     * @return
     */
    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals) {
        return null
    }

    /**
     * 获取用户相关信息(认证信息)
     * @param token
     * @return
     * @throws AuthenticationException
     */
    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) throws AuthenticationException {
        //通过token可以获取用户id，也可以获取用户输入的密码（未加密）
        String id = (String)token.getPrincipal();
        //根据用户id到数据库查询用户信息
        MockUser user = mockService.findUser(id);
        if (user==null) {
            //throw new UnknownAccountException();
            return  null;
        }
        //获取数据库当中密码
        String password = user.getPassword();
        //创建AuthenticationInfo对象
        return new SimpleAuthenticationInfo(user,password,"myRealm");
    }
}
```



### 使用realm

```java
public static void main(String[] args) {
        String file = "classpath:shiro.ini";
        //subject.login==>SecurityManager==>Authenticator=>realm
        MyRealm myRealm = new MyRealm();
        SecurityManager defaultSecurityManager = new DefaultSecurityManager(myRealm);
        SecurityUtils.setSecurityManager(defaultSecurityManager);

        Subject subject = SecurityUtils.getSubject();

        UsernamePasswordToken token = new UsernamePasswordToken("1002","122");
        try{
            subject.login(token);
        } catch (AuthenticationException ex) {
            ex.printStackTrace();
        }

        System.out.println(subject.isAuthenticated());

    }
```



## 在自定义realm中完成授权

定义mockRoleService模拟数据库获取角色信息

### 定义MockRoleService

```
public class MockRoleService {
    public static Map<String, List<String>> roles = new HashMap<>();
    static  {
        List<String> list = new ArrayList<>();
        list.add("admin");
        list.add("market");
        roles.put("1001",list);

        list = new ArrayList<>();
        list.add("hr");
        roles.put("1002",list);
    }

    public List<String> findRoles(String id) {
        return roles.get(id);
    }
}
```



### 获取授权信息

```java
@Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals) {
        MockUser user = (MockUser)principals.getPrimaryPrincipal();
        //到数据库获取角色或者权限信息
        List<String> roles = mockRole.findRoles(user.getId());

        SimpleAuthorizationInfo  info = new SimpleAuthorizationInfo();
        //获取用户的角色以及授权信息
        if ( roles !=null && roles.size()>0) {
            info.setRoles(roles.stream().collect(Collectors.toSet()));
        }

        //假账
        if ("1001".equals(user.getId())) {
            info.addStringPermission("user::add");
            info.addStringPermission("user::del");
        } else {
            info.addStringPermission("user::review");
        }

        return info;
    }
```



### 确定是否用权限

```java
 public static void main(String[] args) {
        String file = "classpath:shiro.ini";
        //subject.login==>SecurityManager==>Authenticator=>realm
        MyRealm myRealm = new MyRealm();
        SecurityManager defaultSecurityManager = new DefaultSecurityManager(myRealm);
        SecurityUtils.setSecurityManager(defaultSecurityManager);

        Subject subject = SecurityUtils.getSubject();

        UsernamePasswordToken token = new UsernamePasswordToken("1002","122");
        try{
            subject.login(token);
        } catch (AuthenticationException ex) {
            ex.printStackTrace();
        }

        System.out.println(subject.isAuthenticated());

        System.out.println("=====");

		//测试授权信息
        System.out.println(subject.hasRole("admin"));
        System.out.println(subject.isPermitted("user::review"));
        //subject.logout();
        //System.out.println(subject.isAuthenticated());

    }
```



## 测试MD5加密

```java
@Test
    public void test(){
        String origin = "111";
        String s1 = new Md5Hash(origin,null,1).toHex();
        System.out.println(s1);

        String s2 = new Md5Hash(origin,null,2).toHex();
        System.out.println(s2);
    }
```



# SpringMVC整合Shiro

## 创建一个springMVC项目

创建maven项目，并增加webapp相关信息，将pom中增加<packaging>war</packaging>

并增加springmvc相关依赖和配置

## 增加shiro依赖

```xml
<dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-webmvc</artifactId>
            <version>5.3.18</version>
        </dependency>
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>javax.servlet-api</artifactId>
            <version>3.1.0</version>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>org.apache.shiro</groupId>
            <artifactId>shiro-spring</artifactId>
            <version>1.8.0</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.16</version>
            <scope>compile</scope>
        </dependency>

    </dependencies>
```



## 自定义realm

```java
public class MyRealm extends AuthorizingRealm {

    MockService mockService = new MockService();

    MockRoleService mockRole = new MockRoleService();

    /**
     * 处理授权（获取授权信息）
     * @param principals
     * @return
     */
    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals) {
        MockUser user = (MockUser)principals.getPrimaryPrincipal();
        //到数据库获取角色或者权限信息
        List<String> roles = mockRole.findRoles(user.getId());

        SimpleAuthorizationInfo  info = new SimpleAuthorizationInfo();
        //获取用户的角色以及授权信息
        if ( roles !=null && roles.size()>0) {
            info.setRoles(roles.stream().collect(Collectors.toSet()));
        }

        //假账
        if ("1001".equals(user.getId())) {
            info.addStringPermission("user::add");
            info.addStringPermission("user::del");
        } else {
            info.addStringPermission("user::review");
        }

        return info;
    }

    /**
     * 获取用户相关信息(认证信息)
     * @param token
     * @return
     * @throws AuthenticationException
     */
    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) throws AuthenticationException {
        //通过token可以获取用户id，也可以获取用户输入的密码（未加密）
        String id = (String)token.getPrincipal();
        //根据用户id到数据库查询用户信息
        MockUser user = mockService.findUser(id);
        if (user==null) {
            //throw new UnknownAccountException();
            return  null;
        }
        //获取数据库当中密码
        String password = user.getPassword();
        //创建AuthenticationInfo对象
        return new SimpleAuthenticationInfo(user,password,"myRealm");
    }
}
```



## 修改web.xml

```xml
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_3_1.xsd"
         version="3.1" metadata-complete="true">
    <display-name>Archetype Created Web Application</display-name>
    
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

    <filter>
        <filter-name>shiroFilter</filter-name>
        <filter-class>org.springframework.web.filter.DelegatingFilterProxy</filter-class>
<!--        将shiro的过滤器的生命周期交给容器管理-->
        <init-param>
            <param-name>targetFilterLifecycle</param-name>
            <param-value>true</param-value>
        </init-param>
    </filter>
    <filter-mapping>
        <filter-name>shiroFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
</web-app>
```



## shiro配置

```xml
<bean id="myRealm" class="net.wanho.shiro.MyRealm"></bean>
    <!--    securityManager-->
    <bean id="securityManager" class="org.apache.shiro.web.mgt.DefaultWebSecurityManager">
        <property name="realm" ref="myRealm"/>
    </bean>

    <!--    shiroFilter-->
    <bean id="shiroFilter" class="org.apache.shiro.spring.web.ShiroFilterFactoryBean">
        <property name="securityManager" ref="securityManager"/>
        <!--        如果没有认证想要访问部分限制资源的话，强制跳回到指定的url-->
        <property name="loginUrl" value="/index.jsp"/>
        <!--        当用户没有对应的权限（premission和roles），会跳转到指定value的请求url-->
        <property name="unauthorizedUrl" value="/refuse.jsp"/>
        <property name="filterChainDefinitions">
            <value>
                /index.jsp=anon
                /refuse.jsp=anon
                /success.jsp=authc
                /admin.jsp=roles[admin]
                /hr.jsp=roles[hr]
            </value>
        </property>
    </bean>
```



## 定义各页面

index，refuse，success，admin以及hr等页面





## 加密配置

配置密码加密器，并设置到realm当中

```
<bean id="hashedCredentialsMatcher" class="org.apache.shiro.authc.credential.HashedCredentialsMatcher">
<!--       true:16进制转换，false：base编码-->
        <property name="storedCredentialsHexEncoded" value="true"/>
        <property name="hashAlgorithmName" value="md5"/>
        <property name="hashIterations" value="1"/>
    </bean>
<!--    自定义realm-->
    <bean id="myRealm" class="net.wanho.shiro.MyRealm">
            <property name="credentialsMatcher" ref="hashedCredentialsMatcher"/>
    </bean>
```

## 自定义过滤器

### 定义过滤器

```java
public class MyFilter implements Filter {

    String filterName;



    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        System.out.println("myFilter is working,name=" + this.filterName);
        filterChain.doFilter(servletRequest,servletResponse);
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void destroy() {

    }

    public String getFilterName() {
        return filterName;
    }

    public void setFilterName(String filterName) {
        this.filterName = filterName;
    }
}
```



### 配置过滤器

```xml
<bean id="myFilter" class="net.wanho.filters.MyFilter">
        <property name="filterName" value="test Filter"/>
    </bean>
```



### 使用过滤器

```xml
<bean id="shiroFilter" class="org.apache.shiro.spring.web.ShiroFilterFactoryBean">
        <property name="securityManager" ref="securityManager"/>
        <!--        如果没有认证想要访问部分限制资源的话，强制跳回到指定的url-->
        <property name="loginUrl" value="/index.jsp"/>
        <!--        当用户没有对应的权限（premission和roles），会跳转到指定value的请求url-->
        <property name="unauthorizedUrl" value="/refuse.jsp"/>
        <property name="filterChainDefinitions">
            <value>
                /index.jsp=anon
                /refuse.jsp=anon
                /success.jsp=authc
                /admin.jsp=roles[admin]
                /hr.jsp=roles[hr]
                /filter.jsp=authc,myFilter
                <!--                /**=authc-->
            </value>
        </property>
    </bean>
```



## shiro标签库

```
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="shiro" uri="http://shiro.apache.org/tags" %>
<html>
<head>
    <title>Title</title>
</head>
<body>

    <shiro:guest>
    欢迎访问，请<a href="index.jsp">登录</a>系统
    </shiro:guest>

    <shiro:authenticated>
        欢迎xxx登录系统
    </shiro:authenticated>


    <shiro:hasRole name="admin">
        <button>admin</button>
    </shiro:hasRole>

    <shiro:hasPermission name="user::add">
        <button>增加</button>
    </shiro:hasPermission>
    <shiro:hasPermission name="user::del">
        <button>删除</button>
    </shiro:hasPermission>
    
    

    <shiro:hasPermission name="user::review">
        <button>详情</button>
    </shiro:hasPermission>


</body>
</html>

```









