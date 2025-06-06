# 分库分表

## 基本概念

### 为什么需要分库分表

提升性能、增加可用性

**提升性能**

如果单表数据量过大，当数据量超过一定量级后，无论是查询还是更新，在经过添加索引等纯数据库层面的传统优化手段之后，还是可能存在性能问题。这时候就需要去换个思路来解决问题。比如从数据生产源头、数据处理源头入手，既然数据量很大，那我们就来个分而治之，化整为零。这就产生了分表，把数据按照一定的规则分成多张表，突破单表环境下的数据存取性能瓶颈。

如果表的数据量超过一千万行，即使SQL使用了索引，查询也是会明显变慢。这是因为索引一般是B+树结构，数据千万级别的话，B+树的高度会增高，查询就会变慢。以MySQL的InnoDB为例，InnoDB存储引擎最小储存单元是页，一页大小固定是16KB，使用该引擎的表为索引组织表。B+树叶子存的是数据，内部节点存的是键值和指针。索引组织表通过非叶子节点的二分查找法以及指针确定数据在哪个页中，进而再去数据页中找到需要的数据。

**增加可用性**

单个数据库如果发生意外，很可能会丢失所有数据。尤其是云时代，很多数据库跑在虚拟机上，如果虚拟机/宿主机发生意外，可能造成无法挽回的损失。因此，除了传统的Master-Slave、Master-Master等部署层面解决可用性问题的方案外，我们也可以考虑从数据分片层面在一定程度上解决此问题。

### 什么时候考虑分库分表

如果B+树的高度为2，即有一个根节点和若干个叶子节点，则这棵B+树的存放总记录数为：根节点指针数 * 单个叶子节点记录行数。

假设一行记录的数据大小为1KB，那么单个叶子节点可以存的记录数 =16KB/1KB =16。非叶子节点内可以存放多少指针呢？假设主键ID为bigint类型，长度为8字节，而指针大小在InnoDB源码中设置为6字节，所以就是一个键值指针占用8+6=14字节，一个内部节点中存储的指针个数为 16KB/14B = 16 * 1024B / 14B = 1170。因此，一棵高度为2的B+树，能存放 1170 * 16 = 18720 条这样的数据记录。同理一棵高度为3的B+树，能存放 1170 *1170 *16 = 21902400，大概两千万左右的记录。

B+树高度一般为1-3层，如果到了4层，查询时会增加查磁盘的次数，数据寻找就会变慢。因此如果单表数据量太大，SQL查询变慢，就需要考虑分表了。

### 分库

将一个数据库拆分成多个数据库

一种是多个数据库具有同等能力

一种是主备模式

### 分表

水平拆分：将表中的数据按照一定的规则进行拆分，比如按照年份，日期，主键值范围等

垂直拆分：将字段比较多的表拆成多个字段比较少的表，一般不建议做垂直拆分，这种拆分应该在需求定义的时候已经规划

### 分库分表引起的问题

#### 透明路由

虽然数据分片解决了性能、可用性以及单点备份恢复等问题，但分布式的架构在获得收益的同时，也引入了新的问题。面对如此散乱的分片之后的数据，应用开发工程师和数据库管理员对数据库的操作变得异常繁重就是其中的重要挑战之一。

#### 分布式ID

数据库被切分后，不能再依赖数据库自身的自增主键生成机制，因为多实例之间不感知彼此的ID，会出现ID重复。常用的分布式ID解决方案有：UUID、基于数据库自增单独维护一张全局ID表、互斥号段模式、Redis单线程自增、雪花算法（Snowflake）等。

#### 跨实例关联查询

在单库未拆分之前，我们可以很方便地使用join操作关联多张表查询数据，但是经过分库分表后，关联表可能不在一个数据库实例中，如何使用join呢？通常有以下几种解决方案。

数据复制：将需要关联的表通过数据库提供的复制机制，整合到同一个实例中。
       字段冗余：把需要关联的字段放入主表中，避免join操作。
       数据抽象：通过ETL工具将数据汇总聚合，生成新表。
       全局表：把一些基础表在每个数据库中都放一份。
         应用层组装：将基础数据查出来（即所谓两次查询），通过应用程序计算组装

