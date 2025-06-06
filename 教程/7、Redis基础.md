---
几typora-root-url: images
---

# Redis基础

## Redis是什么

Redis（Remote Dictionary Server）是一个开源的中间件，可以作为数据库，缓存，消息中间件，流引擎。以key/value的形式存储数据，是一个内存型的中间件。key都是以String的形式存储，value值包含多种数据类型， [strings](https://redis.io/docs/data-types/strings/), [hashes](https://redis.io/docs/data-types/hashes/), [lists](https://redis.io/docs/data-types/lists/), [sets](https://redis.io/docs/data-types/sets/), [sorted sets](https://redis.io/docs/data-types/sorted-sets/) （zSet）with range queries, [bitmaps](https://redis.io/docs/data-types/bitmaps/), [hyperloglogs](https://redis.io/docs/data-types/hyperloglogs/), [geospatial indexes](https://redis.io/docs/data-types/geospatial/), 支持分布式存储，LUA脚本，提供缓存清除策略、事务和不同级别的持久化方式。

Redis也是NoSQL数据库的主要产品（redis，mongodb，memcache等）。redis的结构相对简单，操作大部分是原子操作。redis的key最大允许512M

## Redis的优势

基于内存：绝大部分的请求都是基于内存操作，快速。

单线程：Redis的操作都是单线程，可以避免上下文切换，多线程需要考虑锁，单线程不要，可以节省资源

使用多路复用I/O模型，非阻塞IO

数据结构相对比较简单



## 安装

window的版本：

​	点击msi文件安装即可。

​	安装文件夹当中，redis-server.exe用来启动服务，redis-cli.exe启动客户端。



# 基本操作

## 数据库选择

redis当中一共有16个数据库，序号是从0~15，默认是0号数据库，使用select  index切换数据库。

## 常用命令

### string

常规的key-value缓存应用

应用场合：验证码，访问流量

set  保存一个string类型的数值  set  key   value  ex  秒（px  毫秒）

get   获取一个值

del   删除一个key

incr  对应key的value（数值类型）增加1

incrby  设置key的value值每次增加一个数  incrby  key  5

decr  每次减少1

decrby  每次减少指定的值

strlen： 获取长度

append： 追加

exists：判断key是否存在，为0则不存在，1则存在

setnx：设置值，如果key存在，则不能设置，不存在则可以设置 

expire：全局操作，对所有key都起作用，设置key的有效事件

<img src="images/01.string操作.png" alt="01.string操作" style="zoom:50%;" />

### lists

<img src="https://my-picture-aa.oss-cn-nanjing.aliyuncs.com/img/202308171310250.png" alt="02.lists" style="zoom:50%;" />

### set

<img src="https://my-picture-aa.oss-cn-nanjing.aliyuncs.com/img/202308171311456.png" alt="03.set操作" style="zoom:50%;" />

### sorted set

<img src="https://my-picture-aa.oss-cn-nanjing.aliyuncs.com/img/202308171311896.png" alt="05.sortedSet" style="zoom:50%;" />

### hash

<img src="https://my-picture-aa.oss-cn-nanjing.aliyuncs.com/img/202308171311820.png" alt="04.hash操作" style="zoom:50%;" />

### bitmap

![06.bitmap](https://my-picture-aa.oss-cn-nanjing.aliyuncs.com/img/202308171311836.png)



## 常规操作

redis可以作为缓存，可以设置key存活的时间。string类型可以使用set命令设置时指定时间。

### 设置存活时间

expire  秒

pexpire  毫秒



### 查看存活时间

ttl ，pttl获取存活时间

ttl的单位是秒，pttl的单位是毫秒

 -1  ：永久保存

正数： 存活的时间

-2：表示数据已经过期

### 清除存活时间

将有限的存活时间变成了永久保存

重新设置值，不设置过期时间，会由短期存储变成长期存储

### 密码操作

**使用命令来设置密码**

```
#服务器重新启动，则会无效
config set  requirepass 密码
config set  requirepass 123

#设置结束后不需要重新启动服务器，一旦启动就无效
auth  密码
```

**使用配置文件来进行处理**

windows版本修改redis.windows.conf配置文件

linux版本:redis.conf

释放requirepass属性，并且设置密码

启动的时候带着配置文件启动

### 其他操作

flushdb： 清空本数据库

flushall：清空所有数据库中的数据

del：删除指定的key

exists：判断某个key是否存在

move：将数据从原来的数据库移动到另外一个指定索引的数据  move  key  dbIndex。存在同样key的情况下会移动失败

keys:  用来查找符合条件的key值

​            keys  *  查找所有的key（当前的数据库）

​	'*' : 匹配0~n个字符

 	？匹配单个字符

​	[]: 匹配中间任意一个字符，可以使用中横线（-）指定范围

​	'\\*':用于转义字符✳，如果匹配?，则使用\?



# 持久化

Redis是一个内存型的数据库，当redis服务器重启的时候，数据就会丢失。redis提供持久化方式，将数据或者指令保存到磁盘的文件当中。持久化方式分成两种：RDB(默认)和AOF方式

## RDB方式

RDB是默认的存储方式，采用快照的形式，在指定的时间间隔内将内存中的数据存储到文件中。实际操作时fork一个子进程，先将数据写入临时文件，写入成功后，再替换之前的文件，并且使用二进制进行压缩。在间隔期间，根据key的变化情况决定是否持久化数据。

```shell
#15分钟至少有一次数据变化
save 900 1
#5分钟内至少有10此数据变化
save 300 10
#1分钟内有10000次数据变化
save 60 10000
```

特点：

​	优点：默认，文件压缩，方便恢复数据

​	缺点：容易丢失数据

弥补措施：调用bgsave或者save来进行手工存储

​	bgsave和save都会将内存中的数据保存到文件，成功时返回ok

​	save：在保存期间会阻塞用户的请求，服务器的性能消耗比较小

​	bgsave：不会阻塞用户的请求，服务器的压力比较大

## AOF方式

AOF不是默认，需要手工开启。将redis的操作日志（指令）以追加的形式写入文件. 可以选择操作一条记录一条，也可以选择每秒钟持久化一次方式。如果选择每次操作都进行处理的话，对性能的影响比较大。

会将操作指令存到缓冲区，当缓冲区满了或者时间到了，一次性追到到持久化文件当中。当服务器重启的时候，会首先读取appendonly文件。

```
#默认不启用aof持久化方式，想要开启，将no变成yes
appendonly no

#默认的持久化文件名
appendfilename "appendonly.aof"

#每一次操作都执行持久化处理
# appendfsync always
#每秒钟执行一次持久化处理
appendfsync everysec
#不进行持久化
# appendfsync no
```

特点：

​	优点： 基本不会丢数据

​	缺点： 持久化的频率较高，会影响性能，由于会产生多个文件，对于数据的恢复没有rdb方式效率高。



# 事务

redis的事务，开始事务后，将所有的指令入队，调用exec提交事务，一起执行。取消事务使用discard指令。

如果中间出现执行错误，并不会直接取消，当前这条出错，后续会继续执行。

如果指令是错误的，则会取消事务。

multi：开启redis的事务

exec：提交事务

discard：取消事务

watch：监听某个key，如果有操作，类似于版本号+1，事务中如果版本号被修改，则事务无法提交。

unwatch

# Redis的淘汰机制和过期策略

## 淘汰机制

Redis是内存数据，当占用的内存超出最大限制（maxmemory），需要使用淘汰策略，让redis淘汰掉一些数据，留给后续的数据写操作，或者进行异常处理。



```
#从设置过期时间的这些key当中查找最近最少使用的，淘汰掉
# volatile-lru -> Evict using approximated LRU among the keys with an expire set.
#从设置过期时间的这些key当中查找，淘汰掉一段时间内，使用最少的
# volatile-lfu -> Evict using approximated LFU among the keys with an expire set.
# 从设置过期时间的这些key当中，随机淘汰掉
# volatile-random -> Remove a random key among the ones with an expire set.
# 从设置过期时间的这些key当中，最快过期的数据淘汰掉
# volatile-ttl -> Remove the key with the nearest expire time (minor TTL)
#从所有key当中，查找最近最少使用的，淘汰掉
# allkeys-lru -> Evict any key using approximated LRU.
#从所有key当中，淘汰掉一段时间内，使用最少的
# allkeys-lfu -> Evict any key using approximated LFU.
#从所有key当中，随机淘汰掉
# allkeys-random -> Remove a random key, any key.
#不进行处理，直接抛出error（默认值）
# noeviction -> Don't evict anything, just return an error on write operations.
```



## 删除策略

定时删除：

​	当key设置一个过期时间，同时设置一个创建一个定时器，当时间到达的时候，由定时器立刻执行删除操作。

​	优点：节省内存，立刻删除，基本没有废数据

​	缺点：CPU的压力比较大，放了很多定时器后。

惰性删除：

​	数据到了过期时间后，并不删除，不做任何处理。等到下次访问时

​		数据过期：删除并返回不存在

​		未过期：返回数据

​	优点：节省CPU

​	缺点：占用内存，必须下次访问才可能被删除

**定期删除：**

​	周期性轮询redis库中数据的时效性，采用随机抽查的策略，利用过期数据的占比来控制删除的频率。





# redis缓存问题

## 缓存穿透

用于使用一个不存在的key频繁访问缓存和数据库，由于此key的数据既不在缓存当中，也不在数据库当中，请求--》缓存--缓存失败--》数据库--查询失败。当高并发或者有人恶意攻击的时候，就将所有的压力都交给数据库服务器，由可能导致数据库崩溃。整个系统都挂了。

**发生的场景**

1：数据原来是存在的，由于某些原因（程序员的问题，误删除，淘汰机制），缓存和数据库当中的数据已经删除，前置的应用程序当中还有。

2：恶意攻击

**如何解决**

缓存空值：分析业务，如果是正常业务发生缓存穿透问题的话，可以将对应key/value（null）缓存到redis当中，设置较短的过期时间。如果是恶意攻击，此策略不行，缓存大量的空值，导致缓存服务器空间不足。

业务逻辑前置校验：在业务请求的入口，根据业务规则，进行数据的合法性校验。提前阻止非法请求。

布隆过滤器：对于入口的查询参数，以hash的形式存储，hash方法是多种，在控制层进行校验，不符合的则丢弃。

​	

## 缓存雪崩

缓存雪崩：在某一个时间段，缓存集中过期，比如双十一，双十二，六一八，产生一批缓存集中过期的状况。在某个时点上，高并发访问，会将压力都转移给传统的数据。也有可能是缓存服务器宕机或者断网，导致查询的压力都集中到传统数据库上。

**发生的场景**

1：大量的热点key过期

2：缓存服务器故障

3：系统上线，缓存服务器没有数据

**如何解决**

给每项数据设置一些随机的过期时间，让过期时间均匀分布。

热点数据不过期，通过后端异步更新缓存。（使用缓存和数据库不要求严格一致的场景）

redis集群（针对缓存故障的情况）

当发生雪崩的时候，进行服务的限流（控制并发量），服务的熔断和降级处理

当正式部署的时候，由于缓存服务器没有数据，也可能导致雪崩。采用数据预热的方式，将一部分数据通过程序刷入缓存服务器。



## 缓存击穿

高并发集中对某一个key的数据访问，某个时点key突然失效了，持续的高并发穿破缓存服务器，直击传统数据库。瞬间可能压垮传统数据库。

1）设置热点数据不过期

2）用队列限流

3）使用分布式锁



查：如何解决redis和传统数据库的数据一致性问题



## 秒杀

知识点：Jedis连接池，CountDownLatch



# 集群的搭建方式

## 集群搭建的三种方式

主从（master-slave）

哨兵机制（Sentinel）

集群(cluster)

**主从**

主从：实现读写分离，主服务器主要用来进行写操作，从服务器进行读操作，从服务器不能进行读写操作。

当主服务器挂了以后，可以通过指令将从服务器变成主服务器

先开启服务器，默认端口为6379

再使用下述命令，开启6380服务器，并作为6379的从服务器

```
redis-server --port 6380 --slaveof 127.0.0.1 6379

#关掉主服务器，从服务器翻身做主人
#从服务器的客户端
slaveof no one

```

**哨兵机制**

主从方式需要人工干预，无法直接从从机变成主机，也不能进行任何故障转移。

哨兵不做任何的业务处理，只是用来管理整个主从服务器集群。哨兵的节点一般要求奇数台，最少三台机器

哨兵的作用：

监控：Sentinel会不断检查主服务器和从服务器是否正常工作。

通知：当某一个redis节点出现问题后，sentinel会发送通知给系统管理员或者其他计算机程序

自动故障转移：当主服务器出现故障后，sentinel会从从服务器当中，选举（多数通过原则）一个从机，并且升级成主机，并且告知其他的从服务器，主服务器已经发生变更。

配置提供者：sentinel充当客户端服务发现的来源。当sentinel接收到客户端请求的时候，会提供主服务器的地址，如果发生故障转移，sentinel会报告新地址。













