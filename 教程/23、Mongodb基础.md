# Mongodb基础

## mongodb是什么

MongoDB是一个基于分布式文件存储 [1] 的数据库。由[C++](https://baike.baidu.com/item/C%2B%2B/99272?fromModule=lemma_inlink)语言编写。旨在为WEB应用提供可扩展的高性能数据[存储解决方案](https://baike.baidu.com/item/存储解决方案/10864850?fromModule=lemma_inlink)。

MongoDB是一个介于[关系数据库](https://baike.baidu.com/item/关系数据库/1237340?fromModule=lemma_inlink)和非关系数据库之间的产品，是非关系数据库当中功能最丰富，最像关系数据库的。它支持的[数据结构](https://baike.baidu.com/item/数据结构/1450?fromModule=lemma_inlink)非常松散，是类似[json](https://baike.baidu.com/item/json?fromModule=lemma_inlink)的[bson](https://baike.baidu.com/item/bson?fromModule=lemma_inlink)格式，因此可以存储比较复杂的[数据类型](https://baike.baidu.com/item/数据类型/10997964?fromModule=lemma_inlink)。Mongo最大的特点是它支持的[查询语言](https://baike.baidu.com/item/查询语言/2661811?fromModule=lemma_inlink)非常强大，其语法有点类似于面向对象的查询语言，几乎可以实现类似关系数据库单表查询的绝大部分功能，而且还支持对数据建立索引。

MongoDB是一个非常热门的非关系型数据库，用来做离线数据分析比较多。

支持操作系统较多：Linux，MAC, windows

提供了多种语言的驱动：java，php，python，Ruby，C++



## 应用场景

直播数据，打赏数据，粉丝数据，收藏数据，浏览数据

​	存储方式： 数据库  ，MongoDb

​	特点：修改频度很高，比较适合传统数据库和临时存储相结合

游戏的装备以及道具数据

​	存储方式： 数据库  ，MongoDb

​	特点：修改频度很高，比较适合传统数据库和临时存储相结合

物联网数据：

​	存储： Mongodb

​	特点：修改频度很高，只做临时存储



## 基本概念

文档（Document）：Mongodb的基本单元，由JSON键值对（Key-value）组成，类似于关系型数据库当中的一行

集合（Collection）：一个集合可以包含多个文档，类似于关系型数据库当中的表

数据库（Database）：一个数据库可以包含多个集合，可以在mongodb当中创建多个数据库。



# Springbooot当中使用Mongodb

## 增加依赖

```
<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-mongodb</artifactId>
        </dependency>
```



## 进行配置

```yaml
server:
  port: 8085
spring:
  application:
    name: mongo
  data:
    mongodb:  #smart为数据库名
      uri: mongodb://localhost:27017/smart
```



## 使用方式

### 使用模板方式

直接注入MongoTemplate对象，并调用它的方法

```java
@RestController
public class DeviceTypeController {

    @Resource
    MongoTemplate mongoTemplate;

    @GetMapping("add")
    public String addDeviceType(){
        DeviceType deviceType = new DeviceType();
        deviceType.setId(111);
        deviceType.setName("办公电脑");
        mongoTemplate.insert(deviceType);
        return "success";
    }


    @GetMapping("save")
    public String saveDeviceType(int id,String name){
        DeviceType deviceType = new DeviceType();
        deviceType.setId(id);
        deviceType.setName(name);
        //如果有数据，则修改，没有则增加
        mongoTemplate.save(deviceType);

        return "success";
    }


    @GetMapping("update")
    public String update(int id,String name){

        Query query = new Query(Criteria.where("id").is(id));
        Update update = new Update().set("name",name);
        mongoTemplate.updateFirst(query,update,DeviceType.class);

        return "update success";
    }

}
```



### 使用接口方式

#### 定义接口

```
public interface DeviceRepository extends MongoRepository<Device,Integer> {
    List<Device> findByNameLike(String name);

    List<Device> findByNameLikeAndSn(String name,String sn);

}
```

#### 调用

```java
@RestController
@RequestMapping("device")
public class DeviceController {

    @Resource
    DeviceRepository deviceRepository;

    @GetMapping("add/{id}")
    public String addDevice(@PathVariable("id") int id){
        Device device = new Device();
        device.setId(id);
        device.setName("土壤酸碱度传感器111");
        device.setSn("1203");
        deviceRepository.insert(device);
        return "add success";
    }

    //按照id查询
    @GetMapping("findOne/{id}")
    public String findOne(@PathVariable("id") Integer id){
        Optional<Device> optionalDevice = deviceRepository.findById(id);
        if (optionalDevice.isPresent()){
            //获取数据
            System.out.println(optionalDevice.get());
        }

        return "find success";
    }

    //按照id查询
    @GetMapping("findByName/{name}")
    public String findByName(@PathVariable("name") String  name){
        List<Device> lists = deviceRepository.findByNameLike(name);
        lists.stream().forEach(System.out::println);

        return "find success";
    }
}

```