#### 分布式事务

单数据库可以用本地事务，使用多数据库就只能通过分布式事务解决了。常用解决方案有两阶段提交（2PC）和柔性事务（BASE）等。

#### 排序、分页、函数计算问题

在使用SQL时order by、limit等关键字和聚合函数需要特殊处理。一般来说采用分片的思路，先在每个分片上执行相应的排序和函数，然后将各个分片的结果集进行汇总并再次计算，得到最终结果



##    分布式id生成策略

传统数据库软件开发中，主键自动生成技术是基本需求。而各个数据库对于该需求也提供了相应的支持，
比如MySQL 的自增键，Oracle 的自增序列等。数据分片后，不同数据节点生成全局唯一主键是非常棘手
的问题。同一个逻辑表内的不同实际表之间的自增键由于无法互相感知而产生重复主键。虽然可通过约
束自增主键初始值和步长的方式避免碰撞，但需引入额外的运维规则，使解决方案缺乏完整性和可扩展
性。
        目前有许多第三方解决方案可以完美解决这个问题，如UUID 等依靠特定算法自生成不重复键，或者通过
引入主键生成服务等。为了方便用户使用、满足不同用户不同使用场景的需求，Apache ShardingSphere
不仅提供了内置的分布式主键生成器，例如UUID、SNOWFLAKE，还抽离出分布式主键生成器的接口，
方便用户自行实现自定义的自增主键生成器。     

### 	 uuid

UUID是指在一台机器上生成的数字，它保证对在同一时空中的所有机器都是唯一的。通常平台会提供生成的API。按照制定的标准计算，用到了以太网卡地址、纳秒级时间、芯片ID码和随机数。

UUID由以下几部分的组合：

- 当前日期和时间，UUID的第一个部分与时间有关，如果你在生成一个UUID之后，过几秒又生成一个UUID，则第一个部分不同，其余相同
- 时钟序列
- 全局唯一的IEEE机器识别号，如果有网卡，从网卡MAC地址获得，没有网卡以其他方式获得



缺点：

不易于存储：UUID太长，16字节128位，通常以36长度的字符串表示，很多场景不适用。
       信息不安全：基于MAC地址生成UUID的算法可能会造成MAC地址泄露，这个漏洞曾被用于寻找梅丽莎病毒的制作者位置。
        ID作为主键时在特定的环境会存在一些问题，比如做DB主键或者索引的场景下，UUID就非常不适用

### 	 雪花算法

SnowFlake 算法，是 Twitter 开源的分布式id 生成算法。其核心思想就是：使用一个 64 bit 的 long 型的数字作为全局唯一 id。在分布式系统中的应用十分广泛，且ID 引入了时间戳，可以保证所有生成的ID按时间趋势递增整个分布式系统内不会产生重复ID

`sharding-jdbc` 中雪花算法生成的主键主要由 4部分组成，`1bit`符号位、`41bit`时间戳位、`10bit`工作进程位以及 `12bit` 序列号位。

缺点：

依赖机器时钟，如果机器时钟回拨，会导致重复ID生成

 在单机上是递增的，但是由于设计到分布式环境，每台机器上的时钟不可能完全同步，有时候会出现不是全局递增的情况（此缺点可以认为无所谓，一般分布式ID只要求趋势递增，并不会严格要求递增～90%的需求都只要求趋势递增）

### 	 redis

当使用数据库来生成ID性能不够要求的时候，我们可以尝试使用Redis来生成ID。这主要依赖于Redis是单线程的，所以也可以用生成全局唯一的ID。可以用Redis的原子操作 INCR和INCRBY来实现。redis incr操作最大支持在64位有符号的整型数字。

缺点：

redis 宕机后不可用，RDB重启数据丢失会重复ID

自增，数据量易暴露。

### 修改自增加默认值

例如美团的uid生成，其实就是采用修改的自增长主键来进行处理的。需要zookeeper注册中心

https://tech.meituan.com/2017/04/21/mt-leaf.html

##    sharding-jdbc

![image-20220831083333869](C:/Users/Administrator/AppData/Roaming/Typora/typora-user-images/image-20220831083333869.png)

