---
typora-root-url: images
---

# 一、简介

## 1.技术前提

了解linux

修改虚拟机ip为静态：

+ vim /etc/sysconfig/network-scripts/ifcfg-ens33
  + BOOTPROTO="static"
  + IPADDR="192.168.146.101"
  + NETMASK=255.255.255.0
  + GATEWAY=192.168.146.2
  + DNSI=192.168.146.2
+ 重启网络服务：systemctl restart network

## 2.应用背景

软件在windows上开发完成后，把jar或war包交给运维，运维部署到linux或阿里云时，可能会因为环境不同或配置不同，而导致不能正常工作。用docker就可能方便的解决该问题。

## 3. 工作原理

如果到宠物店只买回一条鱼，回家后可能因为环境不适应而死亡，而从宠物店买回的是带鱼缸和鱼这一整套环境就不会出问题。也就是从系统底层至上层整体打包成镜像文件，从而达到完全跨平台的到处运行。



## 4.Docker与虚拟机的区别

Docker是一个精简版的虚拟机，只是少了对操作系统和硬件的虚拟，所以启动速度是秒级的,而虚拟机的启动则是分钟级的。

Docker是基于Go语言实现的云开源项目，**Docker 属于 Linux 容器的一种封装，提供简单易用的容器使用接口。**它是目前最流行的 Linux 容器解决方案。

Docker的主要目标是“build，Ship and Run Any App，Anywhere”，也就是通过对应用组件的封装、分发、部署、运行等生命周期的管理，使用户的APP（可以是一个WEB应用或数据库应用等等）及其运行环境能够做到“一次封装，到处运行”。
将应用运行在Docker容器上面，而Docker容器在任何操作系统上一致的，这就是实现了跨平台、跨服务器。只需要一次配置好环境，换到别的机器上就可以简化操作、一键部署。

![01.docker和虚拟机](/01.docker和虚拟机.png)

![02.docker和虚拟机](/02.docker和虚拟机.png)

## 5.Docker的组成

docker三要素：镜像、容器、仓库

+ 镜像：相当于java中的类,如Person。应用程序和配置及依赖打包成一个可运行的环境，这个包就是镜像文件。


+ 容器：相当于new Person产生对象,容器是以镜像为模板产生，可把容器看成镜像一个简化版的linux环境和若干运行在其中的应用程序。


+ 仓库：是集中存放镜像的地方。


+ 仓库注册服务器：放着多个仓库。

![03.docker架构](/03.docker架构.jpg)

# 二、安装

## 1.下载Dcoker依的赖环境

```
#yum install -y yum-utils device-mapper-persistent-data lvm2
yum install -y device-mapper-persistent-data lvm2
```

lvm2（LogicalVolume Manage，Version2），逻辑卷管理工具。它是Linux环境下对磁盘分区进行管理的一种机制，将一个或多个底层块设备组织成一个逻辑设备。通过LVM管理员可以轻松管理磁盘分区，使用LVM与传统的分区方法相比有很多的优势，如：容量的分配更加灵活、逻辑卷的扩展和缩减更加方便、使用snapshot（快照）来备份数据也非常方便。通过本文你可以快速了解LVM2的使用方法。



## 2.指定Docker镜像源 

