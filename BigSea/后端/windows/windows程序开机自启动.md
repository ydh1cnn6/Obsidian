1、新建批处理文件 `start_nginx.bat`，内容如下：

```sh
@echo off 
cd /d D:\nginx  # 替换为你的Nginx路径 
start nginx.exe 
exit
```


或者试一下创建快捷方式
2、按 `Win+R`输入 `shell:startup`打开启动文件夹。