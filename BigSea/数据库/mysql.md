---
title: mysql
updateDate: 2026-06-26 16:25:33
tags: [mysql解析json]
---
1、**mysqldump备份的sql文件乱码**

```shell
mysqldump -u root -p --databases gulimall_admin gulimall_oms gulimall_pms gulimall_sms gulimall_ums gulimall_wms pms_catelog sys_menus  > alldb.sql
```



# 2、LOAD DATA INFILE语法
数据导入，根据分隔符、换行符区分数据

# 3、REPLACE
必须有一个PRIMARY KEY或一个UNIQUE索引，否则就是普通的INSERT
1.    尝试把新行插入到表中
2.    当因为对于主键或唯一关键字出现重复关键字错误而造成插入失败时：
  a.    从表中删除含有重复关键字值的冲突
  b.    再次尝试把新行插入到表中
  
# 4、TRUNCATE语法
对于InnoDB表，
    1. 如果有需要引用表的外键限制，则TRUNCATE TABLE被映射到DELETE上；否则使用快速删减（取消和重新创建表）；
    2. 重新设置AUTO_INCREMENT计数器，设置时不考虑是否有外键限制。
对于其它存储引擎，
    1. 删除并创建表；
    2. 删减操作不能保证对事务是安全的；在进行事务处理和表锁定的过程中尝试进行删减，会发生错误；
    3. 被删除的行的数目没有被返回。
    4. 只要表定义文件_tbl_name_.frm是合法的，则可以使用TRUNCATE TABLE把表重新创建为一个空表，即使数据或索引文件已经被破坏。
    5. 当被用于带分区的表时，TRUNCATE TABLE会保留分区；即，数据和索引文件被取消并重新创建，同时分区定义（.par）文件不受影响。

# 5、DESCRIBE
` {DESCRIBE | DESC} tbl_name `

查看表中各列的信息,用于与Oracle相兼容

等同于`show columns from table_name`



#mysql解析json 
![image.png|300](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2026-06-26-202606261549789.png)
