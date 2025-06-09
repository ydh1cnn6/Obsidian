1、git版本问题

解决方案：在git生成的./ssh/config文件中，末尾添加如下代码

```plain
Host *
HostkeyAlgorithms +ssh-rsa
PubkeyAcceptedKeyTypes +ssh-rsa
```

参考：[记一次使用git报错，解决Unable to negotiate with **** port 22: no matching host key type found. Their offer:... - 简书 (jianshu.com)](https://www.jianshu.com/p/764249229bc4)

