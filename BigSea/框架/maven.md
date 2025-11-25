### 远程仓库
1、修改远程仓库地址

mirror：<font style="color:rgba(0, 0, 0, 0.75);">覆盖repository的镜像地址</font>

<font style="color:rgba(0, 0, 0, 0.75);">repository：实际上maven会从此repository对应的mirror对应的地址下载jar包</font>

<font style="color:rgba(0, 0, 0, 0.75);">server：私服的鉴权信息</font>

<font style="color:rgba(0, 0, 0, 0.75);">教程：</font>[<font style="color:rgba(0, 0, 0, 0.75);">https://blog.csdn.net/qq_14947845/article/details/124765578</font>](https://blog.csdn.net/qq_14947845/article/details/124765578)

<font style="color:rgba(0, 0, 0, 0.75);"></font>

<font style="color:rgba(0, 0, 0, 0.75);">2、注意：</font>

<font style="color:rgba(0, 0, 0, 0.75);">项目的maven地址要重新配置，在</font><font style="color:rgba(0, 0, 0, 0.75);">setting</font><font style="color:rgba(0, 0, 0, 0.75);">-</font><font style="color:rgba(0, 0, 0, 0.75);">Build</font>`<font style="color:rgba(0, 0, 0, 0.75);">-</font>`<font style="color:rgba(0, 0, 0, 0.75);">Build Tools</font>`<font style="color:rgba(0, 0, 0, 0.75);">- </font>`<font style="color:rgba(0, 0, 0, 0.75);">Maven</font>`

<font style="color:rgba(0, 0, 0, 0.75);"></font>

<font style="color:rgba(0, 0, 0, 0.75);">3、多个远程仓库</font>

<font style="color:rgba(0, 0, 0, 0.75);">配置profile，不要配置mirror，</font>




### 版本依赖
#### SpringBoot 版本控制
1. 通过**parent**继承方式实现 -- 无父模块时可以用
2. 通过 **dependencyManagement**实现 --有父模块时只能用这个
3. 手动给组件指定version

```xml title="通过继承方式实现"
<parent>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-parent</artifactId>
	<version>2.7.14</version>
	<relativePath/> <!-- lookup parent from repository -->
</parent>
```

```xml title="通过dependencyManagement实现"
<dependencyManagement>
    <dependencies>
        <!-- 关键：引入 Spring Boot 的 BOM 进行版本控制 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>2.7.14</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

#### SpringCloud 版本控制
1. 只能用**dependencyManagement**
2. 手工给 cloud 模块指定版本
```xml title="dependencyManagement方式"
<dependencies>
    <!-- 组件版本由 BOM 自动管理 -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-config</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
</dependencies>
```

>[!tip] 
> Spring Cloud 版本与 Spring Boot 版本强相关(查看兼容性)[[Spring Cloud](https://spring.io/projects/spring-cloud)]
![image.png|500](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-07-07-202507071757941.png)


