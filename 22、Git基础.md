---
typora-root-url: images
---
![](https://cdn.nlark.com/yuque/0/2023/png/39031477/1701250560302-586462bb-4148-433c-b9d8-669b324322c3.png)

![](https://cdn.nlark.com/yuque/0/2023/png/39031477/1701250454342-0254d3c3-8cb2-4623-b5a5-f0764b56c517.png)

# 1. Git 概念


## 1.1 Git历史

同生活中的许多伟大事件一样，Git诞生于一个极富纷争大创新的年代。Linux内核开源项目有着为数众多的参与者。绝大多数的Linux内核维护工作都花在了提交补丁和保存文档的繁琐事务上（1991~2002年间）。到2002年，整个项目组开始启用分布式版本控制系统BitKeeper来管理和维护代码。

到2005年的时候，开发BitKeeper的商业公司同Linux内核开源社区的合作关系结束，他们收回了免费使用BitKeeper的权利。迫使Linux开源社区不得不吸取教训，只有开发一套属于自己的版本控制系统才不至于重蹈覆辙。他们对新的系统订了若干目标：

- 速度
- 简单的设计
- 对非线性开发模式的强力支持（允许上千个并行开发的分支）
- 完全分布式
- 有能力高效管理类似Linux内核一样的超大规模项目（速度和数据量）

<img src="/01.Linux之父.png" alt="01.Linux之父" style="zoom:50%;" align="center" />

## 1.2 Git与svn对比

### 1. SVN

SVN是集中式版本控制系统，版本库是集中放置在中央服务器的，而干活的时候，用的是自己的电脑，所以首先要从中央服务器哪里得到最新的版本，然后干活，干完后，需要把自己做完的活推送到中央服务器。集中式版本控制系统是必须联网才能工作，如果在局域网还可以，贷款勾搭，速度够快，如果在互联网下，可能网速就没那么快了。

集中管理方式在一定程度上看到其他开发人员在干什么，而管理员也可以很轻松掌握每个人的开发权限。集中式版本控制工具的缺点：

- 服务器单点故障

- 容错性差

  <img src="/01.SVN.png" alt="02.01SVN" style="zoom:67%;" />

### 2. Git

Git是分布式版本控制系统，它没有中央服务器的，每个人的电脑就是一个完整的版本库，这样，工作就不需要互联网，因为版本都是在自己的电脑上。既然每个人的电脑都有一个完整的版本库，如何多人协作呢？比如说自己在电脑上改了文件A，其他人也在电脑上改了文件A，这是只需要把各自的修改推送给对方，就可以互相看到对方的修改了。

<img src="/01.GIT控制.png" alt="02.GIT控制" style="zoom: 67%;" />

# 2. Git工作流程

一般工作流程如下：

- 从远程仓库中克隆Git资源作为本地仓库。
- 从本地仓库中checkout代码然后进行代码修改。
- 在提交前先将代码提交到暂存区。
- 提交修改。提交到本地仓库。本地仓库中保存修改的各个历史版本。
- 在修改完成后，需要和团队成员共享代码时，可以将代码push到远程仓库。![02.git常用命令流程图](/02.git常用命令流程图.png)

# 3. Git的安装

​		最早Git是在Linux上开发的，很长一段时间内，Git也只能在Linux和Unix系统上跑。不过，慢慢地有人把它移植到了Windows上。现在，Git可以在Linux、Unix、Mac和Windows这几个大平台上正常运行了。

下载地址：http://git-scm.com/downloads

<img src="/03.Git下载.png" alt="03.Git下载" style="zoom: 67%;" />

上述路径下载太慢，可以使用国内的镜像

https://npm.taobao.org/mirrors/git-for-windows/

- 安装Git：默认安装
- 安装TortoiseGit

![04.TortoiseGit安装01](04.TortoiseGit安装01.md)

![04.TortoiseGit安装02](/04.TortoiseGit安装02.png)

- 安装TortoiseGit中文语言包

![04.TortoiseGit中文语言包](/04.TortoiseGit中文语言包.png)

# 4. Git的使用

## 1. 创建版本库

​		版本库又名仓库。可以简单理解成一个目录，这个目录里面的所有文件都可以被Git管理起来。每个文件的修改、删除都可以被Git跟踪到，以便任何时候可以追踪历史，或者在将来某个时刻可以还原。由于Git是分布式版本管理工具，所以Git不需要互联网也具有完整的版本管理能力。

方法一：在repo1文件夹中右击鼠标--》【Git GUI here】--【repository】--【new】

![04.创建版本库.方法一](/04.创建版本库.方法一.png)

方法二：在repo1文件夹中右击鼠标--》【Git在这里创建版本库】

![04.创建版本库.方法二](/04.创建版本库.方法二.png)

创建好的目录

![04.git版本库目录](/04.git版本库目录.png)

​		.git：本地仓库版本库

​		Repo1：工作目录

如果想要向本地仓库添加文件，必须放入工作目录中（repo1），否则加不进来。

创建文件HelloWorld.txt，右击，点击【TortoiseGit】==》【添加】。

![04.上传文件](/04.上传文件.png)

点击【确定】，重启下电脑，HelloWorld.txt会有个小加号。此时加入的是暂存区。

## 2. 工作区和暂存区

Git和其他版本控制系统如SVN的一个不同之处就是暂存区的概念。

工作区

就是你在电脑里能看到的目录。比如上图中的git-repository就是工作区。.git隐藏文件夹是版本库。Git版本库里存了很多东西，最重要的就是暂存区（stage），还有git自动为我们创建的第一个分支master，以及指向master的一个指针叫HEAD

<img src="/04.工作区和暂存区.png" alt="04.工作区和暂存区" style="zoom: 80%;" />

## 3. 本地仓库操作

### 提交到本地仓库

在本地仓库目录中，右击鼠标， 在弹出菜单上点击【git提交->本地仓库】，输入提交日志。点击【提交】。

- 弹出菜单

  <img src="/05.提交到本地仓库01.png" alt="05.提交到本地仓库01" style="zoom:80%;" />

- 提交![05.提交到本地仓库02](/05.提交到本地仓库02.png)日志

  

- 提交结果

  ![05.提交到本地仓库03](/05.提交到本地仓库03.png)



###  查看文件

【tortoiseGit】--》版本库浏览器

<img src="/06.本地库浏览器.png" alt="06.本地库浏览器" style="zoom:80%;" />

###  修改文件和提交

带有红色感叹号的文件，是被修改过的。

![06.文件修改后提交](/06.文件修改后提交.png)

修改过的文件提交：选中文件，右击鼠标--》【Git提交--》master】

### 删除文件

- 方法一
  - 直接删除文件
  - 右击鼠标--》【Git提交--》master】
- 方法二
  -  选中文件--》右击鼠标--》【TurtoiseGit】--》删除
  -  右击鼠标--》【Git提交--》master】



## 4.上传到远程仓库

### 1. 创建远程仓库

- ​	需要在github上有账户，没有账户需要先注册账户，然后登陆系统。点击【start a project】

  ![07.创建远程仓库01](/07.创建远程仓库01.png)

- 设置仓库属性

  ![07.创建远程仓库02](/07.创建远程仓库02.png)

  可以使用码云  https://gitee.com/，使用方式和Githup一样的操作

### 2. SSH

#### 2.1 什么是ssh

​		SSH 为 Secure Shell 的缩写，由 IETF 的网络小组（Network Working Group）所制定；SSH 为建立在应用层基础上的安全协议。SSH 是较可靠，专为远程登录会话和其他网络服务提供安全性的协议。利用 SSH 协议可以有效防止远程管理过程中的信息泄露问题。SSH最初是UNIX系统上的一个程序，后来又迅速扩展到其他操作平台。SSH在正确使用时可弥补网络中的漏洞。SSH客户端适用于多种平台。几乎所有UNIX平台—包括HP-UX、Linux、AIX、Solaris、Digital UNIX、Irix，以及其他平台，都可运行SSH。

#### 2.2 基于密匙的安全验证

​		需要依靠密匙，也就是你必须为自己创建一对密匙，并把公用密匙放在需要访问的服务器上。如果你要连接到SSH服务器上，客户端软件就会向服务器发出请求，请求用你的密匙进行安全验证。服务器收到请求之后，先在该服务器上你的主目录下寻找你的公用密匙，然后把它和你发送过来的公用密匙进行比较。如果两个密匙一致，服务器就用公用密匙加密“质询”（challenge）并把它发送给客户端软件。客户端软件收到“质询”之后就可以用你的私人密匙解密再把它发送给服务器。

#### 2.3 创建密匙

- 在工作目录右击鼠标，点击【Git Bash Here】命令

![08.创建秘钥](/08.创建秘钥.png)

- 输入命令

  ```
  ssh-keygen -t rsa
  ```

  ![08.创建秘钥02](/08.创建秘钥02.png)



- 密钥存储

  SSH密钥存储在C盘当前用户的.ssh目录下

  ![08.创建秘钥03_秘钥本地存储](/08.创建秘钥03_秘钥本地存储.png)

#### 2.4 Github上设置ssh公钥

- 用户设置

  ![09.设置公钥01.setting](/09.设置公钥01.setting.png)

  

- SSH and GPG keys

  ![09.设置公钥02.setting](/09.设置公钥02.setting.png)

- New SSH key

  将.pub结尾的公钥拷贝到key中，title随便写

  ![09.设置公钥03.setting](/09.设置公钥03.setting.png)



#### 2.5 向Github远程仓库推送项目

##### 使用命令行

![10.命令行推送](/10.命令行推送.png)



##### 使用TortoiseGit工具

- 工作目录中右击鼠标，点击【Git同步】

  ![10.Git同步](/10.Git同步.png)

- 点击【管理】

  <img src="/10.Git管理-远端01.png" alt="10.Git管理-远端01" style="zoom:80%;" />

- 先设置网络中的SSH客户端

  <img src="/10.Git管理03-SSH客户端.png" alt="10.Git管理03-SSH客户端" style="zoom:80%;" />

- 设置Git远端

  <img src="/10.Git管理04-远端.png" alt="10.Git管理04-远端" style="zoom: 80%;" />

  ​	<img src="/10.Git管理05-远端.png" alt="10.Git管理05-远端" style="padding-left:50px;" />

- 点击【推送】

  ![10.Git管理05-推送01](/10.Git管理05-推送01.png)

  ![10.Git管理05-推送02](/10.Git管理05-推送02.png)



- 刷新github的仓库

  <img src="/10.刷新github的仓库.png" alt="10.刷新github的仓库" style="zoom:80%;" />





### 3. HTTPS方式

- 设置远端

  设置好URL，远端名，点击确定

  <img src="/11.Http01远端设置.png" alt="11.Http01远端设置" style="zoom:80%;" />

  

- 点击推送【或拉取】，需要验证，输入用户名、密码

  设置用户名，密码

  <img src="/11.Http03用户名密码.png" alt="11.Http03用户名密码" style="zoom:80%;" />

  

- 正常提交

  <img src="/11.Http04提交成功.png" alt="11.Http04提交成功" style="zoom:80%;" />





# 5. 码云的使用

地址：https://gitee.com

## 1. PUSH到码云

- 登录码云，找到仓库，获取到地址

  <img src="/12.push到码云01.png" alt="12.push到码云01" style="zoom: 67%;" />

- 设置远端

  点击【克隆/下载】，copy出地址，设置Git同步的远端，如下图：

  <img src="/12.push到码云02.png" alt="12.push到码云02" style="zoom:80%;" />

  

- 推送

  第一次推送时，需要选中【强制】复选框

  <img src="/12.push到码云03.png" alt="12.push到码云03" style="zoom:80%;" />







## 2. 管理仓库

- 进入仓库页面

  ![12.码云仓库管理01](/12.码云仓库管理01.png)

- 点击【管理】

  <img src="/12.码云仓库管理02.png" alt="12.码云仓库管理02" style="zoom:80%;" />



# 6. idea中使用码云管理项目

## 设置Gitee

设置方法：file=> setting => Version Control	=> Gitee 

<img src="/13.idea设置码云账户.png" alt="13.idea设置码云账户" style="zoom:80%;" />



## 托管项目

将idea中的项目交给码云托管

- 共享到Gitee： VCS=>Import into Version Control => Share Project on Gitee

  ![13.托管项目](/13.托管项目.png)



- 设置仓库名

  ![13.托管项目_仓库名称](/13.托管项目_仓库名称.png)

- 设置要托管的代码

  ![13.托管项目_托管代码](/13.托管项目_托管代码.png)

## 提交代码

- add到暂存区

  选择代码文件或package（如果package未提交过，需要一起提交），右击鼠标=>Git =》add

  ![14.提交代码_add](/14.提交代码_add.png)

- 提交到本地库

  **Git=》Commit Directory**

  ![14.提交代码_commit](/14.提交代码_commit.png)

  选择文件后，点击commit

- 提交到远程库Gitee

  **Git=>repository=》push**

  ![14.提交代码_push代码](/14.提交代码_push代码.png)



## 导入Gitee上的项目

方法一：welcome页面上导入==>Get from Version Control

方法二：已有项目界面==>VCS ==>Get from Version Control

![14.提交代码_导入Gitee项目](/14.提交代码_导入Gitee项目.png)

