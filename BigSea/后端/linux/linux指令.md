Ctrl + U：这会删除从命令行的起始位置到光标所在位置的所有文本。如果你的光标在行尾，这将清空整个命令行

Ctrl + K：这会删除从光标所在位置到命令行末尾的所有文本。如果你的光标在行首，这将不产生任何效果。Esc + D：删除光标后面的单个字符。

Backspace 或 Ctrl + H：删除光标前一个字符。

Delete 或 Ctrl + D：删除光标位置的字符。

Ctrl + A：回到行首

Ctrl + E： 跳到行尾





# <font style="color:rgb(34, 34, 38);">取出文件中含有指定字段的全部行，并写入另一份文件</font>
```shell
grep -i "aaa" Home.log > new.log  
```

-d、-r、-R 对目录操作 

-i 忽略大小写

-l 列出内容符合的文件名称（-L是不符合的）

-w 全词匹配

-C <font style="color:rgb(51, 51, 51);">查看匹配行的上下文行数（-B、-A分别是前后）</font>

<font style="color:rgb(51, 51, 51);"></font>

# <font style="color:rgb(51, 51, 51);">根据pid查端口、根据端口查pid</font>
<font style="color:rgb(51, 51, 51);">lsof -i:端口号</font>

[lsof根据端口号查找占用进程号及根据进程号查找占用端口号_lsof -i:端口号-CSDN博客](https://blog.csdn.net/tterminator/article/details/113201328)



输入分隔符/0





按时间查日志

1. <font style="color:rgb(0, 0, 0);">grep   '2019-09-09 10:24:3[1-7]'   test.log    查询test.log文件中2019-09-09 10:24:31到2019-09-09 10:24:37时间范围内的日志</font>

<font style="color:rgb(0, 0, 0);">查看磁盘占用</font>

<font style="color:rgb(0, 0, 0);">df -h</font>

<font style="color:rgb(0, 0, 0);">du -sh *</font>

<font style="color:rgb(0, 0, 0);"></font>

<font style="color:rgb(0, 0, 0);"></font>

<font style="color:rgb(0, 0, 0);">查看每个CPU核心的详细统计</font>

<font style="color:rgb(0, 0, 0);">mpstat -P ALL 1</font>

<font style="color:rgb(0, 0, 0);">显示所有核心，每秒刷新</font>

<font style="color:rgb(0, 0, 0);"></font>

<font style="color:rgb(0, 0, 0);">top排序</font>

<font style="color:rgb(0, 0, 0);">1、cpu，shift+p</font>

<font style="color:rgb(0, 0, 0);">2、内存，shift+m</font>

<font style="color:rgb(0, 0, 0);">3.进程ID（PID），Shift+N) </font>

<font style="color:rgb(0, 0, 0);">4.切换排序方向 。快捷键: （大写，按 Shift+R) </font>

<font style="color:rgb(0, 0, 0);">5.按用户 （USER）排序 快捷键： （大写，按 Shift+U) 效果：按 USER名称字母顺序排序。</font>

