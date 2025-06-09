## 项目结构
> node_modules:第三方依赖
>
> public：静态资源
>
> conifg：配置文件
>
> config.ts:<font style="color:rgb(51, 51, 51);">dev、test、线上环境等地址</font>
>
> route.ts:路由配置
>
> src:**存放源码**
>
> layout:布局文件
>
> reduxs:全局状态管理
>
> action
>
> store
>
> reducer
>
> typings:全局ts
>
> utils：存放工具类
>
> api:公共api
>
> fetch：配置接口
>
> <font style="color:rgb(51, 51, 51);">enums： 存放公共枚举</font>
>
> <font style="color:rgb(51, 51, 51);">hooks:  存放公共hooks</font>
>
> <font style="color:rgb(51, 51, 51);">common.ts:  存放公共方法</font>
>
> <font style="color:rgb(51, 51, 51);">random.tsx:  存放其他方法</font>
>
> <font style="color:rgb(51, 51, 51);">components  公共组件</font>
>
> <font style="color:rgb(51, 51, 51);">pages：页面组件</font>
>
> App.css
>
> App.js
>
> index.css
>
> index.js
>
> <font style="color:rgb(51, 51, 51);">gitignore —  git的选择性上传的配置文件</font>
>
> <font style="color:rgb(51, 51, 51);">package.json  —  Webpack配置和项目包管理文件</font>
>
> <font style="color:rgb(51, 51, 51);">README.md  —  项目说明文件</font>
>



**React**<font style="color:rgb(35, 39, 47);">是返回标记的 JavaScript 函数</font>

**React**组件必须以<font style="color:rgb(35, 39, 47);">大写字母开头，而 HTML 标签必须为小写</font>

```java
function MyButton() {
  return (
    <button>
      I'm a button
    </button>
  );
}

export default function MyApp() {
  return (
    <div>
      <h1>Welcome to my app</h1>
      <MyButton />
    </div>
  );
}

```



## 基本语法：
### if、？、&&
都可以起到if的作用，？的话要有分支



### map
```jsx
const products = [
  { title: 'Cabbage', isFruit: false, id: 1 },
  { title: 'Garlic', isFruit: false, id: 2 },
  { title: 'Apple', isFruit: true, id: 3 },
];

export default function ShoppingList() {
  const listItems = products.map(product =>
    <li
      key={product.id}
      style={{
        color: product.isFruit ? 'magenta' : 'darkgreen'
      }}
      >
      {product.title}
    </li>
```



### 响应事件
```jsx
function MyButton() {
  function handleClick() {
    alert('You clicked me!');
  }

  return (
    <button onClick={handleClick}>
      Click me
    </button>
  );
}
```



::::danger
<font style="color:#DF2A3F;">注意:</font>方法名后没有 `()`

:::asd
Asd
:::
::::



### useState
```jsx
function MyButton() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  return (
    <button onClick={handleClick}>
      Clicked {count} times
    </button>
  );
}
```

### 钩子函数
### 组件共享数据
子向父、子向兄弟传值：

1、父组件定义点击事件，填充子组件并给子组件注册点击

2、子组件接收`传递值`和`onclick`，并给子组件绑定`传递值`和`onclick`

```jsx
export default function MyApp() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  return (
    <div>
      <h1>Counters that update together</h1>
      <MyButton count={count} onClick={handleClick} />
      <MyButton count={count} onClick={handleClick} />
    </div>
  );
}
```

```jsx
function MyButton({ count, onClick }) {
  return (
    <button onClick={onClick}>
      Clicked {count} times
    </button>
  );
}
```





### css
<font style="color:rgb(36, 41, 47);background-color:rgb(244, 246, 248);">双大括号 </font><font style="color:rgb(36, 41, 47);">{{}}</font><font style="color:rgb(36, 41, 47);background-color:rgb(244, 246, 248);"> 则通常用于传递样式对象给组件（...是解构赋值）</font>

```jsx
function MyComponent() {
  const style = { backgroundColor: 'red', color: 'white' };

  return (
    <div style={{ ...style, fontSize: '16px' }}>
      <p>Hello, world!</p>
    </div>
  );
}
```







对变量、数组、对象：=赋值、：类型

对对象的属性、



78

159.22.2.1

## 案例
```jsx
const LoadingButton = React.createClass({
  getInitialState() {
    return {
      isLoading: false
    };
  },

  render() {
    let isLoading = this.state.isLoading;
    return (
      <Button
        bsStyle="primary"
        disabled={isLoading}
        onClick={!isLoading ? this.handleClick : null}>
        {isLoading ? 'Loading...' : 'Loading state'}
      </Button>
    );
  },

  handleClick() {
    this.setState({isLoading: true});

    // This probably where you would have an `ajax` call
    setTimeout(() => {
      // Completed of async action, set loading state back
      this.setState({isLoading: false});
    }, 2000);
  }
});

ReactDOM.render(<LoadingButton />, mountNode);
```































