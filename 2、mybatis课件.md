---
typora-root-url: images
---
```java
class aaa{

}
```
# ORM模型

由于 JDBC 的缺陷，ResultSet 和 POJO 的映射是一个比较大的难题。实际工作中基本上不使用 JDBC


ORM(Object Relational Mapping)：主要是用来解决数据库表和POJO之间的映射关系。

# Mybatis基础

## 基本概念

Mybatis是持久层的框架，基于JDBC，对JDBC进行封装，支持普通的SQL查询，存储过程以及关系映射。几乎消除了JDBC的代码以及参数的手工设置，对结果集进行映射。

缺点：移植困难。Mybatis需要自己编写SQL，不同的数据库存在方言。

主要是和hibernate相比较。

## mybatis的运行流程

<img src="https://my-picture-aa.oss-cn-nanjing.aliyuncs.com/img/202308171315849.png" alt="01.运行流程" style="zoom:60%;" />



# 开发入门

## 增加模板

### mybatis config.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE configuration PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
"http://mybatis.org/dtd/mybatis-3-config.dtd" >
<configuration>
 <mappers>
 </mappers>
</configuration>
```

### mybatis mapper.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
"http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
<mapper namespace="">

</mapper>
```

## 入门程序

### 添加依赖

```xml
<dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.16</version>
            <scope>compile</scope>
        </dependency>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.12</version>
            <scope>test</scope>
        </dependency>
```

### 创建配置文件

```xml
<configuration>

    <environments default="dev">
        <environment id="dev">
            <transactionManager type="JDBC"></transactionManager>
            <dataSource type="unpooled">
                <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
                <property name="url" value="jdbc:mysql://localhost:3306/school?serverTimezone=UTC&amp;useSSL=false"/>
                <property name="username" value="root"/>
                <property name="password" value="root"/>
            </dataSource>
        </environment>
    </environments>
    <mappers>
        <mapper resource="mappers/ScoreMapper.xml"/>
    </mappers>
</configuration>
```

### 创建POJO类

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Score {
    String sno;
    String cno;
    double degree;
}

```

编写Mapper映射文件

```xml
<mapper namespace="net.wanho">
    <select id="selectAll" resultType="net.wanho.domain.Score">
        select * from score
    </select>

</mapper>
```

### 加载Mapper文件

```xml
<mappers>
        <mapper resource="mappers/ScoreMapper.xml"/>
    </mappers>
```

### 测试代码

```java
/**
     * 入门案例
     */
    @Test
    public void test01() throws IOException {
        String config = "config.xml";
        Reader reader = Resources.getResourceAsReader(config);
        SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(reader);
        SqlSession sqlSession = factory.openSession();
        List<Score> list = sqlSession.selectList("net.wanho.selectAll");
        list.forEach(System.out::println);

    }
```



# 面向接口编程

dao文件和xml的映射通过dao的全类名+方法名去映射。

xml文件的namespace需要设置成dao的全类名，select，insert，delete等标签的id和dao接口中的方法名一致。

## xml方式

### 定义dao

```java
public interface CourseDao {
    List<Course> selectall();
}
```



### 定义xml文件

```xml
<mapper namespace="net.wanho.mapper.CourseDao">
    <select id="selectAll" resultType="net.wanho.domain.Course">
        select * from course
    </select>
</mapper>
```

## 注解方式

常用注解：@Insert，@Update，@Delete，@Select，@ResultMap，@Option

简单的单表的操作，可以使用注解方式，复杂的查询不建议使用



思考题：

mybatis的dao接口中的方法是否可以重载？

如果采用的xml方式配置sql的话，由于xml当中sql和dao接口使用namespace+id的方式映射，则不能重载。

如果使用接口方式编程，则可以重载。



# 配置文件

## config配置文件

### 配置日志

```xml
    <settings>
<!--        日志配置-->
        <setting name="logImpl" value="STDOUT_LOGGING"/>
<!--        <setting name="logImpl" value="log4J"/>-->
    </settings>
```

### 下划线转驼峰

数据库当中属性使用下划线进行设计，但是pojo使用的驼峰，可以全局设置下划线转驼峰

```xml
<settings>
<!--        下划线转驼峰-->
        <setting name="mapUnderscoreToCamelCase" value="true"/>
    </settings>