```
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

如果安装出错，可以进入到  /etc/yum.repos.d目录下，将dockerxxx.repo相关的文件删除后，再次使用上述命令来指定镜像。

## 3. 安装Docker

```
yum makecache fast   #为加快安装速度，对缓存加速
yum -y install docker-ce
```

如果 /etc/ yum.repos.d/

## 4.查看版本

docker version 或  docker --version

```
#简单的版本信息
docker --version
#详细的版本信息
docker version
```

## 5.启动Docker并测试

+ 启动docker:   systemctl start docker
+ 重启:  systemctl restart docker
+ 卸载docker:   yum remove docker
+ 设置开机启动:  systemctl enable docker

## 6. 云镜像仓库

是一个代理仓库，放了一些镜像，因为中央仓库https://hub.docker.com是国外网站，非常慢，有两个云可用，网易云和阿里云，推荐使用阿里云，更全面，其镜像地址：https://www.aliyun.com/product/acr

获取加速器地址的方法如下：

+ 注册-->可使用淘宝帐号注册,搜索容器镜像服务

+ 获取加速器地址：通过网址https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors获取

+ 配置加速器

  + mkdir /etc/docker

  + vi /etc/docker/daemon.json

  + 内容如下：每个帐号都不同，使用下面一个也可以。

    {
      "registry-mirrors": ["https://c40fbq35.mirror.aliyuncs.com"]
    }

  + 使配置生效：systemctl daemon-reload，systemctl restart docker

    ```
    #加载文件
    systemctl daemon-reload
    #重新启动
    systemctl restart docker
    ```

    

+ helloworld镜像生成容器:docker run hello-world，默认先从本地的镜像中找，没找到就从阿里云中找其镜像并拉取。



# 三、docker常用命令

## 1. 帮助命令

+ docker info---查看docker的总体信息


+ docker help---查看docker有哪些命令

## 2. 镜像操作

### 	什么镜像

​		镜像是一种轻量级的、可以执行的独立软件包，用来打包软件运行环境和基于运行环境的软件，她包含某个软件锁需要的所有内容，包括代码、运行时库、环境变量和配置文件。

​	    在 Docker 中，一个只读层被称为镜像，一个镜像是永久不会变的。由于 Docker 使用一个统一文件系统，Docker 进程认为整个文件系统是以读写方式挂载的。 但是所有的变更都发生顶层的可写层，而下层的原始的只读镜像文件并未变化。由于镜像不 可写，所以镜像是无状态的。

<img src="/04.docker-filesystems-multilayer.png" alt="04.docker-filesystems-multilayer" style="zoom:50%;" />



​		bootfs（boot file system）主要包含bootloader和kernel，bootloader主要是引导加载kernel，Linux刚启动时会加载bootfs文件系统，在Docker镜像的最底层是bootfs，这一层和Linux、Unix系统是一样的，包含boot加载器和内核。当boot加载完成之后整个内核都在内存中了，此时内存的使用权已经由bootfs转交给内核，此时系统也会卸载bootfs。
​		rootfs（foot file system），在bootfs之上，包含的就是典型的Linux系统中的/dev ,/proc,/bin等标准目录和文件，rootfs就是各种不同的操作系统发行版，比如说Ubuntu，Centos，Redhat等 

   镜像是层叠式的，上面的镜像依赖于下面的镜像。镜像是只读的，不能写操作。 联合文件系统

<img src="/05.docker-filesystems-multilayer.png" alt="05.docker-filesystems-multilayer" style="zoom:50%;" />

- 查看仓库里有什么对应的镜像

  docker search  镜像名

- 查看镜像
  + docker images---查看有哪些镜像，repository表示镜像的仓库源，tag是版本，image id是镜像的唯一ID,created是创建时间，size是镜像大小。
  + docker images -a---查看镜像及中间映像层，也就是一个表面镜像内部还包含了哪些镜像。
  + docker images -q---只显示镜像ID

- 下载镜像

  语法： docker pull  镜像名:版本号

  + docker pull nginx,相当于docker pull nginx:latest下载最新版本。
  + docker pull tomcat:8.5.32

- 删除镜像
  + docker rmi hello-world---失败，因为提示说该镜像的容器正在运行，
  + **docker rmi -f hello-world- --强制删除**

## 3. 容器操作

### 3.1 创建并启动容器

以centos镜像为例演示

+ docker pull centos---从阿里上拉取centos镜像
+ docker run -it centos---启动容器，i为交换模式，t为打开终端，it常常一起使用，exit退出
+ docker run -it --name mycts centos---启动并指定容器名称，上面没指定都会随机给个名字

### 3.2 查看有哪些容器

- docker ps  查看正在**运行**的容器
- docker ps -q  ---只显示容器id
- docker ps -a  列表形式查看所有的容器
- docker ps -qa   查看所有，包括没有运行的容器



### 3.3 停止和启动容器

+ exit---从终端退出并可能停止容器，ctrl+p+q（键盘）退出但容器仍然运行。
+ docker stop aea7a56b0c7d或容器名---停止容器
+ docker start 容器名或容器id  重新启动被停止的容器

### 3.4 删除容器

不是停止，停止后容器还在，只是不运行了

- **docker rm** 容器id或名称---注意，必须先关闭容器才能删除，rmi是删除镜像
- docker rm -f $(docker ps -aq)---批量删除

### 3.5 进入容器的内部进行操作

docker exec -it 容器id bash

### 3.6 容器与宿主机间拷贝文件

+ 从容器中拷贝到宿主机

  ```
  docker run -it centos
  
  cd /tmp
  
  vi hello.txt
  
  ctrl+p+q
  
  docker ps
  
  docker  cp  容器id:/tmp/hello.txt  /opt
  ```

  

+ 从宿主机拷贝到容器

  docker cp  /opt/a.txt  容器id:/tmp

# 四.  数据卷/目录挂载

## 1. 有什么用

+ 目录映射：

  为方便宿主机与容器间传递数据，产生目录映射，使两者共享同一目录。使用数据卷可将宿主机上的一个目录映射到容器的一个目录中。

+ 持久化容器数据

  容器运行中所产生的数据，如果不通过commit生成新镜像，当容器被删除后数据就丢失了。使用数据卷可在不产生新镜像的前提下保存数据在磁盘上，有点像redis中的持久化。

+ 部署项目方便

为了部署项目，需要使用到cp命令将宿主机内的war包复制到容器内部。

使用数据卷可以在宿主机中操作目录中内容，那么容器内部映射的文件，也会跟着一起改变

## 2. 特点

- 数据卷可在容器之间共享
- 修改卷中数据可以直接生效，并且对卷的修改不会引起镜像的更新。
- 卷的生命周期一直持续到没有容器使用它为止。

## 3. 产生数据卷

docker run -di -v /myData:/myContainerData --name myc1  centos

```
docker run -di -v /mydata:/opt --name myc1  centos
```

参数说明：

+ -di:产生交互式后台进程
+ -v:创建一个目录数据卷并挂载到容器里,myData是宿主机中目录，myContainerData是容器中目录
+ --name:给容器启一名称为myc1
+ centos：镜像名（如果是其他的，则换其名称）



docker volume prune 清除所有的数据卷

## 4. 测试

+ vim /myData/a.txt
+ docker exec -it myc1 bash
+ cat /myContainerData/a.txt
+ 

# 五. docker应用部署

## 1. MYSQL部署

### a. 拉取镜像

+ 搜索mysql镜像：docker search mysql


+ 拉取镜像：docker pull centos/mysql-57-centos7  ，镜像选择的是centos/mysql-57-centos7

### b. 启动mysql容器

```
docker run -di --name=mysql5.7 -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root centos/mysql-57-centos7

