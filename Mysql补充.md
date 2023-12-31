---
typora-root-url: images
---

# Mysql的逻辑架构

![01.架构](/01.架构.png)





**日志**

1. 重做日志（redo log）持久性、原子性

2. 回滚日志（undo log)原子性

   一致性（通过锁、mvcc来约束）

3. 二进制日志（bin log），对数据库的任何变化（创建表，更新数据库，对行数据进行增删改）

4. 错误日志（error log）

5. 慢查询日志（slow query log）

6. 一般查询日志（general log）

7. 中继日志（relay log）

# 监控工具

## 查看数据库连接

show processlist 或者show full processlist查看数据库的连接状况

## 显示引擎

```
show engines;  查看所有引擎
show variables like '%storage_engine%';
```



## profile工具

查看sql的时候，只显示两位的有效小数。0.02sec，如果需要更精确的时间，可以使用show profiles查看sql的执行周期。

### 查看profile是否开启

```
show variables like '%profiling%';
```

### 开启profile

```
set profiling =1;
```

### 查看sql执行

```
show profiles
#进一步查看具体sql的执行步骤 2为show profiles查询出来的queryID
show profile cpu,block io for query 2;
```



## 慢查询

global：全局设置，需要重新打开新的窗口。

### 查看慢查询是否打开

```
show variables like '%slow_query%';
```

### 设置慢查询

```
set global slow_query_log =1;
```

### 查看慢查询时间

```
show variables like '%long_query%'; 
```

设置慢查询时间

```
set global long_query_time=2;
```

安装版的日志文件：c:/programData/mysql/mysql版本/xxx.log



# 引擎

## MyISAM和InnoDB

| 比较项目       | MyISAM                                                       | InnoDB                                                       |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 存储空间       | 可以被压缩，存储空间比较小                                   | 需要更多的内存和存储空间                                     |
| 外键           | 不支持                                                       | 支持                                                         |
| 事务           | 不支持                                                       | 支持                                                         |
| 缓存           | 只缓存索引，不缓存实际数据                                   | 不仅缓存索引还缓存数据，对内存的要求比较高，缓存的大小对于效率有决定性的影响 |
| 锁             | 表锁，即使操作一条记录也会锁住整张表，不适合高并发操作       | 行锁，操作时只锁一行，不会影响其他行。行锁有可能导致间隙锁（范围锁） |
| 关注点         | 读性能                                                       | 并发，事务等                                                 |
| 默认使用       | N                                                            | yes                                                          |
| 移植，备份     | 数据以文件的形式存储的，在备份和恢复时可以针对某个表进行操作 | 免费的备份方案可以是拷贝数据文件，binlog或者是dump文件       |
| 记录存储顺序   | 按照记录的插入顺序进行存储                                   | 按照主键大小顺序插入                                         |
| 索引的存储结构 | B+索引                                                       | B+树索引                                                     |
| 选择问题       | 查询快                                                       | 写更优                                                       |

## 查看引擎

```shell
#查看支持的引擎
show engines;
#查看默认的引擎
show variables like '%engine%';
```



# 索引

## 基本概念

索引是基于数据库表创建的，它包含表中的某些列以及记录的值（具体是什么值，要看引擎以及索引的种类）。Mysql的官方定义：索引是帮助mysql实现高效**获取数据**的数据结构。

索引：排好序的，能够快速查找数据的数据结构。通过对数据建立索引形成目录，在mysql当中，非主键索引（非聚簇索引），是在特定的数据之外，需要单独去维护的数据结构。索引是一个单独的文件，需要占用物理空间。

### 索引的作用

在存储数据的时候，会把数据按照指定的方式组织成某种数据结构（B+树），查询的时候，可以利用该数据结构的特点来提升查询的速度。

### 索引的优点

提升查询的效率，降低IO的成本

可以利用索引对数据进行排序，降低数据排序的成本，降低CPU的消耗。

### 缺点

索引实际也可以看作一张表，保存了主键和索引字段，需要占用空间。

索引会带来额外的维护成本（增加，删除，修改都需要维护索引表），降低写操作的效率。

### 索引的分类

根据列的多少：单值和复合（联合）索引

根据是否主键： 主键索引（聚簇索引）以及非主键索引（非聚簇索引、普通索引）

是否唯一： 唯一索引，索引列的值必须不能重复（唯一），但是允许有NULL值。（除了null之外的都不能重复）

hash索引：采用hash算法，只有在memory引擎的时候才会使用

全文索引：5.6以后的版本支持，类似solr，es，把一篇篇文章存储在某一列上，搜索的时候使用全文索引

## 索引的维护

### 创建表的时候

一起创建索引，复合索引用逗号隔开。

```
create table user (
   id   int primary key auto_increment ,
   name   varchar(30),
   sex    char(1),
   phone   varchar(12),
   email   varchar(50),
   index user_phone(phone)
);
```

### 创建表以后增加索引