```

如果查询sql中的列名和POJO当中列名不一致的话，如何解决：

1：下划线和驼峰，可以全局设置

2：可以使用别名

3：自定义映射  resultMap  

​	resultMap使用场合：数据库sql查询列名和pojo不一致的情况下

​											   关联查询需要映射对象属性时使用

### 设置别名

```xml
<typeAliases>
<!--        <typeAlias type="net.wanho.domain.Employee" alias="employee"></typeAlias>-->
        <package name="net.wanho.domain"/>
    </typeAliases>
```

### mapper配置

```xml
 <mappers>
<!--        设置成class以及使用package来配置,都有隐形的条件:-->
<!--        1: 编译后,xml文件和dao文件需要同一个文件夹下-->
<!--        2: xml文件和dao的文件名除了扩展名之外,需要一样(包括大小写)-->
<!--        <mapper class="net.wanho.mapper.CourseMapper"/>-->
<!--        <mapper class="net.wanho.mapper.EmployeeMapper"/>-->
        <package name="net.wanho.mapper"/>
    </mappers>
```



## mapper配置文件

### resultMap的使用

在pojo对象属性和sql列名不一致的情况下使用

在关联查询的时候使用

sql的select标签的属性，不能使用resultType，必须使用resultMap

### 多个参数问题

1： 简单数据类型的多个参数，可以使用@Param注解指定参数名称

2： 使用map传递，参数名使用 key的名称

3： 直接用POJO对象传递，xml的参数需要和POJO属性一致(大小写必须一致，而且需要有getter/setter)

### #和$区别

<span>#</span>： 类似于preparedStatement，使用参数占位符，可以避免sql注入问题。进行类型处理。String，date类型都会增加单引号。

$:  拼接字符串，可能引起sql注入。一般用于动态列名以及模糊查询。不会进行类型处理。

**模糊查询**

1： 使用$进行拼接字符串

2： 使用concat， like concat('%',#{},‘%’)

3：使用动态标签bind，定义了一个局部变量    like  #{变量}

### 自增长主键的回填

1：在insert标签上使用useGeneratedKey=true，指定keyColumn和keyProperty属性

2：使用selectKey子标签来进行



## 动态标签

### if和where

动态where会根据条件，去掉第一个条件开始的and或者or

```
<select id="selectList" resultType="teacher">
        select * from teacher
        <where>
            <if test="tno !=null and tno !=''">
                and tno = #{tno}
            </if>
            <if test="tname !=null and tname !=''">
                and tname like  concat('%',#{tname},'%')
            </if>
        </where>

    </select>
```



### choose

```xml
<select id="selectSeason" resultType="SalaryVO">
        SELECT userid
                ,case #{season} when 'A' then '第一季度'
                    when 'B' then '第二季度'
                    when 'C' then '第三季度'
                    when 'D' then '第四季度'
                end seasonTitle
                ,sum(money)  money
        from salary
        <where>
            <if test="userid !=0">
                userid = #{userid}
            </if>
            <if test="season != null ">
                <choose>
                    <when test='season =="A"'>
                        and  `month` in (1,2,3)
                    </when>
                    <when test='season =="B"'>
                        and  `month` in (4,5,6)
                    </when>
                    <when test='season =="C"'>
                        and  `month` in (7,8,9)
                    </when>
                    <otherwise>
                        and  `month` in (10,11,12)
                    </otherwise>
                </choose>
            </if>
        </where>
        group by userid
    </select>
```



### foreach

```xml
 <insert id="insertBatch">
        insert  into teacher(tno,tname,tsex)
        values
        <foreach collection="list" open="" close="" separator="," item="teacher">
            (#{teacher.tno},#{teacher.tname},#{teacher.tsex})
        </foreach>
    </insert>

    <delete id="delete">
        delete from teacher
        where tno in
        <foreach collection="list" open="(" close=")" separator="," item="tno">
            #{tno}
        </foreach>
    </delete>
```

### sql

对于一些常用的sql进行抽取，可以重复利用。

```xml
<sql id="selectColumn">
        select sno,sname,ssex,sbirthday,class
        from student
    </sql>
    <select id="selectAll" resultMap="stuMap">
        <include refid="selectColumn">
    </select>
    <select id="selectOne" resultMap="stuMap">
        <include refid="selectColumn">
        where sno = #{sno}
    </select>
```



### trim

动态的替换字符串，添加部分字符串。

```xml
<select id="selectByCon" resultType="net.wanho.domain.Student">
        <include refid="selectColumn" />
        <trim prefix="where" prefixOverrides="and | or">
            <if test="sno !=null and sno !=''">
                and sno = #{sno}
            </if>
            <if test="sname !=null and sname !=''">
                <bind name="bindSname" value="'%' +sname + '%' "/>
                and sname like #{bindSname}
            </if>
            <if test="ssex !=null and ssex !=''">
                and ssex = #{ssex}
            </if>
        </trim>
    </select>
```



### bind

```
<select id="selectBySname" resultType="net.wanho.domain.Student">
        <include refid="selectColumn" />
        <where>
            <if test="sname !=null and sname !=''">
                <bind name="bindSname" value="'%' +sname + '%' "/>
                and sname like #{bindSname}
            </if>
        </where>
    </select>
```



### set

```xml
<update id="update">
        update student
        <set>
           <if test="sname!=null and sname !=''">
               sname = #{sname},
           </if>
            <if test="ssex!=null and ssex !=''">
                ssex = #{ssex},
            </if>
            <if test="sbirthday!=null and sbirthday !=''">
                sbirthday = #{sbirthday},
            </if>
            <if test="clsname!=null and clsname !=''">
                class = #{clsname},
            </if>
        </set>
        where sno =#{sno}
    </update>
```



# 关联查询

## 一对一

在主entity当中，增加一个属性，为辅助对象类型

需要在mapper的xml文件当中使用resultMap，并且使用association标签，来定义映射关系

SQL语句可以分成一次SQL或者多次SQL的形式

```xml
<resultMap id="courseMap" type="course" autoMapping="true">
        <association property="teacher" column="tno"
                     javaType="net.wanho.domain.Teacher" autoMapping="true">
            <!--           <id column="tno" property="tno"/>-->
            <!--           <result column="tname" property="tname"></result>-->
        </association>
    </resultMap>
    <select id="selectRelated" resultMap="courseMap">
        select c.*,t.tname,t.tsex,t.tbirthday
        from course c
        left join  teacher t on
            c.tno = t.tno
    </select>


    <resultMap id="courseMap1" type="course" autoMapping="true">
        <association property="teacher" column="tno"
                     javaType="net.wanho.domain.Teacher" autoMapping="true"
                     select="net.wanho.mapper.TeacherMapper.selectByTno"  >
        </association>
    </resultMap>

    <select id="selectRelatedList" resultMap="courseMap1">
        select * from course
    </select>
```



## 一对多

在主entity当中，增加一个集合类型的属性，元素类型为多的一方。

需要在mapper的xml文档当中使用resultMap来进行映射，使用collection标签，映射集合的元素

```xml
<resultMap id="relatedMap" type="net.wanho.domain.Student"
               autoMapping="true">
        <id column="sno" property="sno"/>
<!--        <result column="sname" property="sname"/>-->
<!--
    property是指   Student当中的多的属性名
    ofType用来定义Student的scoreList集合中元素的类型-->
        <collection property="scoreList" column="sno"  autoMapping="true"
                    ofType="net.wanho.domain.Score"/>
    </resultMap>
    <select id="selectRelated" resultMap="relatedMap">
        select s.sno,s.sname,s.ssex,s.sbirthday,s.class ,score.cno,score.degree
        from student s
        left join score on
            s.sno = score.sno
        order by sno
    </select>
```



# 缓存

## 一级缓存

在mybatis当中，默认是开启一级缓存。提升查询的效率。在短时间间隔范围内，执行两次同样的查询，第二次会从本地缓存中获取，不需要连接数据，发行SQL。一级缓存是基于统一sqlSession对象，跨越sqlsession不能共享缓存。

如果两次查询之间有任何的写操作，则会清空缓存。

```java
@Test
    public void test01(){
        final TeacherMapper mapper = sqlSession.getMapper(TeacherMapper.class);
        Teacher teacher = mapper.selectByTno("831");

        Teacher temp = new Teacher();
        temp.setTno("113");
        temp.setTname("测试");
        mapper.update(temp);
        System.out.println("=====================");
        Teacher teacher1 = mapper.selectByTno("831");
        System.out.println(teacher==teacher1); //true
    }

    @Test
    public void test02(){
        final TeacherMapper mapper = sqlSession.getMapper(TeacherMapper.class);
        Teacher teacher = mapper.selectByTno("831");


        SqlSession sqlSession  =factory.openSession(true);
        final TeacherMapper mapper1 = sqlSession.getMapper(TeacherMapper.class);
        Teacher teacher1 = mapper1.selectByTno("831");
        System.out.println(teacher==teacher1); //false
    }
```



## 二级缓存

```xml
1、
<settings>
        <setting name="cacheEnabled" value="true"/>
</settings>
2、
//XxxMapper.xml
<cache/>
3、POJO 类实现 Serializable 接口
4、二级缓存必须在SqlSession关闭或提交之后有效
sqlSession1.close();  // 或者 sqlSession1.commit();
```



跨越sqlSession对象，基于mapper，使用注解的方式不能直接使用二级缓存。

需要手工开启。禁用某个sql的二级缓存，设置useCache=false即可

# 懒加载(延时加载)

使用关联查询的地方，使用多个sql进行查询。

如果在某些情况下，只需要主表的数据，不需要从表的数据，可以使用延时加载。

**设置**

1：使用单个设置 在collection或者association属性使用   fetchType=lazy

2：使用全局设置，在config文件中

​	lazyLoadingEnabled=true

​	aggressiveLazyLoading=false



# 分页查询

## 使用原生的SQL进行分页

### 接口

```java
@Select("select count(0) from user")
    int selectCount();

    @Select("select * from user limit #{offset},#{pageSize}")
    List<User> selectListByPage(@Param("offset") int offset,@Param("pageSize")int pageSize);
```

### 使用案例

```java
 @Test
    public void test01(){
        //先记录总共的记录条数，
        //1：传进来的pageNum不应该超过范围，特殊情况下有可能出错
        //2： 前端的分页插件需要知道总共多少条数据
        final UserMapper mapper = sqlSession.getMapper(UserMapper.class);
        int total = mapper.selectCount();
        //pageNum客户的请求
        int pageNum = 3;
        int pageSize = 10;
        //需要验证pageNum是否超出范围
        //计算offset
        int offset = (pageNum -1) * pageSize;

        List<User> users = mapper.selectListByPage(offset, pageSize);
        users.forEach(e-> System.out.println(e));
    }
```



## 使用RowBounds

存在一个问题：从第一行开始取到需要的数据的最后一行，然后根据页码和每页条数，获取实际的数据。不适合大数据量的情况

```java
@Test
    public void test02(){

        final UserMapper mapper = sqlSession.getMapper(UserMapper.class);
        //pageNum客户的请求
        int pageNum = 3;
        int pageSize = 10;
        //需要验证pageNum是否超出范围
        //计算offset
        int offset = (pageNum -1) * pageSize;
        RowBounds rowBounds = new RowBounds(offset,pageSize);
        List<User> users = mapper.selectByRowBounds(rowBounds);
        users.forEach(e-> System.out.println(e));

    }
```



## 使用拦截器

可以自定义插件，也可以使用第三方的插件，直接使用第三方：pageHelper。

定义插件，利用mybatis提供的Interceptor，在executor和mapperedStatement之间对sql语句进行拦截。

### 增加依赖

```xml
<dependency>
     <groupId>com.github.pagehelper</groupId>
     <artifactId>pagehelper</artifactId>
     <version>5.1.11</version>
</dependency>
```



### 配置

在config的配置文件中配置plugin

```xml
<plugins>
        <plugin interceptor="com.github.pagehelper.PageInterceptor">
<!--            设置数据库-->
            <property name="helperdialect" value="mysql"/>
<!--            处理页码的正常范围
        小于等于0的页码，默认变成第一页数据
        大于最大页码，变成最后一页
-->
            <property name="reasonable" value="true"/>
        </plugin>
    </plugins>
```



### 接口

```xml
@Select("select * from user")
 List<User> selectByPageHelper();
```



### 使用

```java
@Test
    public void test03(){

        final UserMapper mapper = sqlSession.getMapper(UserMapper.class);
        //pageNum客户的请求
        int pageNum =3;
        int pageSize = 10;
        PageHelper.startPage(pageNum,pageSize);
        List<User> users = mapper.selectByPageHelper();
        PageInfo<User> userPageInfo = new PageInfo<>(users);
        System.out.println(userPageInfo);


    }
```



​       



