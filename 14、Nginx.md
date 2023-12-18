---
typora-root-url: 图例
---
```
njcb1234
```


# Nginx 基础

## 1. 域名解析



一个域名一定会被解析为一个或多个 ip，一般包含两步：

- 本地域名解析

  浏览器会首先在本机的 hosts 文件中查找域名映射的 IP 地址，如果找到就返回 IP，没找到则进行域名服务器解析，一般本地解析都会失败，因为默认这个文件是空的。

  Windows 下的 hosts 文件地址：C:/windows/system 32/drivers/etc/hosts

  Linux 下的 hosts 文件所在路径： /etc/hosts

- 域名服务器解析

  本地解析失败，才会进行域名服务器解析，域名服务器就是网络中的一台计算机，里面记录了所有注册备案的域名和 IP 映射关系，一般只要域名是正确的，并且备案通过，一定能找到。

## 2. Nginx 简介

是一个 WEB 服务器，是一个高性能的反向代理的服务器、还是一个负载均衡服务器，同时还可以实现动静分离。

特点：在高并发和处理静态资源上相对于 tomcat 有更多优势.

+ 什么是反向代理

  + 正向代理：客户端先进行代理服务器的设置，客户端发送请求到代理服务器，代理服务器将请求转发至原始服务器。代理服务器所代理的对象是很多个客户端。

  + 反向代理：对于客户而言反向代理就像原始服务器, 客户不需要作任何设置，客户端发送请求，直接发送到代理服务器，代理服务器判断向何处转发请求, 并将获得的内容返回给客户端。反向代理是对多个服务器进行代理

+ 什么是负载均衡

  可以按照调度规则实现动态、静态页面分离，可以按照轮询、ip 哈希、权重等多种方式实现将请求平均分配到后端服务器上

  

## 3. Docker 安装



### 3.1 拉取镜像

Docker pull nginx

### 3.2 启动容器

+ docker run -d --name mynginx 1 -p 80:80 nginx bash

+ 配置文件在/etc/nginx/nginx. Conf, 默认没有 vi 命令

+ 拷贝 nginx 目录到宿主机：

  + docker cp mynginx 1:/etc/nginx   /opt/nginx

  + docker cp mynginx 1:/usr/share/nginx/html  /usr/share/nginx/html

    

+ 删除容器：docker stop mynginx 1--》docker rm mynginx 1

+ 启动容器并添加数据卷：

+ docker run  -v  /opt/data/nginx:/etc/nginx   -di --name mynginx  -p 80:80 nginx

  ​		  

  

## Yum 安装

1. 安装 yum 仓库 yum-utils

   ```shell
   #可以不执行，当出现版本问题时，再进行更新
   sudo yum install yum-utils -y
   ```

2. 创建/etc/yum. Repos. D/nginx. Repo 文件，

   ```
   vi /etc/yum.repos.d/nginx.repo
   ```

   内容如下

   ```shell
   [nginx-stable]
   name=nginx stable repo
   baseurl=http://nginx.org/packages/centos/$releasever/$basearch/
   gpgcheck=1
   enabled=1
   gpgkey=https://nginx.org/keys/nginx_signing.key
   module_hotfixes=true
   
   #[nginx-mainline]
   #name=nginx mainline repo
   #baseurl=http://nginx.org/packages/mainline/centos/$releasever/$basearch/
   #gpgcheck=1
   #enabled=0
   #gpgkey=https://nginx.org/keys/nginx_signing.key
   #module_hotfixes=true
   ```

   Nginx-stable: 稳定版的信息。一般情况下使用此版本

   Nginx-mainline：主力版本（或开发版本），如果想要安装此版本，可以先使用如下命令，再安装

   使用 stable 版本，下面这句话不要执行

   ```shell
   #使用stable版本，下面这句话不要执行
   sudo yum-config-manager --enable nginx-mainline
   ```

3. 安装

   ```shell
   sudo yum install nginx -y
   ```

4. 启动测试

   ```shell
   nginx
   ```

5. 在 windows 主机上输入 http://192.168.33.10

