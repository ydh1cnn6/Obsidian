---
title: MyBatis-Plus
updateDate: 2026-03-10 15:54:01
---
# MyBatis-Plus 零基础入门教程
MyBatis-Plus（简称 MP）是 MyBatis 的增强工具，核心是**在 MyBatis 基础上只做增强不做改变**，无需编写 XML 即可完成 CRUD、分页、条件查询等操作，大幅简化开发。下面从「环境搭建→核心使用→进阶功能」一步步讲解，所有代码可直接复用，以「用户表（user）」为示例场景。
## 一、前置知识
- 熟悉 MyBatis 基础（核心思想一致，MP 做了封装）；
- 掌握 Spring Boot 项目搭建（教程基于 Spring Boot 实现）；
- 核心优势：无侵入、损耗小、强大的 CRUD 操作、支持 Lambda 表达式、自动分页、逻辑删除等。
## 二、环境搭建（Spring Boot 项目）
### 1. 引入核心依赖（pom.xml）
MP 已整合 MyBatis，无需单独引入 MyBatis 依赖：
```xml
<!-- MyBatis-Plus 核心依赖 -->
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.5.5</version> <!-- 推荐使用最新稳定版 -->
</dependency>
<!-- MySQL 驱动 -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
<!-- Lombok（简化实体类，可选但推荐） -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
<!-- 数据库连接池（Spring Boot 默认 HikariCP，无需额外引入） -->
```

### 2. 配置数据库与 MP（application.yml）
```yaml
spring:
  # 数据库连接配置
  datasource:
    url: jdbc:mysql://localhost:3306/test_db?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: 你的数据库密码
    driver-class-name: com.mysql.cj.jdbc.Driver
# MyBatis-Plus 配置
mybatis-plus:
  # 实体类别名包（简化 XML 中类型引用）
  type-aliases-package: com.example.entity
  # 配置 XML 映射文件路径（如需自定义 SQL 时用）
  mapper-locations: classpath:mapper/**/*.xml
  # 全局配置
  global-config:
    db-config:
      # 主键生成策略（默认 ASSIGN_ID：雪花算法，AUTO：自增）
      id-type: AUTO
      # 逻辑删除字段名（如 deleted，0=未删，1=已删）
      logic-delete-field: deleted
      logic-delete-value: 1
      logic-not-delete-value: 0
  # 日志配置（控制台打印 SQL，开发用）
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
    # 下划线转驼峰（默认开启，可省略）
    map-underscore-to-camel-case: true
```

## 三、核心使用步骤
### 步骤 1：创建实体类（映射数据库表）
用 MP 注解替代 MyBatis 手动映射，简化配置：
```java
import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data // Lombok 自动生成 getter/setter/toString
@TableName("t_user") // 映射数据库表名（默认类名小写，可自定义）
public class User {
    // 主键（AUTO：自增，ASSIGN_ID：雪花算法生成Long型ID）
    @TableId(type = IdType.AUTO)
    private Long id;

    // 普通字段（字段名与数据库一致可省略 @TableField）
    @TableField("user_name") // 数据库字段 user_name → 实体属性 username
    private String username;

    private String password;

    private Integer age;

    private String email;

    // 逻辑删除字段（对应全局配置的 logic-delete-field）
    @TableLogic
    private Integer deleted;

    // 自动填充字段（创建时间）
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    // 自动填充字段（更新时间）
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
```
- 核心注解说明：

| 注解            | 作用                  |
| ------------- | ------------------- |
| `@TableName`  | 指定实体类映射的数据库表名       |
| `@TableId`    | 标记主键，指定主键生成策略       |
| `@TableField` | 映射普通字段，指定字段名/自动填充规则 |
| `@TableLogic` | 标记逻辑删除字段            |

