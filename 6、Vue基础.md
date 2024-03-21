---
typora-root-url: images
---

# Vue概述

## Vue是什么

Vue (读音 /vjuː/，类似于 **view**) 是一套用于构建用户界面的**渐进式框架**。与其它大型框架不同的是，Vue 被设计为可以自底向上逐层应用。Vue 的核心库只关注视图层，不仅易于上手，还便于与第三方库或既有项目整合。另一方面，当与[现代化的工具链](https://vuejs.zcopy.site/v2/guide/single-file-components.html)以及各种[支持类库](https://github.com/vuejs/awesome-vue#libraries--plugins)结合使用时，Vue 也完全能够为复杂的单页应用提供驱动。

## MVVM

Model-View-ViewModel的简写，本质上是MVC的改进版。将View的状态和行为抽象化，让我们将视图UI和业务逻辑分开。主要的目的和MVC一样，分离视图和模型。

提供双向绑定的js库，核心是MVVM中VM部分，VM部分负责连接View和Model，保证视图和数据的一致性。

好处：前端开发高效，便捷。

核心思想：数据驱动视图

## 插值表达式

数据绑定的最常用的形式就是插值表达式，是一个单向绑定。 

语法：{{表达式}}

支持加减乘除运算

支持逻辑运算符

支持三目运算符

```
<body>
    <div id="app">{{message}}
            <br>{{count + 100}}
            <br>
            {{count>100}}    
            <br>
            {{count>100?'ok':'NO'}}
    </div>    

    <script>
        new  Vue({
            el: "#app",
            data: {
                message: 'hello',
                count: 100
            }
        })
    </script>
    
</body>
```



# 指令

在vue当中提供一系列的指令用于对数据的操作。都i是以v-xxx形式出现，特殊情况下有简写。

指令当中封装一些DOM的行为，根据不同的值，框架会对DOM进行相关的操作

## v-text 

v-text会覆盖原来dom元素中的值。只会替换原来的值，不会清空这个DOM元素。类似js原生操作中的innerText。

当值当中存在html元素的时候，不会进行解析和渲染，按照文本的形式输出

```
<body>
    <div id="app">{{message}}
           <h3 v-text="info">happy</h3>
    </div>    

    <script>
        new  Vue({
            el: "#app",
            data: {
                message: 'hello',
                count: 100,
                info:'java180<i>中华</i>'
            }
        })
    </script>
    
</body>
```



## v-html

会覆盖原来dom元素中的值。只会替换原来的值，不会清空这个DOM元素。类似js原生操作中的innerHtml。

当值当中存在html元素的时候，会进行解析和渲染.

```
<body>
    <div id="app">{{message}}
           <h3 v-html="info">happy</h3>
    </div>    

    <script>
        new  Vue({
            el: "#app",
            data: {
                message: 'hello',
                count: 100,
                info:'java180<i>中华</i>'
            }
        })
    </script>
    
</body>
```



## v-bind

v-bind指定：用于绑定组件的属性

1：单向绑定，从Model到View的单向绑定。

2：语法v-bind:属性名，可以进行简写  成  :属性名

3：v-bind会将它的值当成js的合法表达式。

```
<body>
    <div id="app">{{message}}
           <h3 v-bind:title="info">happy</h3>
    </div>    

    <script>
        new  Vue({
            el: "#app",
            data: {
                message: 'hello',
                count: 100,
                info:'java180都是小能手'
            }
        })
    </script>
    
</body>
```



## v-model

运用在表单元素当中，实现数据的双向绑定。

v-mode会忽略掉表单原生的value，checked，selected等属性，使用实例的值当作初始值。

```
<body>
    <div id="app">{{info}}
        <br>
         <input type="text" v-model="info">
    </div>    

    <script>
        new  Vue({
            el: "#app",
            data: {
                info:'java180都是小能手'
            }
        })
    </script>
    
</body>
```



## v-on

vue是可以监听DOM事件，触发js的代码

1：绑定事件监听器，事件的类型由参数指定   v-on:事件类型="表达式"

2：表达式可以是一个方法名，也可以是一个内联语句（不推荐使用），如果没有修饰符，可以简写成@事件类型="表达式"

3：触发的事件监听器回调在vue对象的methods中定义

### 基本使用

```html
<body>
    <div id="app">{{info}}
        <br>
         <input type="text" v-model="info">
         <br>
         {{sum}}
        <input type="number" v-model="step">
        <button v-on:click="add">增加</button>
    </div>    

    <script>
        new  Vue({
            el: "#app",
            data: {
                info:'java180都是小能手',
                sum:0,
                step: 3
            },
            methods: {
                add(){
                   this.sum = this.sum + this.step; 
                }
            }
        })
    </script>
    
</body>
```



### 按键修饰符

在监听键盘事件的时候，可以添加事件修饰符

.enter     .tab     .esc    space,left ,right,down....

v-on:事件类型.修饰符

```html
<body>
    <div id="app">
        <!-- <input type="text" v-model="info" @keydown="check($event)"> -->
        <input type="text" v-model="info" @keydown.enter="check()">
        <span style="color: red;">{{errMsg}}</span>
    </div>    

    <script>
        new  Vue({
            el: "#app",
            data: {
                errMsg:'',
                info:''
            },
            methods: {
                // check(event){
                //    if (event.keyCode==13){
                //      if (this.info.length<1 || this.info.length>10) {
                //         this.errMsg = '请输入1到10个字符的字符串'
                //      } else {
                //         this.errMsg=''
                //      }
                //    }
                // }
                check(){
                    if (this.info.length<1 || this.info.length>10) {
                        this.errMsg = '请输入1到10个字符的字符串'
                     } else {
                        this.errMsg=''
                     }
                }
            }
        })
    </script>
    
</body>
```



### 事件修饰符

vue当中的事件绑定，除了按键修饰符之外，还提供一些事件修饰符号。

stop：停止冒泡，调用event.stopPropagation（）

prevent: 停止默认事件，event.preventDefault ()

capture:调用事件回调函数时，采用捕获的事件流方向。

self：当事件从监听器绑定的元素本身触发的时候，才会回调（事件委托有关）

once: 事件只触发一次

```html
<body>
    <div id="app">
        <a href="http://www.baidu.com" target="_blank" v-on:click.prevent="clickA" rel="noopener noreferrer">a连接</a>
    </div>    

    <script>
        new  Vue({
            el: "#app",
            data: {
                errMsg:'',
                info:''
            },
            methods: {
                clickA(){
                    //event.preventDefault()  不会终止页面跳转，而是将当前页面保存到页面根目录中。 这
                    alert("点击a连接")
                }
            }
        })
    </script>
    
</body>
```



## v-for

循环指令，item in items

可以迭代数组，item 是数据源当中每个元素的别名

迭代对象，迭代的是属性，item可以是（value，key，index）格式，只写一个默认是value

迭代整数：相当于1~n之间的整数迭代

迭代字符串：item为字符串当中的每个字符，会去掉开头和结尾的空格符

```html
<body>
    <div id="app">
        <div>
            <input type="text" v-model="editForm.id">
            <input type="text" v-model="editForm.name">
            <input type="text" v-model="editForm.city">
            <input type="text" v-model="editForm.state">
            <input type="text" v-model="editForm.zip">
            <button @click="add">add</button>
            <button @click="deleteSelect">add</button>
        </div>
        <table>
            <tr v-for="user in users">
                <td>{{user.id}}</td>
                <td>{{user.name}}</td>
                <td>{{user.city}}</td>
                <td>{{user.state}}</td>
                <td>{{user.zip}}</td>
            </tr>
        </table>
    </div>    

    <script>
        new  Vue({
            el: "#app",
            data: {
                editForm:{
                    id: '',
                    name:'',
                    city:'',
                    state:'',
                    zip: ''
                },
                users:[{
                    id:1, name: "Tyler Bennett", city: "New York", state: "NY", zip: "10001"
                },{
                    id:2, name: "John Rappl", city: "Boston", state: "MA", zip: "02107"

                },
                {
                    id:3, name: "Tyler max", city: "Chinese", state: "JS", zip: "210000"
                }
                ]
            },
            methods: {
                add(){
                    let user= this.editForm;
                    this.users.push(user);
                }
            }
        })
    </script>
    
</body>
```



## v-show和v-if

v-if 

v-if    v-else

v-if   v-else-if   v-else

v-if: 来回销毁和创建DOM对象，性能上会受到影响。

v-show：不会销毁和创建DOM对象，使用display：none来隐藏元素，性能上有所提升。

```html
<body>
    <div id="app">
       <!-- <div v-if="grade=='A'">一等奖学金</div>
       <div id="test" v-else-if="grade=='B'">二等奖学金</div>
       <div v-else>没有等奖学金</div> -->
       <div v-show="grade=='A'">一等奖学金</div>
       <div v-show="grade=='B'">二等奖学金</div>
       <div v-show="grade !='A' && grade !='B'">没有奖学金</div>
       <button @click="change">修改</button>
    </div>    

    <script>
        new  Vue({
            el: "#app",
            data: {
                grade:'A'
            },methods: {
                change(){
                    this.grade = this.grade=='A'?'B':'A';
                }
            }
        })
    </script>
    
</body>
```



## 样式处理

使用v-bind：style和v-bind：class进行处理

```html
<body>
    <div id="app">
      <div>
        样式处理
      </div>
      <h3 :style='h3Style'>内联样式</h3>
      <div :class="borderStyle">测试样式</div>
    </div>    

    <script>
        new  Vue({
            el: "#app",
            data: {
                h3Style: 'color: red;',
                borderStyle: 'border1'
            },
        })
    </script>
    
</body>
```



## 过滤器

vue的过滤器主要用于文本的格式化以及转换。不改变原有数据的值，只是改变显示形式。

主要使用在插值表达式和v-bind属性绑定上

放在js表达式的尾部，由管道符（|）来表示

私有过滤器和公有过滤器

### 私有过滤器

在vue对象中，filters属性中添加一个方法。

过滤器必须带有一个参数，此参数就是从管道命令中接收过来的数据，也添加多个参数

可以创建多个过滤器，也可以同时使用多个过滤器

不带参数的过滤器，可以用方法名放在管道符的后面，如果带有参数，则类似于方法调用

过滤器必须带有返回值

```html
<body>
    <div id="app">
        <div>
            原来的值:{{message}}
        </div>
        <div>过滤后的值:{{message | toUpper | concatFilter('java180')}}</div>
    </div>    

    <script>
        new  Vue({
            el: "#app",
            data: {
               message:'abcHabcAA11'
            },
            filters: {
                toUpper(value) {
                    return value.toUpperCase();
                },
                concatFilter(value,suffix) {
                    return value + suffix
                }
            },
            
        })
    </script>
    
</body>
```



### 公有过滤器

使用Vue.filter(过滤器名，回调函数). 注意：一定要在vue对象实例化之前调用



## 计算属性

计算属性是基于响应式缓存。当数据发生变化的时候，会重新计算值。



## 监听器

使用watch属性可以监听vue对象中数据的变化。

监听简单数据类型，只要顶一个function，可以获取原来的值和更新后的值

监听复杂数据类型，需要深度监听，使用deep属性和handler方法来进行处理。不能获取更新前的数据



## 声明周期钩子函数

主要是四个阶段： create，mount，update，destroy

beforeCreate：组件创建之前，无法通过vm来访问数据，调用方法。

created：组件创建之后，可以通过vm访问data数据，也可以调用method相关的方法，但是$el还未创建

beforeMount：挂载数据到实际DOM之前，页面是未经过Vue编译的DOM结构，所有的DOM操作不能起作用

mounted: 挂载数据到DOM之后， $el的对象被替换

```html
<body>
    <div id="app">
           <span>{{message}}</span> 
           <button @click="change">修改message</button>
    </div>    

    <script>
        
        // let person= {name:'zhangsan'}
        // Vue.prototype.newobject=person;
       
       let vm= new  Vue({
            el: "#app",
            data: {
               message:'java180',
            },
            methods: {
                change(){
                    this.message = this.message + "11";
                }
            },
            // beforeCreate () {
            //     console.log(this.message);
            //     console.log(document.getElementById("app"));
            // },
            // created(){
            //     console.log("=============created===============");
            //     console.log("message",this.message);
            //     console.log("$el",this.$el)
            //     console.log(document.getElementById("app").innerHTML);
            // },
            // beforeMount(){
            //     console.log("=============beforeMount===============");
            //     console.log("message",this.message);
            //     console.log("$el",this.$el)
            //     console.log(document.getElementById("app").innerHTML);
            // },
            // mounted(){

            //     console.log("=============mounted===============");
            //     console.log("message",this.message);
            //     console.log("$el",this.$el)
            //     console.log(document.getElementById("app").innerHTML);

            //     // console.log(this.newobject);
            // }

            beforeUpdate () {
                console.log("message",this.message);
                console.log(document.getElementById("app").innerHTML);
            },
            updated () {
                console.log("message",this.message);
                console.log(document.getElementById("app").innerHTML);
            },
            beforeDestroy () {
                console.log("beforeDestory");
            },
            destroyed () {
                console.log("destroyed");
            }
           
        })
        vm.$destroy();

       
    </script>
    
</body>
```



# 组件编程基础

组件：实现应用中局部代码（html，css，js)以及部分资源（mp3,icon,mp4）的集合

