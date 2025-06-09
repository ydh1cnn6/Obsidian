idea，Unicode编码怎么转为中文？

1. 启用「透明转换」功能

 

进入  File -> Settings -> Editor -> File Encodings （Windows/Linux）或  IntelliJ IDEA -> Preferences -> Editor -> File Encodings （macOS）。

 

勾选 Transparent native-to-ascii conversion 选项。此功能会在编辑时自动将 Unicode 编码转换为可读的中文，并在保存时还原为 Unicode 格式。



确保 Default encoding for properties files 设置为  UTF-8 ，以保证中文正常解析。

