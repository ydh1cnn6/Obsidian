---
typora-root-url: images
---



# spring-security

## Spring Security是什么

Spring Security是一个能够为基于Spring的企业应用系统提供声明式的安全访问控制解决方案的安全框架。它提供了一组可以在Spring应用上下文中配置的Bean，充分利用了Spring IoC（控制反转Inversion of Control ），DI（依赖注入:Dependency Injection ）和AOP（面向切面编程）功能，为应用系统提供声明式的安全访问控制功能，减少了为企业系统安全控制编写大量重复代码的工作。

Spring Security对Web安全性的支持大量地依赖于Servlet过滤器。这些过滤器拦截进入请求，并且在应用程序处理该请求之前进行某些安全处理。 Spring Security提供有若干个过滤器，它们能够拦截Servlet请求，并将这些请求转给认证和访问决策管理器处理，从而增强安全性。根据自己的需要，可以使用适当的过滤器来保护自己的应用程序。

**项目模块**

- spring-security-core
  spring-security-remoting
  spring-security-web
  spring-security-config
  spring-security-ldap
  spring-security-oauth2-core
  spring-security-oauth2-client
  spring-security-oauth2-jose
  spring-security-acl
  spring-security-cas
  spring-security-openid
  spring-security-test

## 和shiro对比

Spring Security
	优点：与Spring无缝连接，全面的权限控制，专为web开发而设计的	
	缺点：需要依赖spring，旧版本不能脱离web使用，新版本对框架实现了分层抽取，分成核心模块和web模块

shiro
	优点：简单高效：shiro主张的理念是把复杂事情简单化，针对性能更高的互联网应用有更好表现
				通用性：不局限于web环境，可以脱离web使用
	缺点：在web环境下一些特定的需求需要手动编写代码
	

相对shiro，Spring Security在ssm整合时非常麻烦，因此此类项目中使用较少。随着springboot简化配置，spring security的开发和配置越来越简单。

## 常见概念

**认证（Authentication）**

即身份认证，指验证用户是否为使用系统的合法主体，就是说用户能否访问该系统。 （解决你是谁的问题）

最常用的简单身份认证方式如下：

- 用户名密码方式：系统通过核对用户输入的用户名和口令，看其是否与系统中存储的该用户的用户名和口令一致，来判断用户身份是否正确。
- 指纹打卡机：对于采用指纹等系统，则出示指纹。
- 硬件key刷卡系统：对于硬件Key等刷卡系统，则需要刷卡。
- 动态验证码：通过手机动态验证码。

Spring Security支持的认证方式有：用户名和密码、OAuth2.0登录、SAML2.0登录、中央认证服务器（CAS）、记住我、JAAS身份认证、OpenID、预身份验证方案、X509认证

**授权（Authorization）**

即身份鉴权，指验证某个用户是否具有权限使用系统的某个操作，身份认证后需要分配权限方可访问系统的资源，对于某些资源没有权限是无法访问的。（解决你能做什么的问题）

用户对象User：当前操作的用户，程序等

资源对象resource：当前被访问的对象

角色对象role：一组权限操作许可的集合

权限对象premission：权限操作许可权

Spring Security支持的授权方案：基于过滤器授权、基于表达式访问控制、安全对象实现、方法安全、域对象安全（ACL）

**攻击防护**

防止会话固定、点击劫持、跨站点请求伪造等攻击。（解决系统安全问题）

Spring Security支持的攻击防护有：CSRF、会话固定保护、安全请求头、HTTPS、HTTP防火墙



# 入门案例

## 基本操作步骤

1：创建一个Spring boot的web工程

2：增加Spring security依赖

3： 增加一个index.html页面

## 项目主要依赖

```xml
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-web</artifactId>
</dependency>
```



## 启动工程

项目启动时，springSecurity也会跟着启动，默认使用HttpBasic的方式启动，用户名是user，密码在启动日志里面，是个随机字符串，例如下图。

![](/A01-自动登录密码.png)



Spring Security会默认生成一个login的页面，用于进行登录。输入用户名user和控制台的密码，即可以访问主页面index.html

![](/A02.默认登录页面.png)





主页面有DefaultLoginPageGeneratingFilter的generateLoginPageHtml()方法生成。



# 过滤器

Spring security的认证和授权，是由很多的过滤器一起来完成工作的。它们形成一个过滤器连。

<img src="/B01-过滤器链.png" alt="B01-过滤器链" style="zoom:80%;" />

## DelegatingFilterProxy

DelegatingFilterProxy本身是一个Filter。Servlet容器可以注册其标准的过滤器（filter），但是并不会知道applicationcontext容器中的bean。DelegatingFilterProxy是Servlet容器和applicationcontext容器的桥梁，它注册在Servlet容器中，并且调用applicationcontext容器的bean。

<img src="/B02-DelegatingFilterProxy.png" alt="B02-DelegatingFilterProxy" style="zoom:80%;" />

## FilterChainProxy

FilterChainProxy是Spring Security提供的一种特殊过滤器，允许通过SecurityFilterChain委托给多个过滤器实例。FilterChainProxy是一个bean，它一般包含在DelegatingFilterProxy中

<img src="/B03-FilterChainProxy.png" alt="B03-FilterChainProxy" style="zoom:80%;" />



## SecurityFilterChain

