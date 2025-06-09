### 1、日期格式
```shell
date 							#Sat May 15 22:40:38 CST 2021
date +'%Y-%m-%d'	#2021-05-15
date -d '2020-05-01 -1 day' +'%Y-%m-%d'				#2020-04-30
date -d 'Sat May 15 23:00:27 CST 2021' +%s		#1621090827
date -d @1621090827														#Sat May 15 23:00:27 CST 2021
```

[Shell脚本中的日期和时间处理：获取、格式化与操作指南_shell date格式化-CSDN博客](https://blog.csdn.net/weixin_43221753/article/details/135569832)

[https://zhuanlan.zhihu.com/p/417018007](https://zhuanlan.zhihu.com/p/417018007)



### 2、条件判断
#### <font style="color:rgb(51, 51, 51);">if语句</font>
```shell
if [ command ];then
   符合该条件执行的语句
elif [ command ];then
   符合该条件执行的语句
else
   符合该条件执行的语句
fi
```

#### <font style="color:rgb(51, 51, 51);">文件/文件夹(目录)判断</font>
```shell
[ -d DIR ]  #如果 FILE 存在且是一个目录则为真。
[ -e FILE ] #如果 FILE 存在则为真。
[ -s FILE ] #如果 FILE 存在且大小不为0则为真。

。。。。。。。
```

#### <font style="color:rgb(17, 17, 17);">字符串判断、</font>
```shell
[ -z STRING ] #如果STRING的长度为零则为真 ，即判断是否为空，空即是真；
[ -n STRING ] #如果STRING的长度非零则为真 ，即判断是否为非空，非空即是真；
[ STRING1 = STRING2 ] #如果两个字符串相同则为真 ；
[ STRING1 != STRING2 ] #如果字符串不相同则为真 ；
[ STRING1 ]　 #如果字符串不为空则为真,与-n类似
```

#### <font style="color:rgb(17, 17, 17);">数值判断</font>
```shell
INT1 -eq INT2           #INT1和INT2两数相等为真 ,=
INT1 -ne INT2           #INT1和INT2两数不等为真 ,<>
INT1 -gt INT2           #INT1大于INT1为真 ,>
INT1 -ge INT2           #INT1大于等于INT2为真,>=
INT1 -lt INT2           #INT1小于INT2为真 ,<</div>
INT1 -le INT2           #INT1小于等于INT2为真,<=
```

#### <font style="color:rgb(17, 17, 17);">复杂逻辑判断</font>
```shell
#-a 与
#-o 或
# ! 非
if [ "$VAR1" -gt 0 -a "$VAR2" -lt 10 ]; then
    echo "VAR1 大于 0 且 VAR2 小于 10"
fi
```

[Shell if 条件判断_shell if判断语句-CSDN博客](https://blog.csdn.net/zhan570556752/article/details/80399154)





### `<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">$</font>`<font style="color:rgb(77, 77, 77);">的各种用法（</font>取参数）
```shell
echo "脚本名字: $0"
echo "第一个参数: $1"
echo "第二个参数: $2"
echo "参数个数: $#"
echo "所有参数列表: $@"
echo "以一个单字符串显示所有向脚本传递的参数，与位置变量不同，参数可超过9个： $*"
echo "当前进程ID: $$"
echo "最后命令的退出状态: $?
```

[shell脚本中$0 $1 $# $@ $* $? $$ 的各种符号意义详解_shell $1-CSDN博客](https://blog.csdn.net/weixin_49114503/article/details/141360012)

# <font style="color:rgb(25, 27, 31);">shell中`$@`和`$*`的区别</font>
<font style="color:rgb(25, 27, 31);">$@：参数列表</font>

<font style="color:rgb(25, 27, 31);">$*:	参数列表的字符串拼接</font>

参考资料：[shell中`$@`和`$*`的区别](https://zhuanlan.zhihu.com/p/337476333)



