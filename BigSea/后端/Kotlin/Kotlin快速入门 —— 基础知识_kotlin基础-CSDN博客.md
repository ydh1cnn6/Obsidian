---
title: Kotlin快速入门 —— 基础知识_kotlin基础-CSDN博客
---
#### 目录

- - [一、变量和函数](#一、变量和函数)
    - - [1.变量](#1.变量)
        - [2.函数](#2.函数)
    - [二、程序的逻辑控制](#二、程序的逻辑控制)
    - - [1.条件语句](#1.条件语句)
        - [2.循环语句](#2.循环语句)
    - [三、面向对象](#三、面向对象)
    - - [1.类与对象](#1.类与对象)
        - [2.继承与构造函数](#2.继承与构造函数)
        - [3.接口](#3.接口)
        - [4.数据类与单例类](#4.数据类与单例类)
    - [四、Lambda编程](#四、Lambda编程)
    - - [1.集合的遍历与创建](#1.集合的遍历与创建)
        - [2.集合的函数式API](#2.集合的函数式API)
        - [3.Java函数式API的使用](#3.Java函数式API的使用)
    - [五、空指针检查](#五、空指针检查)
    - - [1.可空类型系统](#1.可空类型系统)
        - [2.判空辅助工具](#2.判空辅助工具)
    - [六、Kotlin中的小魔术](#六、Kotlin中的小魔术)
    - - [1.字符串内嵌表达式](#1.字符串内嵌表达式)
        - [2.函数的参数默认值](#2.函数的参数默认值)
- [PS:](#PS:)

---

### 一、变量和函数

#### 1.变量

声明变量只有两种关键字：**val**和**var**

**val**：用来声明一个**不可变**的变量，这种变量在初始赋值之后不能重新赋值，和Java中的[final类](https://so.csdn.net/so/search?q=final%E7%B1%BB&spm=1001.2101.3001.7020)似。

**var**：用来声明一个**可变**的变量，这种变量在赋初始值后可以更改。  
示例：

```
fun main() {
	var a = 10
	a = a + 10
	val b = 20
	b = b + 20 //编译器报错
}
```

**注意：**

1. Kotlin每一行代码结尾不用加分号
2. Kotlin有类型推导机制

显式声明变量类型：

```
val a: Int = 10
val a: String = "Hello"
```

[Kotlin](https://so.csdn.net/so/search?q=Kotlin&spm=1001.2101.3001.7020)数据类型：

|Kotlin对象数据类型|数据类型说明|
|---|---|
|Int|整型|
|Long|长整型|
|Short|短整型|
|Float|单精度浮点型|
|Double|双精度浮点型|
|Boolean|布尔型|
|Char|字符型|
|Byte|字节型|

#### 2.函数

基本语法规则：

```
fun methodName(param1: Int, param2: Int): Int {
	return 0;
}
```

Kotlin使用fun关键字定义函数；紧跟在fun后面的是函数名；函数名后面紧跟一对括号；里面声明函数接收什么参数，参数声明格式是“参数名：参数类型”，无参数则写一对空括号；括号后面的部分是可选的，用于声明函数的返回类型，如果不需要返回数据则这部分可不写；大括号部分就是函数体。

当一个函数中只有一行代码时，Kotlin允许我们不必编写函数体，直接将唯一的一行代码定义在函数的尾部，中间用等号连接。  
例如：

```
//返回两数中最大的数
fun largeNumber(num1: Int, num2: Int): Int = max(num1, num2);
```

由于Kotlin的类型推导机制，max函数的返回值为Int，因此不用声明函数返回值类型。进一步化简如下：

```
fun largeNumber(num1: Int, num2: Int) = max(num1, num2);
```

### 二、程序的逻辑控制

#### 1.条件语句

Kotlin的条件语句主要有两种：**if**和**when**

**if语句：**

示例：

``` kotlin
fun largerNumber(num1: Int, num2: Int): Int {
	var value = 0
	if (num1 > num2) {
		value = num1
	} else {
		value = num2
	}
	return value
}
```

Kotlin的if语句有一个额外的功能：它可以拥有返回值，返回值就是if语句每一个条件中的最后一行代码的返回值。

结合上文类型推导机制的语法糖，示例代码可以继续化简：

```
fun largerNumber(num1: Int, num2: Int) = if (num1 > num2) num1 else num2
```

**when语句：**

when语句允许传入一个任意类型的参数，然后可以在when的结构体中定义一系列的条件，当执行逻辑只有一行代码时，{}可以省略，格式是：

```
匹配值 -> {执行逻辑}
```

示例：

```
fun getScore(name: String) = when (name) {
	"Tom" -> 86
	"Jim" -> 88
	"Jack" -> 95
	else -> 0
}
```

**注意：**

1. when语句也是有返回值的，和if类似
2. when语句一定要加上else分支，否则编译器会报错
3. 如果执行逻辑的返回值类型有不同，则when语句的返回值类型为Any

when语句可以进行类型匹配，示例：

```
fun checkNumber(num: Number) {
	when (num) {
		is Int -> println("Int")
		is Double -> println("Double")
		else -> println("default")
	}
}
```

上诉代码的is关键字，类似Java中的instanceof关键字。

when语句不带参数用法，示例如下：

```
fun getScore(name: String) = when {
	name == "Tom" -> 86
	name == "Jim" -> 77
	name == "jack" -> 95
	else -> 0
}
```

**注意：**

1. Kotlin判断字符串或者对象是否相对可以直接使用==关键字

#### 2.循环语句

**while语句：**

while循环和C、Java它们的循环用法基本相同，示例：

```
var i: Int = 0
while (i < 10) {
	println(i)
	i++
}
```

**for循环:**

Kotlin舍弃的传统的for-i循环，变成了for-in循环。

**区间：** Kotlin有区间的这个概念，示例如下:

两端闭区间（[0,10]）：

```
val range 0..10
```

左闭右开区间（[0,10)）：

```
val range = 0 util 10
```

降序区间（[10,1]）：

```
var range 10 downTo 1
```

有了区间的概念，就可以用for-in循环遍历区间，示例：

```
for (i in 0..10) {
	//输出打印0到10
	println(i)
}
```

**步长：** step关键字，使用示例：

```
for (i in 0..10 step 2) {
	//0 2 4 6 8 10
	println(i)
}
```

### 三、面向对象

#### 1.类与对象

Kotlin也是使用class关键字声明一个类，示例：

```
class Person {
}
```

在类中定义字段和函数：

```
class Person {
	var name = ""
	var age = 0
	
	fun eat() {
		println("eating!!!")
	}
}
```

创建类的对象：

```
val p = Person()
```

Kotlin中实例化一个类的方式和Java基本类似，只是去掉了new关键字。

#### 2.继承与构造函数

在Kotlin中任何一个非抽象类默认都是不可以被继承的，相当于Java中给类声明了final关键字。

想要自定义类可以被继承，需要在类前加上open关键字，示例：

```
open class Person {
	
}
```

加上open关键字后，Person类就允许被继承了。

创建类继承自Person， Kotlin不是用extends，而是变成一个冒号，示例：

```
class Student : Person() {
	var sno = ""
	var grade = 0
}
```

上诉代码中Person类后面要加上括号，这里和Java不一样。这里涉及到主构造函数和次构造函数相关内容。

**主构造函数：**

每一个类都有一个默认的不带参数的主构造函数。主构造函数的特点是没有函数体，直接定义在类名的后面。示例：

```
class Student(val sno: String, val grade: Int) : Person() {
}
```

这里将sno和grade字段放入主构造函数当中，表名在对Student类进行实例化时，要传入构造函数中要求的所有参数，示例：

```
val Student = Student("a123", 5)
```

当需要在主构造函数中编写一些逻辑时，可以利用init结构体，示例：

```
class Student(val sno: String, val grade: Int) : Person() {
	init {
		println(sno)
		println(grade)
	}
}
```

Kotlin中也规定：子类中的构造函数必须调用父类中的构造函数。但是主构造函数并没有函数体，所以Kotlin通过括号来实现。  
上诉代码中，Person类后面的一对空括号表示Student类的主构造函数在初始化的时候会调用Person类的无参构造函数。

我们把Person类的字段放入主构造函数中，示例：

```
open class Person(val name: String, val age: Int) {
}
```

这时Student类也需要修改：

```
class Student(val sno: String, val grade: Int, name: String, age: Int) {
}
```

**注意:**

1. 在Student类的主构造函数中增加name和age这两个字段时，不能将它们声明成val，因为在主构造函数中声明成val或者var的参数将自动成为该类的字段，这会导致和父类中同名的name和age字段造成冲突。

**次构造函数：**

Kotlin中，任何一个类只能有一个主构造函数，但是可以有多个构造函数。次构造函数是有函数体的。  
当一个类既有主构造函数又有次构造函数时，所有的次构造函数都必须调用主构造函数（包括间接调用）。

示例：

```
class Student(val sno: String, val grade: Int, name: String, age: Int) :  Person(name, age) {
	constructor(name: String, age: Int) : this ("", 0, name, age) {
	}
	constructor() : this("", 0) {
	}
}
```

次构造函数是通过constructor关键字来定义的，上诉例子定义了两个次构造函数：第一个次构造函数接收name和age参数，然后通过this关键字调用了主构造函数，并将sno和grade这两个参数赋值成初始值；第二个次构造函数不接收任何参数，通过调用this关键字调用了第一个次构造函数，并将name和age参数也赋值成初始值，这里的第二个构造函数就是属于间接调用主构造函数，因此这是合法的。

因此我们有三种方式来创建Student对象，示例：

```
val student1 = Student()
val student2 = Student("Jack", 19)
val student3 = Student("a123", 5, "Jacl", 19)
```

有一种特殊情况：类中只有次构造函数没有主构造函数。  
当一个类没有显式定义主构造函数并且定义了次构造函数时，它就是没有主构造函数的。示例：

```
class Student : Person {
	constructor(name: String, age: Int) : super(name, age) {
	}
}
```

上诉代码中Student的类后面没有显式定义主构造函数，同时又定义了次构造函数，所有Student类是没有主构造函数的，所以继承Person类的时候也就不需要加上括号。  
没有主构造函数，次构造函数只能直接调用父类的构造函数，把this关键字换成super关键字即可。

#### 3.接口

Kotlin中的接口部分和Java几乎是一样的。任何一个类最多只能继承一个父类，可以实现任意多个接口。

定义一个接口：

```
interface Study {
	fun readBooks()
	fun doHomework()
}
```

实现接口：

```
class Student(name: String, age: Int) : Person(name, age), Study {
	override fun readBooks() {
		println("reading!")
	}

	override fun doHomework() {
		println("doHomework!")
	}
}
```

Kotlin中继承和实现使用的关键字都是冒号，中间用逗号进行分隔。使用override关键字来重写父类或者实现接口中的函数。

Kotlin还增加了一个额外的功能（Java1.8之后也支持此功能了）：允许对接口中定义的函数进行默认实现。实现该接口的类可以选择实现或者不实现此方法，不实现时就会自动使用默认的实现逻辑。

**函数的可见性修饰符：**  
Kotlin中有四种函数可见性修饰符：public、private、protected、internal。对照表如下

|修饰符|可见性|
|---|---|
|public|所有类可见（默认）|
|private|当前类可见|
|protected|当前类，子类可见|
|internal|同一模块中的类可见|

#### 4.数据类与单例类

**数据类：**

当一个类前面声明了data关键字时，表明这个类是一个数据类，Kotlin会根据主构造函数中的参数自动生成equals()、hashCode()、toString()等方法。示例：

```
data class Cellphone(val brand: String, val price: Double)
```

**注意：**

1. 当一个类中没有任何代码时，可以将尾部的括号省略。

**单例类：**

在Kotlin中创建一个单例类的方式很简单，只需要将class关键字改成object关键字即可。示例：

```
object Singleton {
	fun singletonTest() {
	}
}
```

在Kotlin中不需要私有化构造函数，也不需要提供getInstance()这样的静态方法。Kotlin在背后自动创建了一个Singleton类的实例，并保证全局只会存在一个Singleton实例。调用单例类的函数，类似于Java中静态方法的调用，示例：

```
Singleton.singletonTest()
```

### 四、Lambda编程

#### 1.集合的遍历与创建

Kotlin专门提供了一个内置的listOf()函数来简化初始化List集合的写法，示例：

```
val list = listOf("Apple", "Banana", "Orange", "Pear", "Grape")
```

for-in循环遍历集合，示例：

```
for (fruit in list) {
	println(fruit)
}
```

**注意：**

1. listOf()函数创建的是一个不可变的集合。不可变集合指的是该集合只能读取，无法进行添加、修改或删除操作。

使用mutableListOf()函数创建一个可变的集合，示例：

```
val list = mutableListOf("Apple", "Banana", "Orange", "Pear", "Grape")
list.add("Watermelon")
```

Set集合创建和遍历方式和List集合的类似，只是将创建集合的方式换成了setOf()和mutableSetOf()函数而已。

**注意：**

1. Set集合底层是使用hash映射机制来存放数据的，因此集合中的元素无法保证有序。

Map是一种键值对形式的数据结构，在用法上和上诉集合有较大的不同。相比于Java，Kotlin中不建议使用put()和get()方法来对Map进行添加和读取操作，而推荐使用一种类似于数字下标的语法结构，示例：

```
val map = HashMap<String, Int>()
//添加数据
map["Apple"] = 1
//读取数据
val number = map["apple"]
```

Kotlin也提供了一对mapOf()和mutableMapOf()函数来简化Map的用法。在mapOf()函数中，直接传入初始化的键值对组合来完成对Map集合的创建，示例：

```
val map = mapOf("Apple" to 1, "Banana" to 2, "Orange" to 3)
```

**注意：**

1. 上诉代码中的to不是关键字，而是一个infix函数

for-in循环遍历Map，示例：

```
for ((fruit, number) in map) {
	println(fruit + number)
}
```

#### 2.集合的函数式API

**Lambda的定义：** Lambda就是一小段可以作为参数传递的代码。

Lambda表达式的语法结构：

```
{参数名1: 参数类型, 参数名2: 参数类型 -> 函数体}
```

上诉代码中最外层是一对大括号，如果有参数传入到Lambda表达式中，则需要声明参数列表，参数列表结尾用一个->符号，表示参数列表的结束以及函数体的开始，函数体中可以编写任意行代码，**最后一行会自动作为Lambda表达式的返回值**。

比如我们需要找到list中长度最长的那个单词，初始代码示例如下：

```
val list = listOf("Apple", "Banana", "Orange", "Pear", "Grape")
val lambda = {fruit: String -> fruit.length}
val maxLengthFruit = list.maxBy(lambda)
```

第一步化简，直接将lambda表达式传入maxBy函数中：

```
val maxLengthFruit = list.maxBy({fruit: String -> fruit.length})
```

Kotlin规定，当Lambda参数是函数的最后一个参数时，可以将Lambda表达式移到函数括号外面，示例：

```
val maxLengthFruit = list.maxBy() {fruit: String -> fruit.length}
```

如果Lambda参数是函数的唯一一个参数，则可以把函数的括号省略，示例：

```
val maxLengthFruit = list.maxBy {fruit: String -> fruit.length}
```

由于Kotlin的类型推导机制，Lambda表达式中的参数列表在大多数情况下不必声明参数类型，示例：

```
val maxLengthFruit = list.maxBy {fruit -> fruit.length}
```

当Lambda表达式的参数列表只有一个参数时，也不必声明参数名，可以使用it关键字代替，示例：

```
val maxLengthFruit = list.maxBy {it.length}
```

**map函数：**

集合中map函数是最常用的一种函数式API，它用于将集合中的每一个元素都映射成另外的值，映射规则在Lambda表达式中指定，最终生成一个新的集合。

示例：

```
val list = listOf("Apple", "Banana", "Orange", "Pear", "Grape")
//将单词转换成大写
val newList = list.map {it.toUpperCase()}
```

**filter函数：**

用来过滤集合中的数据。可以单独使用，也可以配合map函数使用，示例：

```
val list = listOf("Apple", "Banana", "Orange", "Pear", "Grape")
//保留五个字母以内的单词，并转换成大写
val newList = list.filter {it.length <= 5}.map {it.toUpperCase()}
```

**any和all函数：**

any函数用于判断集合中是否存在一个元素满足指定条件，all函数用于判断集合中是否所有元素都满足指定条件。示例：

```
val list = listOf("Apple", "Banana", "Orange", "Pear", "Grape")
val anyResult = list.any {it.length <= 5} //true
val allResult = list.all {it.length <= 5} //false
```

#### 3.Java函数式API的使用

如果我们在Kotlin代码中调用了一个Java方法，并且该方法接收一个Java单抽象方法接口参数，就可以使用函数式API。Java单抽象方法接口指的是接口中只有一个待实现的方法。

Java中有一个最为常用的单抽象方法接口——Runnable接口。Java代码创建并执行一个子线程的代码如下：

```
new Thread(new Runnable() {
	@Override
	public void run() {
		System.out.println("running!!")
	}
}).start();
```

使用Kotlin，最简写法如下：

```
Thread {
	println("running!!")
}.start()
```

### 五、空指针检查

#### 1.可空类型系统

Kotlin将空指针异常的检查提前到了编译时期，如果程序存在空指针异常的风险，那么在编译的时候会自动报错，修正之后才能运行。

Kotlin默认所有参数和变量都不可为空，比如下诉代码是没有空指针风险的：

```
fun doStudy(study: Study) {
	study.readBooks()
	study.doHomework()
}
```

**可空类型系统：**

在类名的后面加上一个问号。比如，Int表示不可为空的整型，而Int?就表示可为空的整型。

在doStudy函数中，如果我们希望传入的参数可以为空，那么就要将Study改成Study?。由于我们将参数改成了可空的Study?类型，那么调用函数的时候都可能造成空指针异常，这种情况Kotlin不允许编译通过。

#### 2.判空辅助工具

**?.操作符：**

当对象不为空的时候正常调用相应的方法，对象为空时什么都不做。比如：

```
if (a != null) {
	a.doSomething()
}
```

改用?.操作符：

```
a?.doSomething()
```

使用?.操作符对doStudy()函数进行优化，示例：

```
fun doStudy(study: Study?) {
	study?.readBooks()
	study?.doHomework()
}
```

**?:操作符：**

这个操作符的左右两边都接收一个表达式，如果左边表达式的结果不为空就返回左边表达式的结果，否则返回右边表达式的结果。比如：

```
val c = if (a != null) {
	a
} else {
	b
}
```

改用?:操作符：

```
val c = a ?: b
```

**非空断言工具：**

写法是在对象的后面加上!!，示例：

```
val a = content!!.toUpperCase()
```

**let函数：**

这个函数提供了函数式API的编程接口，可以使用Lambda表达式，示例：

```
obj.let { obj2 ->
	//逻辑代码
}
```

这里调用了obj对象的let函数，然后Lambda表达式中的代码就会立即执行，并且这个obj对象本身会作为参数传递到Lambda表达式中（obj和obj2其实式同一个对象）。

在doStudy方法中，就可以结合?.操作符和let函数来对代码进行优化，示例：

```
fun doStudy(study: Study?) {
	study?.let {
		it.readBooks()
		it.doHomework()
	}
}
```

上诉代码中，?.操作符表示对象为空时什么都不做，对象不为空就调用let函数，然后将study对象本身作为参数传毒到Lambda表达式中，此时study对象肯定不为空，就可以调用它的任意方法了。

### 六、Kotlin中的小魔术

#### 1.字符串内嵌表达式

Kotlin允许在字符串中嵌入${}这种语法结构的表达式，并在运行的时候使用表达式执行的结果代替这一部分的内容。示例：

```
"hello, ${obj.name}. nice to meet you"
```

当表达式中仅有一个变量的时候，可以将两边的大括号省略。示例：

```
"hello, $name. nice to meet you"
```

#### 2.函数的参数默认值

我们可以在定义函数的时候给任意参数设定一个默认值，这样当调用此函数时就不会强制要求调用方为此参数传值，在没有传值的情况下会自动使用参数的默认值。示例：

```
fun printParams(num: Int, str: String = "Hello") {
	println("num is $num, str is $str")
}
```

当调用printParams()函数时，可以选择给第二个参数传值，也可以不传，不传的情况下会使用默认值。示例：

```
printParams(123)
```

如果我们给第一个参数设定一个默认值：

```
fun printParams(num: Int = 100, str: String) {
	println("num is $num, str is $str")
}
```

下面的调用将会报类型不匹配的错误：

```
printParams("Hello")
```

这是因为编译器会认为我们想把字符串赋值给第一个num参数，而报类型不匹配的错误。

Kotlin提供了另外一种机制，就是可以**通过键值对的方式来传参**。示例：

```
printParams(str = "Hello")
```

给函数设定参数默认值这个功能，可以在很大程度上替代次构造函数的作用，回到上面写的代码：

```
class Student(val sno: String, val grade: Int, name: String, age: Int) :  Person(name, age) {
	constructor(name: String, age: Int) : this ("", 0, name, age) {
	}
	constructor() : this(this, 0) {
	}
}
```

上诉代码中有一个主构造函数和两个次构造函数，次构造函数在这样的作用是提供了使用更少参数来对Student类进行实例化的方式。无参的次构造函数会调用两个参数的次构造函数，并将这两个参数赋值成初始值。两个参数的次构造函数会调用4个参数的主构造函数，并将缺失的两个参数也赋值成初始值。

这种功能其实可以通过只写一个主构造函数，然后给参数设定默认值的方式来实现，示例：

```
class Student(val sno: String = "", val grade: Int = 0, name: String = "", age: Int = 0) : Person(name, age) {
}
```

## PS:

本文整理自《第一行代码 Android》第三版，笔记文章，希望对大家有所帮助！