6. 其它命令

   ```shell
   #停止
   nginx  -s  stop
   #重启
   nginx -s reopen
   #检查是否有语法错误
   nginx -t
   #重新加载
   nginx  -s  reload
   #查看版本
   nginx  -V  或nginx -v
   #查看80端口的程序
   netstat –ano | grep 80
   #卸载Nginx
   yum remove nginx
   ```

关闭防火墙 (需要重启)：chkconfig  iptables off

卸载步骤：

```
卸载时
1：先停止nginx服务 nginx -s stop
2：查找nginx目录文件：find / -name nginx
3: 依次删除找到的目录：rm -rf /usr/sbin/nginx
4：使用yum清除 yum remove nginx
```

其它 Linux 版本的安装请参考以下文档：

http://nginx.org/en/linux_packages.html#RHEL-CentOS

### 配置文件位置

/etc/nginx  

主配置文件 ngixn. Conf

每个服务器配置的 conf. D 目录下

主启动页：/usr/share/nginx/html

# 四、nginx 信号量

## 1. 工作模式

​		nginx 是一个多进程/多线程高性能 web 服务器，在 linux 系统中，nginx 启动后会以后台守护进程（daemon）的方式去运行，后台进程包含一个 master 进程和多个 worker 进程（可以通过在 nginx. Conf 配置文件中配置 worker_processes 参数设置），可以充分利用多核架构。

 		Nginx 默认的工作模式是以多进程的方式来工作的，nginx 也是支持多线程的方式的，只是我们主流的方式还是多进程的方式。Nginx 在启动之后会有一个 master 进程和多个 worker 进程（默认是一个），多个 worker 子进程将监听同一个端口，并行处理请求。Worker 进程数应该设置为等于 CPU 的核数，高流量并发场合也可以考虑将进程数提高至 CPU 核数 * 2。

​		master 主进程主要用来管理 worker 进程，主要作用是：读取并验正配置信息，管理真正提供服务的 worker 进程，向各 worker 进程发送信号，监控 worker 进程的运行状态，当 worker 进程退出后 (异常情况下)，会自动重新启动新的 worker 进程。Master 进程不会对用户请求提供服务，而用户的请求则是 worker 进程来响应的。

​		nginx 是通过信号来控制，比如关闭，重启等去控制 nginx 进程。Nginx 信号是属于 nginx 进程间的通信的一种机制，比如 master 主进程控制多个 worker 子进程，也是通过信号控制的，如下图。

![工作模式](/工作模式.png)

## 2. 信号量

信号控制语法

​	***kill -信号选项 nginx 的主进程号***

- TERM，INT：快速关闭
- QUIT ：从容关闭（优雅的关闭进程, 即等请求结束后再关闭）
- HUP ：平滑重启，重新加载配置文件 （平滑重启，修改配置文件之后不用重启服务器。直接 kill -PUT 进程号即可）
- USR 1 ：重新读取日志文件，在切割日志时用途较大（停止写入老日志文件，打开新日志文件，之所以这样是因为老日志文件就算修改的文件名，由于 inode 的原因，nginx 还会一直往老的日志文件写入数据）
- USR 2 ：平滑升级可执行程序，nginx 升级时候用
- WINCH ：优雅的关闭旧的进程 (配合上 USR 2 来进行升级)

```shell
#查找nginx .pid
Find / -name nginx. Pid
#查看nginx .pid 的进程 id ==》结果为 4851
Cat /var/run/nginx. Pid
#关闭nginx进程 （id 号为 4851，每次都不一样，会变化，需要查找）
#关闭后无法访问 ，需要重新启动
Kill -QUIT 4851
```



# 五、nginx 的配置



![配置文件结构](/配置文件结构.png)

## 1. Main 全局配置

Nginx 在运行时与具体业务功能（比如 http 服务或者 email 服务代理）无关的一些参数，比如工作进程数，运行的身份等。