FilterChainProxy使用SecurityFilterChain确定应该请求调用哪些Spring安全筛选器。

<img src="/B04-securityfilterchain.png" alt="B04-securityfilterchain" style="zoom:80%;" />

SecurityFilterChain中包含一个list，指定有哪些SecurityFilter

<img src="/B04-securityfilterchain源码.png" alt="B04-securityfilterchain源码" style="zoom:80%;" />



## 常用的Security过滤器

通过debug时，查看FilterChainProxy的filterChains属性，可以查看默认配置的过滤器

![A04.默认的filter](/A04.默认的filter.png)

security的处理主要是依赖各种类型的过滤器

- **WebAsyncManagerIntegrationFilter**：用于继承SecurityContext到Spring异步执行机制中的WebAsyncManager,和spring整合必须的。
- **SecurityContextPersistenceFilter**：  首当其冲的一个过滤器。主要是使用SecurityContextRepository在session中保存或更新一个SecurityContext，并将SecurityContext给以后的过滤器使用，来为后续filter建立所需的上下文，SecurityContext中存储了当前用户的认证和权限信息。
- **HeaderWriterFilter**：向请求的header中添加响应的信息，可以在http标签内部使用security:headers来控制
- **CsrfFilter**：Csrf又称跨域请求伪造，SpringSecurity会对所有post请求验证是否包含系统生成的csrf的token信息，如果不包含则报错，起到防止csrf攻击的效果
- **LogoutFilter**：匹配URL为/logout的请求，实现用户退出，清楚认证信息
- **UsernamePasswordAuthenticationFilter※**：认证操作全靠这个过滤器，默认匹配URL为/login且必须为POST请求
- **DefaultLoginPageGeneratingFilter※**：如果没有在配置文件中指定认证页面，则由该过滤器生成一个默认的认证界面
- **DefaultLogoutPageGeneratingFilter**：由此过滤器生成一个默认的退出登录页面
- **BasicAuthenticationFilter**：此过滤器会自动解析HTTP请求中头部名字包含有Authentication，且以Basic开头的头部信息，提取参数构造UsernamePasswordAuthenticationToken进行认证，成功则填充SecurityContextHolder的Authentication
- **RequestCacheAwareFilter**：通过HttpSessionRequestCache内部维护一个RequestCache，用于缓存HttpServletRequest
- **SecurityContextHolderAwareRequestFilter**：对ServletRequest进行一次包装，使得request具有更加丰富的API
- **AnonymousAuthenticationFilter**：当SecurityContextHolder中认证信息为空，则会创建一个匿名用户存储到SecurityContextHolder中，SpringSecurity为了兼容未登录的访问，也走了一套认证流程，只不过是一个匿名的身份
- **SessionManagementFilter**：SecurityContextRepository限制同一个用户开启多个会话的数量
- **ExceptionTranslationFilter**：位于整个SpringSecurityFilterChain的后方，用来转换整个链路中出现的异常
- **FilterSecurityInterceptor※※**：授权过滤器，获取所有配置资源的访问授权信息，根据SecurityContextHolder中存储的用户信息来决定其是否有权限。





# 设置登录用户名和密码

## 通过配置文件

如果想要修改默认的登录和密码，可以修改application.properties，增加登录用户相关内容

```properties
# 应用名称
spring.application.name=boot18-security
# 应用服务 WEB 访问端口
server.port=8080
#增加以下内容（security的默认用户信息）
spring.security.user.name=java
spring.security.user.password=111
spring.security.user.roles=admin
```



## 通过配置类（内存）

定义一个配置类，继承WebSecurityConfigurerAdapter

**WebSecurityConfigurerAdapter**：用来自定义自定义策略

**PasswordEncoder**：用于对密码进行加密的接口

**@EnableWebSecurity**

开启WebSecurity模式，主要作用如下：
	1：控制Spring Security是否使用调试模式（debug属性），默认为false
	2：导入WebSecurityConfiguration，用于配置web安全过滤器FilterChainProxy
	3：若干个WebSecurityConfigurerAdapter作用于一个WebSecurity生成一个最终使用的web安全过滤器FilterChainProxy
	4：如果是Servlet环境，导入WebMvcSecurityConfiguration，如果是OAuth2环境，导入OAuth2ClientConfiguration
	6：使用EnableGlobalAuthentication启用全局认证机制。Spring Security依赖于全局认证机制

```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.inMemoryAuthentication()
                .withUser("java")
                .password(new BCryptPasswordEncoder().encode("111") )
                .roles("admin");
    }

    @Bean
    PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
}
```



## 通过数据库

### 设计表

```sql
SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `menu`
-- ----------------------------
DROP TABLE IF EXISTS `menu`;
CREATE TABLE `menu` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) DEFAULT NULL,
  `url` varchar(100) DEFAULT NULL,
  `parentid` bigint(20) DEFAULT NULL,
  `permission` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of menu
-- ----------------------------
INSERT INTO `menu` VALUES ('1', '系统管理', '', '0', 'menu:system');
INSERT INTO `menu` VALUES ('2', '用户管理', '', '0', 'menu:user');

-- ----------------------------
-- Table structure for `role`
-- ----------------------------
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of role
-- ----------------------------
INSERT INTO `role` VALUES ('1', 'ADMIN');
INSERT INTO `role` VALUES ('2', 'USER');

-- ----------------------------
-- Table structure for `role_menu`
-- ----------------------------
DROP TABLE IF EXISTS `role_menu`;
CREATE TABLE `role_menu` (
  `mid` bigint(20) NOT NULL,
  `rid` bigint(20) NOT NULL,
  PRIMARY KEY (`mid`,`rid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of role_menu
