---
typora-root-url: 图例
updateDate: 2025-12-05 11:24:41
title: JVM调优
---



# 补充

- JMM（Java内存模型）：是Java语言在多线程并发情况下对于共享变量读写(实际是共享变量对应的内存操作)的规范，规定了线程的工作内存和主内存之间的交互关系，以及线程之间的可见性和程序的执行顺序，主要是为了解决多线程可见性、原子性的问题，解决共享变量的多线程操作冲突问题。
- JVM内存模型：Java虚拟机在运行时对该Java进程占用的内存进行的一种逻辑上的划分，包括方法区、堆内存、虚拟机栈、本地方法栈、程序计数器。这些区块实际都是Java进程在Java虚拟机的运作下通过不同数据结构来对申请到的内存进行不同使用。





# 一、JVM模型

JVM的组成

整个JVM 分为四部分：

1.  Class Loader 类加载器 : 类加载器的作用是加载类文件到内存

2.  Execution Engine 执行引擎: 执行引擎也叫做解释器(Interpreter) ，负责解释命令，提交操作系统执行。

3.  Native Interface 本地接口

- 本地接口的作用是融合不同的编程语言为Java 所用，它的初衷是融合C/C++ 程序，Java 诞生的时候是C/C++ 横行的时候，要想立足，必须有一个聪明的、睿智的调用C/C++ 程序，于是就在内存中专门开辟了一块区域处理标记为native 的代码，它的具体做法是Native Method Stack 中登记native 方法，在Execution Engine 执行时加载native libraies 。目前该方法使用的是越来越少了，除非是与硬件有关的应用，比如通过Java 程序驱动打印机，或者Java 系统管理生产设备，在企业级应用中已经比较少见，因为现在的异构领域间的通信很发达，比如可以使用Socket 通信，也可以使用Web Service 等等。

4. Runtime data area 运行数据区

- 运行数据区是整个JVM 的重点。我们所有写的程序都被加载到这里，之后才开始运行，Java 生态系统如此的繁荣，得益于该区域的优良自治。
![image.png|300](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-12-05-202512051031175.png)

  
## 1. java程序的执行顺序

- 编译器将Java源文件编译成字节码文件
- 类加载器加载字节码文件到内存
- JVM进程解释程序。

![01.java程序执行过程.png|300](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-12-05-01.java程序执行过程.png)

所有的程序都要求运行在JVM上，是因为考虑到了可移植性问题 ，但如果真正去执行程序，无法离开操作系统的支持。在 java 中可以使用 native 实现 本地 C 函数的调用，Native Interface，但是这些都是属于程序的辅助手段，而真正的程序运行都在“运行时数据区”之中。
## 2. 运行时数据区

- 程序计数器（Program Counter Register）：线程私有。一小块内存空间，可以看做当前线程所执行的字节码的行号指示器。字节码解释器通过改变计数器的值来实选择下一条需要执行的字节码指令。分支、循环、跳转等都需要依赖计数器来完成。
- 虚拟机栈（Stack）：线程私有。每个方法在执行的同时都会创建一个帧栈（Stack Frame）。用于存储局部变量表，操作数栈，动态链栈，方法出口等信息。
  - 局部变量表（Local Variables）:方法的局部变量或形参，其以变量槽（solt）为最小单位，只允许保存32为长度的变量，如果超过32位则会开辟两个连续的solt(64位长度，long和double)；
  - 操作树栈（Operand Stack）：表达式计算在栈中完成；
  - 指向当前方法所属的类的运行时常量池的引用（Reference to runtime constant pool）：引用其他类的常量或者使用String 池中的字符串；
  - 方法返回地址（Return Address）：方法执行完后需要返回调用此方法的位置，所以需要再栈帧中保存方法返回地址；
- 本地方法栈（Native Method Stack）：执行本地方法时使用
- 堆（Heap）：虚拟机管理的内存中最大的一块。所有线程共享使用。用来存放对象
- 方法区（Method Area）：各线程共享区域，用来存储已经被虚拟机加载的类信息，静态变量、即时编译器编译后的代码等

