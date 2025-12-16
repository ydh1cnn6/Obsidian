---
title: jvm
updateDate: 2025-12-16 17:11:02
tags:
  - 笔记
  - jvm
author: BigSea
email: 2834637197@qq.com
封面: ""
createDate: 2025-06-06 15:13:16
week: 第50周｜星期五
Country: China
City: NanJing
Weather: ☁️
uvIndex(1-15): 3
Temperature(℃): 12
CurrentWeatherTime: 12:00 AM
GetWeatherTime: 2025-12-12 14:36:43
Feels Like(℃): 10
Pressure(hPa): 1027
Humidity(%): 47
WindSpeed: 4
WindSpeedDesc: 和风
TempRange(℃): 8-13
SunHour: 10.3h
Sunrise: 06:56 AM
Sunset: 05:01 PM
---
# JVM模型
![jvm模型|350](https://i-blog.csdnimg.cn/blog_migrate/754c2912d23e93962f4543bb81ce3e21.png)
>[!tip]
补充：**本地接口**和**本地方法栈**进行交互

- JDK6 及更早：永久代完全存储类元数据、运行时常量池、静态变量值、方法字节码等所有方法区要求的内容；
- JDK7：做了过渡优化 —— 将字符串常量池、静态变量值移到堆的老年代，但类元数据、符号引用等核心内容仍存储在永久代，仍属于对方法区的实现。
- JDK8：永久代改成元空间
**永久代  ->值老年-引用永久 ->值老年-引用元空间**
[深入理解JavaJVM：方法区与元空间-CSDN博客](https://blog.csdn.net/m0_69057918/article/details/131123965)


[java内存模型备份](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-12-16-202512161116624.png)
![jvm内存模型2025-12-15 17.37.01.excalidraw](jvm内存模型2025-12-15%2017.37.01.excalidraw.md)
## 1、栈
![image.png|300](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-12-16-202512160926475.png)

### 1、局部变量表：
存储基础变量、引用
​ 在《Java虚拟机规范》中，对这个内存区域规定了**两类异常状况**：
- 如果线程请求的栈深度大于虚拟机所允许的深度，将抛出**StackOverflowError**异常；
- 如果Java虚拟机栈容量可以动态扩展，当栈扩展时无法申请到足够的内存会抛出**OutOfMemoryError**异常
### 操作数栈
### 动态链接
### 方法返回地址
### 额外的信息
## 2、堆
![image.png|300](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-12-16-202512161005819.png)
### 新生代
清理方式：MinorGC，停止-复制（Stop-and-copy）”清理法

- Eden区（伊甸区）：一块比较大的
- Survivor区（幸存者区）：有两块较小的，（也可以说是s0,s1，两个会互相交换）
    - FromSurvivor空间
    - ToSurvivor空间
默认比例为：8:1:1
在新生代中，大的对象是不会进入新生代的 而是直接进入老年代。
​ 当Eden区没有足够的空间进行分配，虚拟机将发起一次MinorGC：
- GC开始的时候，对象会存在Eden区。这个时候FormSurvivor区和ToSurvivor 是空的，作为保留区域。
- GC进行的时候，Eden区的所有存活的对象都会被复制到ToSurvivor 区中，而在FormSurvivor区的是扔存活的对象，根据他们的年龄值决定去向。年龄值达到年龄的阀值（15 新生代中的对象每熬过一次GC 年龄就+1）的对象会被移动到老年代中，没有达到阀值的对象会被复制的ToSurvivor区，接着FormSurvivor和ToSurvivor 两者交换角色。都要保证ToSurvivor 区在一轮GC后是空的；如果在GC时，当ToSurvivor没有足够的空间存放上一次新生代收集下来的存活对象，需要依赖老年代进行分配担保，将这些对象放入到老年代。
[JVM: GC过程总结(minor GC 和 Full GC)-CSDN博](https://blog.csdn.net/weixin_42615068/article/details/102813947)
### 老年代
清理方式：Full GC，标记-清除或者标记整理。
标记出仍然存活的对象（存在引用的），将所有存活的对象向一端移动，以保证内存的连续

### GC触发条件
#### Minor GC触发条件：
Eden区满时
#### Full GC触发条件：  
（1）调用System.gc时，系统建议执行Full GC，但是不必然执行  
（2）老年代空间不足  
（3）方法去空间不足  
（4）通过Minor GC后进入老年代的平均大小大于老年代的可用内存  
（5）由Eden区、From Space区向To Space区复制时，对象大小大于To Space可用内存，则把该对象转存到老年代，且老年代的可用内存小于该对象大小。

## 3、方法区
方法区是《Java 虚拟机规范》中定义的**线程共享逻辑区域**，不属于堆（但 JDK7 前的永久代是堆内实现，易混淆），核心作用是存储支撑 JVM 运行的 “类相关核心数据”，是 JVM 能识别、加载、执行类的基础。

| 存储内容           | 具体作用                                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| 类的元数据          | 类的全限定名、父类 / 接口信息、字段（属性）定义、方法定义（参数、返回值、访问修饰符）、常量池指针等 ——JVM 靠这些信息识别 “这个类是什么、能做什么”。                                 |
| 运行时常量池         | 每个类独有，存储字符串常量、数字常量、符号引用（如类名 / 方法名的字面量）、直接引用等 —— 比如 `String s = "abc"` 中的 `"abc"` 就存在这里（JDK7 后字符串常量池移到堆，仅符号引用保留）。 |
| 静态变量（类变量）      | 类级别的变量（`static` 修饰），比如 `public static int count = 0`—— 生命周期和类绑定，类卸载时才释放。                                         |
| 方法字节码 & 即时编译缓存 | 类的方法体字节码（`.class` 文件中的核心内容），以及 JIT 编译器编译后的机器码缓存（提升方法执行效率）。                                                       |
| 注解、枚举等元信息      | 类 / 方法 / 字段上的注解（如 `@Override`）、枚举类的常量定义等。                                                                        |
### 元空间

|维度|永久代（PermGen）|元空间（Metaspace）|
|---|---|---|
|JDK 版本|JDK1.2 ~ JDK7|JDK8+|
|是否属于堆|是（堆的独立分区）|否（本地内存 / 非堆）|
|占用 -Xmx 额度|是|否|
|内存上限|需显式配置 MaxPermSize|默认无上限（可配 MaxMetaspaceSize）|
|溢出异常|OutOfMemoryError: PermGen space|OutOfMemoryError: Metaspace|
|核心改进|-|避免堆内空间竞争、支持动态扩容|

## 4、本地方法区

## 5、程序计数器


# 参数配置

## 1. ‌堆内存配置参数‌
- ‌**Xms**：初始堆大小（如 `-Xms256m`）
- ‌**Xmx**‌：最大堆大小（如 `-Xmx512m`）
- ‌**Xmn**‌：新生代大小（通常为 `-Xmx` 的 1/3 或 1/4）
- ‌**XX:MetaspaceSize**‌：元空间初始大小（如 `-XX:MetaspaceSize=512m`）
- ‌**XX:MaxMetaspaceSize**‌：元空间最大值（如 `-XX:MaxMetaspaceSize=1024m`）
## 2. 垃圾回收器配置参数‌
- ‌**XX:+UseSerialGC**‌：串行垃圾收集器
- ‌**XX:+UseParallelGC**‌：并行垃圾收集器
- ‌**XX:+UseConcMarkSweepGC**‌：CMS垃圾收集器
- ‌**XX:+UseG1GC**‌：G1垃圾收集器
- ‌**XX:ParallelGCThreads=n**‌：设置并行收集器线程数（如 `-XX:ParallelGCThreads=4`）
## 3. ‌**GC策略参数**‌
- ‌**XX:MaxGCPauseMillis=n**‌：设置最大垃圾回收暂停时间（如 `-XX:MaxGCPauseMillis=100`）
- ‌**XX:GCTimeRatio=n**‌：设置垃圾回收时间占程序运行时间的百分比（如 `-XX:GCTimeRatio=19`）
- ‌**XX:MaxTenuringThreshold=n**‌：设置对象进入老年代的阈值（如 `-XX:MaxTenuringThreshold=15`）
## 4. ‌**日志和调试参数**‌
- ‌**XX:+PrintGCDetails**‌：打印GC详细信息
- ‌**XX:+PrintGCTimeStamps**‌：打印GC时间戳
- ‌**XX:+HeapDumpOnOutOfMemoryError**‌：OOM时生成堆转储文件
- ‌**Xloggc:file**‌：指定GC日志文件路径（如 `-Xloggc:/var/log/gc.log`）
## 5. ‌**其他常用参数**‌
- ‌**Xss**‌ ：线程堆栈大小（如 `-Xss1024k`）
- ‌**XX:SurvivorRatio**‌：Eden与Survivor区比例（默认8）
- ‌**XX:+UseAdaptiveSizePolicy**‌：启用自适应大小策略


## 1. ‌堆内存配置参数‌
- ‌-Xms：初始堆大小（如 `-Xms256m`）
- ‌**-Xmx**‌：最大堆大小（如 `-Xmx512m`）
- ‌**-Xmn**‌：新生代大小（通常为 `-Xmx` 的 1/3 或 1/4）
- ‌**-XX:MetaspaceSize**‌：元空间初始大小（如 `-XX:MetaspaceSize=512m`）
- ‌**-XX:MaxMetaspaceSize**‌：元空间最大值（如 `-XX:MaxMetaspaceSize=1024m`）
## 2. 垃圾回收器配置参数‌
- ‌**-XX:+UseSerialGC**‌：串行垃圾收集器
- ‌**-XX:+UseParallelGC**‌：并行垃圾收集器
- ‌**-XX:+UseConcMarkSweepGC**‌：CMS垃圾收集器
- ‌**-XX:+UseG1GC**‌：G1垃圾收集器
- ‌**-XX:ParallelGCThreads=n**‌：设置并行收集器线程数（如 `-XX:ParallelGCThreads=4`）
### 3. ‌**GC策略参数**‌
- ‌**-XX:MaxGCPauseMillis=n**‌：设置最大垃圾回收暂停时间（如 `-XX:MaxGCPauseMillis=100`）
- ‌**-XX:GCTimeRatio=n**‌：设置垃圾回收时间占程序运行时间的百分比（如 `-XX:GCTimeRatio=19`）
- ‌**-XX:MaxTenuringThreshold=n**‌：设置对象进入老年代的阈值（如 `-XX:MaxTenuringThreshold=15`）
### 4. ‌**日志和调试参数**‌
- ‌**-XX:+PrintGCDetails**‌：打印GC详细信息
- ‌**-XX:+PrintGCTimeStamps**‌：打印GC时间戳
- ‌**-XX:+HeapDumpOnOutOfMemoryError**‌：OOM时生成堆转储文件
- ‌**-Xloggc:file**‌：指定GC日志文件路径（如 `-Xloggc:/var/log/gc.log`）
## 5. ‌**其他常用参数**‌
- ‌**-Xss**‌ ：线程堆栈大小（如 `-Xss1024k`）
- ‌**-XX:SurvivorRatio**‌：Eden与Survivor区比例（默认8）
- ‌**-XX:+UseAdaptiveSizePolicy**‌：启用自适应大小策略


# jvm
## 运行时方法区
堆:存放对象，所有线程公有
栈:线程私有，每一个方法执行的时候都公有自己的栈空间。局部变量，操作數，引用，方法出口信息等
方法区:公有，被虚拟机加载的类信息，静态变量，常量池(jdk1.8后移到堆) ，即时编译器编译后的代码
程序计数器:线程私有，存储执行的方法代码的行号，用来控制跳转，循环，分支，选择等
本地方法栈:执行本地方法
## 类加载过程
[类加载过程](http://www.dtmao.cc/NodeJs/78494.html)
双亲委派机制的好处有什么:
	1:防止类的重复加载
	2:沙箱安全机制，防止篡改Java的核心API I
	ClassLoader加载的原则:
双亲委派模型
	可见性:子类加载器是访问父类加载器加载的类，但是父类加载器是不能访问子类加载器加载的类
	唯一:同一个命名空间，- 一个类只会被加载一-次
## 类加载器
# 垃圾回收
## 垃圾判断
引用计数法:问题，无法处理循环引用
根可达:从栈变量，静态变量，常量池。JNI指针(本地方法)等作为root.可以解决循环依赖问题
## 回收算法
分代回收:不同的代里面使用的回收算法是不同的
标记清除:
​		特点：垃圾区域直接回收
​		优缺点:``优``：算法简单;``缺``：内存碎片化
拷贝：
​		特点：将内存分成两份，一般存储数据，另一半留着拷贝用
​		优点：效率比较高，没有碎片，
​		缺点：内存利用率低
标记压缩：
​		特点:一边标记一边整理
​				优点I没有碎片，空间利用率也高
​				缺点:算法比较复杂，效率降低
## 分代模型
新生代+老年代+永久代(1.7)/元空间
永久代(1.7)/元空间
​		逻辑名称：方法区
​		存放：静态变量、1.7前的常量、类信息、即时编译代码
​		大小：1.7之前要设置大小，1.8不用了(受限于物理内存)
调优：基本无视这一块
常说的内存：
-Xmx和-Xms设置为一样大，目的是避免伸缩（xmx默认1/4物理内存）
![image-20230819160721365](https://my-picture-aa.oss-cn-nanjing.aliyuncs.com/img/202308191607517.png)parallel scavenge
# java对象的引用类型
## 强引用
A a = new A();
垃圾回收器宁愿抛出00M，也不会回收强引用指向的对象
## 弱引用
当内存足够的时候，不公被回收，如果内存不足，则公被回收
## 软引用
gc调用则回收
## 虚引用
虚引用也称为幽灵或者幻影应用
	特点:
		对象上是否有虚引用，不会对对象的生存造成影响
		必须和引用队列- -起使用，用于垃圾回收的跟踪​				