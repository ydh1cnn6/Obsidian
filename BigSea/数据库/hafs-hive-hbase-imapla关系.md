---
title: hafs-hive-hbase-imapla关系
tags:
  - 笔记
  - 未命名
author: BigSea
email: 2834637197@qq.com
封面: ""
createDate: 2025-12-24 16:12:32
updateDate: 2025-12-25 09:59:46
week: 第52周｜星期三
Country: China
City: NanJing
Weather: 🌫️
uvIndex(1-15): 1
Temperature(℃): 7
CurrentWeatherTime: 3:00 PM
GetWeatherTime: 2025-12-24 16:12:43
Feels Like(℃): 5
Pressure(hPa): 1022
Humidity(%): 76
WindSpeed: 3
WindSpeedDesc: 微风
TempRange(℃): 6-8
SunHour: 7.8h
Sunrise: 07:03 AM
Sunset: 05:06 PM
---
[hafs-hive-hbase-imapla关系备份](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-12-25-202512250952721.png)
![hafs-hive-hbase-imapla关系](Excalidraw/hafs-hive-hbase-imapla关系.md)
# Hadoop
## HDFS
HDFS的英文全称是Hadoop Distributed File System，即Hadoop分布式文件系统
## YARN

## MapReduce


# Hive
依赖Hadoop，真正的计算和执行则由**MapReduce**完成（也可以通过 Apache Tez、Apache Spark执行查询）。
定义了简单的类似 SQL 的查询语言——Hive SQL
>[!tip]
Hive 并不是一个关系数据库。Hive 中没有定义专门的数据格式，需要由用户指定三个属性：**列分隔符、行分隔符 、读取文件数据的方法**（Hive 中默认有三个文件格式 TextFile，SequenceFile 以及 ORCFile）。Hive 在查询数据的时候，由于没有索引，需要扫描整个表Hive SQL，因此延迟较高；另外一个导致 Hive 执行延迟高的因素是 MapReduce 框架，由于 MapReduce 本身具有较高的延迟，因此在利用 MapReduce 执行 Hive 查询时，也会有较高的延迟（相对的，数据库的执行延迟较低，当然，这个低是有条件的，即数据规模较小，当数据规模大到超过数据库的处理能力的时候，Hive 的并行计算显然能体现出优势）。

# Hbase
HBase是一个开源的、分布式的、持久的、强一致性的数据存储系统（NoSQL数据库），可以在**HDFS**或Alluxio（VDFS）之上运行，具有近似最优的写性能和出色的读性能，主要适用于海量明细数据（十亿、百亿）的随机实时查询，如日志明细、交易清单、轨迹行为等，此开源项目的目标是在商品硬件集群上托管非常大的表——数十亿行X数百万列。
1. HBase不是关系型数据库，而是一个在HDFS上开发的面向列的分布式数据库，不支持SQL。 
2. HBase为查询而生的，**它通过组织起节点内所有机器的内存**，提供一個超大的内存Hash表 。
3. HBase是物理表，不是逻辑表，提供一个超大的内存hash表，搜索引擎通过它来存储索引，方便查询操作。 
4. HBase是列存储。
对于那些有低延时要求的应用程序，HBase是一个好的选择，尤其适用于对海量数据集进行访问并要求**毫秒级响应**时间的情况，但HBase的设计是对单行或者少量数据集的访问，对HBase的访问必须提供主键或者主键范围。访问接口：Hive、Pig、REST Gateway、HBase Shell、Native Java API、Thrift Gateway
>[!tip]
Hive 提供易用的查询接口，MapReduce 提供分布式计算能力。但随着技术发展，Hive 已不再局限于 **MapReduce**，用户可根据场景选择更高效的执行引擎
# Impala
Impala可以直接对接存储在HDFS、HBase 或亚马逊S3中的Hadoop数据，提供快速、交互式的 SQL 查询，提高 APACHE Hadoop 上的SQL查询性能。Impala 使用与 Hive 相同的元数据、SQL 语法（Hive SQL）、ODBC 驱动程序和用户界面（Hue Beeswax），因此，Hive用户只需很少的设置成本，即可使用Impala。
原理：为了避免延迟，Impala**绕过MapReduce**，通过一个专门的分布式查询引擎直接访问数据，该引擎与商业并行RDBMS中的查询引擎非常相似。结果是性能比 Hive 快几个数量级，具体取决于查询类型和配置。
>[!tip]
注：安装impala的话，必须先安装hive，保证hive安装成功，并且还需要启动hive的metastore服务。
