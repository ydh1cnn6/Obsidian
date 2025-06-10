---
typora-root-url: images
---

# ElasticSearch

## Lucene

Lucene是apache软件基金会 jakarta[项目组](https://baike.baidu.com/item/项目组/6791625?fromModule=lemma_inlink)的一个子项目，是一个[开放源代码](https://baike.baidu.com/item/开放源代码/114160?fromModule=lemma_inlink)的全文[检索引擎](https://baike.baidu.com/item/检索引擎/144626?fromModule=lemma_inlink)[工具包](https://baike.baidu.com/item/工具包/4576772?fromModule=lemma_inlink)，但它不是一个完整的全文检索引擎，而是一个全文检索引擎的架构，提供了完整的查询引擎和索引引擎，部分[文本分析](https://baike.baidu.com/item/文本分析/11046544?fromModule=lemma_inlink)引擎（英文与[德文](https://baike.baidu.com/item/德文/26064?fromModule=lemma_inlink)两种西方语言）。Lucene的目的是为[软件开发](https://baike.baidu.com/item/软件开发/3448966?fromModule=lemma_inlink)人员提供一个简单易用的工具包，以方便的在目标系统中实现全文检索的功能，或者是以此为基础建立起完整的全文检索引擎。

## ElasticSearch

The Elastic Stack是一个项目工具集，包含ElasticSearch、Kinaba，Beats以及Logstash。能够安全可靠地获取各种来源的数据，并且对数据进行实时的搜索、分析以及可视化。

**Elasticsearch** 是一个高度可扩展且开源的REST风格的全文检索和分析引擎。它可以让您快速且近实时地存储，检索以及分析海量数据。它通常用作那些具有复杂搜索功能和需求的应用的底层引擎或者技术。



## 索引方法

正排索引：文档的id为关键字，索引文档种每个内容的位置，查找时扫描每个文档当中的内容直到找到锁包含的关键字，应用在结构统一并且数据量不大的情况。

倒排索引：反向索引。通过某个单词，能够快速定位到包含此单词的文档。包含两个部分：单词词典和倒排文件。应用在结构不固定且数据量比较大的情况。

原理（过程）：将结构化的数据的一部分内容抽取出来，重新组织，使其变成一定结构化的数据。然后对齐进行索引，从而提供查询效率

## Solr和ElasticSearch对比

1：Solr利用Zookeeper进行分布式管理，ES自带分布式管理协调器

2：Solr的安装比较复杂，ES比较简单

3：Solr支持的数据类型比较多，json，xml，csv，ElasticSearch只支持json数据格式

4：Solr提供的底层功能更多，ES更注重核心功能，图形化界面比较友好（kibana）

5：Solr的索引更新比较慢，查询速度比较块

​       ES这块查询比较慢，索引的更新比较快，即时性性更好



# 安装

window版本解压即可适用

点击/bin/elasticsearch.bat
![image-20230314142728249.png](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-06-10-image-20230314142728249.png)




9300: ES的集群之间维持心跳的端口

9200：客户端连接的端口
![image-20230314142944859.png](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-06-10-image-20230314142944859.png)

# 核心概念



## 索引（index）

索引：相似特征的文档的集合。一个索引必须要由标识符进行标记，可以对索引进行增加，删除以及搜索等操作

在ES当中可以定义多个索引，能搜索的数据先进行索引再进行查询，提升查询的效率。

ES当中的索引可以类比于结构化数据库当中的表，但是表当中所有的数据结构是相同的，索引当中文档的结构则可以不同。

## 文档（doc）

一个文档是一个可以被索引的基本单元，类似于结构化数据库当中的record。可以是某个客户的文档，也可以是产品的文档，也可以商户的文档。文档以JSON格式表示。

## 字段（field）

相当于结构化数据库的column，用来记录文档的属性



## 分片

一个索引的数据量可能会超过单个硬件限制的范围。比如10亿数据量的文档索引可能1TB的磁盘空间，一般情况下，单个的硬件不会有那么大的磁盘空间，而且单个节点来处理请求，响应比较慢。为了解决这个问题，ElasticSearch提供将索引分成多份的功能，每一份就称之为分片。每一个分片都有相对独立的索引功能。

## 副本

在大的网络环境当中，其中某一个节点因为机器的故障或者网络的故障等多种原因，可能处于离线状态。如果没有副本，不进行故障转移，集群的服务就会出现问题。为了集群的高可用性，ES允许为分片创建副本。当主分片出现故障后，从副本上进行读取数据。

主分片和副本不在同一个节点上。

# 索引操作

## 创建索引

适用put请求

```
PUT /product
```

## 查看单个索引

适用GET请求

```
GET /product
```



## 查看所有索引

```
GET /_cat/indices
```

## 删除索引

适用delete

```
DELETE /product
```



# 文档操作

## 创建文档

```shell
POST /product/_doc
{
  "title":"java编程基础",
  "price":200,
  "category":"计算机技术",
  "author":"陈阳",
  "publish":"西北工业大学"
}
```

## 指定ID创建文档

```shell
POST /product/_doc/1
{
  "title":"C语言",
  "price":50,
  "category":"计算机技术",
  "author":"陈星驰",
  "publish":"清华大学出版社"
}
```

## 查找文档

```shell
#查找单个索引
GET /product/_doc/1
#查找所有
GET /product/_search
```

```yml
GET /book/_ search
{
    "query": {
        “match": {
        	"publisher":“出社"
        }
    }
}

//组合
GET /book/_ search
{
    "query": {
	    "bool":{
	    "should":[
            {“match": {"title":"西游"}}
            {“match": {"publisher":“出社}}
	    ]
	    }
        
    }
}


```

trem:数值类型，不做分词处理

match



## 修改文档

```shell
#全量修改
PUT /product/_doc/1
{
  "title":"C语言11",
  "price":80,
  "category":"计算机技术",
  "author":"陈星驰",
  "publish":"清华大学出版社"
}
#部分修改
POST /product/_update/1
{
  "doc":{
    "title":"python"
  }
}

```



## 删除文档

```
DELETE /product/_doc/di_63oYBP0mK2zQDTlTg
```



## 查询分页排序

```json
GET /product/_search
 {
    "query":{
      "match_all": {

      }
    },
    "from": 0,  
    "size": 2,
    "_source": ["title","price"], 
    "sort": [   
      {
        "price": {
          "order": "asc"
        }
      }
    ]
    
  }
```



## 组合查询

shoud表示or条件，must表示and条件

```
GET /product/_search
 {
    "query":{
      "bool": {
        "should": [
          {
             "match": {
                   "category": "编"
              }
          },
           {
             "match": {
                   "publish": "西北"
              }
          }
        ]
      } 
     
    }
  
  }
```



# Java代码操作ES

# 分布式集群

## 配置

## 故障转移

当集群当中的某一个节点，出现单点的故障（宕机或者网络问题），集群会自动进行故障转移。如果是master挂掉了，集群会重新选择一台机器作为主节点。分片和副本都会进行自动分配。

当集群当中如有新的节点加入的话，也会重新分配。

## 路由计算

ES当中主分片的数量不能进行修改。

当存储一个文档的时候，集群会根据主分片的数量，计算存储在那个分片上。ES内部有它自己的路由规则

hash（routing)%主分片数量=shard