-- ----------------------------
INSERT INTO `role_menu` VALUES ('1', '1');
INSERT INTO `role_menu` VALUES ('2', '1');
INSERT INTO `role_menu` VALUES ('2', '2');

-- ----------------------------
-- Table structure for `role_user`
-- ----------------------------
DROP TABLE IF EXISTS `role_user`;
CREATE TABLE `role_user` (
  `uid` bigint(20) NOT NULL,
  `rid` bigint(20) NOT NULL,
  PRIMARY KEY (`uid`,`rid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of role_user
-- ----------------------------
INSERT INTO `role_user` VALUES ('1', '1');
INSERT INTO `role_user` VALUES ('2', '2');

-- ----------------------------
-- Table structure for `users`
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` varchar(20) NOT NULL,
  `password` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of users  
-- 密码：111
-- ----------------------------
INSERT INTO `users` VALUES ('1', 'java', '$2a$10$TigfHF7Cn2.DJ487NNRrXenvRh72FW/LEviYgn/Yyj2b8tExf.bCi');
INSERT INTO `users` VALUES ('2', 'web', '$2a$10$TigfHF7Cn2.DJ487NNRrXenvRh72FW/LEviYgn/Yyj2b8tExf.bCi');
```



### 创建springboot的web工程

引入依赖

```xml
<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>6.0.6</version>
        </dependency>

        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
            <version>2.1.4</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
        </dependency>
```



### 定义配置文件

```yaml
server:
  port: 8080
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/authc?serverTimezone=Asia/Shanghai&useSSL=false
    username: root
    password: root
mybatis:
  type-aliases-package: com.boot03dbuser.entity
  mapper-locations: classpath:mapper/*.xml
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
```

### 定义主体Users

需要实现UserDetails接口，用户名属性必须为username，密码字段必须是password，否则无法接收

**注意点：如果数据库中的角色名称不是以ROLE_开头，则必须添加（为角色验证服务）**

```java
@Data
public class Users implements UserDetails {

    private Long id;
    private String username;
    private String password;
    private List<String> roles;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        for (String role : roles) {
            //Role的字符串必须以：Role_开头（如果数据库中没有输入role，则此处需要添加）
            //具体可以参考：org.springframework.security.core.userdetails.User的roles方法
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
        }
        return authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
```



### 编写UserDao接口

```java
public interface UsersDao {
    Users selectOne(String username);

    List<String> selectRolesByUser(String username);
}
```

### 编写UserMapper文件

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
<mapper namespace="com.boot03dbuser.dao.UsersDao">
    <select id="selectOne" resultType="Users">
        select id,username,password
        from users
        where username = #{username}
    </select>

    <select id="selectRolesByUser"  resultType="string">
        select name
        from role
        INNER  JOiN role_user ON
            role.id = role_user.rid
        INNER  JOIN users ON
           role_user.uid = users.id
        WHERE users.username = #{username}
    </select>
</mapper>
```



### 编写UserService类

实现**UserDetailsService**接口，用于在程序中引入一个自定义的AuthenticationProvider，实现数据库访问模式的验证

**UserDetailsService**接口(位于org.springframework.security.core.userdetails包下) 用户详情信息服务，此接口定义了获取用户详细信息的唯一的一个方法，通过用户名称获取用户信息；但是获取用户信息的源头有很多自己也可定义只要实现了此接口重写loadUserByUsername方法，在方法内部定义自己获取用户信息的逻辑，后续认证工作交由SpringSecurity来完成即可。我们获取用户名和密码的代码需要写入此接口的实现类当中



```java
@Service
public class UserService implements UserDetailsService {

    @Resource
    UsersDao usersDao;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        //获取用户
        Users users= usersDao.selectOne(username);
        if(users == null) {
            throw new UsernameNotFoundException("用户不存在");
        }
        //获取角色
        List<String> roles = usersDao.selectRolesByUser(username);
        users.setRoles(roles);
        return users;
    }
}
```



### 编写配置类



```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Resource
    UserService userService;
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userService);
    }

    @Bean
    PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
}
```





## 留个后门

自定义一个类来实现AuthenticationProvider，完成用户的认证工作，然后加入到配置文件中。

### 自定义验证类

```java
@Component
public class BackdoorAuthenticationProvider implements AuthenticationProvider {
    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String name = authentication.getName();
        String password = authentication.getCredentials().toString();

        //利用mamp用户名登录，不管密码是什么都可以，伪装成admin用户
        if (name.equals("mamp")) {
            Collection<GrantedAuthority> authorityCollection = new ArrayList<>();
            authorityCollection.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
            authorityCollection.add(new SimpleGrantedAuthority("ROLE_USER"));
            return new UsernamePasswordAuthenticationToken(
                    "admin", password, authorityCollection);
        }
        return null;
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return authentication.equals(
                UsernamePasswordAuthenticationToken.class);
    }
}
```



### 修改配置类

将自定义的后门验证类加入进来

```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Resource
    UserService userService;

    @Resource
    BackdoorAuthenticationProvider backdoorAuthenticationProvider;
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userService);
        //将自定义的类注册进来
        auth.authenticationProvider(backdoorAuthenticationProvider);
    }

    @Bean
    PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
}
```



## 基于用户角色的验证

### 增加静态页面

在static中增加两个页面，admin.html 和user.html

admin.html只可以admin角色用户可以访问

user.html只可以user角色的用户可以访问

### 增加控制器

每个方法上都增加@PreAuthorize注解，用来控制方法的访问权限

**注意此时的角色字符串不能带有ROLE_**

如果用户具备给定角色就允许访问,否则出现403。

```java
@Controller
public class UserController {

    @RequestMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String admin(){
        return "redirect:/admin.html";
    }

    @RequestMapping("/user")
    @PreAuthorize("hasRole('USER')")
    public String user(){
        return "redirect:/user.html";
    }
}
```



### 启用security的方法注解

在SecurityConfig类上增加@EnableGlobalMethodSecurity(prePostEnabled = true)

```java
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Resource
    UserService userService;

    @Resource
    BackdoorAuthenticationProvider backdoorAuthenticationProvider;
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        System.out.println("............AuthenticationManagerBuilder.......");
        auth.userDetailsService(userService);
        //将自定义的类注册进来
        auth.authenticationProvider(backdoorAuthenticationProvider);
    }

    @Bean
    PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
}

```



### 测试

使用java用户测试admin是否可以登录

## @EnableGlobalMethodSecurity详解

用来开启在控制器方法上使用Spring Security的访问注解权限，默认不开启

- securedEnabled=true：开启@Secured 注解过滤权限， @Secured({"ROLE_admin","ROLE_hr"})
- jsr250Enabled=true：开启@RolesAllowed 注解过滤权限，指定访问，@RolesAllowed("admin")
- prePostEnabled=true：开启以下四个注解
  - @PreFilter 允许方法调用,但必须在进入方法之前过滤方法的参数值
  - @PostFilter 允许方法调用,但必须按照表达式来过滤方法的结果
  - @PreAuthorize 在方法调用之前,基于表达式的计算结果来限制对方法的访问
  - @PostAuthorize 允许方法调用,但是如果表达式计算结果为false,将抛出一个安全性异常

@PreAuthorize和@PostAuthorize支持spring表达式语言，提供基于表达式的访问控制，适用于比较复杂的权限控制条件。例如@PreAuthorize("hasRole('admin')")和@PreAuthorize("hasAnyRole('admin','user')")

@PreAuthorize("hasRole('ROLE_SYSTEM') and #userEntity.password>8 or hasRole('ROLE_ADMIN')")

使用@PreFilter和@PostFilter可以对集合类型的参数或返回值进行过滤。使用@PreFilter和@PostFilter时，Spring Security将移除使对应表达式的结果为false的元素。

单场景来说，面向权限的注解，包括Spring Security的@Secured以及基于标准的@RolesAllowed都很便利.
当安全规则更为复杂的时候，组合使用@PreAuthorize、@PostAuthorize以及SpEL能够发挥更强大的威力。我们还看到通过为@PreFilter和@PostFilter提供SpEL表达式，过滤方法的输入和输出。

# 动态配置页面

## 默认的登录页面

主页面由DefaultLoginPageGeneratingFilter的generateLoginPageHtml()方法生成。

请求地址：/login

请求方式:  POST

参数：username，password

## 自定义登录页面

### 增加登录html页面

static中增加两个html，一个是mylogin.html，用于用户输入登录信息，另一个是error.html，当登录失败时，进入此页面。

注意：mylogin.html中form表单的action，method以及参数需要和默认的登录页面一致

```html
    <form action="/login" method="post">
        username:<input type="text" name="username" value="java"><br>
        password:<input type="text" name="password" value="111"><br>
        <input type="submit" value="login">
    </form>
```

### 修改首页

logout时会做以下处理

- 使 HTTP 会话无效
- 清理已配置的所有 RememberMe 身份验证
- 清除`SecurityContextHolder`
- 重定向到`/login?logout`

```html
<body>
    welcome security
    <a href="/logout">退出系统，回到登录</a>
</body>
```

### 修改SecurityConfig配置文件

重写 configure(HttpSecurity http) 方法，用来配置用户自定义登录页面以及其失败，没有权限的页面

阻止csrf验证

>  http.csrf().disable(); //跨站请求伪造

设置哪些可以不用登录即可访问的页面

> http.authorizeRequests()
>                .antMatchers("/index","/mylogin.html","/login")
>                .permitAll();

定义登录页面以及其处理

> http.formLogin()
>                .loginPage("/mylogin.html")  //登录的视图页面
>                .loginProcessingUrl("/login") //登录处理
>                 .failureUrl("/error.html");  //登录错误时显示页面

```java
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Resource
    UserService userService;

    @Resource
    BackdoorAuthenticationProvider backdoorAuthenticationProvider;
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        System.out.println("............AuthenticationManagerBuilder.......");
        auth.userDetailsService(userService);
        //将自定义的类注册进来
        auth.authenticationProvider(backdoorAuthenticationProvider);
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        //必须先关掉，否则无法正确访问启动页面
        //CSRF（Cross-site request forgery），中文名称：跨站请求伪造
        //CSRF能够做的事情包括：以你名义发送邮件，发消息，盗取你的账号，甚至于购买商品，虚拟货币转账…造成的问题包括：个人隐私泄露以及财产安全。
        http.csrf().disable(); //跨站请求伪造
        //定义哪些可以不需要认证即可访问的路径
        //自定义启动页以及处理的/login必须匿名即可访问，因为此时还没有登录
       http.authorizeRequests()
               .antMatchers("/index","/mylogin.html","/login")
               .permitAll();
       http.formLogin()
               .loginPage("/mylogin.html")  //登录的视图页面
               .loginProcessingUrl("/login") //登录处理
                .failureUrl("/error.html");  //登录错误时显示页面
        //自定义403页面
        // 当用户权限时，显示此页面
        http.exceptionHandling()
                .accessDeniedPage("/unauth.html");
    }

    @Bean
    PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
}
```



# 使用ajax登录验证

AuthenticationSuccessHandler：当spring框架用户认证成功后执行的接口，方法为onAuthenticationSuccess

AuthenticationFailureHandler：当spring框架用户认证失败后执行的接口，方法为onAuthenticationFailure

需要实现此俩个接口，用于返回json类型的数据的数据

## 登录页面修改

```java
<body>
    username:<input type="text" id="username" value="java"><br>
    password:<input type="text" id="password" value="111"><br>
    <button id="login">login</button>
    <script>
        $(function () {
            $("#login").click(function () {
                let user = $("#username").val();
                let pwd = $("#password").val();
                $.ajax({
                    url:"/login",
                    type:"post",
                    data:{
                        username:user,
                        password:pwd
                    },
                    success:function (data) {
                        alert(data);
                        console.log(data);
                    }
                })
            })
        })
    </script>
</body>
```

## 登录成功Handler

实现AuthenticationSuccessHandler接口

```java
@Component
public class UserSuccessHandler implements AuthenticationSuccessHandler {
    /**
     * 登录成功后
     * @param request
     * @param response
     * @param authentication  登录成功后的封装类
     * @throws IOException
     * @throws ServletException
     */
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request
            , HttpServletResponse response
            , Authentication authentication) throws IOException, ServletException {
        response.setContentType("application/json;charset=utf-8");

        ServletOutputStream out = response.getOutputStream();
        AjaxResult result = AjaxResult.success("登录成功");
        ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(out,result);
        out.flush();
        out.close();

    }
}
```

## 登录失败Handler

```java
@Component
public class UserFailHandler implements AuthenticationFailureHandler {
    /**
     *当框架验证用户失败时，进行处理
     * @param request
     * @param response
     * @param e
     * @throws IOException
     * @throws ServletException
     */
    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException e) throws IOException, ServletException {
        response.setContentType("application/json;charset=utf-8");
        ServletOutputStream out = response.getOutputStream();

        AjaxResult result = AjaxResult.error(-1,"登录失败，请联系管理员");
        ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(out,result);
        out.flush();
        out.close();
    }
}
```



## 修改配置项

```java
@Configuration
@EnableWebSecurity
//启用security的部分注解
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig  {

    @Resource
    UserFailureHandler userFailureHandler;
    @Resource
    UserSuccessHandler userSuccessHandler;

    @Bean
    PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        //禁止掉CSRF处理
        httpSecurity
                .csrf()
                .disable();
        //设置哪些URL可以不需要登录就直接可以访问
        httpSecurity.authorizeRequests()
                .antMatchers("/login.html","/login")
                .permitAll();
        //设置自定义的登录页面
        httpSecurity.formLogin()
                .loginPage("/login.html")
                .loginProcessingUrl("/login")
                .successHandler(userSuccessHandler)
                .failureHandler(userFailureHandler);
        //自定义403错误页面，当用户没有权限时，会自动跳入此页面
        httpSecurity.exceptionHandling()
                .accessDeniedPage("/unauthc.html");

        return httpSecurity.build();
    }

}
```



# 前后端分离（jwt + redis + springsecurity）

思路：用户登录时将token写入redis，并且带回到客户端。

​	实现OncePerRequestFilter接口，从用户端获取token，并进行处理

## 创建web工程并设置依赖

```xml
<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>
        <!-- 阿里JSON解析器 -->
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>fastjson</artifactId>
            <version>1.2.80</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt</artifactId>
            <version>0.9.1</version>
        </dependency>


        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>6.0.6</version>
        </dependency>

        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
            <version>2.1.4</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
        </dependency>