### 步骤 2：创建 Mapper 接口（核心，无需实现类）
继承 `BaseMapper` 即可获得 MP 内置的 CRUD 方法，无需编写 XML：
```java
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.entity.User;
import org.apache.ibatis.annotations.Mapper;

// 必须加 @Mapper 或在启动类加 @MapperScan("com.example.mapper")
@Mapper
public interface UserMapper extends BaseMapper<User> {
    // 继承 BaseMapper 后，自动拥有以下方法（无需手动实现）：
    // insert(T entity) → 新增
    // deleteById(Serializable id) → 根据ID删除
    // deleteByMap(Map<String, Object> map) → 多条件删除
    // updateById(T entity) → 根据ID更新
    // selectById(Serializable id) → 根据ID查询
    // selectList(Wrapper<T> queryWrapper) → 条件查询列表
    // selectCount(Wrapper<T> queryWrapper) → 条件统计总数
    // selectPage(IPage<T> page, Wrapper<T> queryWrapper) → 分页查询
}
```
> 注意：启动类需添加 `@MapperScan` 扫描 Mapper 包（替代每个 Mapper 加 `@Mapper`）：
> ```java
> import org.mybatis.spring.annotation.MapperScan;
> import org.springframework.boot.SpringApplication;
> import org.springframework.boot.autoconfigure.SpringBootApplication;
> 
> @SpringBootApplication
> @MapperScan("com.example.mapper") // 扫描所有 Mapper 接口
> public class MpDemoApplication {
>     public static void main(String[] args) {
>         SpringApplication.run(MpDemoApplication.class, args);
>     }
> }
> ```

### 步骤 3：测试基础 CRUD（Service/Controller）
```java
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.entity.User;
import com.example.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor // Lombok 自动注入 UserMapper
public class UserService {
    private final UserMapper userMapper;

    // 1. 新增用户
    public boolean addUser(User user) {
        return userMapper.insert(user) > 0;
    }

    // 2. 根据ID查询用户
    public User getUserById(Long id) {
        return userMapper.selectById(id);
    }

    // 3. 根据ID更新用户（只更新非空字段）
    public boolean updateUser(User user) {
        return userMapper.updateById(user) > 0;
    }

    // 4. 根据ID删除用户（物理删除，逻辑删除需配置 @TableLogic）
    public boolean deleteUser(Long id) {
        return userMapper.deleteById(id) > 0;
    }

    // 5. 条件查询（QueryWrapper 方式，非 Lambda）
    public List<User> getUserByCondition(String username, Integer age) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        // 用户名模糊查询（非空时）
        queryWrapper.like(username != null, "user_name", username);
        // 年龄大于指定值（非空时）
        queryWrapper.gt(age != null, "age", age);
        // 按创建时间降序
        queryWrapper.orderByDesc("create_time");
        return userMapper.selectList(queryWrapper);
    }

    // 6. 条件查询（LambdaQueryWrapper 方式，推荐，避免字段名写错）
    public List<User> getUserByLambda(String username, Integer age) {
        LambdaQueryWrapper<User> lambdaQuery = new LambdaQueryWrapper<>();
        // Lambda 方式无需写字符串字段名，编译期校验
        lambdaQuery.like(username != null, User::getUsername, username)
                   .gt(age != null, User::getAge, age)
                   .orderByDesc(User::getCreateTime);
        return userMapper.selectList(lambdaQuery);
    }

    // 7. 分页查询（第1页，每页10条）
    public IPage<User> getUserByPage(Integer pageNum, Integer pageSize) {
        // 创建分页对象（pageNum 从1开始，MP 自动处理）
        Page<User> page = new Page<>(pageNum, pageSize);
        // 分页查询（可搭配条件构造器）
        LambdaQueryWrapper<User> lambdaQuery = new LambdaQueryWrapper<>();
        lambdaQuery.gt(User::getAge, 18); // 只查年龄大于18的
        return userMapper.selectPage(page, lambdaQuery);
    }
}
```

## 四、进阶功能
### 1. 配置分页插件（必配，否则分页失效）
MP 3.4.0+ 需手动配置分页拦截器：
```java
import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MyBatisPlusConfig {
    // 配置分页插件
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        // 添加分页拦截器，指定数据库类型
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }
}
```