组件化和模块化的区别：

模块化：原来大的js文件，处理的功能比较，文件的可读性以及可维护性降低，为了简化js以及复用js，将完成类似功能的特定的js代码分拆到多个小文件当中，并向外提供访问的接口对象。

模块化：用户界面比较复杂，为了简化代码，提升UI相关代码的重复利用率，抽取用户界面中的局部代码，放入相关的文件中。

分类：非单文件组件（语法），单文件组件（实际开发用）

## 非单文件组件

### 定义组件

使用vue.extend（{template:}）

```java
let comp= Vue.extend({
            template:'#temp',
            data(){
               return {
                level:'起飞'
               } 
            }
        })
```



### 注册组件

注册私有组件，在vue对象的components属性中注册

注册公有组件：使用Vue.component("组件名"，组件对象)来进行注册

```java
       Vue.component("my-comp",comp)
        Vue.component("ourComp",comp)
       let vm= new  Vue({
            el: "#app",
            data: {
               message:'java180',
            },
            components: {
                comp
            }   
           
        })
```



### 组件定义的事项

1：无论哪种方式创建组件，template当中必须有且仅有一个根元素

2：组件的名称

​	支持Kebab-case风格，多个单词之间用短横线（中横线）连接<my-comp></my-comp>

​	支持驼峰CamelCase命名，使用的时候依旧要使用中横线

