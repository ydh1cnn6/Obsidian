<font style="color:rgb(51, 51, 51);">有多种方法可以放弃当前修改。</font>

<font style="color:rgb(51, 51, 51);">方法一：使用</font><font style="color:rgb(51, 51, 51);background-color:rgb(237, 238, 240);">git checkout</font><font style="color:rgb(51, 51, 51);">命令</font>

```bash
git checkout .
```

<font style="color:rgb(51, 51, 51);">该命令会将当前工作目录中所有修改的文件回滚到最近的一次提交状态。</font>

<font style="color:rgb(51, 51, 51);">方法二：使用</font><font style="color:rgb(51, 51, 51);background-color:rgb(237, 238, 240);">git reset</font><font style="color:rgb(51, 51, 51);">命令</font>

```bash
git reset --hard HEAD
```

<font style="color:rgb(51, 51, 51);">该命令会将当前分支的HEAD指针和索引都重置为最近的一次提交状态，丢弃所有的修改。</font>

<font style="color:rgb(51, 51, 51);">方法三：使用</font><font style="color:rgb(51, 51, 51);background-color:rgb(237, 238, 240);">git stash</font><font style="color:rgb(51, 51, 51);">命令</font>

```bash
git stash save --include-untracked
```

<font style="color:rgb(51, 51, 51);">该命令会将当前修改的文件保存到一个临时的存储区（stash），并将工作目录恢复到最近的一次提交状态。可以使用</font><font style="color:rgb(51, 51, 51);background-color:rgb(237, 238, 240);">git stash list</font><font style="color:rgb(51, 51, 51);">命令查看存储区的内容，再使用</font><font style="color:rgb(51, 51, 51);background-color:rgb(237, 238, 240);">git stash apply</font><font style="color:rgb(51, 51, 51);">或者</font><font style="color:rgb(51, 51, 51);background-color:rgb(237, 238, 240);">git stash pop</font><font style="color:rgb(51, 51, 51);">命令将修改恢复出来。</font>

<font style="color:rgb(51, 51, 51);">这些方法可以根据具体需求选择，注意在执行前确认没有重要的修改未提交，因为这些操作会永久丢弃未提交的修改。</font>

