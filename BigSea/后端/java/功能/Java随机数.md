---
title: Java随机数
tags:
  - 笔记
  - Java随机数
author: BigSea
email: 2834637197@qq.com
封面: ""
createDate: 2025-12-10 16:56:24
updateDate: 2025-12-11 09:44:55
week: 第50周｜星期三
Country: China
City: NanJing
Weather: ☀️
uvIndex(1-15): 1
Temperature(℃): 19
CurrentWeatherTime: 3:00 PM
GetWeatherTime: 2025-12-10 16:56:30
Feels Like(℃): 19
Pressure(hPa): 1018
Humidity(%): 36
WindSpeed: 3
WindSpeedDesc: 微风
TempRange(℃): 9-19
SunHour: 10.5h
Sunrise: 06:54 AM
Sunset: 05:01 PM
---
# 伪随机
## 伪随机数生成（核心常用）

伪随机数通过固定算法（线性同余、梅森旋转等）结合 “种子” 生成，相同种子会产生完全相同的随机序列，适合大部分非安全场景（如游戏、模拟、数据填充）。
### 1. `java.lang.Math.random()`（最简单）
#### 原理
底层依赖 `java.util.Random`，默认使用系统时间作为种子，生成 `[0.0, 1.0)` 范围内的 `double` 类型随机数。
#### 使用示例
java
运行
```java
// 生成 [0.0, 1.0) 的随机double
double randomDouble = Math.random();

// 生成 [1, 100] 的随机整数
int randomInt = (int) (Math.random() * 100 + 1);

// 生成 [min, max) 的随机整数（通用公式）
int min = 5, max = 15;
int randomRange = (int) (Math.random() * (max - min) + min);
```
#### 特点
- 优点：调用简单，无需创建对象；
- 缺点：仅支持 `double` 类型，无法指定种子，灵活性差。
### 2. `java.util.Random`（灵活的伪随机数生成器）
#### 原理
基于**线性同余算法**实现，支持指定种子，可生成多种类型（int、long、float、double、boolean）的随机数。
#### 核心 API

| 方法                        | 功能           | 范围                                        |
| ------------------------- | ------------ | ----------------------------------------- |
| `nextInt()`               | 生成随机 int     | `Integer.MIN_VALUE` ~ `Integer.MAX_VALUE` |
| `nextInt(int bound)`      | 生成随机 int     | `[0, bound)`（bound 必须 > 0）                |
| `nextLong()`              | 生成随机 long    | `Long.MIN_VALUE` ~ `Long.MAX_VALUE`       |
| `nextDouble()`            | 生成随机 double  | `[0.0, 1.0)`                              |
| `nextBoolean()`           | 生成随机 boolean | true/false                                |
| `nextFloat()`             | 生成随机 float   | `[0.0f, 1.0f)`                            |
| `nextBytes(byte[] bytes)` | 填充随机字节到数组    | 字节范围 `-128 ~ 127`                         |
#### 使用示例
java
运行
```java
import java.util.Random;

public class RandomDemo {
    public static void main(String[] args) {
        // 方式1：默认种子（系统时间 + 纳秒）
        Random random = new Random();
        
        // 生成 [0, 100) 的int
        int r1 = random.nextInt(100);
        // 生成 [10, 20] 的int
        int r2 = random.nextInt(11) + 10;
        // 生成随机long
        long r3 = random.nextLong();
        // 生成随机boolean
        boolean r4 = random.nextBoolean();

        // 方式2：指定种子（固定种子生成固定序列，可复现）
        Random fixedSeedRandom = new Random(12345);
        System.out.println(fixedSeedRandom.nextInt(100)); // 始终输出 78
        System.out.println(fixedSeedRandom.nextInt(100)); // 始终输出 43
    }
}
```
#### 线程安全与性能
- `Random` 是线程安全的（内部用 `AtomicLong` 维护种子），但多线程并发调用时性能较低（CAS 竞争）；
- 单线程场景推荐使用，多线程场景建议每个线程创建独立实例，或使用 `ThreadLocalRandom`。
### 3. `java.util.concurrent.ThreadLocalRandom`（多线程最优）
#### 原理
JDK 7 新增，基于 `ThreadLocal` 实现，每个线程持有独立的 `Random` 实例，避免多线程竞争，性能远高于 `Random`。
#### 使用示例
java
运行
```java
import java.util.concurrent.ThreadLocalRandom;

public class ThreadLocalRandomDemo {
    public static void main(String[] args) {
        // 生成 [0, 100) 的int
        int r1 = ThreadLocalRandom.current().nextInt(100);
        // 生成 [5, 15] 的int（指定上下界）
        int r2 = ThreadLocalRandom.current().nextInt(5, 16);
        // 生成随机double（0.0 ~ 1.0）
        double r3 = ThreadLocalRandom.current().nextDouble();
        // 生成 [0.0, 10.0) 的double
        double r4 = ThreadLocalRandom.current().nextDouble(10.0);
        // 生成 [2.0, 8.0) 的double
        double r5 = ThreadLocalRandom.current().nextDouble(2.0, 8.0);
    }
}
```
#### 特点
- 不可指定种子（为了线程隔离）；
- 仅通过 `current()` 方法获取实例，不能 new；
- 多线程场景（如线程池、并发计算）首选。
# 真随机
## 真随机数生成（安全场景）

伪随机数可通过种子预测，不适合密码学、token 生成等安全场景，需使用基于系统熵源（如鼠标移动、键盘输入、硬件噪声）的真随机数生成器 `SecureRandom`。
### 1. `java.security.SecureRandom`
#### 原理
通过操作系统提供的随机数生成器（如 Linux 的 `/dev/random`/`/dev/urandom`，Windows 的 `CryptGenRandom`）生成真随机数，不可预测。
#### 使用示例
java
运行
```java
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

public class SecureRandomDemo {
    public static void main(String[] args) throws NoSuchAlgorithmException {
        // 方式1：默认算法（推荐，由系统决定最优算法）
        SecureRandom secureRandom = new SecureRandom();
        
        // 方式2：指定算法（如SHA1PRNG、NativePRNG）
        // SecureRandom secureRandom = SecureRandom.getInstance("SHA1PRNG");

        // 生成随机字节数组（适合生成密钥、token）
        byte[] randomBytes = new byte[16]; // 16字节=128位
        secureRandom.nextBytes(randomBytes);

        // 生成 [0, 100) 的安全随机int
        int r1 = secureRandom.nextInt(100);
        // 生成 [10, 20] 的安全随机int
        int r2 = 10 + secureRandom.nextInt(11);

        // 补充：重新播种（增强随机性）
        secureRandom.setSeed(secureRandom.generateSeed(8)); // 8字节种子
    }
}
```
#### 关键注意事项
- `/dev/random` 是阻塞式的（熵源不足时等待），`/dev/urandom` 是非阻塞的（推荐生产环境使用）；
- `SecureRandom` 性能低于伪随机数生成器，仅在安全场景使用；
- 避免使用固定种子（会失去真随机特性）。