```java
<my-comp></my-comp>
 <our-comp></our-comp>
 
Vue.component("my-comp",comp)
Vue.component("ourComp",comp)
```



### data定义

需要使用函数方式来定义

```java
let comp= Vue.extend({
    template:'#temp',
    data(){
        return {
        	level:'起飞'
        } 
    }
})
```



## 组件的切换

### v-if和v-show来切换组件

### :is切换组件

```html
<body>
    <div id="app">
      <monday v-show="week==1"></monday>
      <thuesday v-show="week==2"></thuesday>
      <button @click="changeWeek">change</button>
      <hr>
      <component :is="compName"></component>

    </div> 
    <template id="temp1">
        <div>
            <h3>星期一</h3>
        </div>
    </template>   
    <template id="temp2">
        <div>
            <h3>星期二</h3>
        </div>
    </template>   


    <script>

        let monday= Vue.extend({
            template:'#temp1',

        })
         let thuesday=Vue.extend({
            template:'#temp2'
         })
       let vm= new  Vue({
            el: "#app",
            data: {
               message:'java180',
               week:1,
               compName:'monday'
            },
            
            components: {
                monday,thuesday
            },
            methods: {
                changeWeek(){
                    this.week = this.week==1?2:1
                    this.compName = this.compName=='monday'? 'thuesday':'monday'

                }
            }
           
           
        })


       
    </script>
    
</body>
```



