---
typora-root-url: D:\ftp178\02.上课内容\11.vagrant&linux\01.课件\images
---

# 什么是Vagrant

Vagrant是一个工具，用于创建和部署虚拟化环境，它可以和VirtualBox以及vmware一起整合使用。

以VirtualBox为例，VirtualBox会开发一个创建虚拟机的接口，Vagrant会利用此接口来创建虚拟机，并且通过vagrant来管理、配置以及安装虚拟机。



# 安装

## 安装vagrant

### 下载vagrant软件

https://developer.hashicorp.com/vagrant/downloads

### 安装vagrant

vagrant是没有图形界面的，安装后也没有桌面快捷方式。Vagrant安装程序，会将安装路径自动加入Path环境变量当中。可以命令行通过命令来操作vagrant。可以使用vagrant version来检查是否成功安装



## 安装VirtualBox

虚拟机（Virtual Machine）指通过软件模拟的具有完整硬件[系统功能](https://baike.baidu.com/item/系统功能/10394740?fromModule=lemma_inlink)的、运行在一个完全隔离环境中的完整[计算机系统](https://baike.baidu.com/item/计算机系统/7210959?fromModule=lemma_inlink)。在实体计算机中能够完成的工作在虚拟机中都能够实现。在计算机中创建虚拟机时，需要将实体机的部分硬盘和[内存容量](https://baike.baidu.com/item/内存容量/3361934?fromModule=lemma_inlink)作为虚拟机的硬盘和内存容量。每个虚拟机都有独立的[CMOS](https://baike.baidu.com/item/CMOS/428167?fromModule=lemma_inlink)、硬盘和[操作系统](https://baike.baidu.com/item/操作系统/192?fromModule=lemma_inlink)，可以像使用实体机一样对虚拟机进行操作。

VirtualBox 是一款开源[虚拟机软件](https://baike.baidu.com/item/虚拟机软件/9003764?fromModule=lemma_inlink)。VirtualBox 是由德国 [Innotek](https://baike.baidu.com/item/Innotek/4492496?fromModule=lemma_inlink) 公司开发，由[Sun](https://baike.baidu.com/item/Sun/69463?fromModule=lemma_inlink) Microsystems公司出品的软件，使用[Qt](https://baike.baidu.com/item/Qt/451743?fromModule=lemma_inlink)编写，在 Sun 被 [Oracle](https://baike.baidu.com/item/Oracle/301207?fromModule=lemma_inlink) 收购后正式更名成 Oracle VM VirtualBox。Innotek 以 GNU General Public License ([GPL](https://baike.baidu.com/item/GPL/2357903?fromModule=lemma_inlink)) 释出 VirtualBox，并提供[二进制](https://baike.baidu.com/item/二进制/361457?fromModule=lemma_inlink)版本及 OSE 版本的代码。使用者可以在VirtualBox上安装并且执行[Solaris](https://baike.baidu.com/item/Solaris/3517?fromModule=lemma_inlink)、Windows、[DOS](https://baike.baidu.com/item/DOS/32025?fromModule=lemma_inlink)、Linux、[OS/2](https://baike.baidu.com/item/OS%2F2/1958699?fromModule=lemma_inlink) Warp、BSD等系统作为客户端操作系统。已由[甲骨文公司](https://baike.baidu.com/item/甲骨文公司/430115?fromModule=lemma_inlink)进行开发，是甲骨文公司xVM虚拟化平台技术的一部分。



## 设置环境变量

### VAGRANT_HOME

通过vagrant创建虚拟机需要先导入镜像文件，也就是各种box。默认的存放目录就在用户目录下的.vagrant.d目录下，对于windows系统来说，c:/user/用户名/.vagrant.d

如果都放入cpan，导致c盘空间紧张，可以通过环境变量VAGRANT_HOME来设置存放的位置。



### 设置path

<img src="/01.环境变量.png" alt="01.环境变量" style="zoom: 67%;" />



## 使用Vagrant安装Centos7

### 下载镜像文件

vagrant的官网下载：https://developer.hashicorp.com

centos的镜像：https://cloud.centos.org/centos/

### 查看box

vagrant box list

### 添加box

vagrant  box add  文件所在位置 --name box名

```
vagrant box add D:\ftp178\01.soft\CentOS-7.box --name centos7
```

文件所在位置 : 通过此位置指定一个box镜像文件

centos7：给box镜像起的名字，安装虚拟机的时候需要使用此名字，尽量简单好记

### 删除box

vagrant box remove box名字

```
vagrant box remove centos7
```



### 虚拟机相关操作

vagrant init： 初始化一个虚拟机配置文件vagrantfile，需要先创建目录，在对应的目录下运行此命令。

​	vagrant init  box名，如果忘记指定box名，则可以vagrantfile当中进行修改

vagrant up：启动虚拟机，无论虚拟机是关闭，还是暂停状态，都可以使用此命令来恢复虚拟机的运行

vagrant ssh：进入虚拟机，进行操作

vagrant suspend：挂起虚拟机

vagrant reload：重启虚拟机，重新加载vagrantfile当中的配置信息

vagrant halt：关闭虚拟机

vagrant status：查看虚拟机的状态

vagrant destroy：删除虚拟机，销毁当前的虚拟机



