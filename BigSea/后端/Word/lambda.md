1、Consumer

```java
List list = Arrays.asList("1","2");
Consumer consumer = e -> System.out.println(e);
consumer.accept("hello");
consumer.accept(list);
list.forEach(consumer);
```

![](https://cdn.nlark.com/yuque/0/2025/png/39031477/1737429054585-7b0353de-5ec5-407a-8f43-3312d5291ad6.png)



补充：andThen

```plain
List list = Arrays.asList("1","2");
Consumer consumer = e -> System.out.println(e);
consumer.accept("hello");
consumer.accept(list);
list.forEach(consumer);

Consumer andThen = consumer.andThen(e -> System.out.println("测试" + e));
andThen.accept("hello");
```

![](https://cdn.nlark.com/yuque/0/2025/png/39031477/1737429132898-ddd80b89-58b3-4c7e-94bf-9cf4d31e688d.png)