### 语句执行步骤

SQL解析==》查询优化==》SQL路由==》SQL改写==》SQL执行==》结果归并

- **SQL解析**
  分为词法解析和语法解析。 先通过词法解析器将 SQL 拆分为一个个不可再分的单词。再使用语法解析器对 SQL 进行理解，并最终提炼出解析上下文。 解析上下文包括表、选择项、排序项、分组项、聚合函数、分页信息、查询条件以及可能需要修改的占位符的标记。
- **执行器优化**
  合并和优化分片条件，如 OR 等。
- **SQL路由**
  根据解析上下文匹配用户配置的分片策略，并生成路由路径。目前支持分片路由和广播路由。
- **SQL改写**
  将 SQL 改写为在真实数据库中可以正确执行的语句。SQL 改写分为正确性改写和优化改写。
- **SQL执行**
  通过多线程执行器异步执行。
- **结果归并**
  将多个执行结果集归并以便于通过统一的 JDBC 接口输出。结果归并包括流式归并、内存归并和使用装饰者模式的追加归并这几种方式。

### 数据库分片策略（databaseStrategy）

#### standard

用于单分片键的标准分片场景，对应StandardShardingStrategy，提供对SQL语句中的=, >, <, >=, <=, IN和BETWEEN AND的分⽚操作⽀持。
	shardingColumn: # 分片列名称
	shardingAlgorithmName: # 分片算法名称

####   complex

用于多分片键的复合分片场景，对应ComplexShardingStrategy复合分⽚策略。提供对SQL语句中的=, >, <, >=, <=, IN和BETWEEN AND的分⽚操作⽀持。
	shardingColumns: 分片列名称，多个列以逗号分隔
	shardingAlgorithmName: # 分片算法名称

####   hint     

Hint 分片策略，对应HintShardingStrategy，通过Hint指定分⽚值⽽⾮从SQL中提取分⽚值的⽅式进⾏分⽚的策略。

​	shardingAlgorithmName: # 分片算法名称

####   none

不分片

### 分片算法

#### 取模分片算法

类型：MOD

可配置属性：sharding‐count  （int）分片数量

#### 哈希取模分片算法

类型：HASH_MOD

可配置属性：sharding‐count  （int）分片数量

#### 基于分片容量的范围分片算法

VOLUME_RANGE

可配置属性：

​	range‐lower：（long）  范围下界，超过边界的数据会报错

​	range‐upper：（long）  范围上界，超过边界的数据会报错

​	sharding‐volume：（int）  分片容量		

### 依赖

注意shardingsphere的每个版本差异较大，尤其是5.x和4.x，使用的时候要注意

```xml
<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
            <version>2.1.4</version>
        </dependency>

        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <scope>runtime</scope>
        </dependency>

        <dependency>
            <groupId>org.apache.shardingsphere</groupId>
            <artifactId>shardingsphere-jdbc-core-spring-boot-starter</artifactId>
            <version>5.1.0</version>
        </dependency>
```



### 分库案例

#### 创建数据库以及表

分别创建ds_0和ds_1两个数据库

```SQL
SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `t_stu_0`
-- ----------------------------
DROP TABLE IF EXISTS `t_stu_0`;
CREATE TABLE `t_stu_0` (
  `stu_id` bigint(20) NOT NULL,
  `stu_name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`stu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```



#### 配置文件