# Vue脚手架

## 安装nodejs

官网地址：https://nodejs.org/en

## 安装Vue脚手架

### 设置源

```shell
npm config set registry https://registry.npm.taobao.org
```

### 安装脚手架

```shell
npm install -d:g @vue/cli
```

## 创建项目

### 创建项目所在文件夹

### 用命令行进入此文件夹

```shell
#先切换盘符
d:
#再输入目录
D:\ftp180\04.code\06.front
```



### 运行创建项目命令

选择vue2的版本

```shell
#vue-cli是项目名
vue create vue-cli
```

进入项目文件夹

```shell
cd  vue-cli
```

运行项目

```shell
npm run serve
```



### 禁用ESLINT检查

vue.config.js文件



# 组件的使用

## ref属性

```html
<template>
    <div>
        <h3  ref="user">用户</h3>
        <h3  ref="myinfo">{{ info }}</h3>
        <button @click="showInfo">显示信息</button>
    </div>
</template>
<script>
//vc  Vue Component
export default {
    name:'School',
    data(){
        return {
            info:'好好学习，天天向下'
        }
    },
    
    methods:{
        showInfo(){
            console.log(this.$refs.myinfo);
            // this.address = "测试修改"
        }
    }
}
</script>

```



## props属性：设置组件的属性