```shell
## 指定 nginx 进程使用什么用户启动，默认是 nobody
user       www www ;  
#指定启动多少进程来处理请求 ，一般情况下设置成 CPU 的核数。默认为1
Worker_processes  4;  
#在高并发情况下 ，通过设置将 CPU 和具体的进程绑定来降低由于多核 CPU 切换造成的寄存器等现场重建带来的性能损耗。
#位数和进程数相关 。
#两个cpu内核开启两个进程
#worker_processes  2;  
#worker_processes  01 10；分别对应第一个 CPU 内核，第二个 CPU 内核  
worker_cpu_affinity 0001 0010 0100 1000;  #分别对应第一个CPU内核 ……第四个 CPU 内核 
# Error_log 是个主模块指令，用来定义全局错误日志文件。
#日志输出级别有debug 、info、notice、warn、error、crit 可供选择，其中，debug 输出日志最为最详细，而 crit 输出日志最少。
Error_log  logs/error. Log crit;
#指定进程pid文件的位置 。
Pid        logs/nginx. Pid;
#用于指定一个nginx进程可以打开的最多文件描述符数目 ，需要使用命令“ulimit -n 8192”来设置。
Worker_rlimit_nofile 8192;
```

## 2. Events 模块

```shell
Events {
  #每一个worker进程能并发处理 （发起）的最大连接数（包含与客户端或后端被代理服务器间等所有连接数）。
  #默认是1024
  #进程的最大连接数受Linux系统进程的最大打开文件数限制 ，最大不能超过 worker_rlimit_nofile 的值
  Worker_connections  4096;  
  #use是个事件模块指令 ，用来指定 Nginx 的工作模式。
  #Nginx支持的工作模式有select 、poll、kqueue、epoll、rtsig 和/dev/poll。
  # 其中 select 和 poll 都是标准的工作模式，kqueue 和 epoll 是高效的工作模式，
  # 不同的是 epoll 用在 Linux 平台上，而 kqueue 用在 BSD 系统中。对于 Linux 系统，epoll 工作模式是首选。
  # use [ kqueue | rtsig | epoll | /dev/poll | select | poll ] ;
  Use epoll;
}
```

## 3. Http 服务器

```shell
#include是个主模块指令 ，实现对配置文件所包含的文件的设定，可以减少主配置文件的复杂度。
#类似于Apache中的include方法 。
Include    conf/mime. Types;
Include    /etc/nginx/proxy. Conf;
Include    /etc/nginx/fastcgi. Conf;
#定义路径下默认访问的文件名
Index    index. Html index. Htm index. Php;
#default_type属于HTTP核心模块指令 ，这里设定默认类型为二进制流，也就是当文件类型未定义时使用这种方式。
#例如在没有配置PHP环境时 ，Nginx 是不予解析的，此时，用浏览器访问 PHP 文件就会出现下载窗口。
Default_type application/octet-stream;
```

### 3.1 客户端 head 缓存

```shell
#服务器名字的hash表大小
Server_names_hash_bucket_size 128;
#用来指定来自客户端请求头的header buffer 大小。
Client_header_buffer_size 32 k; 
#用来指定客户端请求中较大的消息头的缓存最大数量和大小 ，4 为个数，128 k 为大小，最大缓存为 4 个 128 KB。
Large_client_header_buffers 4 128 k; 
#允许户端请求的最大单个文件字节数 。如果有上传较大文件，请设置它的限制值。
Client_max_body_size 10 m; 
#缓冲区代理缓冲用户端请求的最大字节数 。
Client_body_buffer_size 128 k; 
#高效文件传输模式 ，sendfile 指令指定 nginx 是否调用 sendfile 函数来输出文件，
#减少用户空间到内核空间的上下文切换 。对于普通应用设为 on，
# 如果用来进行下载等应用磁盘 IO 重负载应用，可设置为 off，以平衡磁盘与网络 I/O 处理速度，降低系统的负载。
# 开启 tcp_nopush on; 和 tcp_nodelay on; 防止网络阻塞。
Sendfile on ; 
Tcp_nopush on;
Tcp_nodelay on;
#长连接超时时间 ，单位是秒，65 s 内没上传完成会导致失败。
Keepalive_timeout 65 : 
#用于设置客户端请求主体读取超时时间 ，默认是 60 s。
Client_body_timeout 60 s;
#用于指定响应客户端的超时时间 。
Send_timeout 60 s;
```



### 3.2 FastCGI 参数

FastCGI 相关参数是为了改善网站的性能：减少资源占用，提高访问速度。

