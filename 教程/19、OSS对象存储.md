---
title: 19、OSS对象存储
---
# OSS对象存储

## OSS是什么

Object Store Service： 对象存储服务，是一种云存储服务，OSS一般都提供与平台无关的REST风格的接口，可以在任何时间，地点以及存储位置访问任意类型的数据。

## 使用MINIO的OSS

MinIO对象存储使用buckets来组织对象，buckets（桶）类似于文件目录，每个桶可以存储任意数量的对象。

MinIO是一个高性能的，分布式的存储系统，对于硬件系统的要求相对比较低。针对要求比较高的私有云进行架构。

### 创建bucket

### 创建accesskey和securitykey

​	如果使用的是user创建，则需要指定权限

### 创建工程，引入依赖

```xml
<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>io.minio</groupId>
            <artifactId>minio</artifactId>
            <version>8.4.5</version>
        </dependency>
```



### 文件上传

```java
public static void main(String[] args) throws IOException, InvalidKeyException, InvalidResponseException, InsufficientDataException, NoSuchAlgorithmException, ServerException, InternalException, XmlParserException, ErrorResponseException {
        String host = "http://192.168.33.10:9000";
        String accessKey="java178";
        String secretKey="12345678";
        //MinioClient用来连接的服务器
        MinioClient client =MinioClient.builder()
                            .endpoint(host)
                            .credentials(accessKey,secretKey)
                            .build();
        //判断
        boolean bucketExists = client.bucketExists(BucketExistsArgs.builder().bucket("java1792").build());
        if (!bucketExists){
            client.makeBucket(MakeBucketArgs.builder().bucket("java1792").build());
        }
        String fileName = "d:/fox.jpg";
        InputStream in = new FileInputStream(fileName);
        PutObjectArgs objectArgs = PutObjectArgs.builder().bucket("java1792")
                .object("fox.jpg")
                .stream(in, in.available(), 0)
                .build();
        client.putObject(objectArgs);


        System.out.println("文件上传成功");

    }
```

### 文件下载

```

```

### 整合web

```

```



## 使用阿里云的OSS