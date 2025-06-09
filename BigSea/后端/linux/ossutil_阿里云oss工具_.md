```bash
ossutil cp exampleobject.txt oss://examplebucket/desfolder/ -e oss-cn-shanghai.aliyuncs.com -i yourAccessKeyID  -k yourAccessKeySecret
```

[如何通过cp命令将本地文件上传至OSS_对象存储(OSS)-阿里云帮助中心](https://help.aliyun.com/zh/oss/developer-reference/upload-objects-6?spm=a2c4g.11186623.help-menu-31815.d_5_3_2_2_11_0.3cca58256GLkXh&scm=20140722.H_179388._.OR_help-T_cn~zh-V_1)

```bash
ossutil cp oss://examplebucket/exampleobject.txt  localfolder/  -e oss-cn-shanghai.aliyuncs.com -i yourAccessKeyID -k yourAccessKeySecret
```

[通过cp命令将下载OSS的文件_对象存储(OSS)-阿里云帮助中心](https://help.aliyun.com/zh/oss/developer-reference/download-objects-5?spm=a2c4g.11186623.help-menu-31815.d_5_3_2_2_11_1.12035436XzJWVN&scm=20140722.H_179389._.OR_help-T_cn~zh-V_1)



### 通用选项
| **<font style="color:rgb(24, 24, 24);">-c，--config-file</font>** | <font style="color:rgb(24, 24, 24);">ossutil工具的配置文件路径</font> |
| :--- | :--- |
| **<font style="color:rgb(24, 24, 24);">-e，--endpoint</font>** | <font style="color:rgb(24, 24, 24);">指定Bucket对应的Endpoint，域名</font> |
| **<font style="color:rgb(24, 24, 24);">-i，--access-key-id</font>** | <font style="color:rgb(24, 24, 24);">指定访问OSS使用的AccessKey ID，</font> |
| **<font style="color:rgb(24, 24, 24);">-k，--access-key-secret</font>** | <font style="color:rgb(24, 24, 24);">指定访问OSS使用的AccessKey Secret，</font> |
| **<font style="color:rgb(24, 24, 24);">-p，--password</font>** | <font style="color:rgb(24, 24, 24);">指定访问OSS使用的AccessKey Secret，</font> |


**<font style="color:rgb(24, 24, 24);"></font>**



[使用-h命令查看ossutil支持的选项_对象存储(OSS)-阿里云帮助中心](https://help.aliyun.com/zh/oss/developer-reference/view-options?spm=a2c4g.11186623.0.0.120357efWUmaW4#section-yhn-ko6-gqj)