```shell
#指定连接到后端FastCGI的超时时间 。
Fastcgi_connect_timeout 300;  
#指定向FastCGI传送请求的超时时间 ，此值是已经完成两次握手后向 FastCGI 传送请求的超时时间。
Fastcgi_send_timeout 300;  
#指定接收FastCGI应答的超时时间 ，此值是已经完成两次握手后接收 FastCGI 应答的超时时间。
Fastcgi_read_timeout 300; 
#用于指定读取FastCGI应答第一部分需要多大的缓冲区 。
# 此值表示将使用 1 个 64 KB 的缓冲区读取应答的第一部分（应答头）
Fastcgi_buffer_size 64 k; 
# 指定本地需要用多少和多大的缓冲区来缓冲 FastCGI 的应答请求。
Fastcgi_buffers 4 64 k;  
#默认值是fastcgi_buffers的两倍 。
Fastcgi_busy_buffers_size 128 k;  
#表示在写入缓存文件时使用多大的数据块 ，默认值是 fastcgi_buffers 的两倍。
Fastcgi_temp_file_write_size 128 k;
#表示开启FastCGI缓存并为其指定一个名称 。开启缓存非常有用，可以有效降低 CPU 的负载，并且防止 502 错误的发生。
Fastcgi_cache TEST;  
#FastCGI缓存指定一个文件路径 、目录结构等级、关键字区域存储时间和非活动删除时间。
fastcgi_cache_path /usr/local/nginx/fastcgi_cache levels=1:2 keys_zone=TEST: 10 m inactive=5 m;  
#用来指定应答代码的缓存时间 。
#实例中的值表示将200和302应答缓存一个小时 。
Fastcgi_cache_valid 200 302 1 h;  
#将301应答缓存1天 ，其他应答均缓存 1 分钟。
Fastcgi_cache_valid 301 1 d;
#
Fastcgi_cache_valid any 1 m; 
```



### 3.3 gzip 模块设置

```shell
#开启gzip压缩输出
Gzip on;
#最小压缩文件大小 ，页面字节数从 header 头的 Content-Length 中获取。默认值为 0，不管多大页面都压缩，建议设置成大于 1 K 的字节数，小于 1 K 可能会越压越大。
Gzip_min_length 1 k;
#压缩缓冲区 ，表示申请四个 8 K 的内存作为压缩结果流缓存
#默认是申请与原始数据大小相同的内存空间来存储gzip压缩结果 。
Gzip_buffers    4 8 k;
#用于设置识别HTTP协议版本 ，默认是 1.1
#（默认 1.1，前端如果是 squid 2.5 请使用 1.0）
Gzip_http_version 1.1;
#压缩等级 ，1 压缩比最小，处理速度最快，9 压缩比最大，传输速度快，但是消耗 CPU 资源。
#范围1 ~9
Gzip_comp_level 5;
#压缩类型 ，默认已包含 text/html。
Gzip_types text/html text/plain text/css text/javascript application/json application/javascript application/x-javascript application/xml;
#和http头有关系 ，会在响应头加个 Vary: Accept-Encoding ，
# 可以让前端的缓存服务器缓存经过 gzip 压缩的页面，例如，用 Squid 缓存经过 Nginx 压缩的数据。
Gzip_vary on;
#Nginx作为反向代理的时候启用 ，决定开启或者关闭后端服务器返回的结果是否压缩，
#  匹配的前提是后端服务器必须要返回包含”Via”的 header 头。
#gzip_proxied any;
```



## 4. Nginx 配置虚拟主机

### 4.1 配置虚拟主机流程

1：拷贝一段完整的 server 段，并放入 http 标签内

2：更改 server_name 以及对应网页的 root 根目录

3：创建 server_name 对应网页的根目录，如果没有 index 首页会出现 404错误。

4：对客户端 server_name 的主机做 host 解析或 DNS 配置。

5：浏览器访问，或者在 Linux 客户端做 host 解析，用 wget 或 curl 访问。

```nginx
Server {
         Listen 80;
         Server_name localhost;
         Index index. Html index. Htm;

         Location /emp {
         			#在/opt/project目录下存放各种html文件
                    Root /opt/project;
                    #默认的首页
                    Index index. Html index. Htm;
         }
   }

#浏览器中使用localhost/emp来访问对应的资源
```

