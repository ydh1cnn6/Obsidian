1、JMS（java message service）结构

消息头

消息属性

主题内容



2、消费方式

p2p，单个消费者

ps，发布订阅模型，根据topic主题消费，订阅主题的都能消费

3、消费量级

10万级，高吞吐，ms级时效，可以做的0丢失，社区活跃，支持消息队列

4、作用

解耦、削峰填谷

5、组件

1）Producer

2）Broker

3）Consumer

6、启动

/home/kafka/kafka_2.12-3.9.0/bin

zookeeper-server-start.sh	zookeeper.properties

kafka-server-start.sh	 	server.properties

zookeeper-server-stop.sh

kafka-server-stop.sh



7、创建主题

kafka-topics.sh

```bash
$ bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic my-topic --partitions 1 \
  --replication-factor 1 --config max.message.bytes=64000 --config flush.messages=1
```

--bootstrap-server	localhost:9092			kafka服务器

--create --topic my-topic				创建主题

--partitions 1 \



--list 	查看主题

--describe	主题描述

--later 修改

--delete 删除



```bash
bin/kafka-console-producer.sh --topic quickstart-events --bootstrap-server localhost:9092
```





# SpringBoot
## 相关配置
### 1、pom文件

```xml title=pom.xml
<!-- Spring Kafka 核心依赖 -->
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
</dependency>
```
### 2、application.yml配置

```yaml title="application.yml"
spring:
  kafka:
    # Kafka 集群地址（多个用逗号分隔）
    bootstrap-servers: localhost:9092
    # 生产者配置
    producer:
      # 键的序列化器（默认：StringSerializer）
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      # 值的序列化器（默认：StringSerializer，JSON 可选 JsonSerializer）
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      # 批次大小（默认 16384 bytes）
      batch-size: 16384
      # 缓冲区大小（默认 33554432 bytes）
      buffer-memory: 33554432
      # 消息确认机制（0:不确认；1:leader 确认；all:所有副本确认）
      acks: 1
      # 重试次数
      retries: 3
      # 重试间隔（ms）
      retry-backoff: 1000
    # 消费者配置
    consumer:
      # 键的反序列化器
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      # 值的反序列化器（JSON 可选 JsonDeserializer）
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      # 消费者组 ID（必填）
      group-id: my-consumer-group
      # 自动偏移量重置策略（earliest:从最早开始；latest:从最新开始）
      auto-offset-reset: earliest
      # 是否自动提交偏移量（默认 true）
      enable-auto-commit: false
      # 自动提交偏移量的间隔（ms，仅当 enable-auto-commi
      t=true 时生效）
      auto-commit-interval: 1000
      # 消费者一次拉取的最大记录数
      max-poll-records: 500
    # 监听器配置（消费者监听相关）
    listener:
      # 偏移量提交模式（manual:手动提交；manual_immediate:立即手动提交；batch:批量提交）
      ack-mode: manual_immediate
      # 并发消费者数量（≤ 主题分区数）
      concurrency: 3
      # 拉取超时时间（ms）
      poll-timeout: 3000
    # 事务配置（如需事务支持）
    # transaction:
    #   transaction-id-prefix: tx-
```

### 3、生产者服务
实体类
```java title="USER"
import lombok.Data;

@Data // Lombok 注解，自动生成 getter/setter
public class User {
    private Long id;
    private String name;
    private Integer age;
}
```

生产者
```java title="KafkaProducer"
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;
import org.springframework.util.concurrent.ListenableFuture;
import org.springframework.util.concurrent.ListenableFutureCallback;

import javax.annotation.Resource;

@Component
public class KafkaProducer {

    // 注入 Kafka 模板
    @Resource
    private KafkaTemplate<String, Object> kafkaTemplate;

    // 发送字符串消息
    public void sendStringMessage(String topic, String message) {
        // 同步发送（会阻塞等待结果）
        // kafkaTemplate.send(topic, message).get();

        // 异步发送（非阻塞，通过回调处理结果）
        ListenableFuture<SendResult<String, Object>> future = kafkaTemplate.send(topic, message);
        future.addCallback(new ListenableFutureCallback<SendResult<String, Object>>() {
            @Override
            public void onSuccess(SendResult<String, Object> result) {
                System.out.println("消息发送成功：" + result.getRecordMetadata().offset());
            }

            @Override
            public void onFailure(Throwable ex) {
                System.err.println("消息发送失败：" + ex.getMessage());
            }
        });
    }

    // 发送对象消息（自动序列化为 JSON）
    public void sendObjectMessage(String topic, User user) {
        kafkaTemplate.send(topic, user);
    }
}
```