props是只读的，vue底层会检测程序员对props的修改，如果你该了props的值，会在控制台发出警告信息。

如果根据业务确实需要修改的信息，请定义在data当中



### 子组件

```html
<template>
    <div>
        <h3>{{ address }}</h3>
        <h3>{{ count }}</h3>
    </div>
</template>
<script>
//vc  Vue Component
export default {
    name:'School',
    //常用简写
    // props:['address','count'],
    //可以指定数据类型
    // props:{
    //     address: String,
    //     count: Number,

    // },
    props:{
        address:{
            type: String,
            required: true,
            default: '默认值'
        },
        count:{
            type:Number,
            default: 10
        }

    },

}

```

### 父组件使用组件时，传入属性

```html
<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <!-- <school address="卡子门校区" count ='50'></school> -->
    <school  address="卡子门校区"></school>
    <hr>
    <h3>app当中的内容</h3>
  </div>
</template>

<script>
import School from './components/School.vue'
export default {
  name: 'App',
  components: {
    School
  }
}
</script>
```



## style样式

scoped 属性表示当前设置的css相关样式，只针对school组件
	一般情况下，只有app.vue（入口组件）在定义样式时不使用scoped，其他都会使用scoped属性

```
<!-- scoped 属性表示当前设置的css相关样式，只针对school组件
一般情况下，只有app。vue（入口组件）在定义样式时不使用scoped，其他都会使用scoped属性
-->
<style scoped>
    h3 {
        color:red;
    }
</style>
```



## 组件之间的传值。。。。待加

### 父向子传值

#### props属性进行传值

#### 使用provide和inject

父组件当中使用provide方法传递值

子组件当中，使用inject来接收

### 子向父传值

#### 使用props属性

#### 自定义事件



## 兄弟组件之间如何传递参数