```

## 配置项目

```yaml
server:
  port: 8080
token:
  header: authentication
  secret: 123456
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/authc?serverTimezone=Asia/Shanghai&useSSL=false
    username: root
    password: root
  redis:
    host: 127.0.0.1
    port: 6379
mybatis:
  type-aliases-package: com.boot06jwt.vo
  mapper-locations: classpath:mappers/*.xml
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
```

## 编写工具类

### redis缓存工具类

```java
@Component
public class RedisCache {
    @Autowired
    RedisTemplate redisTemplate;

    /**
     * 缓存基本的对象，Integer、String、实体类等
     *
     * @param key 缓存的键值
     * @param value 缓存的值
     */
    public <T> void setCacheObject(final String key, final T value)
    {
        redisTemplate.opsForValue().set(key, value);
    }

    /**
     * 缓存基本的对象，Integer、String、实体类等
     *
     * @param key 缓存的键值
     * @param value 缓存的值
     * @param timeout 时间
     * @param timeUnit 时间颗粒度
     */
    public <T> void setCacheObject(final String key, final T value, final Integer timeout, final TimeUnit timeUnit)
    {
        redisTemplate.opsForValue().set(key, value, timeout, timeUnit);
    }

    /**
     * 设置有效时间
     *
     * @param key Redis键
     * @param timeout 超时时间
     * @return true=设置成功；false=设置失败
     */
    public boolean expire(final String key, final long timeout)
    {
        return expire(key, timeout, TimeUnit.SECONDS);
    }

    /**
     * 设置有效时间
     *
     * @param key Redis键
     * @param timeout 超时时间
     * @param unit 时间单位
     * @return true=设置成功；false=设置失败
     */
    public boolean expire(final String key, final long timeout, final TimeUnit unit)
    {
        return redisTemplate.expire(key, timeout, unit);
    }

    /**
     * 获得缓存的基本对象。
     *
     * @param key 缓存键值
     * @return 缓存键值对应的数据
     */
    public <T> T getCacheObject(final String key)
    {
        ValueOperations<String, T> operation = redisTemplate.opsForValue();
        return operation.get(key);
    }

    /**
     * 删除单个对象
     *
     * @param key
     */
    public boolean deleteObject(final String key)
    {
        return redisTemplate.delete(key);
    }

    /**
     * 删除集合对象
     *
     * @param collection 多个对象
     * @return
     */
    public long deleteObject(final Collection collection)
    {
        return redisTemplate.delete(collection);
    }

    /**
     * 缓存List数据
     *
     * @param key 缓存的键值
     * @param dataList 待缓存的List数据
     * @return 缓存的对象
     */
    public <T> long setCacheList(final String key, final List<T> dataList)
    {
        Long count = redisTemplate.opsForList().rightPushAll(key, dataList);
        return count == null ? 0 : count;
    }

    /**
     * 获得缓存的list对象
     *
     * @param key 缓存的键值
     * @return 缓存键值对应的数据
     */
    public <T> List<T> getCacheList(final String key)
    {
        return redisTemplate.opsForList().range(key, 0, -1);
    }

    /**
     * 缓存Set
     *
     * @param key 缓存键值
     * @param dataSet 缓存的数据
     * @return 缓存数据的对象
     */
    public <T> BoundSetOperations<String, T> setCacheSet(final String key, final Set<T> dataSet)
    {
        BoundSetOperations<String, T> setOperation = redisTemplate.boundSetOps(key);
        Iterator<T> it = dataSet.iterator();
        while (it.hasNext())
        {
            setOperation.add(it.next());
        }
        return setOperation;
    }

    /**
     * 获得缓存的set
     *
     * @param key
     * @return
     */
    public <T> Set<T> getCacheSet(final String key)
    {
        return redisTemplate.opsForSet().members(key);
    }

    /**
     * 缓存Map
     */
    public <T> void setCacheMap(final String key, final Map<String, T> dataMap)
    {
        if (dataMap != null) {
            redisTemplate.opsForHash().putAll(key, dataMap);
        }
    }

    /**
     * 获得缓存的Map
     */
    public <T> Map<String, T> getCacheMap(final String key)
    {
        return redisTemplate.opsForHash().entries(key);
    }

    /**
     * 往Hash中存入数据
     *
     * @param key Redis键
     * @param hKey Hash键
     * @param value 值
     */
    public <T> void setCacheMapValue(final String key, final String hKey, final T value)
    {
        redisTemplate.opsForHash().put(key, hKey, value);
    }

    /**
     * 获取Hash中的数据
     *
     * @param key Redis键
     * @param hKey Hash键
     * @return Hash中的对象
     */
    public <T> T getCacheMapValue(final String key, final String hKey)
    {
        HashOperations<String, String, T> opsForHash = redisTemplate.opsForHash();
        return opsForHash.get(key, hKey);
    }

    /**
     * 删除Hash中的数据
     *
     * @param key
     * @param hKey
     */
    public void delCacheMapValue(final String key, final String hKey)
    {
        HashOperations hashOperations = redisTemplate.opsForHash();
        hashOperations.delete(key, hKey);
    }

    /**
     * 获取多个Hash中的数据
     *
     * @param key Redis键
     * @param hKeys Hash键集合
     * @return Hash对象集合
     */
    public <T> List<T> getMultiCacheMapValue(final String key, final Collection<Object> hKeys)
    {
        return redisTemplate.opsForHash().multiGet(key, hKeys);
    }

    /**
     * 获得缓存的基本对象列表
     *
     * @param pattern 字符串前缀
     * @return 对象列表
     */
    public Collection<String> keys(final String pattern)
    {
        return redisTemplate.keys(pattern);
    }
}
```

### JwtToken工具类

```java
@Component
public class JwtTokenUtil {