![02.运行时数据区.png|300](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-12-05-02.运行时数据区.png)
## 3. Java对象访问模式

hotSpot虚拟机在堆内存中直接保存对象，通过对象类型指针，可以直接进行方法区的调用。

![03.java对象访问模式.png|300](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-12-05-03.java对象访问模式.png)




# 二、类加载机制

## 1. 类的加载过程

javap -v  xxx.class可以看到class类加载后的内容。

![06.类的加载过程.png|300](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-12-05-06.类的加载过程.png)

 加载：在硬盘上查找并通过IO读入字节码文件到JVM虚拟机方法区，同时在堆中创建Class对象

 验证：校验字节码文件的正确性

 准备：为类的静态变量分配内存，并将其初始化为默认值。此阶段仅仅只为静态类变量（即static修饰的字段变量）分配内存，并且设置该变量的初始值（比如static int num = 5，这里只是将num初始化成0,5的值将会在初始化时赋值）；对于final static修饰的变量，编译的时候就会分配了，也不会分配实例变量的内存。

 解析：把类中的符号引用（CONSTANT_Class_info、CONSTANT_Fieldref_info）转为直接引用

 初始化：执行类构造器< **clinit** >方法（类构造器不是实例构造器），对类的静态变量初始化为指定的值，执行静态代码块。

## 2. 类的加载器

- 引导类加载器：负责加载jre/lib目录下的核心类库，比如rt.jar,charsets.jar等
- 扩展类加载器：负责加载jre/lib/ext目录中的JAR类包
- 应用程序类加载器：负责加载ClassPath路径（类路径）下的class字节码文件，主要就是加载你自己写的那些类。
- 自定义加载器

扩展类加载器、应用程序类加载器、自定义加载器是java.lang.ClassLoader的子类实例，自定义类加载器直接继承java.lang.ClassLoader

![2.加载器.png|300](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-12-05-2.加载器.png)

1.当Application ClassLoader 收到一个类加载请求时，他首先不会自己去尝试加载这个类，而是将这个请求委派给父类加载器Extension ClassLoader去完成。
2.当Extension ClassLoader收到一个类加载请求时，他首先也不会自己去尝试加载这个类，而是将请求委派给父类加载器Bootstrap ClassLoader去完成。
3.如果Bootstrap ClassLoader加载失败(在、lib中未找到所需类)，就会让Extension ClassLoader尝试加载。
4.如果Extension ClassLoader也加载失败，就会使用Application ClassLoader加载。
5.如果Application ClassLoader也加载失败，就会使用自定义加载器去尝试加载。
6.如果均加载失败，就会抛出ClassNotFoundException异常。

```
public static void main(String[] args) {
                //获取引导类加载器
		System.out.println(String.class.getClassLoader());
               //获取扩展类加载器
		System.out.println(sun.net.spi.nameservice.dns.DNSNameService.class.getClassLoader());
                //获取应用类加载器（系统加载器）
		System.out.println(N.class.getClassLoader());

		
		//AppClassLoader 也称为SystemClassLoader
		ClassLoader appClassLoader = ClassLoader.getSystemClassLoader();
		System.out.println(appClassLoader);
//		System.out.println(N.class.getClassLoader().getParent());
	}
```

ClassLoader有几个原则，分别是：

**Parent Delegate**：双亲委派模型。该原则保证了所有要加载的类，都要经过Boostrap ClassLoader这个老大哥，能防止自定义的类替换掉java核心类，例如String类。

**Visibility**：可见性。子类加载器能够访问父加载器加载的类，反过来父加载器不能访问子加载器加载的类。

**Unique**：唯一性，在同一命名空间内，一个类只会被加载一次。



**为什么要双亲委派机制：**

- 避免类的重复加载：当类加载器已经加载了该类时，就没有必要子ClassLoader再加载一次，保证被加载的类的唯一性

- 沙箱安全机制：自己写的java.lang.String.class类不会被加载，这样便可以防止核心API库不会被随意篡改。保证了运行的安全性，防止不可信类扮演可信任的类。

  ![06.string](06.string.png.md)

# 三、垃圾回收