routing是一个可变值，默认是文档的_id，也可以是自定义的值。



**写操作**

客户端发送请求到协调节点（集群中的任意一个）

协调节点将请求转发的指定节点（包含主分片）

主分片保存数据

主分片将数据分发给副本

副本保存完之后反馈给主分片

主分片进行响应

客户端获得响应结果

索引的创建和删除，文档的创建、修改、删除都是写操作，都需要在主分片上完成，然后复制给副本。



**读操作**

客户端发送请求到协调节点（集群中的任意一个）

协调节点计算获取到主分片以及其所有副本所在的位置

将请求转发到具体的节点（有负载均衡的策略）

节点返回查询节点，并将结果返回给客户端。



## 扩容

一般情况下，主分片 + 副本的总数=节点的平方

```
put /users/_settings
{
  "number_of_replicas":2
}

```



# 分析器

ES内置了很多的分析器。对存入的数据预先进行分析，并形成词条。

目前使用的标准的分析器，根据unicode联盟定义的单词边界进行分词处理，它会删除掉绝大部分的标点。

IK分词器：中文分词器，下载解压后放入es的plugins目录下即可。提供两种分词器：

ik_max_word: 会将文本做做多词汇的拆分（最细粒度），尽可能多的拆出词语

ik_smart: 粗粒度的拆分，已经被拆分出来的词语不会被其他词占用