docker run -di --name=mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root  mysql
```

参数说明：

+ -di:  以守护进程交互式启动容器
+ --name:  给容器启名为mysql5.7
+ -p:  端口映射，格式为：**宿主机端口：容器端口**，为什么要映射？因为容器的ip地址跟windows的ip不在一个网段，无法通信。从win7访问容器就只能通过win7访问宿主机(虚拟机)的ip+映射的端口。
+ -e:  当从win7远程连接容器mysql时，要设置root帐号的密码，这里设置远程连接密码为root,但要注意：在进入容器内访问时，密码是空的。
+ 最后一个参数：是上面下载的镜像名.

### c. 连接mysql

#### 1. 容器本地连接

+ docker exec -it mysql5.7 bash


+ mysql -uroot -p  ，密码为空，回车

#### 2. win10远程连接

mysql    -uroot    -proot    -h192.168.146.101   ，默认连接的是3306，如果映射的宿主机不是3306，则后面添加   -P3306

**mysql8.0遇到的问题**

![image-20221128174837761](/C:/Users/mameiping/AppData/Roaming/Typora/typora-user-images/image-20221128174837761.png)

2026问题：

方案一：

my.cnf中增加

```
skip_ssl
```

方案二：

```
mysql -uroot -p123456 -h192.168.33.10 -P3306 --ssl-mode=DISABLED
```

2059问题：

```
ALTER USER 'root'@'localhost' IDENTIFIED BY 'password' PASSWORD EXPIRE NEVER;
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '123456';
FLUSH PRIVILEGES;
```



## 2. tomcat部署

### 去仓库当中查找

```
docker search tomcat
```

### 查找镜像

```
docker images tomcat
```

### 拉取镜像

最新版本不需要指定版本号

```bash
#docker pull tomcat:版本号，最新版不需要版本号
docker pull tomcat:8.5
```

### 启动并运行容器

```bash
docker run -di -p 8080:8080 -v /opt/data:/usr/local/tomcat/webapps/ --name mytomcat  tomcat:8.5
```

### 在windows主机上访问

```
http://192.168.33.10:8080/
```

如果出现404，则是因为版本中的webapps当中没有内容。进行以下将webapps删除，并且将webapps.dist改名为webapps

```bash
#进入容器，会进入usr/local/tomcat目录
docker exec -it mytomcat /bin/bash
#查看内容，会发现有webapps和webapps.dist
ls -l
#查看webspps当中的内容，会发现是空的,退到上一层目录，移除webapps
cd webapps
ls -l
cd ..
rm -rf webapps
#将webapps.dist变成webapps
mv webapps.dist webapps
```

再次在浏览器中访问。

### 2.1 自定义war

+ 将window当中打好的war上传到Linux（docker01.war）

- 将war拷贝放入数据卷目录

  ```bash
  cp /home/vagrant/docker01.war /opt/data
  ```

+ 测试：http://192.168.33.10:8080/docker01




## 3. nginx部署

### 3.1 拉取镜像

docker pull nginx

### 3.2 启动容器

+ docker run -d --name mynginx1 -p 80:80 nginx bash

+ 配置文件在/etc/nginx/nginx.conf,默认没有vi命令

+ 拷贝nginx目录到宿主机：

  + ctr+p+q
  + docker ps
  + docker cp mynginx1:/etc/nginx   /opt/data

+ 删除容器：docker stop mynginx1--》docker rm mynginx1

+ 启动容器并添加数据卷：

  docker run  -v  /opt/data/nginx:/etc/nginx   -di --name mynginx  -p 80:80 nginx

### 3.3 测试

http://192.168.146.101/

## 4. redis部署

### 4.1. 拉取redis

docker pull redis

### 4.2 启动容器 

以aop方式持久化，如果用rdb则不加--appendony yes

docker run -d --name myredis -p 6379:6379 redis --appendonly yes

### 4.3 进入redis容器

+ 进入容器

docker exec -d myredis bash

+ 启动客户端
  + cd /usr/local/bin
  + redis-cli

## MinIO安装

官网地址

https://www.minio.org.cn/

什么是MinIO

OSS：对象存储的中间件

前提

1、在[服务器](https://cloud.tencent.com/product/cvm?from=10680)的安全组和防火墙中放通相对应的端口，操作系统：centos 7.6，需要放通9000端口

2、登录自己的Linux系统服务器

3、关闭服务器内部的firewalld防火墙

4、开启内核端口转发：

通过vim /etc/sysctl.conf把里面的net.ipv4.ip_forward = 0修改为net.ipv4.ip_forward = 1后进行保存退出，通过sysctl -p命令使修改后的内核转发文件生效

5、下载安装好[docker](https://cloud.tencent.com/product/tke?from=10680)

6、安装配置好镜像加速源（由于正常拉取镜像是从境外的docker官网拉取，建议设置镜像加速源）

### 查看镜像

```
docker search minio
```

### 拉取镜像

```
docker pull minio/minio