## 为什么需要GC

GC（Garbage Collection）是垃圾收集的意思，负责清除对象并释放内存。Java 提供的 GC 功能可以自动检测对象是否超过作用域从而达到自动回收内存的目的，从而防止内存泄漏。

## 1. 手动回收的问题

java中的对象当没有引用变量指向它（它们：互相引用，但是没有栈引用变量）时，虚拟机会在适当时机回收这些对象。

finalize方法：在对象在被虚拟机回收前一定会自动调用 其finalize方法

System.gc():提醒虚拟机回收内存

```java
public class Cat {
	String name;
	
	public Cat(String name) {
		super();
		this.name = name;
	}
	
	public void finalize() throws Throwable {
		System.out.println("finalize");
	}	
}
//=========================================
public static void main(String[] args) {
	Cat cat = new Cat("xiaohua",5);
	cat = null;
	System.gc();
}
```



手工回收的问题

- 忘记回收
- 多次回收

## 2. JVM堆内存分代模型

- 此部分使用于分代垃圾回收算法---部分垃圾回收器，新的垃圾回收器（G1)已经不再使用这样的分代模型

- 新生代 + 老年代 + 永久代（1.7）/元空间（1.8） Metaspace

  - 永久代/元数据区

    - 永久代/元数据都是用来存储各种Class的对象（loadClass时）
    - 永久代必须指定大小限制，元数据区可以设置，也可以不设置（受限于物理内存）
    - 字符串常量（1.7）是存储在永久代，1.8是存储在堆当中
    - MethodArea是逻辑概念 ≈ 永久代/元数据

  - 堆内存逻辑分区（新生代 + 老年代）

    - 老年代和新生代的比例大致为1:3

    - 新生代=eden + 2个survior区，eden和survivor 0，survivor1的比例是8:1:1

      ![05.堆内存逻辑分区.png|300](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-12-05-05.堆内存逻辑分区.png)

- 新生代：存活对象少，使用copy算法，效率高

  - 新生代=eden + 2个survior区，YGC回收的时候，大多数的对象会被回收。
  - 对象创建时，需要分配空间，先去检查Eden，如果不够，直接进入老年代。
  - 如何回收
    - 第一次进行YGC（也叫MinorGC）时候，大部分对象（90%）的对象就会被回收，活着的对象放到survivor0区当中，将eden全部释放，不需要压缩。
    - 再次YGC的时候，将Eden和survivor0中活着的对象都copy到survivor1中
    - 再次YGC,Eden + survivor1 ==》survivior0，如此反复
    - 年龄足够（对象的活着计算的次数达到一定程度以后），直接进入老年代
    - Survivor区装不下，进入老年代

- 老年代：垃圾少，一般使用Mark-Compact（标记压缩），G1使用copy

  - 装大对象以及一直活着的（岁数比较大的）

  - 老年代满了，进行FGC (Full GC)，也叫MajorGC，会压缩，效率比较低

    

## 3. 垃圾回收期如何判断垃圾

- 引用计数（Reference Count）：无法解决多个引用对象之间循环引用，但是无法引用指向的情况。

- 根可达算法

  ![05.根可达算法.png|300](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-12-05-05.根可达算法.png)
# 4. 常见的垃圾回收算法

### Mark-Sweep（标记清除）

- 找出垃圾，标记垃圾区域，直接回收。

- 特点：位置不连续，产生碎片

  ![05.标记清除算法.png|300](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-12-05-05.标记清除算法.png)

### Coping（拷贝算法）

- 将内存空间分成两份，只使用一半内存，另一半空余着。垃圾回收时，将活着的对象拷贝到空余的区域，将原来使用的一半全部清空。

- 特点：没有碎片，空间利用率比较低

  ![05.垃圾回收-拷贝算法.png|300](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-12-05-05.垃圾回收-拷贝算法.png)
### Mark-Compact（标记压缩）

- 一边标记一边整理压缩

- 特点：没有碎片，算法效率比较低（查找效率基本相同，压缩的时候效率低）

  ![05.垃圾回收-标记压缩算法.png|300](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-12-05-05.垃圾回收-标记压缩算法.png)

