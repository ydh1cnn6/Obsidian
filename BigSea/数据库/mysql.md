1、**<font style="color:rgb(51, 51, 51);">mysqldump备份的sql文件乱码</font>**

```shell
mysqldump -u root -p --databases gulimall_admin gulimall_oms gulimall_pms gulimall_sms gulimall_ums gulimall_wms pms_catelog sys_menus  > alldb.sql
```



# <font style="color:rgb(51, 51, 51);">2、LOAD DATA INFILE语法</font>
数据导入，根据分隔符、换行符区分数据



# <font style="color:rgb(51, 51, 51);">3、REPLACE</font>
必须有一个<font style="color:rgb(51, 51, 51);">PRIMARY KEY或一个UNIQUE索引，否则就是普通的INSERT</font>

<font style="color:rgb(51, 51, 51);">1.</font><font style="color:rgb(51, 51, 51);">   </font><font style="color:rgb(51, 51, 51);"> </font><font style="color:rgb(51, 51, 51);">尝试把新行插入到表中</font>

<font style="color:rgb(51, 51, 51);">2.</font><font style="color:rgb(51, 51, 51);">   </font><font style="color:rgb(51, 51, 51);"> </font><font style="color:rgb(51, 51, 51);">当因为对于主键或唯一关键字出现重复关键字错误而造成插入失败时：</font>

<font style="color:rgb(51, 51, 51);">a.</font><font style="color:rgb(51, 51, 51);">   </font><font style="color:rgb(51, 51, 51);"> </font><font style="color:rgb(51, 51, 51);">从表中删除含有重复关键字值的冲突行</font>

<font style="color:rgb(51, 51, 51);">b.    再次尝试把新行插入到表中</font>

<font style="color:rgb(51, 51, 51);"></font>

# <font style="color:rgb(51, 51, 51);">4、TRUNCATE语法</font>
<font style="color:rgb(51, 51, 51);">对于InnoDB表，</font>

    1. <font style="color:rgb(51, 51, 51);">如果有需要引用表的外键限制，则TRUNCATE TABLE被映射到DELETE上；否则使用快速删减（取消和重新创建表）；</font>
    2. <font style="color:rgb(51, 51, 51);">重新设置AUTO_INCREMENT计数器，设置时不考虑是否有外键限制。</font>

<font style="color:rgb(51, 51, 51);">对于其它存储引擎，</font>

    1. <font style="color:rgb(51, 51, 51);">删除并创建表；</font>
    2. <font style="color:rgb(51, 51, 51);">删减操作不能保证对事务是安全的；在进行事务处理和表锁定的过程中尝试进行删减，会发生错误；</font>
    3. <font style="color:rgb(51, 51, 51);">被删除的行的数目没有被返回。</font>
    4. <font style="color:rgb(51, 51, 51);">只要表定义文件</font>_<font style="color:rgb(51, 51, 51);">tbl_name</font>_<font style="color:rgb(51, 51, 51);">.frm是合法的，则可以使用TRUNCATE TABLE把表重新创建为一个空表，即使数据或索引文件已经被破坏。</font>
    5. <font style="color:rgb(51, 51, 51);">当被用于带分区的表时，TRUNCATE TABLE会保留分区；即，数据和索引文件被取消并重新创建，同时分区定义（.par）文件不受影响。</font>

# <font style="color:rgb(51, 51, 51);">5、DESCRIBE</font>
` {DESCRIBE | DESC} tbl_name `

查看表中<font style="color:rgb(51, 51, 51);">各列的信息,用于与Oracle相兼容</font>

<font style="color:rgb(51, 51, 51);">等同于</font>`<font style="color:rgb(51, 51, 51);">show columns from table_name</font>`

