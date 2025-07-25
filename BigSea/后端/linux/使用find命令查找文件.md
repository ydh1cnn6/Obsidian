
find命令是Linux中用于搜索文件的强大工具，它可以根据文件名、类型、大小、日期等多种条件来查找文件。在当前目录下使用find命令查找文件的基本语法如下：
```shell
find . -name "文件名"
```

这里的.代表当前目录，-name参数后跟要查找的文件名。如果要忽略大小写，可以使用-iname参数。例如，要在当前目录及其子目录下查找所有.jpg和.jpeg文件，可以使用以下命令：
```shell
find . \( -iname '*.jpeg' -o -iname '*.jpg' \)
```

如果只想查找当前目录下的文件，而不包括子目录，可以使用-maxdepth参数限制搜索深度：
```shell
find . -maxdepth 1 -iname '*.jpg'
```