### Generational Collecting（分代）收集

基于对对象生命周期分析后得出的垃圾回收算法。把对象分为年青代、年老代、持久代，对不同生命周期的对象使用不同的算法（上述方式中的一个）进行回收。现在的垃圾回收器（从J2SE1.2开始）都是使用此算法的。



## 5.垃圾收集器

查看垃圾回收器的命令

```
java -XX:+PrintCommandLineFlags -version
```

![JDK8默认的垃圾回收器.png|300](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-12-05-JDK8默认的垃圾回收器.png)

**注意：如上图, JDK8的默认垃圾回收器为Parallel**

不同的厂商、不同的版本的虚拟机提供的垃圾收集器可能有很大的差别。

![04.垃圾收集器.png|300](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-12-05-04.垃圾收集器.png)

相关概念：

- **并行收集**：指多条垃圾收集线程并行工作，但此时用户线程仍处于等待状态。
- **并发收集**：指用户线程与垃圾收集线程同时工作（不一定是并行的可能会交替执行）。用户程序在继续运行，而垃圾收集程序运行在另一个CPU上。
- **吞吐量**：即CPU用于运行用户代码的时间与CPU总消耗时间的比值（吞吐量 = 运行用户代码时间 / ( 运行用户代码时间 + 垃圾收集时间 )）。例如：虚拟机共运行100分钟，垃圾收集器花掉1分钟，那么吞吐量就是99%



### Serial 收集器

Serial收集器是最基本的、发展历史最悠久的收集器。**新生代采用复制算法，老年代采用“标记-整理“算法。**

**特点：**单线程、简单高效（与其他收集器的单线程相比），对于限定单个CPU的环境来说，Serial收集器由于没有线程交互的开销，专心做垃圾收集自然可以获得最高的单线程手机效率。收集器进行垃圾回收时，必须暂停其他所有的工作线程，直到它结束（Stop The World）。

**应用场景**：适用于Client模式下的虚拟机。

**Serial / Serial Old收集器运行示意图**

![07.serial.png|300](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-12-05-07.serial.png)

### ParNew收集器

ParNew收集器其实就是Serial收集器的多线程版本。

除了使用多线程外其余行为均和Serial收集器一模一样（参数控制、收集算法、Stop The World、对象分配规则、回收策略等）。

**特点**：多线程、ParNew收集器默认开启的收集线程数与CPU的数量相同，在CPU非常多的环境中，可以使用-XX:ParallelGCThreads参数来限制垃圾收集的线程数。

　　　和Serial收集器一样存在Stop The World问题

**应用场景**：ParNew收集器是许多运行在Server模式下的虚拟机中首选的新生代收集器，因为它是除了Serial收集器外，唯一一个能与CMS收集器配合工作的。

**ParNew/Serial Old组合收集器运行示意图如下：**

![07.parNew.png|300](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-12-05-07.parNew.png)
### Parallel Scavenge 收集器

与吞吐量关系密切，故也称为吞吐量优先收集器。

**特点**：属于新生代收集器也是采用复制算法的收集器，又是并行的多线程收集器（与ParNew收集器类似）。

该收集器的目标是达到一个可控制的吞吐量。还有一个值得关注的点是：GC自适应调节策略（与ParNew收集器最重要的一个区别）

**GC自适应调节策略**：Parallel Scavenge收集器可设置-XX:+UseAdptiveSizePolicy参数。当开关打开时不需要手动指定新生代的大小（-Xmn）、Eden与Survivor区的比例（-XX:SurvivorRation）、晋升老年代的对象年龄（-XX:PretenureSizeThreshold）等，虚拟机会根据系统的运行状况收集性能监控信息，动态设置这些参数以提供最优的停顿时间和最高的吞吐量，这种调节方式称为GC的自适应调节策略。

Parallel Scavenge收集器使用两个参数控制吞吐量：

- XX:MaxGCPauseMillis 控制最大的垃圾收集停顿时间
- XX:GCRatio 直接设置吞吐量的大小。

### Serial Old 收集器