    @Value("${token.header}")
    private String header;
    @Value("${token.secret}")
    private String secret;


    public String createToken(LoginUsers loginUsers){
        //创建JwtBuilder对象
        //通过JwtBuilder对象的一系列方法，来设置token中信息，compact()方法创建token字符串
        JwtBuilder jwtBuilder = Jwts.builder();
        String token = jwtBuilder.setHeaderParam("typ","JWT")   //类型
                .setHeaderParam("alg","HS256")  //加密算法
                .claim("id", loginUsers.getId())
                .claim("uuid",UUID.randomUUID().toString())
                .setIssuer("wanho")  //签发主题
                .setAudience("wanho")
                .setSubject(loginUsers.getUsername())  //主体
                .setIssuedAt(new Date())  //发行事件
                .setNotBefore(new Date())  //有效开始时间（参数指定的时间之后才会有效）
                .setExpiration(new Date(System.currentTimeMillis()+ 360000)) //过期时间
                .setId(UUID.randomUUID().toString())
                .signWith(SignatureAlgorithm.HS256,secret)
                .compact();
        return token;
    }

    //解析token字符串
    public Claims parseToken(String token){
        JwtParser parser = Jwts.parser();
        Jws<Claims> claimsJws = parser.setSigningKey(secret).parseClaimsJws(token);
        Claims claims = claimsJws.getBody();
        return claims;

    }

