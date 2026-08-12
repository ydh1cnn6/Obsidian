---
updateDate: 2026-03-10 15:23:31
title: JPA
---
# Spring Data JPA 零基础入门教程
Spring Data JPA 是 Spring 对 JPA（Java Persistence API）的封装，核心是**简化数据访问层代码**，无需手动编写 SQL 和 DAO 实现类，仅通过接口定义即可完成 CRUD、分页、排序等操作。下面从「环境搭建→核心使用→进阶功能」一步步讲解，所有代码均可直接复用。
## 一、前置知识（新手必看）
- JPA：Java 持久化规范，底层常用实现是 Hibernate（Spring Data JPA 默认集成 Hibernate）；
- 核心思想：通过**面向对象的方式操作数据库**，用实体类映射数据库表，用方法名 / 注解替代 SQL。
## 二、环境搭建（Maven 项目）
### 1. 引入核心依赖（pom.xml）
Spring Boot 项目直接引入 starter 即可，自动整合 JPA + Hibernate + 数据库驱动：

```xml
<!-- Spring Data JPA 核心依赖 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<!-- MySQL 驱动（根据数据库替换） -->
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
```

### 2. 配置数据库与 JPA（application.yml）
```yaml
spring:
  # 数据库连接配置
  datasource:
    url: jdbc:mysql://localhost:3306/test_db?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: 你的数据库密码
    driver-class-name: com.mysql.cj.jdbc.Driver
  # JPA 配置
  jpa:
    hibernate:
      ddl-auto: update # 表结构自动更新（开发用，生产建议用 none）
    show-sql: true # 控制台打印执行的 SQL
    properties:
      hibernate:
        format_sql: true # 格式化 SQL，便于查看
    database-platform: org.hibernate.dialect.MySQL8Dialect # 数据库方言（MySQL8 专用）
```

- `ddl-auto` 取值说明：
    - `create`：每次启动删除旧表，创建新表（测试用）；
    - `update`：根据实体类更新表结构（开发用）；
    - `none`：不操作表结构（生产用）；
    - `validate`：校验实体类与表结构是否一致。
    
## 三、核心使用步骤（以「用户表」为例）
### 步骤 1：创建实体类（映射数据库表）
用 JPA 注解将实体类与数据库表关联：

```java
import lombok.Data;
import jakarta.persistence.*; // Spring Boot 3+ 用 jakarta，2+ 用 javax

@Data // Lombok 自动生成 getter/setter/toString
@Entity // 标记为 JPA 实体类
@Table(name = "t_user") // 映射数据库表名（默认类名小写，可自定义）
public class User {
    @Id // 主键
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 自增主键（MySQL 推荐）
    private Long id;

    @Column(name = "user_name", length = 50, nullable = false, unique = true) 
    // 映射字段：自定义列名、长度、非空、唯一
    private String username;

    @Column(length = 20)
    private String password;

    private Integer age;

    private String email;
}
```

- 核心注解说明：
    - `@Entity`：声明为持久化实体；
    - `@Table`：指定映射的表名；
    - `@Id`：标记主键；
    - `@GeneratedValue`：主键生成策略（IDENTITY = 自增，AUTO = 自动选择，SEQUENCE = 序列）；
    - `@Column`：映射普通字段，可自定义列名、长度、约束等。
    
### 步骤 2：创建 Repository 接口（核心，无需实现类）
Spring Data JPA 核心：继承 `JpaRepository` 即可获得 CRUD、分页、排序等默认方法：
```java
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

// 泛型参数：<实体类, 主键类型>
public interface UserRepository extends JpaRepository<User, Long> {
    // 1. 默认方法（继承自 JpaRepository，无需手动写）：
    // findAll() → 查询所有
    // findById(Long id) → 根据ID查询
    // save(User user) → 新增/修改
    // deleteById(Long id) → 根据ID删除
    // count() → 统计总数

    // 2. 自定义方法（通过方法名自动生成 SQL，无需写注解）
    // 根据用户名查询
    User findByUsername(String username);

    // 根据年龄区间查询（大于min，小于max）
    List<User> findByAgeBetween(Integer min, Integer max);

    // 根据用户名模糊查询 + 年龄排序（降序）
    List<User> findByUsernameLikeOrderByAgeDesc(String username);

    // 根据用户名和邮箱查询（多条件）
    User findByUsernameAndEmail(String username, String email);
}
```

- 方法名命名规则：遵循 `findBy + 字段名 + 关键字`，常用关键字：