Serial Old是Serial收集器的老年代版本。

**特点**：同样是单线程收集器，采用标记-整理算法。

**应用场景**：主要也是使用在Client模式下的虚拟机中。也可在Server模式下使用。

Server模式下主要的两大用途（在后续中详细讲解···）：

1. 在JDK1.5以及以前的版本中与Parallel Scavenge收集器搭配使用。
2. 作为CMS收集器的后备方案，在并发收集Concurent Mode Failure时使用。

Serial / Serial Old收集器工作过程图（Serial收集器图示相同）：

![07.Serial Old.png|300](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-12-05-07.Serial Old.png)

### Parallel Old 收集器

是Parallel Scavenge收集器的老年代版本。

**特点**：多线程，采用标记-整理算法。

**应用场景**：注重高吞吐量以及CPU资源敏感的场合，都可以优先考虑Parallel Scavenge+Parallel Old 收集器。

**Parallel Scavenge/Parallel Old收集器工作过程图：**

![07.parallel Old.png|300](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-12-05-07.parallel Old.png)

### CMS收集器

一种以获取最短回收停顿时间为目标的收集器。

**特点**：基于标记-清除算法实现。并发收集、低停顿。

**应用场景**：适用于注重服务的响应速度，希望系统停顿时间最短，给用户带来更好的体验等场景下。如web程序、b/s服务。

**CMS收集器的运行过程分为下列4步：**

**初始标记**：标记GC Roots能直接到的对象。速度很快但是仍存在Stop The World问题。

**并发标记**：进行GC Roots Tracing 的过程，找出存活对象且用户线程可并发执行。

**重新标记**：为了修正并发标记期间因用户程序继续运行而导致标记产生变动的那一部分对象的标记记录。仍然存在Stop The World问题。

**并发清除**：对标记的对象进行清除回收。

 CMS收集器的内存回收过程是与用户线程一起并发执行的。

 CMS收集器的工作过程图：

![07.cms.png|300](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-12-05-07.cms.png)

CMS收集器的缺点：

- 对CPU资源非常敏感。
- 无法处理浮动垃圾，可能出现Concurrent Model Failure失败而导致另一次Full GC的产生。
- 因为采用标记-清除算法所以会存在空间碎片的问题，导致大对象无法分配空间，不得不提前触发一次Full GC。



### G1收集器

G1堆的内存与其他收集器有很大区别，它将整个Java堆划分成多个大小相等的独立区域（Region），虽然还保留着新生代和老年代的概念，但是不再是物理的隔离。它们都是一部分Region的集合。

- 并行与并发：能够充分利用多CPU、多核环境下的硬件优势，使用多个CPU来缩短Stop The World停顿的时间。
- 分代收集：分代概念依旧保留，但是它能够使用不同的方式去处理新创建的对象和已经存活一段时间的对象，以及熬过多次GC的旧对象以获得更好的收集效果。
- 空间整理：整体上看是基于“标记-整理”，局部看是基于“复制”。运行期间不会产生内存空间碎片，收集后可提供规整的可用内存。
- 可预测的停顿：G1除了追求停顿外，还能建立可预测的停顿模型。



## 6. 内存回收和分配策略

对于整个GC流程里，最需要处理的就是年轻代和老年代的内存清理操作，而元空间（永久代）都不在GC范围内.

一般流程：

![04.垃圾回收流程.png|300](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-12-05-04.垃圾回收流程.png)

1：判断Eden区是否有空间
	有空间：则将新对象保存在伊甸园区
	没有：自动执行一次YGC(Minor GC)操作，将伊甸园区无用的内存空间进行清理。
2: 清理后再次判断Eden区是否有空间
	有空间：则将新对象保存在伊甸园区
	没有：则进行Survivor区空间判断
3：根据Survivor区空间判断结果，进行不同处理
	有空间：则将Eden区的部分对象保存到Survivor区，然后在Eden区保存新对象
	没有：则判断老年区
4：对老年区空间进行判断
	有空间：将survivor区的对象保存到老年区，再将Eden区的对象保存到Svuvivor区，在Eden区创建对象
	没有：则进行FullGC,再次进行判断，有空间，执行对象移动。依旧没有空间，则会产生OutOfMemoryError