```yaml
server:
  port: 8080
mybatis:
  type-aliases-package: wanho.boot18shardingjdbc.domain
  mapper-locations: classpath:mappers/*.xml
spring:
  shardingsphere:
    datasource:
      names: ds0,ds1
      ds0:
        type: com.zaxxer.hikari.HikariDataSource  #com.alibaba.druid.pool.DruidDataSource
        driverClassName: com.mysql.cj.jdbc.Driver
        jdbcUrl: jdbc:mysql://localhost:3306/ds_0?serverTimezone=UTC&useSSL=false&useUnicode=true&characterEncoding=UTF-8
        username: root
        password: root
      ds1:
        type: com.zaxxer.hikari.HikariDataSource  #com.alibaba.druid.pool.DruidDataSource
        driverClassName: com.mysql.cj.jdbc.Driver
        jdbcUrl: jdbc:mysql://localhost:3306/ds_1?serverTimezone=UTC&useSSL=false&useUnicode=true&characterEncoding=UTF-8
        username: root
        password: root
    rules:
      sharding:
        tables:
          t_stu:  # actual-data-nodes数据节点配置，采用Groovy表达式 t_user_0,t_user_1
            actual-data-nodes: ds$->{0..1}.t_stu_0  
        default-database-strategy:
          standard:  #用于使用单一键作为分片键的=、IN、BETWEEN AND、>、<、>=、<= 进行分片的场景。
            sharding-algorithm-name: inline
            sharding-column: stu_id
#          complex:  #复合键盘使用的场合
#            sharding-algorithm-name: inlinw
#            sharding-columns: stu_id,stu_name
        sharding-algorithms:
          inline:
            type: HASH_MOD
            props:
              sharding-count: "2"  #必须写成带引号的形式，内部要转换成int
    props:
      sql-show: true
```



####  编写Dao

```java
public interface StuDao {
    @Insert("insert into t_stu(stu_id,stu_name) value(#{stu_id},#{stu_name})")
    void insert(Stu stu);
}
```

#### 测试控制器

```java
@RestController
public class StuController {
    @Resource
    StuDao stuDao;
    @GetMapping("/saveStu")
    @Transactional
    public String saveStu(){
        stuDao.insert(new Stu(new Random().nextInt(10000),"888"));
        stuDao.insert(new Stu(new Random().nextInt(10000),"999"));
        stuDao.insert(new Stu(new Random().nextInt(10000),"aaa"));
        return "success";
    }
}
```

#### 事务处理

多个数据库采用XA两段式强事务

##### 加入依赖

注意shardingsphere-jdbc-core-spring-boot-starter的版本为5.1.0的时候，事务的版本必须是5.0.0，否则会抛出

异常：shardingsphere com.atomikos.icatch.jta.JtaTransactionServicePlugin.beforeInit()V

```java
<dependency>
    <groupId>org.apache.shardingsphere</groupId>
    <artifactId>shardingsphere-transaction-xa-core</artifactId>
    <version>5.0.0</version>
</dependency>
```

##### 添加注解

@Transactional
    @ShardingSphereTransactionType(TransactionType.XA)：指定使用XA事务

```java
@RestController
public class StuController {
    @Resource
    StuDao stuDao;
    
    @GetMapping("/saveStu")
    @Transactional
    @ShardingSphereTransactionType(TransactionType.XA)
    public String saveStu(){
      
        stuDao.insert(new Stu(new Random().nextInt(10000),"888"));
        stuDao.insert(new Stu(new Random().nextInt(10000),"999"));
        //int y=10/0;
        stuDao.insert(new Stu(new Random().nextInt(10000),"aaa"));
        return "success";
    }
}

```



### 分表案例

#### 创建数据库以及表

```sql
SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `t_user_0`
-- ----------------------------
DROP TABLE IF EXISTS `t_user_0`;
CREATE TABLE `t_user_0` (
  `user_id` varchar(50) NOT NULL,
  `user_name` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `t_user_1`;
CREATE TABLE `t_user_1` (
  `user_id` varchar(50) NOT NULL,
  `user_name` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Records of t_user_1
-- ----------------------------

```



#### 配置文件

```yml
server:
  port: 8080
mybatis:
  type-aliases-package: wanho.boot18shardingjdbc.domain
  mapper-locations: classpath:mappers/*.xml
spring:
  shardingsphere:
    datasource:
      names: ds0
      ds0:
        type: com.zaxxer.hikari.HikariDataSource  #com.alibaba.druid.pool.DruidDataSource
        driverClassName: com.mysql.cj.jdbc.Driver
        jdbcUrl: jdbc:mysql://localhost:3306/ds_0?serverTimezone=UTC&useSSL=false&useUnicode=true&characterEncoding=UTF-8
        username: root
        password: root
    rules:
      sharding:
        tables:
          t_user:
            actual-data-nodes: ds0.t_user_$->{0..1}  #数据节点配置，采用Groovy表达式
            table-strategy: # 配置策略
              standard:  # 用于单分片键的标准分片场景
                sharding-column: user_id
                sharding-algorithm-name: user-inline  # 分片算法名字，必须是中横线分隔，不可以是下划线
        sharding-algorithms:
          user-inline:
            type: HASH_MOD
            props:
              sharding-count: "2"  #必须写成带引号的形式，内部要转换成int
    props:
      sql-show: true
```