    //获取用户名
    public Integer getUserID(String token){
        Integer userid;
        try {
            Claims claims = parseToken(token);
            userid = (Integer) claims.get("id");
        } catch (ExpiredJwtException ex) {
            userid =(Integer)  ex.getClaims().get("id");
        }

        return userid;
    }

    //获取用户名
    public String getUUIDFromToken(String token){
        String userid;
        try {
            Claims claims = parseToken(token);
            userid = (String) claims.get("uuid");
        } catch (ExpiredJwtException ex) {
            userid = (String) ex.getClaims().get("uuid");
        }

        return userid;
    }


    //获取用户名
    public String getUsername(String token){
        String username = "";
        try {
            Claims claims = parseToken(token);
            username = claims.getSubject();
        } catch (ExpiredJwtException ex) {
            username = ex.getClaims().getSubject();
        }

        return username;
    }

    public String getTokenFromRequest(HttpServletRequest request){
        return request.getHeader(header);
    }
}

```

## 定义UserDetail的实现类

```java
@Data
public class LoginUsers implements UserDetails {

    private Long id;
    private String username;
    private String password;
    private List<String> roles;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> simpleGrantedAuthorities = new ArrayList<>();

        for (String role : roles) {
            simpleGrantedAuthorities.add(new SimpleGrantedAuthority("ROLE_"+ role));
        }
        return simpleGrantedAuthorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}