create  [unique]  index 索引名 on 表名(索引列名[,索引列名])

ALTER TABLE 表名 ADD [UNIQUE]  INDEX  索引名(列名)

```
create index user_email on user(email)
ALTER TABLE user ADD UNIQUE INDEX user_email(email)
```

### 查看索引

```
show index from user
```

### 删除索引

```
drop index 索引名 on table名
```



## 索引查询的原理

### Mysql当中常见的索引结构

InnoDB:

​	主键索引（聚簇索引）：非叶子节点，只包含主键的值，叶子节点包含主键以及所在行的所有数据。索引和数据是一起存储的，整张表就是一个主键索引，表在磁盘上的存储呈现的就是树状结构。这种将数据和索引放在一起的存储方式的索引又称为聚簇索引。

​	非主键索引（非聚簇索引，普通索引）：非叶子节点，只存储索引列的值，叶子节点包含改行的主键值和索引列的值。

如何查找：如果是利用的主键查询，直接在主键索引表，根据主键的值，快速定位到数据。如果不是主键查询，而是和索引列相关的查询，可以先查索引表，快速拿到数据（只有索引列 + id的情况下）。如果有其他列，则可以通过id，再次通过主键索引获取数据。

通过索引获取主键id，再根据主键获取数据的过程，称之为回表。

MyISAM引擎:

​	主键索引（聚簇索引）：非叶子节点存储依旧是主键值，叶子节点存储的是主键值和该行所在的物理地址。

​              非主键索引：和InnoDB是相同



### mysql为什么会推荐自增长主键

B+树的插入数据可能会引起数据页的分裂，删除数据可能会引起列的合并，两者都是比较耗时的IO操作。所以比较好的方式就是顺序去插入数据。因为再插入数据的时候，主键值是自动增长的，不需要修改B+树当中已经排好序的节点，提升数据写操作的效率。



## 执行计划

模拟SQL优化器执行sql语句，从而让开发人员知道sql执行的具体信息，分成那几步，是否使用了索引，是否可以再次进行优化。

查看执行计划：**explain 语句**

![02.查询计划](/../../../../../../images/02.查询计划.png)

**id**：select查询的序列号，表示select的子句操作表的顺序。

​	id值相同，可以认为是一组操作，所有组当中，id值越大，越优先执行。id值越少越好

**select_type**: 查询的类型，主要用来区分普通查询，联合查询还是子查询等

​	SIMPLE: 简单的select，查询当中不包括子查询或者union

​	PRIMARY: 复杂查询中，最外层的查询被标记为PRIMARY

​	UNION:  包含UNION查询，UNION之后的查询，会被标记成UNION，如果From子句中包含子查询，外层select会被标记成DERIVED.

​	SUBQUERY: 在select或者where子句当中包含子查询

​	DEPENDENT SUBQUERY:  在select或者where子句当中包含子查询，子查询是基于外层的。

​	DERIVED: 在from子句当中如果包含子查询的话，有可能被标记为衍生，mysql会将执行结果放在临时表里面

**type**：

​	const: 常量查询 ，通过索引一次比对就查询到，一般出现primary key或者unique索引。where条件当中出现主键条件或者unique条件。

​	eq_ref:  关联查询当中，唯一索引扫描，对于每个索引键，表中只有一条记录与之匹配。

​	ref：非唯一性索引扫描，返回匹配某个单独值的所有行。

​	range: 只检索给定范围的行。如果条件当中出现between，>,< 等范围条件的时候，如果利用索引扫描的效果比全表扫描要好的话，优化器会优先选择索引中范围查询。

​	index：使用了索引，但是没有用索引进行过滤。可能使用索引进行了分组排序。

​	all:  全表扫描。本次查询优化器选择不使用索引。

possible_keys: 优化器根据查询语句，认为可能命中的索引。但是不一定会命中

key: 实际查询中命中索引

**Extra**：辅助说明信息

​	Using index：索引覆盖

​	Using index condition：索引条件下推

​	Using where : 使用了where条件进行过滤

​	Using filesort：优化器不使用索引，而是使用cpu进行扫描比较（想办法根据业务看看能否进行优化）

​	Using temporary：使用了临时表来保存中间结果，常见于order by， group by以及union可能会出现。

​	Using join buffer：关联查询当中经常出现，使用了缓存。

## 索引优化的原则

### 最左原则

建立复合索引的时候，最常使用的条件列放在最左侧

name,phone,email

name

name phone

name phone email

如果查询条件当中没有name条件的话，则索引无效。在设计复合索引的时候，要注意此原则

### 索引覆盖

查询的列在索引表中都能够获取的话，则不需要进行回表处理，我们称之为索引覆盖（Using index）。当优化sql的时候，尽可能满足此原则。

### 索引下推

在mysql5.6之前没有这个功能，为了提升性能，避免不必要的回表，Mysql5.6之后就有了索引下推。

一般出现复合索引的部分条件，或者是范围查询的时候。

