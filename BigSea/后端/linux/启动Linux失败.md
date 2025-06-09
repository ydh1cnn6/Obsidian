## <font style="color:rgb(34, 34, 38);">1、VirtualBox搭建虚拟机可能遇到的坑</font>
Failed to get device handle and/or partition ID for 0000000001ee4e20 (hPartitionDevice=0000000000000ad5, Last=0xc0000002/1) (VERR_NEM_VM_CREATE_FAILED).  
**<font style="color:rgb(77, 77, 77);">翻译：不能为虚拟电脑 ubuntu_打开一个新任务</font>**

**<font style="color:rgb(77, 77, 77);"></font>**

**<font style="color:rgb(77, 77, 77);">原因</font>**

1. <font style="color:rgb(77, 77, 77);">开启了hyper-v</font>
2. <font style="color:rgb(77, 77, 77);">使用wsl时开启虚拟机</font>

**<font style="color:rgb(77, 77, 77);">解决办法</font>**

1. <font style="color:rgb(77, 77, 77);">关闭hyper-v，用命令： 以管理员启动 powershell，执行：</font>

[VirtualBox搭建虚拟机可能遇到的坑-CSDN博客](https://blog.csdn.net/weixin_50705817/article/details/128922525)



解决指令

`<font style="color:#DF2A3F;">bcdedit /set hypervisorlaunchtype off</font>`

重新开启以使用安卓虚拟机

`<font style="color:rgb(36, 41, 47);">bcdedit /set hypervisorlaunchtype auto</font>`

[#20545 (Windows 11 Support) – Oracle VM VirtualBox](https://www.virtualbox.org/ticket/20545)