```

## 定义dao

```
public interface UsersDao {
    LoginUsers selectOne(String username);

    List<String> selectRolesByUser(String username);
}
```



## 定义Mapper

```xml
<mapper namespace="com.boot06jwt.dao.UsersDao">
    <select id="selectOne" resultType="loginUsers">
        select id,username,password
        from users
        where username = #{username}
    </select>

    <select id="selectRolesByUser"  resultType="string">
        select name
        from role
        INNER  JOiN role_user ON
            role.id = role_user.rid
        INNER  JOIN users ON
           role_user.uid = users.id
        WHERE users.username = #{username}
    </select>
</mapper>
```

## 定义UserService

```java
@Service
public class UserService implements UserDetailsService {

    @Resource
    UsersDao usersDao;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        //获取用户
        LoginUsers loginUsers = usersDao.selectOne(username);
        if(loginUsers == null) {
            throw new UsernameNotFoundException("用户不存在");
        }
        //获取角色
        List<String> roles = usersDao.selectRolesByUser(username);
        loginUsers.setRoles(roles);
        return loginUsers;
    }
}

```

## 定义用户登录控制器

```java
@RestController
@CrossOrigin
public class LoginController {
    @Autowired
    UserService userService;

    @Resource
    JwtTokenUtil jwtTokenUtil;

    @Resource
    RedisCache redisCache;

    @PostMapping("/login")
    public AjaxResult login(String username,String password){
        UserDetails userDetails = userService.loadUserByUsername(username);
        if (userDetails==null){
            throw new UsernameNotFoundException("用户不存在");
        }

        String token = jwtTokenUtil.createToken((LoginUsers) userDetails);
        String uuid = jwtTokenUtil.getUUIDFromToken(token);
        //将token写入
        redisCache.setCacheObject(uuid,(LoginUsers) userDetails);
        //AjaxResult result = AjaxResult.success("用户登录成功",token);
        return AjaxResult.success("登录成功",token);
    }
}

```



## 定义其他访问控制器

```java
@RestController
@CrossOrigin
public class UserController {

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String admin(){
        return "admin access success";
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('USER')")
    public String user(){
        return "USER access success";
    }

    @GetMapping("/authc")
    public String authc(){
        return "authc success";
    }

    @GetMapping("/anonymous")
    public String anonymous(){
        return "anonymous success";
    }
}


```



## 定义过滤器过滤器

```java
@Component
public class JwtAuthTokenFilter extends OncePerRequestFilter
{
    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    RedisCache redisCache;


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException
    {
        //通过token获取用户信息的UUID
        String token = jwtTokenUtil.getTokenFromRequest(request);
        //如果token为空，说明没有登录，则需要跳转到登录页面
        if (!StringUtils.isEmpty(token)) {
            String uuid = jwtTokenUtil.getUUIDFromToken(token);
            System.out.println(SecurityContextHolder.getContext().getAuthentication());

            ////根据uuid获取用户信息（从redis缓存中获取）
            LoginUsers loginUsers = redisCache.getCacheObject(uuid);
            //
            //用户存在，但是未存入验证信息
            if (loginUsers != null
                    && SecurityContextHolder.getContext().getAuthentication()==null){
                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(loginUsers.getUsername(), loginUsers.getPassword(), loginUsers.getAuthorities());
                //authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                authenticationToken.setDetails(loginUsers);
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }
        }


        chain.doFilter(request, response);
    }
}

```

## 定义未登录时处理器

```java
@Component
public class AuthenticationEntryPointImpl implements AuthenticationEntryPoint, Serializable
{
    private static final long serialVersionUID = -8970718410437077606L;