```

### 创建并启动minIO容器

这里的 \ 指的是命令还没有输入完，还需要继续输入命令，先不要执行的意思。
这里的9090端口指的是minio的客户端端口。虽然设置9090，但是我们在访问9000的时候，他会自动跳到9090。

MINIO_ACCESS_KEY：登录的用户名

MINIO_SECRET_KEY：登录的密码

20以后的命令

```
docker run -p 9000:9000 -p 9090:9090 \
 --net=host \
 --name minio \
 -d --restart=always \
 -e "MINIO_ACCESS_KEY=minioadmin" \
 -e "MINIO_SECRET_KEY=minioadmin" \
 -v /opt/minio/data:/data \
 -v /opt/minio/config:/root/.minio \
 minio/minio server \
 /data --console-address ":9090" -address ":9000"

```

【WARNING: Published ports are discarded when using host network mode
744135519b57a75d58b6c4bac2bee74a83a03b38e146db33426616ce921b49ac】  不影响使用

### 访问服务器

```
http://192.168.33.10:9090/
```



### 时间冲突

[MinIO上传文件The difference between the request time and the server's time is too large.异常

```shell
# 安装ntp ntpdate
yum -y install ntp ntpdate

#与时间服务器同步时间
ntpdate cn.pool.ntp.org

