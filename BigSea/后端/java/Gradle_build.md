### 错误描述：![](https://cdn.nlark.com/yuque/0/2025/png/39031477/1747964280966-0fa005b5-a5a1-4836-9d52-c498a8b6e9fe.png)
### <font style="color:rgb(77, 77, 77);">解决方案</font>
1. <font style="color:rgba(0, 0, 0, 0.75);">定位到Project根目录下的.idea文件夹。</font>
2. <font style="color:rgba(0, 0, 0, 0.75);">在该文件夹中找到modules.xml和所有与Gradle有关的XML文件（例如gradle.xml）。</font>
3. <font style="color:rgba(0, 0, 0, 0.75);">删除这些文件以移除IDEA对Gradle项目的记忆。</font>
4. <font style="color:rgba(0, 0, 0, 0.75);">刷新Maven项目即可。</font>

![](https://cdn.nlark.com/yuque/0/2025/png/39031477/1747964290135-ef7eec43-9e0a-4f31-9b7d-a79bed72a62f.png)