![02.兄弟参数传递](https://raw.githubusercontent.com/ydh1cnn6/pic/master/02.兄弟参数传递.png)

```

```



# 路由处理

## 基础使用

### 安装路由

```
#安装路由
npm install vue-router@3
#卸载路由
npm uninstall vue-router
```

### 配置路由

创建一个router文件（一定要放在src下），里面创建一个index.js文件

```js
import VueRouter from "vue-router";
import Role from '../components/Role'
import User from '../components/User'

const router = new VueRouter({
    routes:[{
        path: '/user',
        component: User
    },{
        path: '/role',
        component: Role
    }]
})
export default  router
```

### 导入路由

修改main，引入vueRouter以及router对象

```js
import Vue from 'vue'
import App from './App.vue'
#import对象
import VueRouter from 'vue-router'
import router from './router'

Vue.config.productionTip = false

//将路由组件应用到vue组件当中
Vue.use(VueRouter)
//vm
new Vue({
  render: h => h(App),
  beforeCreate(){
    Vue.prototype.$bus=this
  },
  router  //增加路由属性
}).$mount('#app')

```

### 组件修改

```html
<template>
  <div id="app">
      <div>
        <router-link to="/user"  class="link">用户</router-link>  &nbsp;&nbsp;&nbsp;&nbsp;
        <router-link to="/role">角色</router-link>
      </div>
      <hr>
      <div>
          <router-view></router-view>
      </div>
  </div>
</template>
```



## 简单说明

每一个组件都会有$route属性，每个组件特有的，存储访问的url，参数（params,query），以及meta，那么等信息

每个应用都会有一个全局$router属性，用于存储应用中的所有路由信息。



## 路由懒加载

```js
import VueRouter from "vue-router";
//修改成懒加载形式
// import Role from '../components/Role'
// import User from '../components/User'

const router = new VueRouter({
    routes:[{
        path: '/user',
        component: ()=>import('../components/User')
    },{
        path: '/role',
        component: ()=>import('../components/Role'),
        
    }]
})
export default  router
```



## 嵌套路由

路由定义，使用children属性来定义

### 路由定义

```js
import VueRouter from "vue-router";
//修改成懒加载形式
// import Role from '../components/Role'
// import User from '../components/User'

const router = new VueRouter({
    routes:[{
        path: '/user',
        component: ()=>import('../components/User')
    },{
        path: '/role',
        component: ()=>import('../components/Role'),
        children:[
            {
                path:'pg',  //子路由不可以以“/”开头
                component:()=>import('../components/Programmer')
            },
            {
                path:'db',
                component:()=>import('../components/DbManager'),
               
            }
        ]
    }]
})
export default  router
```

### vue组件

```html
<template>
    <div>
        <router-link to="/role/db" class="link">数据库管理员</router-link>
        <router-link to="/role/pg" class="link">开发人员</router-link>
        <router-view></router-view>
    </div>
</template>
<script>
export default {
    mounted(){
        console.log(this);
    }
}
</script>
```



## query传递参数

使用模板字符串或者对象方式方式传递时，如果使用query方式传递数据

```html
<template>
    <div>
        <!-- <router-link v-for="manager in managers"  class="link"
           :to="`/role/db/detail?id=${manager.id}&name=${manager.name}&sex=${manager.sex} `" 
            :key="manager.id">{{manager.id}}</router-link> -->

            <router-link v-for="manager in managers"  class="link"
                :to="{
                        path:'/role/db/detail',
                        query: {
                            id: manager.id,
                            name: manager.name,
                            sex:manager.sex
                        }
                }" 
                :key="manager.id">{{manager.id}}</router-link>
        <router-view></router-view>
    </div>
</template>
<script>
export default {
    data(){
        return {
            managers:[{id:'1001',name:'小明',sex:'女'},
                     {id:'1002',name:'小白',sex:'女'}]
        }
    }
}
</script>
```





## 命名路由

在路由中使用name属性进行命名

### 命名路由

```
 children:[{
     path:'detail',
     name: 'roleDetail',
     component:()=>import('../components/Details.vue'),
 }]
```

### to属性调整

```html
<template>
    <div>
        <!-- <router-link v-for="manager in managers"  class="link"
           :to="`/role/db/detail?id=${manager.id}&name=${manager.name}&sex=${manager.sex} `" 
            :key="manager.id">{{manager.id}}</router-link> -->

            <router-link v-for="manager in managers"  class="link"
                :to="{
                        //path:'/role/db/detail',
                        name: 'roleDetail'
                        query: {
                            id: manager.id,
                            name: manager.name,
                            sex:manager.sex
                        }
                }" 
                :key="manager.id">{{manager.id}}</router-link>
        <router-view></router-view>
    </div>
</template>
<script>
export default {
    data(){
        return {
            managers:[{id:'1001',name:'小明',sex:'女'},
                     {id:'1002',name:'小白',sex:'女'}]
        }
    }
}
</script>
```



## 使用params传递参数

在使用REST风格的时候，使用params来传递参数，在path上，使用:参数名,传参数时，使用params属性

必须使用**命名路由**方式，不能使用path属性

### 路由配置

```js
import VueRouter from "vue-router";
//修改成懒加载形式
// import Role from '../components/Role'
// import User from '../components/User'

const router = new VueRouter({
    mode:'history', //默认是hash模式，可以改成history
    routes:[{
        path: '/user',
        component: ()=>import('../components/User')
    },{
        path: '/role',
        component: ()=>import('../components/Role'),
        children:[
            {
                path:'pg',  //子路由不可以以“/”开头
                component:()=>import('../components/Programmer')
            },
            {
                path:'db',
                component:()=>import('../components/DbManager'),
                children:[{
                    path:'detail/:id/:name/:sex',
                    name: 'roleDetail',
                    component:()=>import('../components/Details.vue'),
                }]
            }
        ]
    }]
})
export default  router
```



### 参数传递

```html
<template>
    <div>
        <!-- <router-link v-for="manager in managers"  class="link"
           :to="`/role/db/detail?id=${manager.id}&name=${manager.name}&sex=${manager.sex} `" 
            :key="manager.id">{{manager.id}}</router-link> -->

            <router-link v-for="manager in managers"  class="link" :replace="true"
                :to="{
                        // path:'/role/db/detail',
                        name: 'roleDetail',
                        params: {
                            id: manager.id,
                            name: manager.name,
                            sex:manager.sex
                        }
                }" 
                :key="manager.id">{{manager.id}}</router-link>
        <router-view></router-view>
    </div>
</template>
<script>
export default {
    data(){
        return {
            managers:[{id:'1001',name:'小明',sex:'女'},
                     {id:'1002',name:'小白',sex:'女'}]
        }
    }
}
</script>
```



## 编程式路由

调用vm或者vc对象的$router对象的方法

push，replace，go，back等方法进行路由跳转。

```html
<template>
  <div id="app">
      <div>
        <button @click="toUser" class="link">用户</button>
        <button @click="toRole" class="link">角色</button>
      </div>
      <hr>
      <div>
          <router-view></router-view>
      </div>
  </div>
</template>

<script>

export default {
  name: 'App',
  
  components: {

  },
  methods:{
    toUser(){
      this.$router.push({
        path: '/user',
        query: {
          id:'test'
        }
      })
    },
    toRole(){
      this.$router.push({
        path: '/role'
      })
    }
  },
  mounted(){
    console.log(this.$router);
  }
}
</script>
```



# axios组件

vue本身不支持发送Ajax请求，必须要使用其他的组件（插件），目前使用比较多的axios

axios是基于promise的HTTP请求客户端，用来发送请求。

## 安装axios

```
npm install axios
```



## 设置代理服务器

vue.config.js文件当中增加devServer相关配置

/api开头的请求都是发送到后端的ajax请求，其他前端的url跳转

```
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  //禁用ESLINT检查
  lintOnSave: false  ,
  //api开头的请求都是后端的ajax请求
  devServer:{
    // port: 8080 //当前前端的服务器端口号，不该默认是8080
    https:false,
    proxy:{
      '/api':{
        // 前端:http://localhost:8080/api/test==>后端：http://localhost:9000/test
        target: 'http://localhost:9000',
        changeOrigin: true, //允许跨域
        pathRewrite:{
          '^/api':''  //请求到后端路径修改，去掉/api
        }
      }
    }
  }
})
```



## 简单GET请求

```
ajaxTest(){
                //怎么发送ajax
                // Promise 提供两个方法，then一个catch
                // then: 调用后端正常返回后的回调方法
                // catch: 如果后端不正常返回，则调用该方法。回调参数是异常对象。
                axios.get('/api/test.do')
                .then((response)=>{console.log(response);  })
                .catch((error)=>{console.log(error);  })

            },
```



## 简单POST请求

```
ajaxPost(){
                // axios.post('/api/testPost.do',{id:'1001',name:'李白'})
                // .then((response)=>{console.log(response);  })
                // .catch((error)=>{console.log(error);  })  

                axios({
                    url:'/api/testPost.do',
                    method:'post', 	//default is 'post'
                    data:{id:'1001',name:'张三'}  //default is {} 	//body data

                }) .then((response)=>{console.log(response);  })
                 .catch((error)=>{console.log(error);  })  
            }
```



## 拦截器

### 拦截器定义

创建util/request.js文件

```js
import axios  from "axios"
const service = axios.create({
    // baseURL: "http://localhost:9000",
    baseURL:'',
    timeout: 3000
})

service.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    //给所有的请求增加一个请求头信息， Authentication
    config.headers['Authentication']="java180"
    return config;
  }, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  })

  // 添加响应拦截器
  service.interceptors.response.use(function (response) {
    console.log("response.data",response.data);
    return response;
  }, function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    return Promise.reject(error);
  });

  export default service
```



### 拦截器使用

在使用的vue组件中先引入request对象，然后进行调用

```js
 request({
                    url:'/api/testInterceptor',
                    method:'POST',
                    data: data

                }).then((response)=>{console.log(response);  })
```



# Vuex

Vuex是用来管理Vue.js当中的状态。比较适合中大型项目。

## 使用vuex的好处

能够在vuex当中集中管理共享数据，易于开发和管理

存储在vuex当中的数据时响应式的，能够实时保持和页面之间的同步



## 组成

<img src="/03.vuex的组件.png" alt="03.vuex的组件" style="zoom:80%;" />

## 安装

```shell
npm install vuex@3
```

## 使用

### 简单案例

#### 创建一个store对象

在src目录下创建一个store目录，并在其内部创建index.js

注意：由于在创建Vuex.Store对象之前需要让vue先使用Vuex对象，此处需要引入Vue，并且调用Vue.use(Vuex)

```js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
const actions= {
    add(context,value) {
        //调用axios，进行ajax操作
        //调用mutations当中的ADD方法
        context.commit('ADD',value)
    }

}

const mutations={
    ADD(state,value) {
        state.sum += value;
    },

    SUB(state,value) {
        state.sum -= value;
    }
    
}

const state={
    sum:0
}

export default new Vuex.Store({ 	
    state, 
    actions, 
    mutations 
})


```



#### 将store对象挂载到vue对象当中

```js
import Vue from 'vue'
import App from './App.vue'
import store from './store'


Vue.config.productionTip = false


//vm
new Vue({
  render: h => h(App),
  beforeCreate(){
    Vue.prototype.$bus=this
  },
  store
  
}).$mount('#app')

```



#### 组件中使用vuex

```html
<template>
    <div>
        <h3>合计:{{ $store.state.sum }}</h3>
        <div>
            <input type="number" v-model="step">
            <button @click="add">+</button> 
            <button @click="subtract">-</button>

        </div>
    </div>
</template>
<script>
export default {
    data () { 
        return { 
            step: 2 
        }
    },
    methods:{
        add() {
            //调用actions当中的方法
           this.$store.dispatch('add', parseInt(this.step));

        },
        subtract(){
            //调用mutations当中的方法
            this.$store.commit('SUB', parseInt(this.step));
        }
    }

}
</script>
```



### 常用的对象

state：用来存储共享数据

mutations: 定义一系列的方法，用来改变state中的数据，不用来调用后端的api，所有的方法都带有上store参数，value作为传入的值。

actions: 定义一系列方法，用来调用mutations当中的方法，带有一个上下文参数。可以用来调用后端的API

getters： 类似于组件当中的计算列

modules：模块化



### 四个map的使用

mapState，mapGetters需要放在计算属性中

mapMutations和mapActions放在methods当中

```


```



### 模块化

```

```