##### 方案二：配置生产者（）
```java sdf
@Bean  
public ProducerFactory<Integer, String> producerFactory() {  
    return new DefaultKafkaProducerFactory<>(producerConfigs());  
}  
  
@Bean  
public Map<String, Object> producerConfigs() {  
    Map<String, Object> props = new HashMap<>();  
    props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");  
    props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, IntegerSerializer.class);  
    props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);  
    // See https://kafka.apache.org/documentation/#producerconfigs for more properties  
    return props;  
}  
  
@Bean  
public KafkaTemplate<Integer, String> kafkaTemplate() {  
    return new KafkaTemplate<Integer, String>(producerFactory());  
}
```



### 4、消费者服务

```java title="消费者"
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Component
public class KafkaConsumer {

    // 监听单个主题
    @KafkaListener(topics = "test-topic", groupId = "my-consumer-group")
    public void listenStringMessage(ConsumerRecord<String, String> record, Acknowledgment ack) {
        try {
            // 消息处理逻辑
            String topic = record.topic();
            int partition = record.partition();
            long offset = record.offset();
            String message = record.value();
            System.out.println("收到消息：topic=" + topic + ", partition=" + partition + ", offset=" + offset + ", content=" + message);
            
            // 手动提交偏移量（配合 ack-mode: manual_immediate）
            ack.acknowledge();
        } catch (Exception e) {
            // 处理失败时不提交偏移量，消息会被重新消费
            System.err.println("消息处理失败：" + e.getMessage());
        }
    }

    // 监听对象消息（自动反序列化为 User 对象）
    @KafkaListener(topics = "user-topic", groupId = "my-consumer-group")
    public void listenObjectMessage(ConsumerRecord<String, User> record, Acknowledgment ack) {
        User user = record.value();
        System.out.println("收到用户消息：" + user);
        ack.acknowledge(); // 手动提交
    }

    // 监听多个主题（用逗号分隔）
    @KafkaListener(topics = {"topic1", "topic2"}, groupId = "my-consumer-group")
    public void listenMultiTopics(ConsumerRecord<String, String> record) {
        System.out.println("多主题消息：" + record.value());
    }
}
```


### 5、创建topic
如何topic已存在，则不会重新创建，也不会修改topic。
The bean causes the topic to be created on the broker; it is not needed if the topic already exists.`NewTopic`
#### 创建单个

```java title="topic"
@Bean 
public KafkaAdmin admin() { 
	Map<String, Object> configs = new HashMap<>(); 
	configs.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092"); 
	return new KafkaAdmin(configs); 
}

@Bean  
public NewTopic topic() {  
    return TopicBuilder.name("topic1")  
            .partitions(10)  
            .replicas(1)  
            .build();  
}
```

#### 批量创建Topic
```java title="方式2"
@Bean public KafkaAdmin.NewTopics topics456() {
	return new NewTopics( 
		TopicBuilder.name("defaultBoth") 
			.build(), 
		TopicBuilder.name("defaultPart") 
			.replicas(1)
			 .build(), 
		TopicBuilder.name("defaultRepl") 
			.partitions(3) 
		.build()
	); 
}
```

##  补充说明
### 1、配置的topic分区 （没想好）
```java title=""


```



## 命令行管理Kafka Topic
### 1. 查看Topic列表
```bash
bin/kafka-topics.sh --list --bootstrap-server localhost:9092
```

### 2. 查看Topic详细信息
```bash
bin/kafka-topics.sh --describe --topic my_topic --bootstrap-server localhost:9092
```

### 3. 修改Topic配置
```bash
bin/kafka-configs.sh --alter \
  --bootstrap-server localhost:9092 \
  --entity-type topics \
  --entity-name my_topic \
  --add-config retention.ms=86400000
```

### 4. 增加Topic分区数
```bash
bin/kafka-topics.sh --alter \
  --bootstrap-server localhost:9092 \
  --topic my_topic \
  --partitions 6
```

### 5. 删除Topic
```bash
bin/kafka-topics.sh --delete \
  --bootstrap-server localhost:9092 \
  --topic my_topic
```
``