如果出现 502,503 错误，尝试临时关闭 SELinux 后再测试。

```shell
#临时关闭SELinux
Setenforce 0
永久关闭：
#输入命令 （需要重启服务器）
Vim /etc/selinux/config
#设置config文件中的SELINUX =enforcing 改为 SELINUX=disabled，然后退出保存。
```

如果出现 403 错误，用以下方式解决

- 看 log，查看路径是否正确
- 如果路径正确，则确认配置文件中用户是什么，修改和当前用户匹配（如果当前用户为 root，请也将用户改成 root）。

### 4.2 location 模块语法规则

Location 的语法规则有两种：前缀字符串（路径名）和正则表达式

- 前缀字符串

```shell
#匹配以/some/path/开头的路径 ，如：/some/path/domt. Html
Location /some/path/ { }
```

- 正则表达式

  正则表达式前加上“~”表示区分大小写，加上"~*"表示不区分大小写

  ※当使用插入符时“^~"则表示只匹配前缀字符串，不匹配正则表达式



Location [=|~|~*|^~] /uri/ { … }**  

- =     精确匹配，如果找到匹配=号的内容，立即停止搜索，并立即处理请求 (优先级最高)
- ~     区分大小写
- ~*  不区分大小写
- ^~  只匹配字符串，不匹配正则表达式
- /    通用匹配，任何请求都会匹配到

```nginx
#匹配跟目录
Location =/ {
	
}
#各种图片格式结尾的 （正则匹配）
# ~ 区分大小写
# . 匹配除换行符之外的任何字符
# * 匹配 0 或多次
#\ 转义字符 \. 匹配点好（.)
Location ~ .*\. (gif|jpg|jpeg|png|bmp|icon)$ {
}
#将所有请求都交给
Location / {

}
```



# 六、nginx 动静分离

## 1. 什么是动静分离

在 Web 开发中，通常来说，动态资源其实就是指那些后台资源，而静态资源就是指 HTML、JavaScript、CSS、img 等文件。

动静分离就是将动态资源和静态资源分开，将静态资源部署在 Nginx 上。当一个请求来的时候，如果是静态资源的请求，就直接到 nginx 配置的静态资源目录下面获取资源，如果是动态资源的请求，nginx 利用反向代理的原理，把请求转发给后台应用去处理，从而实现动静分离。

优点：

- 可以很大程度的提升静态资源的访问速度。
- 前后端可以并行开发、有效地提高开发效率。

## 2. Nginx 结合 tomcat 实现动静分离

### 项目准备

编写一个带图片的 index. Html, 放置在/opt/project/emp 目录中。

图片 fruit 01. Jpg 放入/opt/project/static/img 目录中

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>
</head>
<body>
	<form action="">
		用户：<input name="user"><br>
		密码：<input name="password"><br>
		<input type="submit" value="登录">
		<input type="reset" value="取消"> 
	</form> 
	<img src="/static/img/fruit01.jpg" style="width:200px;height:200px"/>
</body>
</html>
```

### Nginx 配置

思路：动、静态的文件，请求时匹配不同的目录

当访问 gif, jpeg 时直接访问/opt/project/static/目录下内容, 正则自行配置

```nginx
User  root;
Worker_processes  1;

Error_log  /var/log/nginx/error. Log warn;
Pid        /var/run/nginx. Pid;

Events {
    Worker_connections  1024;
}