<span style="color:red">※：大对象（大量需要连续内存的java对象，例如长字符串或长数组），直接进老年代</span>

## 7. java堆内存调整参数

实际上每一块子内存区中都会存在有一部分的可变伸缩区，其基本流程：如果空间不足，在可变的范围之内扩大内存空间，当一段时间之后发现内存空间没有这么紧张的时候，再将可变空间进行释放。

![04.内存调优.png|300](https://raw.githubusercontent.com/ydh1cnn6/pic/master/2025-12-05-04.内存调优.png)

- 堆内存的调整参数

  在整个堆内存的调整策略之中，一般只会调整两个参数：“-Xmx”(最大内存)、“-Xms”（初始化内存）。如果“-Xmx”(最大内存)、“-Xms”（初始化内存）的差距较大，那么伸缩区的范围则较大，系统的性能就可能造成程序性能下降。可以将“-Xmx”(最大内存)、“-Xms”（初始化内存）设置相同，避免伸缩。
  
  -Xms2048M -Xmx2048M

| 序号 | 参数名称               | 描述                                                         |
| ---- | ---------------------- | ------------------------------------------------------------ |
| 1    | -Xms                   | 设置初始分配大小，默认为物理内存的“1/64                      |
| 2    | -Xmx                   | 最大分配内存，默认为物理内存的“1/4”                          |
| 3    | -XX:+PrintGCDetails    | 输出详细的GC处理日志                                         |
| 4    | -XX:+PrintGCTimeStamps | 出GC的时间戳信息                                             |
| 5    | -XX:+PrintGCDateStamps | 输出GC的时间戳信息<br>（以日期的形式,如2018-08-15T16:43:16155+0800） |
| 6    | -XX:+PrintHeapAtGc     | 在GC进行处理的前后打印堆内存信息                             |
| 7    | -Xloggc:保存路径       | 设置日志信息的保存路径                                       |



- 新生代内存调整参数

  Survivor区会分为两个相等大小的Survivor区，所有使用关键字new新实例化的对象，一定会在伊甸园区进行保存。而对于Survivor区保存的一定是在伊甸园区保存好久，并且经过了好几次的小GC还保存下来的活跃对象。那么这个对象将晋升到Survivor区中，Survivor区一定会有两块大小相等的空间。目的是一块Survivor区未来晋升，另外一块Survivor区为了对象回收。这两块内存空间一定有一块是空的。

| 序号 | 参数名称          | 描述                                                         |
| ---- | ----------------- | ------------------------------------------------------------ |
| 1    | -Xmn              | 设置年轻代堆内存大小，默认为物理内存的“1/64                  |
| 2    | -Xss              | 设置每个线程栈大小，JDK1.5之后默认每个线程分配1M的栈大小<br>减少此数值可以产生更多的线程对象，但不能无限生成。 |
| 3    | -XX:SurvivorRatio | 设置Eden与Survivor空间的大小比例，默认为8：1：1，不建议修改  |
| 4    | -XX:NewSize       | 设置新生代内存区大小                                         |
| 5    | -XX:NewRatio      | 设置新生代和老年代的比率                                     |

- 老年代内存调整参数

  老年代主要接收由代发送过来的对象，一般情况下，经过了数次Minor GC 之后还会保存下来的对象才会进入到老年代。如果要保存的对象超过了伊甸园区的大小，此对象也将直接保存在老年代之中，当老年代内存不足时，将引发“Full GC”。

| 序号 | 参数名称                    | 描述                                                 |
| ---- | --------------------------- | ---------------------------------------------------- |
| 1    | -XX:NewRatio                | 设置新生代和老年代的比率                             |
| 2    | -XX:+UseAdaptiveSizePolicy  | 设置是否采用动态控制策略                             |
| 3    | -XX:+PretenureSizeThreshold | 控制直接升入老年代的对象大小，大于则直接分配在老年代 |

- 元空间内存调整参数

  元空间与永久代最大的区别：永久代保存使用的是JVM的堆内存，而元空间使用的是本机物理内存，所以元空间的大小受到本机物理内存大小的限制。

| 序号 | 参数名称                  | 描述                                                         |
| ---- | ------------------------- | ------------------------------------------------------------ |
| 1    | -XX:MetaspaceSize         | 设置元空间的初始大小                                         |
| 2    | -XX:MaxMetaspaceSize      | 设置元空间的最大容量，默认没有限制。（受物理空间限制）       |
| 3    | -XX:MinMetaspaceFreeRatio | 执行GC后，最小的剩余元空间百分比<br>减少为分配空间所导致的垃圾回收 |
| 4    | -XX:MaxMetaspaceFreeRatio | 执行GC后，最大的剩余元空间百分比，<br>减少为释放空间所导致的垃圾回收 |



- 



# 四、对象的引用类型

## 1. 强引用

M m=new M();

这里的u就是强引用，垃圾回收器永远不会回收强引用所指向的对象，虚拟机宁愿抛出OOM(内存溢出)异常，也不会回收强引用所指向的对象，所以可能会导致内存泄漏，过多的内存泄漏会产生内存溢出。

```java
public class M {
	public static void main(String[] args) {
		M m = new M();
        System.gc();//不会被回收==
		m=null;	//解除引用关系
		System.gc();//此时会被回收
	}
	@Override
	protected void finalize() throws Throwable {
		// 不推荐重写
		System.out.println("aaa");
		super.finalize();
	}

}
```



## 2.软引用

+ 特点：当空间足够时，即使发生了gc,也不会回收软引用对象，当内存不够时gc,才回收。
+ 示例

```java
public class N {
	public static void main(String[] args) {
		N n = new N();
		SoftReference<N> sf = new SoftReference<>(n);
		n=null;
		System.gc();
		System.out.println(sf.get()); //不会被回收
		
		try {
			//默认最大堆空间600多M,通过Run as-->Run configurations-->Arguments-->
			//	VM Arguments-->填写参数:-Xms10M -Xmx10M，
			//这里参数1表示最小堆内存，参数2表示最大堆内存。
			SoftReference<byte[]> sfb = new SoftReference<>(new byte[1024*1024*10]);
		} catch(Throwable ex) {
			System.out.println("内存溢出，在溢出前已经发生了gc,回收了软引用对象："+ex.getMessage());
		}
		System.out.println(sf.get());
	}

}
```

+ 应用场景

适合做缓存，用来描述一些有用但并不是必需的对象，比如图片缓存。
假如有一个应用需要读取大量的本地图片，如果每次读取图片都从硬盘读取，则会严重影响性能，但是如果全部加载到内存当中，又有可能造成内存溢出，此时使用软引用可以解决这个问题。如何实现？HashMap中key为图片路径，value为一个弱引用的图片数据

## 3.弱引用 （重点）

+ 特点：gc时就必然回收，不管内存是否够用
+ 示例

```
public class O {
	public static void main(String[] args) {
		O o= new O();
		WeakReference<O> wo = new WeakReference<>(o);
		o=null;
		System.out.println(wo.get());
		System.gc();
		System.out.println(wo.get());//被回收
	}
}
```

+ 应用场景

用来描述非必需对象的，同上，更容易回收掉。

+ ThreadLocal

  + 代码示例

  ```
  public class Test {
  ThreadLocal<User> t1=new ThreadLocal<>();
  ThreadLocal<User> t2=new ThreadLocal<>();
  public static void main(String[] args)throws Exception {
  		Test t=new Test();
  		new Thread(()->{
  			User u1=new User("a1");
  			User u2=new User("a2");
  			t.t1.set(u1);
  			t.t2.set(u2);
  			System.out.println(Thread.currentThread().getName()+",t1的value:"+t.t1.get()+",t2的value:"+t.t2.get());
  		},"线程一").start();
  		new Thread(()->{
  			t.t1.set(new User("a1"));
  			t.t2.set(new User("a2"));
  			System.out.println(Thread.currentThread().getName()+",t1的value:"+t.t1.get()+",t2的value:"+t.t2.get());
  		},"线程二").start();
  		Thread.sleep(500);
  		t.t1=null;//gc时，回收t1指向的local
  	}  
  ```

  + set源码

  ```
  public void set(T value) {
    Thread t = Thread.currentThread();
    //通过当前线程对象获得当前线程唯一的一个Map，map内可添加多个键值对，key是this,就是当前的ThreadLocal对象，value就是设置的值，虽然一个local中只能添加一个值，但一个线程却可以拥有很多个local,每个local都是当前线程的一个key.
    ThreadLocalMap map = getMap(t);
    if (map != null)
    	map.set(this, value);
    else
    	createMap(t, value);
  }
  ```

  + ThreadLocal中的key为弱引用，目的是防止local本身对象的内存泄漏。在map.set方法中

  ```
  tab[i] = new Entry(key, value);-----》这里tab[i]是强引用
  static class Entry extends WeakReference<ThreadLocal<?>> {
    Object value;
    Entry(ThreadLocal<?> k, Object v) {
    super(k);//key,也就是当前local被包装成了弱引用，也就是当发生tl=null时，local不会因为entry中被key强引用而无法被gc回收，当local被回收后，t.t1就是null,所以map中对应的key也是null,当对线程内部的map进行get或set或remove操作时，会自动清除map中key为null的entry.
    value = v;
  }
  }
  ```

  + 关系图
  ![JVM-ThreadLocal之弱引用](picture\JVM-ThreadLocal之弱引用.png)

  
  
  + local仍然会内存泄漏:value会泄漏
  
  向local中添加了数据u后，如果把u=null,依然无法回收u对象，导致内存泄漏，使用remove后才可回收


## 4. 虚引用

用PhantomReference来实现，也被称为幽灵引用或幻影引用，是最弱的引用，不能通过这个引用访问对象，可以用来确保对象执行finalize()后，来实现某些机制，比如垃圾回收的跟踪。垃圾回收时会被回收掉。

用来管理直接内存的。

+ 特点
  + 对象是否有虚引用存在，不会对其生存构成影响
  + 他必须和引用队列一起使用，用于跟踪垃圾回收过程
  + 当gc回收一个被虚引用持有的对象后，jvm会立刻（没有重写finallize）或在发生下一次gc时(重写了finallize方法)把虚引用放入队列中，从而gc会进一步回收被该虚引用持有的对象所指向的堆外内存。也就是说，使用虚引用的目的是为了回收堆内对象所引用的堆外对象
  + 为了使对象保持不变，所以get方法返回null

+ 示例

```java
public class P {
	@Override
	protected void finalize() throws Throwable {
		System.out.println("----88-----");
		super.finalize();
	}
	
	static ReferenceQueue<P> rq = new ReferenceQueue<>();
	public static void main(String[] args) {
		 P p = new P();        
		 ReferenceQueue<Object> rq = new ReferenceQueue<>();
		 PhantomReference<P> pr = new PhantomReference<>(p, rq);
		 
		 System.out.println(pr.get());//获取不到
		 p=null;
		 
		 List<byte[]>list=new ArrayList<>();
		 new Thread(()->{
	    	while(true){
	    		try {//不停的申请内存，目的是为了引起垃圾回收
	    			list.add(new byte[1024*1024*4]);
				} catch (Throwable e) {
					break;
				}
	    		System.out.println(pr.get());
	    	}
	    	//P如果重写了finallize,则上面gc时，会先执行P的finallize方法，导致P对象没有被回收。
	    	//只是被标记为finallize状态，等待下次gc后，才会把虚引用pr放入队列中
	    	try {//必须休眠一下，保证Ｐ对象的finallize方法执行完毕，如果没执行完就再次gc，还可能不回收。
				Thread.sleep(100);
			} catch (Exception e) {}
	    	System.gc();
	    }).start();
	    
	    new Thread(()->{
	    	while(true){
	    		if(rq.poll()!=null){
	    			System.out.println("虚引用对象被gc回收了");
	    			break;
	    		}
	    	}
	    }).start();
	}
}
```





