---
title: 重写equals为什么要重写hashCode
tags:
  - 笔记
  - 重写equals为什么要重写hashCode
author: BigSea
email: 2834637197@qq.com
封面: ""
createDate: 2026-03-12 17:49:35
updateDate: 2026-03-12 17:51:46
week: 第11周｜星期四
Country: China
City: NanJing
Weather: ☀️
uvIndex(1-15): 2
Temperature(℃): 15
CurrentWeatherTime: 3:00 PM
GetWeatherTime: 2026-03-12 17:51:25
Feels Like(℃): 15
Pressure(hPa): 1028
Humidity(%): 38
WindSpeed: 3
WindSpeedDesc: 微风
TempRange(℃): 6-15
SunHour: 11.9h
Sunrise: 06:19 AM
Sunset: 06:10 PM
---
Java 有一个**通用约定**（必须遵守）：
- 如果两个对象通过 `equals()` 比较相等，那么它们的 `hashCode()` 必须返回相同的值；
- 如果两个对象的 `hashCode()` 返回不同的值，那么它们的 `equals()` 必须返回 `false`（反过来不强制：hashCode 相同，equals 可以不同，这就是 “哈希冲突”）。
核心原因：**当你重写了 equals () 但不重写 hashCode () 时，会破坏上述约定，导致依赖哈希的集合（HashMap/HashSet）无法正常工作**。

举个实际例子：
假设你定义了一个 `User` 类，重写了 `equals()`（按 `id` 判断相等），但没重写 `hashCode()`：
```java
class User {
    private Integer id;
    private String name;

    // 构造器、getter/setter 省略

    // 重写equals：按id判断两个User是否相等
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }

    // 未重写hashCode，使用Object的默认实现
}
```

现在测试使用 `HashSet`（不允许重复元素）：
```java
public class Test {
    public static void main(String[] args) {
        User u1 = new User(1, "张三");
        User u2 = new User(1, "张三");

        // equals判断相等
        System.out.println(u1.equals(u2)); // 输出 true

        HashSet<User> set = new HashSet<>();
        set.add(u1);
        set.add(u2);

        // 预期size是1，但实际是2！
        System.out.println(set.size()); // 输出 2
    }
}
```

#### 问题出在哪？Java 有一个**通用约定**（必须遵守）：

- 如果两个对象通过 `equals()` 比较相等，那么它们的 `hashCode()` 必须返回相同的值；
- 如果两个对象的 `hashCode()` 返回不同的值，那么它们的 `equals()` 必须返回 `false`（反过来不强制：hashCode 相同，equals 可以不同，这就是 “哈希冲突”）。Java 有一个**通用约定**（必须遵守）：

- 如果两个对象通过 `equals()` 比较相等，那么它们的 `hashCode()` 必须返回相同的值；
- 如果两个对象的 `hashCode()` 返回不同的值，那么它们的 `equals()` 必须返回 `false`（反过来不强制：hashCode 相同，equals 可以不同，这就是 “哈希冲突”）。
`HashSet` 底层依赖 `HashMap`，添加元素时会先计算对象的 `hashCode()`，找到对应的 “哈希桶”；再在桶内用 `equals()` 检查是否已有相同元素。
- u1 和 u2 的 `equals()` 相等，但因为没重写 `hashCode()`，它们的 hashCode 是不同的（内存地址不同）；
- HashSet 会把它们放到不同的哈希桶里，自然不会触发 `equals()` 检查，最终认为是两个不同的元素 —— 这完全违背了我们的业务逻辑。