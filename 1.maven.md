# Maven基础

## maven是什么

Maven就是项目构建和管理工具，包含一个项目对象模型（POM）,大部分的情况下，通过配置pom的信息，管理项目中的依赖，报告以及项目的构建过程。

常用的命令：

清理：删除前面编译的结果，为后面重新编译和打包等做前期处理

编译compile：将java源文件编译成字节码文件

测试：针对项目中的关键点进行测试，主要使用在白盒测试中

报告：生成测试结果或者运行结果

打包package：通过此命令，可以将包含多个packege以及目录的文件生成一个压缩文件（jar或者war）

安装：将jar安装到本地仓库

部署：部署项目

## maven的下载以及配置

到官网下载压缩包，解压到某个英文目录下。

本地仓库的默认目录：

​	C:\Users\mameiping\.m2\repository

settings.xml当中进行配置

本地仓库

```xml
<localRepository>D:\maven-lib</localRepository>
```

远程仓库

```xml
<mirror>
		<id>aliyunmaven</id>
		<mirrorOf>*</mirrorOf>
		<name>alibaba</name>
		<url>https://maven.aliyun.com/repository/public</url>
	 </mirror>
```

jdk版本

```xml
<profile>
		  <id>jdk1.8</id>
		  <activation>
			<jdk>1.8</jdk>
			<activeByDefault>true</activeByDefault>
		  </activation>
		  <properties>
			<maven.compiler.source>1.8</maven.compiler.source>
			<maven.compiler.target>1.8</maven.compiler.target>
			<maven.compiler.compilerVersion>1.8</maven.compiler.compilerVersion>
			<encoding>UTF-8</encoding>
		  </properties>
	</profile>
```



## maven仓库

本地仓库：当前使用的机器上，当程序运行的时候，先会去本地仓库获取相关的jar包

远程仓库：非本地，外网或者公司内部集中管理。

​	中央仓库：为全世界maven提供服务，在国外，速度有点慢

​	中央仓库的镜像：分担中央仓库的压力，在不同的地方都在服务器

​	私服：为当前局域网范围内提供服务



## 在idea当中使用maven



## 仓库的坐标

groupid，artifactId以及version称为依赖的坐标

```
<groupId>mysql</groupId>
<artifactId>mysql-connector-java</artifactId>
<version>6.0.6</version>
```

## 依赖的范围

compile：默认范围，应用程序在编译，测试，运行时都需要相关的jar包

test：只用于测试相关的代码中的依赖，常用于junit

provided：当编译和测试时需要此类的依赖（jar包），而运行时不需要的情况下，可以指定成此范围。常见于servlet依赖

system：和provided类似，必须显式提供本地jar包所在的位置。



## maven依赖的特征

### 继承性

父工程当中定义的依赖，子工程不需要重复定义，直接继承。



### 传递性

A ，B工程，A工程依赖B工程，B工程中的所有依赖，A工程也可以直接使用（B工程的依赖会传递给A工程）。



## 依赖的原则

项目存在依赖的传递，同样的依赖，多层传递，版本号不同的情况，用最接近它的那一层的版本。

依赖路径层次相同的情况下，谁先声明，用谁的。

不想使用某个依赖下的特定依赖包，可以使用排除方式。使用exclusions排除，不需要指定版本。



## 统一版本号

在properties标签当中定义一个自定义标签，设置版本号

在使用的时候，用${自定义标签名}方式使用

```xml
<properties>
        <jdbc.mysql>6.0.6</jdbc.mysql>
    </properties>
    
<!--            使用指定版本号-->
            <dependency>
                <groupId>mysql</groupId>
                <artifactId>mysql-connector-java</artifactId>
                <version>${jdbc.mysql}</version>
            </dependency>
```

