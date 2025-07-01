#### 一、函数式接口（Functional Interface）

**定义**：  
函数式接口是 **有且只有一个抽象方法** 的接口（可以有默认方法、静态方法或 Object 类中的方法）。Java 8 中通过 `@FunctionalInterface` 注解显式标识，编译器会强制检查其合法性。

---

##### 1. 常见内置函数式接口

Java 8 在 `java.util.function` 包中提供了以下核心接口：

|                 |                     |                     |     |
| --------------- | ------------------- | ------------------- | --- |
| 接口              | 方法                  | 用途                  |     |
| `Supplier<T>`   | `T get()`           | 无参数，返回一个值（生产者）      |     |
| `Consumer<T>`   | `void accept(T t)`  | 处理一个参数，无返回值（消费者）    |     |
| `Function<T,R>` | `R apply(T t)`      | 接收 T 类型参数，返回 R 类型结果 |     |
| `Predicate<T>`  | `boolean test(T t)` | 接收参数并返回布尔值（条件判断）    |     |
| `Runnable`      | `void run()`        | 无参数，无返回值（线程任务）      |     |

---

##### 2. 自定义函数式接口

``` fold
@FunctionalInterface
interface StringProcessor {
    String process(String input);
    
    // 允许默认方法
    default void log() {
        System.out.println("Processing string");
    }
}
```

---

#### 二、Lambda 表达式

**定义**：  
Lambda 是匿名函数，用于简洁地实现函数式接口的抽象方法。语法如下：  
`(参数列表) -> { 方法体 }`

---

##### 1. 基础语法示例

```
// 无参
Runnable task = () -> System.out.println("Hello!");

// 单参数（可省略括号）
Consumer<String> print = s -> System.out.println(s);

// 多参数
Comparator<Integer> comp = (a, b) -> a.compareTo(b);

// 复杂逻辑（使用代码块）
Function<Integer, Integer> square = x -> {
    int result = x * x;
    return result;
};
```

---

##### 2. Lambda vs 匿名内部类

**传统写法**：

```
new Thread(new Runnable() {
    @Override
    public void run() {
        System.out.println("Old way");
    }
}).start();
```

**Lambda 简化**：

```
new Thread(() -> System.out.println("Lambda way")).start();
```

---

#### 三、方法引用与构造器引用

Lambda 的简写形式，语法为 `类名/对象::方法名`。

##### 1. 四种类型的方法引用

```
// 静态方法
Function<String, Integer> parser = Integer::parseInt;

// 实例方法
List<String> list = Arrays.asList("a", "b", "c");
list.forEach(System.out::println);

// 特定对象的实例方法
String str = "Hello";
Supplier<String> supplier = str::toUpperCase;

// 构造器引用
Supplier<List<String>> listSupplier = ArrayList::new;
```

---

#### 四、实际应用场景

##### 1. 集合操作（Stream API）

```
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
names.stream()
     .filter(name -> name.startsWith("A")) // Predicate
     .map(String::toUpperCase)             // Function
     .forEach(System.out::println);        // Consumer
```

##### 2. 条件过滤（Predicate）

```
Predicate<Integer> isEven = num -> num % 2 == 0;
List<Integer> numbers = Arrays.asList(1, 2, 3, 4);
List<Integer> evens = numbers.stream().filter(isEven).toList();
```

##### 3. 线程初始化

```
new Thread(() -> {
    // 执行耗时操作
    System.out.println("Running in background");
}).start();
```

---

#### 五、变量作用域

Lambda 可访问外层作用域的变量，但要求变量是 `final` 或等效 final（未被修改）。

```
int count = 0; // 等效 final
Runnable counter = () -> {
    System.out.println(count); // ✅ 允许访问
    // count++; ❌ 错误，不能修改
};
```

---

#### 六、注意事项

1. 函数式接口必须有且仅有一个抽象方法。
2. `@FunctionalInterface` 注解非强制，但建议添加以保证接口规范。
3. Lambda 表达式无法独立存在，必须依附于函数式接口。

---

#### 七、完整示例

```
import java.util.function.Function;

public class Demo {
    public static void main(String[] args) {
        // 自定义函数式接口
        StringProcessor processor = s -> s + " processed";
        System.out.println(processor.process("Data")); // 输出: Data processed

        // 使用内置 Function
        Function<String, Integer> lengthGetter = String::length;
        System.out.println(lengthGetter.apply("Hello")); // 输出: 5
    }
}

@FunctionalInterface
interface StringProcessor {
    String process(String input);
}
```

通过结合函数式接口和 Lambda，Java 实现了更简洁的函数式编程能力，极大提升了代码可读性和开发效率。

#### 实战

##### 1、Predicate