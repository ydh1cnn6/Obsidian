**直接使用iframe**

注意：静态资源要放在public中的static文件夹下，访问时直接使用/static/main.html

```vue
<template>
  <div class="hello">
    <iframe src="/static/main.html" frameborder="0" width="100%" height="1000px" ></iframe>
  </div>
</template>
<script>
export default {
  name: 'HelloWorld',
}

</script>
```

```vue
<template>
  <div id="app">
    <hello-world></hello-world>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
export default {
  name: 'App',
  components: {

    HelloWorld
  }
}
</script>
```

****

**文件结构**

![](https://cdn.nlark.com/yuque/0/2023/png/39031477/1700031632368-6c9fa1a2-b68e-40ab-9634-847509d05336.png)