    //commence:开始，着手
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException e)
            throws IOException
    {

        response.setHeader("Access-Control-Allow-Origin","*"); //允许所有域都可以跨域
        response.setHeader("Access-Control-Allow-Methods","GET,POST,PUT,DELETE,OPTIONS");
        response.setHeader("Access-Control-Allow-Headers","x-requested-with,content-type");
        response.setContentType("application/json;charset=utf-8");

        AjaxResult result = AjaxResult.error(-1,"用户未登录，请登录后再访问");
        response.getWriter().write(JSON.toJSONString(result));
    }
}

```

## 定义权限不足时处理

```java
@Component
public class CustomizeAccessDeniedHandler implements AccessDeniedHandler {
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException, ServletException {
        //登录log更新
        AjaxResult result = AjaxResult.error(-1,"没有权限");
        response.setHeader("Access-Control-Allow-Origin","*"); //允许所有域都可以跨域
        response.setHeader("Access-Control-Allow-Methods","GET,POST,PUT,DELETE,OPTIONS");
        response.setHeader("Access-Control-Allow-Headers","x-requested-with,content-type");
        response.setContentType("application/json;charset=utf-8");
        response.getWriter().write(JSON.toJSONString(result));
    }
}

```



## 定义Security配置器

```java
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter
{
    /**
     * 自定义用户认证逻辑
     */
    @Resource
    private UserDetailsService userService;
    
    /**
     * 认证失败处理类
     */
    @Autowired
    private AuthenticationEntryPointImpl unauthorizedHandler;


    //@Resource
    //JwtLoginFilter jwtLoginFilter;
    ///**
    // * token认证过滤器
    // */
    @Resource
    private JwtAuthTokenFilter jwtAuthTokenFilter;


    @Resource
    CustomizeAccessDeniedHandler customizeAccessDeniedHandler;
    

    
    ///**
    // * 解决 无法直接注入 AuthenticationManager
    // *
    // * @return
    // * @throws Exception
    // */
    //@Bean
    //@Override
    public AuthenticationManager authenticationManagerBean() throws Exception
    {
        return super.authenticationManagerBean();
    }

    /**
     * 强散列哈希加密实现
     */
    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder()
    {
        return new BCryptPasswordEncoder();
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        System.out.println("............AuthenticationManagerBuilder.......");
        auth.userDetailsService(userService);
    }


    /**
     * anyRequest          |   匹配所有请求路径
     * access              |   SpringEl表达式结果为true时可以访问
     * anonymous           |   匿名可以访问
     * denyAll             |   用户不能访问
     * fullyAuthenticated  |   用户完全认证可以访问（非remember-me下自动登录）
     * hasAnyAuthority     |   如果有参数，参数表示权限，则其中任何一个权限可以访问
     * hasAnyRole          |   如果有参数，参数表示角色，则其中任何一个角色可以访问
     * hasAuthority        |   如果有参数，参数表示权限，则其权限可以访问
     * hasIpAddress        |   如果有参数，参数表示IP地址，如果用户IP和参数匹配，则可以访问
     * hasRole             |   如果有参数，参数表示角色，则其角色可以访问
     * permitAll           |   用户可以任意访问
     * rememberMe          |   允许通过remember-me登录的用户访问
     * authenticated       |   用户登录后可访问
     */
    @Override
    protected void configure(HttpSecurity httpSecurity) throws Exception
    {

        httpSecurity.csrf().disable()//跨站请求伪造
                .cors(); //允许跨域
        httpSecurity.headers().frameOptions().disable();
        //设置认证异常处理
        httpSecurity.authorizeRequests()
                .requestMatchers(CorsUtils::isPreFlightRequest).permitAll()
                .antMatchers("/anonymous").permitAll()
                .antMatchers("/login").permitAll()
                .antMatchers(HttpMethod.OPTIONS).permitAll() //不加此项，会导致跨域无效
                .anyRequest().authenticated();

        //禁止session，
        // Spring Security不采用session机制了，
        // 并不是禁用掉了整个系统的session功能。
        httpSecurity.sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS);
        //定义异常处理
        httpSecurity.exceptionHandling()
                .authenticationEntryPoint(unauthorizedHandler)  //认证失败的情况
                .accessDeniedHandler(customizeAccessDeniedHandler); //权限失败的情况下

        //不能直接使用addFilter来添加过滤器JwtAuthTokenFilter
        // 必须要指定顺序，addFilterBefore或者addFilterAfter或者addFilterAt
        //httpSecurity.addFilter(jwtAuthTokenFilter);
        httpSecurity.addFilterBefore(jwtAuthTokenFilter
                ,UsernamePasswordAuthenticationFilter.class);

    }

}

```

