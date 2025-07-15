```shell tatle 
# 查看指定行,分隔符"ascii:SI"
awk -F $'\x0f' '{print $6,$9,$10}' filename

# 查看结果时过滤空行
awk -F $'\x0f' 'NF && $9!="" {print $6,$9,$10}' filename
```