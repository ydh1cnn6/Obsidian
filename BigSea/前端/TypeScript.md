## 基础类型
boolean

number

string

## 数组

```jsx
let list: number[] = [1, 2, 3];
```

元组

```jsx
// Declare a tuple type
let x: [string, number];
// Initialize it
x = ['hello', 10]; // OK
```

枚举

```jsx
enum Color {Red, Green, Blue}
let c: Color = Color.Green;
```

**<font style="color:rgb(36, 36, 36);">Any</font>**

<font style="color:rgb(36, 36, 36);">不清楚类型的变量.允许你在编译时可选择地包含或移除类型检查</font>

**<font style="color:rgb(21, 39, 64);">Void</font>**

<font style="color:rgb(36, 36, 36);">没有任何类型,只能为它赋予</font><font style="color:rgb(191, 65, 74);">undefined</font><font style="color:rgb(36, 36, 36);">和</font><font style="color:rgb(191, 65, 74);">null</font>

<font style="color:rgb(21, 39, 64);">Null 和 Undefined</font>

<br/>color2
<font style="color:rgb(36, 36, 36);">当你指定了</font><font style="color:rgb(191, 65, 74);">--strictNullChecks</font><font style="color:rgb(36, 36, 36);">标记，</font><font style="color:rgb(191, 65, 74);">null</font><font style="color:rgb(36, 36, 36);">和</font><font style="color:rgb(191, 65, 74);">undefined</font><font style="color:rgb(36, 36, 36);">只能赋值给</font><font style="color:rgb(191, 65, 74);">void</font><font style="color:rgb(36, 36, 36);">和它们各自</font>

<br/>

**<font style="color:rgb(21, 39, 64);">Never</font>**

<font style="color:rgb(191, 65, 74);">never</font><font style="color:rgb(36, 36, 36);">类型是那些</font>`<font style="color:rgb(36, 36, 36);">总是会抛出异常</font>`<font style="color:rgb(36, 36, 36);">或</font>`<font style="color:rgb(36, 36, 36);">根本就不会有返回值</font>`<font style="color:rgb(36, 36, 36);">的函数表达式或箭头函数表达式的返回值类型</font>

**<font style="color:rgb(21, 39, 64);">Object</font>**

<font style="color:rgb(36, 36, 36);">非原始类型，也就是除</font><font style="color:rgb(191, 65, 74);">number</font><font style="color:rgb(36, 36, 36);">，</font><font style="color:rgb(191, 65, 74);">string</font><font style="color:rgb(36, 36, 36);">，</font><font style="color:rgb(191, 65, 74);">boolean</font><font style="color:rgb(36, 36, 36);">，</font><font style="color:rgb(191, 65, 74);">symbol</font><font style="color:rgb(36, 36, 36);">，</font><font style="color:rgb(191, 65, 74);">null</font><font style="color:rgb(36, 36, 36);">或</font><font style="color:rgb(191, 65, 74);">undefined</font><font style="color:rgb(36, 36, 36);">之外的类型</font>

**<font style="color:rgb(21, 39, 64);">类型断言</font>**