Http {
    Include       /etc/nginx/mime. Types;
    Default_type  application/octet-stream;

    Log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    Access_log  /var/log/nginx/access. Log  main;

    Sendfile        on;
    #tcp_nopush     on;
    Keepalive_timeout  65;
    #gzip  on;

   # include /etc/nginx/conf. D/*. Conf;
   Server {
        Listen 8100;
        Server_name localhost;
	    Location / {
		    Root /opt/project/emp;
		     Index index. Html index. Htm;
	     }
	 	
  	     # 所有静态图片请求都放到 static 目录下
	     Location ~ .*\. (jpg|jpeg|png)$ { 
      		Alias   /opt/project/static/;  
  	      }  
  	     Error_page   500 502 503 504  /50 x. Html;  
  		    Location = /50 x. Html {  
     		    root   e: wwwroot ;  
  	     }
    }
}
```



### 测试

图片能够正常加载

通过以下语句测试图片的正常加载 

```
curl -I http://localhost/static/img/fruit01.jpg
```

![动静分离图片验证](D:\资料\我的笔记\02.Nginx\图例\动静分离图片验证.png)

# 七、nginx 反向代理、负载均衡

## 1. 什么是反向代理

- 代理：通过客户机的配置，实现让一台服务器代理客户机，客户的所有请求都交给代理服务器处理
- 反向代理：用一台服务器，代理真实服务器，用户访问时，不是访问真实的服务器，而是访问代理服务器。

Nginx 可以当作反向代理服务来使用时，我们需要提前在 Nginx 中配置好反向代理的规则，不同的请求，交给不同的真实服务器处理。当请求到达 nginx，nginx 会根据已经定义的规则进行请求的转发，从而实现路由功能。

**安装在主机上**

![反向代理1](/反向代理1.jpg)

**安装在虚拟机上**

![反向代理2](/反向代理2.jpg)

## 2. Nginx 反向代理 Tocat 

### 拷贝配置文件

将/etc/nginx/conf. D 目录下的 default. Conf 拷贝一份，并命名成 my.Conf

```shell
#进入配置server的目录
Cd /etc/nginx/conf. D
#拷贝文件 （保留模板文件，防止被破坏）
Cp default. Conf  my. Conf
#打开my .conf 进行编辑
Vi  my. Conf
```



### My. Conf 的修改

使用 proxy_pass 来设置反向代理的服务器

```shell

      1 server {
      2     listen       80;
      3     server_name  localhost;
      4
      5     #access_log  /var/log/nginx/host. Access. Log  main;
      6
      7     location / {
                #修改内容 ，注释掉 8，9 行，增加第 10 行数据
      8         #root   /usr/share/nginx/html;
      9         #index  index. Html index. Htm;
     10         proxy_pass  http://192.168.40.251:8080 ;
     11     }
     12  ....



```



### 修改 nginx. Conf

/etc/nginx/nginx. Conf 中的 http 节点中修改以下内容

```shell
	#修改内容
    #include /etc/nginx/conf. D/*. Conf;
    Include /etc/nginx/conf. D/my. Conf;

```



## 3. 负载均衡  

### Upstream 模块

Nginx 的负载均衡功能依赖于 ngx_http_upstream_module 模块，所支持的代理方式有 proxy_pass (一般用于反向代理). Fastcgi_pass (一般用于和动态程序交互），memcached_pass, proxy_next_upstream, fastcig_next_pass 以及 memcached_next_pass 。

Upstream 模块应该放于 http{}标签内。

```shell
Upstream dynamic {
    Zone upstream_dynamic 64 k;


    Server backend 1. Example. Com      weight=5;
    Server backend 2. Example. Com: 8080 fail_timeout=5 s slow_start=30 s;
    Server 192.0.2.1                 max_fails=3;
    Server backend 3. Example. Com      resolve;

    Server backup 1. Example. Com: 8080  backup;
    Server backup 2. Example. Com: 8080  backup;
    #通过该指令配置了每个worker进程与上游服务器可缓存的空闲连接的最大数量 。
    #当超出这个数量时 ，最近最少使用的连接将被关闭。Keepalive 指令不限制 worker 进程与上游服务器的总连接。
    Keepalive 100;
}

//案例
Upstream tc{
		#ip_hash ;
		server 192.168.4.91:80 weight=1 backup;
		server 192.168.4.91:8080 weight=3;
	}	
```



### My. Conf

```
proxy_pass http://tc ;
```



### 负载均衡策略

轮询 (rr)：每个请求按时间顺序逐一分配到不同的后端服务器，如果后端服务器故障，故障系统自动清除，使用户访问不受影响。适用于多个服务器的性能相当的情况下，适用此策略。

轮询权值 (weight), weight 值越大，分配到的访问几率越高，主要用于后端每个服务器性能不均的情况。

Ip_hash，每个请求按访问 IP 的 hash 结果分配 (**IP 地址的前三段**)，这样来自同一个 IP 的固定访问一个后端服务器，主要解决动态网站 session 共享的问题。 192.168.40.Xxx

Url_hash，按照访问的 URL 的 hash 结果来分配请求，是每个 URL 定向到同一个后端服务器，可以进一步提高后端缓存服务器的效率，nginx 本身不支持，如果想使用需要安装 nginx 的 hash 软件包。

### Server 模块的写法 

Server IP 调度状态

Server 指令指定后端服务器 IP 地址和端口，同时还可以设定每个后端服务器在负载均衡调度中的状态。

- Down  表示当前的 server 暂时不参与负载均衡。
- Backup 预留的备份服务器，当其他所有的非 backup 服务器出现故障或者忙的时候，才会请求 backup 机器，因为这台集群的压力最小。
- Max_fails 允许请求失败的次数，默认是 1，当超过最大次数时，返回 proxy_next_upstream 模块定义的错误。0 表示禁止失败尝试，企业场景：2-3. 京东 1 次，蓝汛 10 次，根据业务需求去配置。
- Fail_timeout，在经历了 max_fails 次失败后，暂停服务的时间。京东是 3 s，蓝汛是 3 s，根据业务需求配置。常规业务 2-3 秒合理。



## Vue 项目的发布

### 开发或者测试环境的确认

### 执行打包命令    npm run  build:prod

### 把 dist 文件夹放入 centos 的 /opt/dist 目录  

​      放入 vagrant 共享目录， vagrant reload 读取文件，通过 cp 命令 copy 到 opt 目录下

### 修改 nginx 的配置（server 段）

```
#nginx .conf
Http {
   .....
   Upstream tc {
      server  192.168.66.182:8080;
   }
   
   Include /etc/nginx/conf. D/my. Conf
}

#my .conf
Server {
    ....
    Location /{
       Root  /opt/dist;
       Index index. Html index. Htm;
    }
    Location /core {
       proxy_pass   http://tc ;
    }
}
```



# 八、session 共享

## 1. Ip_hash

缺点：

+ 分配不均匀。
+ 如果后端还作了其他负载均衡，就不能共享 session

## 2. Tomcat 会话复制

会话数据会存储在每个服务器上的堆内存中

### 2.1 实现步骤

+ 在每一个 tomcat 中添加集群缓存配置

  在 tomcat 的 conf 中找到 server. Xml，在<Engine name="Catalina" defaultHost="localhost">这一行下面添加下面内容：

  ```
  <Cluster className="org.apache.catalina.ha.tcp.SimpleTcpCluster" channelSendOptions="8">
    <Manager className="org. Apache. Catalina. Ha. Session. DeltaManager"
               ExpireSessionsOnShutdown="false"
               NotifyListenersOnReplication="true"/>
    <Channel className="org.apache.catalina.tribes.group.GroupChannel">
        <Membership className="org. Apache. Catalina. Tribes. Membership. McastService"
              Address="228.0.0.4" port="45564" frequency="500" dropTime="3000"/>
        <Receiver className="org. Apache. Catalina. Tribes. Transport. Nio. NioReceiver"
    Address="auto" port="4000" autoBind="100" selectorTimeout="5000" maxThreads="6"/>
      <Sender className="org.apache.catalina.tribes.transport.ReplicationTransmitter">       <Transport       className="org.apache.catalina.tribes.transport.nio.PooledParallelSender"/>
      </Sender>
       <Interceptor className="org.apache.catalina.tribes.group.interceptors.TcpFailureDetector"/>
       <Interceptor className="org.apache.catalina.tribes.group.interceptors.MessageDispatch15Interceptor"/>
      </Channel>
      <Valve className="org.apache.catalina.ha.tcp.ReplicationValve" filter=""/>
      <Valve className="org.apache.catalina.ha.session.JvmRouteBinderValve"/>
      <Deployer className="org. Apache. Catalina. Ha. Deploy. FarmWarDeployer"
          TempDir="/tmp/war-temp/" deployDir="/tmp/war-deploy/"
          WatchDir="/tmp/war-listen/" watchEnabled="false"/>
      
      <ClusterListener className="org.apache.catalina.ha.session.ClusterSessionListener"/>
  </Cluster>
  ```

+ 在每个项目的 web. Xml 中添加下面标签

  ```
  <distributable/>
  ```

### 2.2 缺点

+ 因为每个服务器都存储一份 session，所以数据冗余
+ 如果某个服务器内存很小，可能无法存储。

## 3. 会话共享

推荐使用 Spring do 方案，主流, 会话存储在远程的 redis 缓存中.

### 3.1 实现原理

+ 客户端第一次发请求时，没有携带 sessionID，nginx 将请求分发给服务器 1 ，然后服务器 1 产生 session 0，spring 对 sesion 0 封装成 sesion 1，并根据 session 0 计算并更新 session 1 的 id, 然后放入 redis 中，并把 session 0 的原始 ID 回写到浏览器，这样服务器 1 和 redis 中都会有一个相同的 session1


+ 当客户端发送第二次请求的时候，nginx 将请求分发给服务器 2 （无 session），因为请求中携带了一个 sessionID，那么服务器 2 就根据 sessionID 得出 session 1 的 id，用这个 id 去 redis 中获取 session。



### 3.2 实现步骤

建两个 springboot 项目，内容如下，除了端口号不同

+ 两个项目的 pom 依赖

  ```
  <dependencies>
    <dependency>
      <groupId>org. Springframework. Boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org. Springframework. Boot</groupId>
      <artifactId>spring-boot-starter-thymeleaf</artifactId>
    </dependency>
    <dependency>
      <groupId>org. Springframework. Boot</groupId>
      <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>
    <dependency>
      <groupId>org. Springframework. Session</groupId>
      <artifactId>spring-session-data-redis</artifactId>
      <version>2.0.4. RELEASE</version>
    </dependency>
  </dependencies>
  ```

+ templates 目录添加 login. Html

  ```
      <form action="/login" method="post">
          <input name="username"><br>
          <input type="submit">
      </form>
  ```

+ templates 目录添加 success. Html

  ```
      <html lang="en" xmlns:th="http://www.w3.org/1999/xhtml">
      <h1>this is session 1</h1>
      <span th:text="${session.username}"></span>
  ```

+ yml 内容如下, 注意：另一项目端口为 8080

  ```
  Server:
    Port: 80
  Spring:
    Redis:
      Host: 127.0.0.1
      Port: 6379
      Jedis:
        Pool:
          Max-idle: 8
  ```


+ config 包下添加类

  ```
  @Configuration
  Public class MyConfig implements WebMvcConfigurer {
      Public void addViewControllers (ViewControllerRegistry registry) {
          Registry.AddViewController ("/showSuc"). SetViewName ("success");
          Registry.AddViewController ("/showLogin"). SetViewName ("login");
      }
  }
  ```


+ controller 包中添加类

      @Controller
      Public class UserCtl {
      @RequestMapping ("/login")
      Public String hello (HttpSession session, String username){
          Session.SetAttribute ("username", username);
          //注意：这里的 session 已不是传统 session, 被重构成新的 session，存储在 redis 中
          System.Out.Println ("name: "+username+", sessionID："+session.GetId ());
          Return "success";
      }
      }

+ **主类添加注解**

      //使用该注解，会重构 session, 参数为 session 存活时间
      @EnableRedisHttpSession (maxInactiveIntervalInSeconds = 10000*30)
      @SpringBootApplication
      Public class SessionApp {
      Public static void main (String[] args) {
          SpringApplication.Run (SessionApp. Class, args);
      }
      }

  

+ nginx 中

  + 修改配置

    ```
    Location / {
    		Root   /opt/project/emp;
    		Index  index. Html index. Htm;
    		proxy_pass http://tc ;
    }
   Upstream tc{
        server 192.168.1.144:80;
      server 192.168.1.144:8080;
      }
    ```
  
  + 重启 nginx
  
   /usr/local/nginx/sbin/nginx -s reload


+ 启动 redis: redis-server redis. Conf

+ 启动 80 和 8080 两个端口的项目

+ 测试

  + 浏览器输入 http://192.168.184.100/login.html ,输入用户名

  + http://192.168.184.100/showSuc ，反复刷新观看

    