### 2. 自动填充字段（如创建时间/更新时间）
创建填充处理器，实现字段自动赋值：
```java
import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component // 必须交给 Spring 管理
public class MyMetaObjectHandler implements MetaObjectHandler {
    // 新增时填充
    @Override
    public void insertFill(MetaObject metaObject) {
        // 填充 createTime 字段
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
        // 填充 updateTime 字段
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    }

    // 更新时填充
    @Override
    public void updateFill(MetaObject metaObject) {
        // 只填充 updateTime 字段
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    }
}
```

### 3. 逻辑删除（避免物理删除数据）
1. 数据库表添加 `deleted` 字段（INT 类型，0=未删，1=已删）；
2. 实体类添加 `@TableLogic` 注解（或全局配置）；
3. 调用 `deleteById` 时，MP 自动执行 `UPDATE` 语句（更新 deleted=1），而非 `DELETE`；
4. 查询时，MP 自动拼接 `WHERE deleted=0`，无需手动加条件。

### 4. 自定义 SQL（XML/注解方式）
MP 兼容 MyBatis 原生方式，复杂 SQL 可写在 XML 中：
#### （1）创建 Mapper XML 文件（resources/mapper/UserMapper.xml）
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" 
"http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.mapper.UserMapper">
    <!-- 自定义复杂查询 -->
    <select id="getUserByAgeRange" resultType="com.example.entity.User">
        SELECT id, user_name, age, email FROM t_user 
        WHERE age BETWEEN #{minAge} AND #{maxAge}
        AND deleted = 0
    </select>
</mapper>
```

#### （2）Mapper 接口添加方法
```java
public interface UserMapper extends BaseMapper<User> {
    // 自定义方法，对应 XML 中的 id
    List<User> getUserByAgeRange(@Param("minAge") Integer minAge, @Param("maxAge") Integer maxAge);
}
```

### 5. Service 层封装（IService/ServiceImpl）
MP 提供 `IService` 接口，封装了批量操作、链式查询等更丰富的方法：
#### （1）创建 Service 接口
```java
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.entity.User;

public interface UserService extends IService<User> {
    // 可添加自定义业务方法
}
```

#### （2）创建 Service 实现类
```java
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.entity.User;
import com.example.mapper.UserMapper;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
    // 继承后自动拥有批量新增、批量删除、链式查询等方法
    // 示例：批量新增
    public boolean batchAddUser(List<User> userList) {
        return saveBatch(userList);
    }

    // 链式查询示例
    public List<User> getUserByChain() {
        return lambdaQuery()
                .gt(User::getAge, 20)
                .like(User::getUsername, "张")
                .list();
    }
}
```

## 五、常见问题
1. **主键生成策略选择**：
   - `AUTO`：数据库自增（适合 MySQL）；
   - `ASSIGN_ID`：雪花算法（默认，生成Long型唯一ID，适合分布式）；
   - `ASSIGN_UUID`：生成 UUID 字符串。
2. **LambdaQueryWrapper 优势**：
   - 字段名用实体类方法引用（`User::getUsername`），避免手写字符串导致的拼写错误；
   - 编译期校验字段是否存在，更安全。
3. **分页返回参数说明**：
   - `IPage` 包含：`getRecords()`（当前页数据）、`getTotal()`（总条数）、`getPages()`（总页数）、`getCurrent()`（当前页）、`getSize()`（每页条数）。

## 总结
1. **核心流程**：实体类（@TableName/@TableId）→ Mapper 接口（继承 BaseMapper）→ 直接调用内置 CRUD 方法，无需编写 XML；
2. **查询方式**：简单条件用 `QueryWrapper`，推荐用 `LambdaQueryWrapper`（避免字段写错），复杂 SQL 用 XML/注解；
3. **核心优势**：零 XML 实现 CRUD、自动分页、逻辑删除、字段自动填充、Lambda 条件查询，大幅减少重复代码。

掌握以上内容可覆盖 95% 的业务场景，核心是理解 MP 对 MyBatis 的封装逻辑，既保留 MyBatis 的灵活性，又简化了基础 CRUD 开发。