#将系统时间写入硬件时间
hwclock --systohc
```



## RabbitMQ安装

### 查看仓库

```bash
docker search rabbitmq
```



### 拉取镜像

```bash
docker pull rabbitmq
```

### 创建并启动容器

#### 指定用户名/密码启动

```shell
docker run -d --name rabbitmq \
	-p 5672:5672 -p 15672:15672 \
	-v `pwd`/data:/var/lib/rabbitmq \
	--hostname myRabbit \
	-e RABBITMQ_DEFAULT_VHOST=my_vhost  \
	-e RABBITMQ_DEFAULT_USER=admin -e \
	RABBITMQ_DEFAULT_PASS=admin rabbitmq
```

-d 后台运行容器；
	--name 指定容器名；
	-p 指定服务运行的端口（5672：应用访问端口；15672：控制台Web端口号）；
	-v 映射目录或文件；
	--hostname  主机名（RabbitMQ的一个重要注意事项是它根据所谓的 “节点名称” 存储数据，默认为主机名）；
	-e 指定环境变量；
		（RABBITMQ_DEFAULT_VHOST：默认虚拟机名；
		RABBITMQ_DEFAULT_USER：默认的用户名；
		RABBITMQ_DEFAULT_PASS：默认用户名的密码）

#### 不指定用户名密码启动

默认用户名和密码都是guest

```shell
docker run -d --name rabbitmq 	\
      -p 5672:5672 -p 15672:15672   rabbitmq
```



### 安装插件

```bash
docker exec -it rabbitmq bash
rabbitmq-plugins enable rabbitmq_management
```



### 客户端访问

```bash
http://192.168.33.10:15672
```



# 自定义镜像

## 1. Dockerfile介绍

使用Dockerfile可以根据需求开发一个自定义的镜像，其实就是一个文本文件，由一系列命令和参数构成，Docker可读取这个文件构建一个镜像。

## 2. 创建jdk镜像

+ 向/opt/data/jdk目录添加jdk压缩文件

+ 在/opt/data/jdk目录中创建并编辑Dockerfile文件

  vim Dockerfile   ，添加下面内容：

  ```
  FROM centos:7
  MAINTAINER aowin
  WORKDIR /usr
  RUN mkdir /usr/local/java
  ADD jdk-8u261-linux-x64.tar.gz /usr/local/java/
  ENV JAVA_HOME /usr/local/java/jdk1.8.0_144
  ENV JRE_HOME $JAVA_HOME/jre
  ENV CLASSPATH $JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar:$JAR_HOME/lib:$CLASSPATH
  ENV PATH $JAVA_HOME/bin:$PATH
  ```

+ 编译并构建镜像，镜像名为jdk1.8

  docker build -t='jdk1.8'  ./

+ 查看镜像

  docker images

+ 通过镜像jdk1.8创建容器myjdk

  docker run -it --name myjdk jdk1.8 bash

## 3. 微服务部署

### 3.1 上传jar包

在/opt/data/eureka目录中添加eureka-server-1.0.jar

​	<span style="color:blue">注意eureka-server打包时，指定的主机和端口号，需要是192.168.146.101:7100</span>

### 3.2 查找jdk镜像

+ docker search jdk   得到ascdc/jdk8镜像，也可使用前面创建的镜像jdk1.8

### 3.3 编辑Dockerfile

+ 在/opt/data/eureka中创建并编辑Dockerfile文件

  ```
  #基于哪个镜像
  FROM ascdc/jdk8
  #目录挂载，将本地文件夹挂载到当前容器,这里用不着，了解
  VOLUME /tmp
  #将文件复制到容器指定目录
  ADD eureka-server-1.0.jar /usr/local/java/
  #暴露服务的端口
  EXPOSE 7100
  #设置容器启动后要自动执行的命令
  ENTRYPOINT ["java","-jar","/usr/local/java/eureka-server-1.0.jar"]
  
  ```
  
  ENTRYPOINT ：如果有多个ENTRYPOINT ，只有最后一个起作用

### 3.4 生成镜像并测试

+ 编译并创建镜像

  docker build -t='eureka-server' ./

+ 查看生成的镜像：docker images

+ 启动容器：

  + 前台启动：docker run -p 7100:7100 eureka-server
  + 后台启动：docker run -di -p 7100:7100 eureka-server


+ 192.168.146.101:7100