select @@optimizer_switch; 可以查看索引下推的设置项目  index_condition_pushdown

set  optimizer_switch=' index_condition_pushdown=off' --关闭



### 部分前缀索引

某些列的数据量比较大的话，建立索引的话，所占的内存空间也比较多。可以使用列的部分值作为索引。为了时间和空间的平衡，可以将列的部分属性（一般都是前面部分）定义成索引。

缺点：order by 和group by无法命中索引



## 索引可能失效场景

```
--索引失效
explain select * from employee where substring(name,1,5)= 'Anita'; 
--employee的departmentid的外键索引失效
explain select * from employee where departmentid not in (select departmentid from department where departmentid >30 and departmentid <40);
--索引失效
explain select * from employee where departmentid not in (20,40,50,77);
 explain select * from employee where departmentid  >=10  and departmentid <=30;
```



过滤字段上使用函数，可能会导致索引失效

违法最左原则

in或者not in有可能会导致索引失效、范围查询(>,<,>= ,<= )会导致索引失效

不等于（!=, <>）会导致索引失效

like (百分号在前  like  ''%abc') 可能会导致索引失效

字符类型的数据，保存的是数字类的数据，查询的时候，如果不使用单引号，则会导致索引失效。更新的话，可能导致全表都被锁。



## 什么情况下创建索引

查询的频率是远远高于写操作。

数据量太小，不需要建索引

查询中与其他表相关联，且作为被驱动表，建立索引

唯一约束的字段需要建索引

经常用来排序和分组的字段

外连接的时候，选择小表作为驱动表，大表作为被驱动表。两个大数据量的表不建议使用外连接查询。



# 数据设计

## 范式

第一范式：每个列都是不可拆分（ 学生设计表的时候，院系专业都放在一个字段当中，违反了第一范式）

第二范式：非主键列完全依赖于主键（设计员工表时，将部门名，部门所在的地区信息都放在员工表，违反了第二范式）

第三范式：非主键完全依赖于主键，不依赖于其他非主键



## 主键选择

自然主键和代理主键

自然主键：充当主键的字段是有一点的含义，是属于记录的重要组成部分。比如说学生的学号，员工在公司中的工号

代理主键：充当主键的字段本身不具有自然属性，比如说sequence（oracle），自增长组件（mysql）

推荐使用代理主键



## 字符集问题

常用的字符集是UTF-8, 建议使用的UTF8mb4。





# 查询优化

## 减少查询的数据量

减少select * 的使用，一条记录的数据列比较多的时候，界面又不需要那么多列，可以不使用select*去查询

尽量去使用limit

## 减少null的使用

索引对null列会产生额外的空间来保存，而且查询的时候，使用is null 或者is not null会导致索引失效。在设计表的时候，尽量让字段都not null，设置默认值

## Limit分页优化

Limit偏移量较大的时候，查询的效率比较低。

可以记住上一页最后一条记录的id，下次查询的时候，直接根据此ID来进行查询

## 减少表的索引数量

限制每张表上的索引数量，建议单张表的索引不超过5个

1：索引可以增加查询的效率，但是会降低增删改（写操作）的效率

2：mysql优化器在选择如何使用索引时，要根据信息，对每一种案例进行评估，以生成最好的执行计划。如果有多个索引都可以用于查询，就会增加mysql优化器在生成执行计划时的时间，也会降低系统的查询性能。

## 分组和排序的处理

order by和group by字段上建立索引

order by 尽量要不全部升序，要不就是全部降序。

group by的使用原则和order by一致



## 数据量过大，怎么提升查询效率

被驱动表建立索引

在业务允许的情况下，尽量使用小表作为驱动表，大表作为被驱动表

尽量不要使用子查询，如果用，尽量不要使用子查询作为被驱动表（子查询结果是没办法建索引）

当外关联的两个表的数据量都很大的时候，可以考虑单个表数据取出，在java或者C#的代码中进行合并处理



范围查询，尽量不要使用not in 和not exists，可以使用 left join  ...  on where xxx  is  null



# Mysql锁

mysql的锁分为行级锁和表级锁

表级锁，需要通过代码去执行，行级锁是mysql的innodb的默认锁级别，当产生写操作的时候，mysql会自动帮我们增加行级锁。

## 表锁

分为读锁和写锁，读锁是共享锁，写锁是排他锁

lock table 表名  read/write

   读锁：大家可以共享读，但是谁也不能写

​    写锁：自己可以读写，别人不能操作

## 行锁

行锁： 当进行写操作的时候，mysql数据自动增加行级锁，超时或者提交回滚之后会进行锁的释放。

行锁可能会引起范围锁。

**写操作的时候，如果因为索引的失效，可能会导致表锁（务必小心）。**

innodb_lock_wait_timeout 行锁的等待的时间，可以将时间调小，避免长时间阻塞，特殊情况下，也可以将时间调大，避免发生大的回滚（批处理操作的时候）





![01.架构](/../../../../../../images/01.架构.png)