####  编写Dao

```java
public interface UserDao {

    @Insert("insert into t_user(user_id,user_name) " +
            "value(#{user_id},#{user_name})")
    void insert(User user);

    @Select("select * from t_user")
    List<User> selectAll();
}
```

#### 测试控制器

```java
@RestController
public class UserController {
    @Resource
    UserDao userDao;

    @GetMapping("/save")
    @Transactional
    public String save(){
        User user = new User(UUID.randomUUID().toString(),"111");
        userDao.insert(user);

        User user1 = new User(UUID.randomUUID().toString(),"222");
        userDao.insert(user1);

        User user2 = new User(UUID.randomUUID().toString(),"3333");
        userDao.insert(user2);
        return "success";
    }

    @GetMapping("/list")
    public List<User> list(){
        List<User> users = userDao.selectAll();
        return users;
    }
}
```



#### 事务处理

主启动类上增加@EnableTransactionManagement 注解（本地可选）

在对应的方法上使用@Transactional注解



### 分表案例-自定义策略

#### 定义策略类

实现StandardShardingAlgorithm接口

```java
public class CustomizeAlgorithms implements StandardShardingAlgorithm<String>{

    @Override
    public String doSharding(Collection<String> collection, PreciseShardingValue<String> preciseShardingValue) {
       //获取到分片列的值
        String id = preciseShardingValue.getValue();
        String index = String.valueOf(id.hashCode()%2);
        String tableReal = preciseShardingValue.getLogicTableName().concat("_").concat(index);
        System.out.println(tableReal);
        return tableReal;
    }

    @Override
    public Collection<String> doSharding(Collection<String> collection, RangeShardingValue<String> rangeShardingValue)
    {
        return collection;
    }

    @Override
    public void init() {
    }
   
    @Override
    public String getType() {
        return "CUSTOMIZE_TYPE";
    }
}
```

#### spi定义算法

在resources目录下创建META-INF/services目录，并且创建org.apache.shardingsphere.sharding.spi.ShardingAlgorithm文件，将类的全名称放入其中

```
xxx.alg.CustomizeAlgorithms
```

#### 配置文件

```yml
spring:
  shardingsphere:
    datasource:
      names: ds0
      ds0:
        type: com.zaxxer.hikari.HikariDataSource  #com.alibaba.druid.pool.DruidDataSource
        driverClassName: com.mysql.cj.jdbc.Driver
        jdbcUrl: jdbc:mysql://localhost:3306/ds_0?serverTimezone=UTC&useSSL=false&useUnicode=true&characterEncoding=UTF-8
        username: root
        password: root
    rules:
      sharding:
        tables:
          t_user:
            actual-data-nodes: ds0.t_user_$->{0..1}  #数据节点配置，采用Groovy表达式
            table-strategy: # 配置策略
              standard:  # 用于单分片键的标准分片场景
                sharding-column: user_id
                sharding-algorithm-name: t-stu-alg  # 分片算法名字※※※※※
        sharding-algorithms:
          t-stu-alg:    #※※※※※※※※※
            type: CUSTOMIZE_TYPE   #自定义类中getType返回的值※※※※※※※※
            props:
              strategy: standard
              algorithm-class-name: xxx.alg.CustomizeAlgorithms  #全类名※※※※※※※※※※※
    props:
      sql-show: true
      
```



### 使用雪花算法生成id

```java
//问题：产生的全部都是偶数
SnowflakeKeyGenerateAlgorithm algorithm = new SnowflakeKeyGenerateAlgorithm();
System.out.println((Long)algorithm.generateKey());
System.out.println((Long)algorithm.generateKey());
System.out.println((Long)algorithm.generateKey());
```