| 关键字     | 示例                           | 对应 SQL 片段                            |
| ------- | ---------------------------- | ------------------------------------ |
| And     | findByUsernameAndAge         | WHERE username = ? AND age = ?       |
| Or      | findByUsernameOrAge          | WHERE username = ? OR age = ?        |
| Between | findByAgeBetween             | WHERE age BETWEEN ? AND ?            |
| Like    | findByUsernameLike           | WHERE username LIKE ?                |
| OrderBy | findByAgeOrderByUsernameDesc | WHERE age = ? ORDER BY username DESC |
### 步骤 3：测试使用（Service/Controller）
```java
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor // Lombok 自动注入依赖
public class UserService {
    private final UserRepository userRepository;

    // 1. 新增/修改（save 方法：主键为空则新增，不为空则修改）
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    // 2. 根据ID查询
    public User getUserById(Long id) {
        // orElseThrow：查询不到则抛异常，替代 null 判断
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }

    // 3. 分页查询（第1页，每页10条，按ID降序）
    public Page<User> getUserByPage(Integer pageNum, Integer pageSize) {
        // PageRequest：分页请求（pageNum 从0开始）
        Pageable pageable = PageRequest.of(pageNum - 1, pageSize, Sort.by(Sort.Direction.DESC, "id"));
        return userRepository.findAll(pageable);
    }

    // 4. 自定义方法查询
    public List<User> getUserByAge(Integer min, Integer max) {
        return userRepository.findByAgeBetween(min, max);
    }

    // 5. 删除
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
```

## 四、进阶功能
### 1. 自定义 SQL（@Query 注解）
当方法名无法满足复杂查询时，用 `@Query` 自定义 JPQL/SQL：
```java
public interface UserRepository extends JpaRepository<User, Long> {
    // 方式1：JPQL（面向实体类，推荐）
    @Query("SELECT u FROM User u WHERE u.age > :age AND u.email LIKE %:email%")
    List<User> findByAgeAndEmail(@Param("age") Integer age, @Param("email") String email);

    // 方式2：原生 SQL（nativeQuery = true）
    @Query(value = "SELECT * FROM t_user WHERE age > ?1", nativeQuery = true)
    List<User> findByAgeGreaterThan(Integer age);

    // 自定义更新/删除（必须加 @Modifying + @Transactional）
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.age = :age WHERE u.id = :id")
    int updateAgeById(@Param("id") Long id, @Param("age") Integer age);
}
```

### 2. 多表关联查询（一对一 / 一对多）

以「用户 - 订单」一对多为例：
#### （1）创建订单实体类
```java

@Data
@Entity
@Table(name = "t_order")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderNo; // 订单号

    @ManyToOne(fetch = FetchType.LAZY) // 多对一，懒加载（默认急加载）
    @JoinColumn(name = "user_id") // 外键列名
    private User user; // 关联用户
}
```

#### （2）用户实体类添加关联

```java
@Data
@Entity
@Table(name = "t_user")
public class User {
    // 原有字段...

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL) 
    // mappedBy：指定维护外键的一方（订单表的 user 字段）
    // cascade：级联操作（新增用户时自动新增订单）
    private List<Order> orders;
}
```

#### （3）关联查询
```java
public interface UserRepository extends JpaRepository<User, Long> {
    // 查询用户及关联的订单
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.orders WHERE u.id = :id")
    User findByIdWithOrders(@Param("id") Long id);
}
```

### 3. 分页 + 排序 + 条件组合（Specification）

用于动态多条件查询（如用户输入多个筛选条件）：

```java
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

// 动态条件查询示例
public List<User> getUserByCondition(String username, Integer minAge, Integer maxAge) {
    Specification<User> spec = (root, query, cb) -> {
        List<Predicate> predicates = new ArrayList<>();
        // 条件1：用户名模糊查询（非空时）
        if (username != null && !username.isEmpty()) {
            predicates.add(cb.like(root.get("username"), "%" + username + "%"));
        }
        // 条件2：年龄大于最小值（非空时）
        if (minAge != null) {
            predicates.add(cb.greaterThan(root.get("age"), minAge));
        }
        // 条件3：年龄小于最大值（非空时）
        if (maxAge != null) {
            predicates.add(cb.lessThan(root.get("age"), maxAge));
        }
        return cb.and(predicates.toArray(new Predicate[0]));
    };
    // 排序：按年龄升序
    Sort sort = Sort.by(Sort.Direction.ASC, "age");
    return userRepository.findAll(spec, sort);
}
```

## 五、常见问题

1. **主键生成策略选择**：    
    - MySQL 用 `GenerationType.IDENTITY`（自增）；
    - Oracle 用 `GenerationType.SEQUENCE`（序列）；
    - 通用用 `GenerationType.AUTO`（自动选择）。
2. **懒加载异常**：   
    - 原因：懒加载关联对象时，Session 已关闭；
    - 解决：① 用 `fetch = FetchType.EAGER`（急加载）；② 加 `@Transactional` 保证 Session 存活。
3. **分页页码问题**：
    - `PageRequest.of(pageNum, pageSize)` 中 `pageNum` 从 0 开始，开发时需注意前端传参转换。
    
## 总结
1. **核心流程**：实体类（@Entity）→ Repository 接口（继承 JpaRepository）→ 直接调用默认 / 自定义方法；
2. **查询方式**：简单查询用「方法名规则」，复杂查询用 `@Query`，动态条件用 `Specification`；
3. **核心优势**：无需编写 DAO 实现类，简化代码，面向对象操作数据射」和「Spring Data JPA 的方法封装」，避免重复编写 SQL 模板代码。