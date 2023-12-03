---
typora-root-url: 图例
---

---
typora-root-url: E:\课件_总\00-  教学笔记\Quartz\图例



# 一、Quartz基础

实现定时任务简单的有四种方式:Timer，ScheduledThreadPool线程池，quartz(常用)以及springtask,XXL-JOB

## 什么是Quartz

Quartz是一个完全由Java编写的开源作业调度框架，是OpenSymphony开源组织在Job scheduling领域又一个开源项目。Quartz允许开发人员根据时间间隔来调度作业。它实现了作业和触发器的多对多的关系，还能把多个作业与不同的触发器关联。它可以与J2EE与J2SE应用程序相结合也可以单独使用。

Quartz是开源且丰富特性的“任务调度库”，能够集成任何的java应用。Quartz能够创建可简单可复杂的调度，以执行上百、上万个任务。Quartz调库框架包含许多企业级的特性，如JTA事务，集群的支持。

官网地址：http://www.quartz-scheduler.org/

## Quartz的运行环境

嵌入另一个独立运行的程序
可以在应用服务器（或Servlet容器）内被实例化，并且参与事务。
可以作为独立的运行程序（其自己的java虚拟机内），可以通过RMI使用
可以被实例化，作为独立的项目集群（负载均衡或故障转移功能），用于作业的执行

## Quartz的设计模式

Builder模式
Factory模式
组件模式
链式模式

# 二、Quartz的核心

## 核心概念

- 任务job：job就是你想要实现的任务类，每一个Job必须实现org.quartz.Job接口，且只需要实现接口定义的execute()方法。
- 触发器Trigger：触发器代表一个调度参数的配置，配置调用的时间，比如你想每天定时下午5点发送邮件，制定触发的条件。Trigger主要包含SimpeTrigger和CronTrigger两种。
- 调度器Scheduler：是一个计划调度器容器，容器里面可以盛放众多的JobDetail和trigger，它会将任务job以及触发器Trigger整合起来，负责基于Trigger设定的事件来执行Job。

## 体系结构

![01.体系架构](https://my-picture-aa.oss-cn-nanjing.aliyuncs.com/img/202308171832935.png)

## 常用API

- Scheduler：用于与调度程序交互的主程序接口。Scheduler调度程序-任务执行计划表，只有安排进执行计划的任务Job（通过scheduler.schedulejob方法安排进执行计划），当它预先定义的执行事件到了的时候（任务触发trigger），该任务才会执行。
- Job ：预先定义的，希望在将来的某个事件能被调度执行的任务类。
- JobDetail：使用JobDetail来定义定时任务的实例，JobDetail通过JobBuilder来创建
- JobDataMap：可以包含不限量（序列化的）数据对象，在job实例执行的时候，可以使用其中的数据JobDataMap是一个Map接口的实现，额外增加了一些便于存取基本类型的数据方法。
- Trigger触发器：用来触发执行Job的。当调度一个Job时，创建一个触发器对象，并调整它的属性来满足Job执行的条件。它表明任务的执行时点，比如说什么时间执行，间隔如何等。
- JobBuilder：用于定义一个任务实例，也可以定义关于此任务的详细信息，例如：任务名，组别等。这个声明的实例将会作为一个实际执行的任务。
- TriggerBuilder：触发器的创建器，用于创建触发器实例。
- JobListener，TriggerListener，SchedulerListener监听器，用于对组件的监听。

# 三、Quartz的使用

## 入门案例

- 1.创建一个maven工程

- 2.增加依赖

  ```xml
  <dependency>
      <groupId>org.quartz-scheduler</groupId>
      <artifactId>quartz</artifactId>
      <version>2.3.2</version>
  </dependency>
  <dependency>
      <groupId>org.quartz-scheduler</groupId>
      <artifactId>quartz-jobs</artifactId>
      <version>2.3.2</version>
  </dependency>
  ```

- 3.定义任务

  <span style="color:red">注意：定义任务的Job实现类必须是公开的（public）</span>

  ```java
  public class HelloQuartzJob implements Job{
      @Override
      public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
          System.out.println("hello," + LocalTime.now().toString());
      }
  }
  ```

- 4.定义一个主类，来定时执行此任务

  ```java
  public static void main(String[] args) throws SchedulerException {
  	//1：调度器，从工厂中获取调度的实例
  	Scheduler scheduler = StdSchedulerFactory.getDefaultScheduler();
  
  	//2：任务实例（JobDetail）
  	JobDetail job = JobBuilder
  			.newJob(HelloQuartzJob.class)
  			.withIdentity("helloQuartzJob","group1") //任务名称，任务组的名字
  			.build();
  	//3：触发器（Trigger）
  	Trigger trigger = TriggerBuilder.newTrigger()
  			.withIdentity("trigger1","group1") //触发器的名字，触发器组的名字
  			.startNow()  //马上启动触发器
  			.withSchedule(SimpleScheduleBuilder.simpleSchedule()
  					.withIntervalInSeconds(5)
  					.withRepeatCount(5))  //重复执行6次，从0开始
  			.build();
  
  	//让调度器关联任务和触发器，保证按照触发器定义的条件执行任务
  	scheduler.scheduleJob(job,trigger);
  	//启动
  	scheduler.start();
  }
  ```

  

##  Job&JobDetail

- job:工作任务调度的接口，任务类需要实现该接口。该接口中定义的execute方法，类似于JDK提供的TimeTask类中的run方法，用来编写业务逻辑。

  - Job实例在Quartz中的生命周期：每次调度器执行Job时，它在调用execute方法前会创建一个新的Job实例，当调用完成后，关联的job对象会被释放，释放的实例会被垃圾收集器收集。

- JobDetail：JobDetai为job实例提供了许多属性设置，以及jobDataMap成员属性，它用来存储特定Job实例的状态信息，调度器需要借助jobDetail对象来添加Job实例。

  JobDetail的重要属性：name，group，jobClass，jobDataMap

  ```java
  //2：任务实例（JobDetail）
  JobDetail job = JobBuilder
  		.newJob(HelloQuartzJob.class)
  		.withIdentity("helloQuartzJob","group1") //任务名称，任务组的名字
  		.requestRecovery()
  		.build();
  System.out.println(job.getKey().getName());
  System.out.println(job.getKey().getGroup());
  System.out.println(job.getJobClass().getName());
  ```



##  JobExecutionContext

- 当Scheduler调用一个Job，就会将jobExecutionContext对象传递给job的execute()方法。
  Job能通过JobExecutionContext对象访问到Quartz运行时候的环境以及job本身的明细数据。

  ```java
  public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
  	//获取运行时数据
  	System.out.println(jobExecutionContext.getJobDetail().getKey().getName());
  	System.out.println(jobExecutionContext.getJobDetail().getKey().getGroup());
  	System.out.println("hello," + LocalTime.now().toString());
  }
  ```

  

## JobDataMap

在进行任务调度时，JobDataMap存储在JobExecutionContext中，非常方便获取。
jobDataMap可以用来装载任何可序列化的数据对象，当Job实例对象呗执行时，这些参数对象会传递给它。
jobDataMap实现了JDK的Map接口，并且添加了非常方便的方法用来存取基本数据类型。

- 在创建JobDetail和Trigger中传递参数

  可以通过JobExecutionContext对象获取到JobDataMap对象

  ```java
  public static void main(String[] args) throws SchedulerException {
  
  	Scheduler scheduler = StdSchedulerFactory.getDefaultScheduler();
  
  	JobDetail job = JobBuilder.newJob(ParamJob.class)
  			.withIdentity("paramjob","group2")
  			.usingJobData("username","xiaoming") //传参数
  			.usingJobData("age",5)//传参数
  			.build();
  
  	Trigger trigger = TriggerBuilder.newTrigger()
  			.withIdentity("triggle2","group2")
  			.usingJobData("message","triggle message")//传参数
  			.startNow()
  			.withSchedule(SimpleScheduleBuilder.simpleSchedule()
  					.withIntervalInSeconds(1)
  					.repeatForever())
  			.build();
  	scheduler.scheduleJob(job,trigger);
  	scheduler.start();
  }
  ```

- Job类中读取数据

  - 通过JobDataMap获取数据

  ```java
  public class ParamJob implements Job {
      @Override
      public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
  
          JobDataMap jobDataMapmap = jobExecutionContext.getJobDetail().getJobDataMap();
          System.out.println("===name:" + jobDataMapmap.getString("username") + ",age:" + jobDataMapmap.getInt("age") + "======" );
  
          JobDataMap triggleMap = jobExecutionContext.getTrigger().getJobDataMap();
          System.out.println("message:" + triggleMap.getString("message"));
          System.out.println("当前任务执行事件：" + jobExecutionContext.getFireTime());
          System.out.println("下次任务执行事件："  + jobExecutionContext.getNextFireTime());
          System.out.println("hello," + LocalTime.now().toString());
      }
  }
  ```

  - 使用属性方式获取数据

    在job类中定义属性，并提供公开的Setter方法。

    注意，如果trigger和jobdetail中存在同名参数，trigger中的参数会覆盖掉jobdetail中的

    ```java
    public class ParamJob implements Job {
        String username;
        int age;
        String message;
        @Override
        public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
    		
            System.out.println("===name:" +username+ ",age:" + age + "======" );
            System.out.println("message:" + message);
            System.out.println("hello," + LocalTime.now().toString());
        }
    
        public void setUsername(String username) {
            this.username = username;
        }
        public void setAge(int age) {
            this.age = age;
        }
        public void setMessage(String message) {
            this.message = message;
        }
    }
    ```

    

  

##  Job的状态

有状态的job可以理解为多次job调用期间可以持有一些状态信息，这些状态信息存储在jobDataMap中，默认的Job是无状态的Job，即每次调用时都会创建一个新的jobDataMap。

可以使用@PersistJobDataAfterExecution注解，它告诉 Quartz 在 execute() 方法成功完成后（不抛出异常）更新 JobDetail 的 JobDataMap 的存储副本，以便下次执行相同的作业（ JobDetail) 接收更新的值而不是原始存储的值。

最好是和@DisallowConcurrentExecution注解一起使用。

```java
@PersistJobDataAfterExecution //没有它，每次执行age都相同，有了它会增加
public class ParamJob implements Job {
    String username;
    int age;
    String message;
    @Override
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {


        System.out.println("===name:" +username+ ",age:" + age + "======" );
        age++;
		//将值回写入map
        jobExecutionContext.getJobDetail().getJobDataMap().put("age",age);
        System.out.println("message:" + message);

        System.out.println("hello," + LocalTime.now().toString());
    }


    public void setUsername(String username) {
        this.username = username;
    }


    public void setAge(int age) {
        this.age = age;
    }
    public void setMessage(String message) {
        this.message = message;
    }
}

```



## Trigger 触发器

![image-20210704165002603](/C:/Users/Administrator/AppData/Roaming/Typora/typora-user-images/image-20210704165002603.png)



Quartz有一些不同的触发器类型，不过用得最多的是SimpleTriggle和CronTriggle

jobKey：表示job实例的标志，触发器被触发时，该指定的job实例会被执行。

startTime：表示触发器的事件表，第一次开始被触发的事件，它的数据类型是java.util.Date

endTime：表示触发器终止被触发的事件，它的数据类型是java.util.Date

```java
public class TriggerJob implements Job{
    @Override
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {

        System.out.println("=================");
        Trigger trigger = jobExecutionContext.getTrigger();
        System.out.println("开始事件:" + trigger.getStartTime());
        System.out.println("结束事件:" + trigger.getEndTime());
    }
}
```

在trigger中不再使用startNow()，而是设置开始和结束事件

```java
public static void main(String[] args) throws SchedulerException {
	//1：调度器，从工厂中获取调度的实例
	Scheduler scheduler = StdSchedulerFactory.getDefaultScheduler();

	//2：任务实例（JobDetail）
	JobDetail job = JobBuilder
			.newJob(TriggerJob.class)
			.withIdentity("helloQuartzJob","group1") //任务名称，任务组的名字
			.build();
	//3：触发器（Trigger）
	Date startDate = new Date();
	startDate.setTime(startDate.getTime() + 1000);
	Date endDate = new Date();
	endDate.setTime(endDate.getTime() + 10000);
	Trigger trigger = TriggerBuilder.newTrigger()
			.withIdentity("trigger1","group1") //触发器的名字，触发器组的名字
			.startAt(startDate)
			.endAt(endDate)
			.withSchedule(SimpleScheduleBuilder.simpleSchedule()
					.withIntervalInSeconds(5))
			.build();

	//让调度器关联任务和触发器，保证按照触发器定义的条件执行任务
	scheduler.scheduleJob(job,trigger);
	//启动
	scheduler.start();

}
```

###  SimpleTrigger

SimpleTrigger对于设置和使用是最为简单的一种QuartzTrigger
它是为那种需要在特定的日期/时间启动，且以一个可能的间隔时间重复执行n此的job所设计。

注意：

- SimpleTrigger的属性有：开始时间，结束时间，重复次数和重复的时间间隔。
- 重复次数属性的值可以为0，正整数或常量SimpleTrigger.REPEAT_INDEFINITELY
- 重复的时间间隔属性必须为正整数，以毫秒作为时间单位，当重复的时间间隔为0时，意味着与Trigger同时触发执行。
- 如果有指定结束时间属性，则结束时间属性优先于重复次数，这样的好处是：当我们需要创建每隔10秒钟触发一次直到指定时间结束的trigger时，不需要去计算从开始到结束重复的次数

###  CronTrigger触发器

​	如果需要一个基于类似日历的概念而不是根据 SimpleTrigger 的确切指定间隔重复的作业触发计划

​	使用 CronTrigger，您可以指定触发时间表，例如“每个星期五中午”或“每个工作日和上午 9:30”，甚至“每周一、周三上午 9:00 至上午 10:00 之间每 5 分钟一次”和一月份的星期五”。

​	与 SimpleTrigger 一样，CronTrigger 有一个startTime指定计划何时生效，以及一个（可选）endTime指定计划何时停止。

#### Cron Expressions （Cron表达式）

Cron表达式用于配置 CronTrigger 的实例。Cron-Expressions 是实际上由七个子表达式组成的字符串，它们描述了计划的各个细节。这些子表达式用空格分隔。

1. Seconds：秒

2. Minutes：分钟

3. Hours：小时

4. Day-of-Month：每月的某天

5. Month：月份

6. Day-of-Week：星期几

7. Year (optional field) 年份（可选字段）

   

   取值：

   | 字段 | 是否必须 | 允许值              | 允许的特殊符号       |
   | ---- | -------- | ------------------- | -------------------- |
   | 秒   | 是       | 0~59                | ， -  *   /          |
   | 分钟 | 是       | 0~59                | ,  -   *  /          |
   | 小时 | 是       | 0~23                | ,   -  *  /          |
   | 日   | 是       | 1~31                | , -  *  /  ?  L  W C |
   | 月   | 是       | 1~12或JAN~DEC       | , -  *  /            |
   | 周   | 是       | 1~7或者SUN~SAT      | , -  *  /  ?  L C  # |
   | 年   | 否       | 不填写或者1970~2099 | , -  *  /            |

   单个子表达式可以包含范围和/或列表。例如，前面（读作“WED”）示例中的星期几字段可以替换为“MON-FRI”、“MON,WED,FRI”，甚至“MON-WED,SAT”。

   | 符号 | 含义                                                         |
   | ---- | ------------------------------------------------------------ |
   | ，   | 表示多个值，例如周字段上“MON,WED,FRI”                        |
   | -    | 表示区间，例如小时上设置10-12，表示10，11，12点都会触发      |
   | /    | '/' 字符可用于指定值的增量。例如，如果您在“分钟”字段中输入“0/15”，则表示“每小时的第 15 分钟，从零分钟开始”。如果您在“分钟”字段中使用“3/20”，则表示“每小时的每 20 分钟，从第三分钟开始” |
   | *    | *表示该字段的“每个”可能值。因此，*前面示例中“月”字段中的“ * ”字符仅表示“每个月”。因此，Day-Of-Week 字段中的“*”显然意味着“一周中的每一天”。 |
   | ？   | 表示不定值，月份和星期几字段允许使用字符。月份中的日期和星期几是互斥的，因此可以使用？来表示你不想设置这个字段。 |
   | L    | 允许用于月份和星期字段。该字符是“last”的简写，但在两个字段中的含义各不相同。月份字段中的值“L”表示“月份的最后一天”——非闰年的一月为 31 天，二月为 28 天。如果单独用于“星期几”字段，则仅表示“7”或“SAT”。但是如果在day-of-week 字段中使用另一个值，则表示“该月的最后xxx 天”——例如“6L”或“FRIL”都表示“该月的最后一个星期五”。您还可以指定与该月最后一天的偏移量，例如“L-3”，表示日历月的倒数第三天。*使用 'L' 选项时，重要的是不要指定列表或值范围，因为您会得到令人困惑/意外的结果。* |
   | W    | 用于指定离给定日期最近的工作日（周一至周五）。如果您将“15W”指定为 day-of-month 字段的值，则其含义为：“距该月 15 日最近的工作日”。 |
   | #    | 用于指定该月的“第 n 个”XXX 工作日。例如，星期字段中“6#3”或“FRI#3”的值表示“该月的第三个星期五”。 |



练习：

```java
"0 0 10,14,16 * * ?"   每天上午10点，下午2点，4点触发
"0 0/30 9-17 * * ?"  早上9点到晚上5点之间每半小时，从0分开始每隔30分钟触发一次
"0 0 12 ? * WED"  每周三中午12点触发
"0 30 10-13 ？* WED,FRI"   每周三和周五的 10:30、11:30、12:30 和 13:30 触发
"0 15 10 15 * ?" 每月15日上午10：15触发
"0 15 10 L * ?" 每月最后一天上午10：15触发
"0 15 10 ？ * 6L" 每月最后一个星期五上午10：15触发
```

可以利用在线的Cron表达式工具：https://www.bejson.com/othertools/cron/

#### 案例代码

- JOB代码

  ```java
  public class CronTriggerJob implements Job{
      @Override
      public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
  
          System.out.println("=================");
          System.out.println("hello," + LocalTime.now().toString());
      }
  }
  
  ```

- 测试代码

  ```java
  public static void main(String[] args) throws SchedulerException {
  	//1：调度器，从工厂中获取调度的实例
  	Scheduler scheduler = StdSchedulerFactory.getDefaultScheduler();
  
  	//2：任务实例（JobDetail）
  	JobDetail job = JobBuilder
  			.newJob(CronTriggerJob.class)
  			.withIdentity("helloQuartzJob","group1") //任务名称，任务组的名字
  			.build();
  	//3：触发器（Trigger）
  	Date startDate = new Date();
  	startDate.setTime(startDate.getTime() + 1000);
  	Date endDate = new Date();
  	endDate.setTime(endDate.getTime() + 10000);
  	Trigger trigger = TriggerBuilder.newTrigger()
  			.withIdentity("trigger1","group1") //触发器的名字，触发器组的名字
  			.startAt(startDate)
  			.endAt(endDate)
  			.withSchedule(CronScheduleBuilder.cronSchedule("0/1 *  19 * * ?"))
  			.build();
  
  	//让调度器关联任务和触发器，保证按照触发器定义的条件执行任务
  	scheduler.scheduleJob(job,trigger);
  	//启动
  	scheduler.start();
  }
  ```

  

##  配置、资源SchedulerFactory

所有的Scheduler实例是由SchedulerFactory创建

SchedulerFactory的创建方式

- StdSchedulerFactory：默认的SchedulerFactory

  - 使用一组参数来创建和初始化Quartz调度器
  - 配置参数一般存储在quartz.properties中
  - 通过调用getScheduler()方法就能创建和初始化调度器对象

  ```java
  StdSchedulerFactory factory = new StdSchedulerFactory();
  Scheduler scheduler= factory.getScheduler();
  ```

  - 常用方法
    - scheduleJob(job,trigger)：返回值为Date类型，任务的开始事件
    - start()：开启
    - standby():挂起，暂停操作，可调用start再次开启
    - shutdown(boolean)：关闭任务调度，为true，等任务执行之后再关闭，false（默认）则直接关闭。

- DirectSchedulerFactory：对SchedulerFactory的直接实现，通过它可以直接构建Scheduler，thredPool等

  ```java
  DirectSchedulerFactory factory = DirectSchedulerFactory.getInstance();
  Scheduler scheduler = factory.getScheduler();
  ```

  

## Quartz.properties文件

默认文件所在位置：org.quartz包下

```properties
#用来区分特定的调度器实例，可以按照业务用途来给调度器起名字	
org.quartz.scheduler.instanceName: DefaultQuartzScheduler
#instanceId，这个值必须在所有的调度器实例中是唯一的，尤其是集群环境中，作为集群的唯一key。如果想要Quartz帮助你生成这个值，可以设置为AUTO
#org.quartz.scheduler.instanceId=AUTO
org.quartz.scheduler.rmi.export: false
org.quartz.scheduler.rmi.proxy: false
org.quartz.scheduler.wrapJobExecutionInUserTransaction: false
#一个实现org.quartz.spi.threadPool接口的类，以下为自带的线程池类
org.quartz.threadPool.class: org.quartz.simpl.SimpleThreadPool
#处理job的线程个数，至少为1，多数情况下最好不要超过100
org.quartz.threadPool.threadCount: 10
#线程的优先级别，最小为1，最大为10
org.quartz.threadPool.threadPriority: 5
org.quartz.threadPool.threadsInheritContextClassLoaderOfInitializingThread: true

org.quartz.jobStore.misfireThreshold: 60000

org.quartz.jobStore.class: org.quartz.simpl.RAMJobStore
```



## 监听器

Quartz监听器用于当任务调动中你所关注的事情发生时，能够及时获得这一事件的通知，类似于任务执行过程中的邮件、短信类的梯形。Quartz监听器主要有JobListener、TriggerListener、SchedulerListtener三种，顾名思义，分别表示任务、触发器、调度器对应的监听器。监听器分为两种：全局监听器和非全局监听器。
全局监听器能够接收到所有的job/trigger的事件通知，而非全局监听器只能接收到在其上注册的Job或Trigger的事件，不在其上注册的Job或Trigger则不会进行监听。

### JobListener监听器

JobListeners接收与作业相关的事件。

- getName方法：用于获取该JobListener的名称

- jobToBeExecuted方法：Scheduler在JobDetail中将要被执行时调用这个方法。

- jobExecutionVetoed方法：Scheduler在JobDetail即将被执行，但是又被TriggerListener否决时调用该方法。

- jobWasExecuted方法：Scheduler在jobDetail被执行之后调用这个方法

  

- 创建监听器

  ```java
  public class MyJobListener implements JobListener {
      @Override
      public String getName() {
          return MyJobListener.class.getName();
      }
  
      @Override
      public void jobToBeExecuted(JobExecutionContext jobExecutionContext) {
          System.out.println("Job即将要被执行" );
      }
  
      @Override
      public void jobExecutionVetoed(JobExecutionContext jobExecutionContext) {
          System.out.println("Job即将要被执行，但又被否决" );
  
      }
  
      @Override
      public void jobWasExecuted(JobExecutionContext jobExecutionContext, JobExecutionException e) {
          System.out.println("Job已经执行结束" );
      }
  }
  
  ```

-    注册测试

  ```java
  public class Myjob implements Job {
      @Override
      public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
          System.out.println("hello:" + LocalTime.now().toString());
      }
      public static void main(String[] args) throws SchedulerException {
  
  
          Scheduler scheduler = StdSchedulerFactory.getDefaultScheduler();
          JobDetail job = JobBuilder.newJob(Myjob.class)
                  .withIdentity("myjob","group1")
                  .build();
          Trigger trigger = TriggerBuilder.newTrigger()
                  .withIdentity("trigger","group1")
                  .startNow()
                  .withSchedule(SimpleScheduleBuilder.simpleSchedule()
                          .withIntervalInSeconds(1)
                          .withRepeatCount(3))
                  .build();
          scheduler.scheduleJob(job,trigger);
           //注册全局的Job监听器
  //        scheduler.getListenerManager().addJobListener(new MyJobListener(), EverythingMatcher.allJobs());
          //注册局部的Job监听器
          scheduler.getListenerManager().addJobListener(new MyJobListener(), KeyMatcher.keyEquals(JobKey.jobKey("myjob","group1")));
  
          scheduler.start();
  
      }
  }
  ```



### TriggerListener监听器

TriggerListeners接收与触发器相关的事件

- 方法说明
  - getName：用于获取该JobListener的名称
  - triggerFired：当与监听器相关联的trigger被触发，Job上的execute()方法将被执行时，Scheduler就会调用此方法
  - vetoJobExecution：在Trigger触发后，Job将要被执行时由Scheduler调用此方法。TriggerListener给了一个选择否决Job的权利。如果这个方法返回true，这个Job将不会为此次Trigger触发。
  - triggerMisfired：在Trigger错过触发时调用。避免在这个方法中执行持续时间长的逻辑处理，印在在出现许多错过触发的Trigger时，长逻辑会导致骨牌效应。
  - triggerComplete：Trigger被触发并且完成Job的执行，Scheduler调用此方法

- 创建监听器

  ```java
  //监听器
  public class MyTriggerListener implements TriggerListener {
      @Override
      public String getName() {
          return this.getClass().getName();
      }
  
      @Override
      public void triggerFired(Trigger trigger, JobExecutionContext jobExecutionContext) {
          System.out.println("任务即将被执行");
      }
  
      @Override
      public boolean vetoJobExecution(Trigger trigger, JobExecutionContext jobExecutionContext) {
          System.out.println("行驶否决权：" + trigger.getKey().getName());
          return false;
      }
  
      @Override
      public void triggerMisfired(Trigger trigger) {
          System.out.println("触发器错过执行：" + trigger.getKey().getName());
      }
  
      @Override
      public void triggerComplete(Trigger trigger, JobExecutionContext jobExecutionContext, Trigger.CompletedExecutionInstruction completedExecutionInstruction) {
          System.out.println("触发器执行完毕：" + trigger.getKey().getName());
      }
  }
  ```

- 注册测试

  ```java
  public class Myjob implements Job {
      @Override
      public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
          System.out.println("hello:" + LocalTime.now().toString());
      }
      public static void main(String[] args) throws SchedulerException {
  
  
          Scheduler scheduler = StdSchedulerFactory.getDefaultScheduler();
          JobDetail job = JobBuilder.newJob(Myjob.class)
                  .withIdentity("myjob","group1")
                  .build();
          Trigger trigger = TriggerBuilder.newTrigger()
                  .withIdentity("trigger","group1")
                  .startNow()
                  .withSchedule(SimpleScheduleBuilder.simpleSchedule()
                          .withIntervalInSeconds(1)
                          .withRepeatCount(3))
                  .build();
          scheduler.scheduleJob(job,trigger);
          //注册全局
  //        scheduler.getListenerManager().addTriggerListener(new MyTriggerListener(),EverythingMatcher.allTriggers());
          //注册局部
          scheduler.getListenerManager().addTriggerListener(new MyTriggerListener()
                  ,KeyMatcher.keyEquals(TriggerKey.triggerKey("trigger","group1")));
          scheduler.start();
  
      }
  }
  
  ```



## Springboot2.0整合Quartz

### 创建项目，增加依赖

```
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-quartz</artifactId>
</dependency>
```

### 创建Job类型

- 实现Job接口

- 继承QuartzJobBean

  ```java
  //=============实现Job接口==============
  public class SimpleHelloJob implements Job {
      @Autowired
      BusinessService jobService;
      @Override
      public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
          System.out.println("hello," + LocalTime.now().toString()
                  + "," + jobExecutionContext.getJobDetail());
          jobService.doSomething();
      }
  }
  
  //=============继承QuartzJobBean===========
  public class SimpleQuartzBean extends QuartzJobBean {
  
      @Autowired
      BusinessService businessService;
      @Override
      protected void executeInternal(JobExecutionContext jobExecutionContext) throws JobExecutionException {
          System.out.println("==QuartzJobBean==" + jobExecutionContext.getJobDetail());
          businessService.doSomething();
      }
  }
  ```

  

### 创建配置QuartzConfig

```Java
@Configuration
public class QuartzConfig {
    @Bean
    public JobDetail myJobDetail(){
        JobDetail jobDetail = JobBuilder.newJob(SimpleQuartzBean.class)
                .withIdentity("myJob1","myJobGroup1")
                //JobDataMap可以给任务execute传递参数
                .usingJobData("job_param","job_param1")
                .storeDurably()
                .build();
        return jobDetail;
    }
    @Bean
    public Trigger myTrigger(){
        Trigger trigger = TriggerBuilder.newTrigger()
                .forJob(myJobDetail())
                .withIdentity("myTrigger1","myTriggerGroup1")
                .usingJobData("job_trigger_param","job_trigger_param1")
                .startNow()
                .withSchedule(CronScheduleBuilder.cronSchedule("0/2 * * * * ? 2021"))
                .build();
        return trigger;
    }
}
```



### 使用Quartz完成数据库持久化（springboot）

- RAMJobStore ：RAM也就是内存，默认情况下Quartz会将任务调度存在内存中，这种方式性能是最好的，因为内存的速度是最快的。不好的地方就是数据缺乏持久性，但程序崩溃或者重新发布的时候，所有运行信息都会丢失
- JDBC作业存储：存到数据库之后，可以做单点也可以做集群，当任务多了之后，可以统一进行管理。关闭或者重启服务器，运行的信息都不会丢失。缺点就是运行速度快慢取决于连接数据库的快慢。

#### 添加依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<!--       一定要使用springboot的start依赖，
		否则需要自己配置SchedulerFactoryBean等  
		添加此依赖后，会启动自动配置  QuartzAutoConfiguration
-->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-quartz</artifactId>
</dependency>
<!--        mybatis以及mysql相关 ： 一定要添加-->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>6.0.6</version>
</dependency>

<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>2.1.4</version>
</dependency>
```



#### 数据库以及表创建

**sql语句位置**：jar包位置

![02sql语句位置](https://my-picture-aa.oss-cn-nanjing.aliyuncs.com/img/202308171833855.png)



#### application.yml配置文件

```yml
server:
  port: 8080
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/quartz?serverTimezone=Asia/Shanghai&useSSL=false
    username: root
    password: root
  quartz:
    job-store-type: jdbc  #设置保存到JDBC中※※※※※※※※※※※

mybatis:
  type-aliases-package: wanho.boot14.job.entity,wanho.boot14.job.vo
  mapper-locations: classpath:mapper/*.xml
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
pagehelper:
  helper-dialect: mysql
```



#### quartz.properties

名字不要修改（默认查找名字）

```properties
#在集群中每个实例都必须有一个唯一的instanceId，但是应该有一个相同的instanceName
org.quartz.scheduler.instanceName=bootScheduler
org.quartz.scheduler.instanceId=AUTO
#是否跳过Quartz版本更新检查。如果检查并且找到更新，
# 则会在Quartz的日志中报告它。生产部署要禁止
org.quartz.scheduler.skipUpdateCheck=false

#线程池的配置
#SimpleThreadPool这个线程池只是简单地在它的池中保持固定数量的线程，
# 不增长也不缩小。但是它非常健壮且经过良好的测试，差不多每个Quartz用户都使用这个池
org.quartz.threadPool.class=org.quartz.simpl.SimpleThreadPool
#最大线程数，意味着最多有多少个job可以同时执行
org.quartz.threadPool.threadCount=20
#线程优先级
org.quartz.threadPool.threadPriority=5
#线程上下文类加载器是否继承自初始线程的加载器
org.quartz.threadPool.threadsInheritContextClassLoaderOfInitializingThread=true

#集群配置
org.quartz.jobStore.isClustered=false
#org.quartz.jobStore.clusterCheckinInterval=15000
#org.quartz.jobStore.maxMisfiresToHandleAtATime=1
#org.quartz.jobStore.txIsolationLevelSerializable=true

#由quartz管理自己的事务
#org.quartz.jobStore.class=org.quartz.impl.jdbcjobstore.JobStoreTX
org.quartz.jobStore.acquireTriggersWithinLock=true
#超过这个时间还未触发的trigger，就被认为发生了misfire，默认60s。
# job成功触发叫fire，misfire就是未成功触发。
org.quartz.jobStore.misfireThreshold=12000
#JDBC代理类
org.quartz.jobStore.driverDelegateClass=org.quartz.impl.jdbcjobstore.StdJDBCDelegate
#数据库表前缀QRTZ_
org.quartz.jobStore.tablePrefix=qrtz_
```



#### 定义job

```java
public class PrintJob extends QuartzJobBean {
    @Override
    protected void executeInternal(JobExecutionContext jobExecutionContext) throws JobExecutionException {
        System.out.println("hello.quartz..........");
    }
}

```



#### 定义控制器

```java
@RestController
public class JobController {
    @Autowired
    private Scheduler scheduler;

    @RequestMapping(value = "/index", method = RequestMethod.GET)
    public void index() throws SchedulerException {
        //cron表达式
        CronScheduleBuilder cronScheduleBuilder = CronScheduleBuilder.cronSchedule("0/8 * * * * ?");
        //根据name 和group获取当前trgger 的身份
        TriggerKey triggerKey = TriggerKey.triggerKey("cj", "123");
        CronTrigger triggerOld = null;
        try {
            //获取 触发器的信息
            triggerOld = (CronTrigger) scheduler.getTrigger(triggerKey);
        } catch (SchedulerException e) {
            e.printStackTrace();
        }
        if (triggerOld == null) {
            //将job加入到jobDetail中
            JobDetail jobDetail = JobBuilder.newJob(PrintJob.class).withIdentity("cj", "123").build();
            Trigger trigger = TriggerBuilder.newTrigger().withIdentity("cj","123").withSchedule(cronScheduleBuilder).build();
            //执行任务
            scheduler.scheduleJob(jobDetail, trigger);
        } else {
            System.out.println("当前job已存在--------------------------------------------");
        }
    }


    //未测试
    @PostMapping("/removeJob")
    public void removeJob(String jobName,String jobGroupName,String triggerGroupName) {
        TriggerKey triggerKey = TriggerKey.triggerKey(
                jobName, triggerGroupName);
        JobKey jobKey = JobKey.jobKey(jobName, jobGroupName);
        try {

            Trigger trigger = (Trigger) scheduler.getTrigger(triggerKey);
            if (trigger == null) {
                return;
            }
            scheduler.pauseTrigger(triggerKey);;// 停止触发器
            scheduler.unscheduleJob(triggerKey);// 移除触发器
            scheduler.deleteJob(jobKey);// 删除任务
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}
```





# 四：Spring Task介绍

## 基于注解(@Scheduled)的简单定时器

Spring中使用Spring task的方式，可以参考`https://www.cnblogs.com/qlqwjy/p/9960706.html`

Springboot2.0使用Task的方式：

- 创建Task类

  ```java
  @Component
  public class HelloTask {
      //fixedRate： 上一次 启动时间点之后 X秒执行一次
      //fixedDelay： 上一次 结束时间点之后 每X秒执行一次
      //initialDelay： 第一次延迟 X秒执行，之后按照fixedRate的规则每X秒执行
      @Scheduled(cron = "0/2 * * * * ?")
      public void hello(){
          System.out.println("Hello," + LocalTime.now().toString());
      }
  }
  ```

- 修改主类，增加注解`@EnableScheduling`

  ```
  @SpringBootApplication
  @EnableScheduling
  public class SpringtaskApplication {
      public static void main(String[] args) {
          SpringApplication.run(SpringtaskApplication.class, args);
      }
  
  }
  ```





## 基于接口SchedulingConfigurer的动态定时任务

### 定义数据库表

```sql
SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `job_details`
-- ----------------------------
DROP TABLE IF EXISTS `job_details`;
CREATE TABLE `job_details` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '编号',
  `bean_name` varchar(30) NOT NULL DEFAULT '0' COMMENT 'bean名称',
  `class_name` varchar(100) NOT NULL COMMENT '全类名',
  `method_name` varchar(30) NOT NULL COMMENT '方法名',
  `method_params` varchar(50) DEFAULT NULL COMMENT '方法参数',
  `cron_expression` varchar(20) NOT NULL COMMENT 'cron表达式',
  `remark` varchar(100) DEFAULT NULL COMMENT '备注',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除(1:已删除，0:未删除)',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC COMMENT='借款信息表';


```

### 利用mybatis-plus生成entity，mapper，service

### SpringContextUtils：获取容器中的bean

需要实现org.springframework.context.ApplicationContextAware接口

```java
@Component
public class SpringContextUtils implements ApplicationContextAware {
    public  static ApplicationContext applicationContext;
    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }

    public static  Object getBean(String name) {
        return applicationContext.getBean(name);
    }

    public static  <T> T getBean(Class<T> type) {
        return applicationContext.getBean(type);
    }

    public static boolean containsBean(String name) {
        return applicationContext.containsBean(name);
    }
    public static boolean isSingleTon(String name) {
        return applicationContext.isSingleton(name);
    }
}

```

### JobConfiguration：注入TaskScheduler对象

```java
@Configuration
public class JobConfiguration {
    @Bean("taskScheduler")
    public TaskScheduler taskScheduler(){
        ThreadPoolTaskScheduler taskScheduler = new ThreadPoolTaskScheduler();
        taskScheduler.setRemoveOnCancelPolicy(true);
        taskScheduler.setThreadNamePrefix("schedulerThreadPool-");
        taskScheduler.setPoolSize(5);
        return taskScheduler;
    }
}
```

### ScheduledTask：用于存储JobRunnable和触发器绑定后的对象

```java
import org.springframework.lang.Nullable;
import java.util.concurrent.ScheduledFuture;

public class ScheduledTask {
    @Nullable
    volatile ScheduledFuture<?> future;

    public void cancel() {
        ScheduledFuture<?> future = this.future;
        if (future != null) {
            future.cancel(true);
        }
    }
}
```



### 创建SchedulingConfigurer的实现类，动态管理定时任务

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.config.CronTask;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class MySchedulerConfigurer implements SchedulingConfigurer {
    //存储定义任务，用于取消处理
    private final Map<Runnable,ScheduledTask> map = new ConcurrentHashMap<>();
    @Autowired
    TaskScheduler taskScheduler;
    @Override
    public void configureTasks(ScheduledTaskRegistrar registrar) {
        registrar.setScheduler(taskScheduler);

    }

    /**
     * 增加Job  Runnable
     * @param task
     * @param cronExpression
     */
    public void addCronTask(Runnable task,String cronExpression){
        CronTask cronTask = new CronTask(task,cronExpression);
        //重复的情况下如何处理
        this.map.put(task,scheduledCronTask(cronTask));
    }

    /**
     * 取消JOB任务
     * @param runnable
     */
    public void cancalCronTask(Runnable runnable) {
        //从列表当中移除
        ScheduledTask task = this.map.remove(runnable);
        if (task != null) {
            task.cancel();
        }
    }

    //组件定时任务对象
    private ScheduledTask scheduledCronTask(CronTask task){
        ScheduledTask scheduledTask = new ScheduledTask();
        scheduledTask.future = this.taskScheduler.schedule(task.getRunnable(),task.getTrigger());
        return scheduledTask;
    }
}


```



### 定义一个具体执行定时任务的类JobRunnable

```java
//如何能从容器中获得对应的Job的Bean对象
// 通过SpringContextUtils获取bean的名称
package com.hyy.springtask2;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StringUtils;

import java.lang.reflect.Method;
import java.util.Objects;

public class JobRunnable implements Runnable {
    private static final Logger logger = LoggerFactory.getLogger(JobRunnable.class);
    private String beanName;
    private String methodName;
    private String params;

    public JobRunnable(String beanName, String methodName) {
        this(beanName, methodName, null);
    }

    public JobRunnable(String beanName, String methodName, String params) {
        this.beanName = beanName;
        this.methodName = methodName;
        this.params = params;
    }

    @Override
    public void run() {
        logger.info("定时任务开始执行 - bean：{}，方法：{}，参数：{}", beanName, methodName, params);
        long startTime = System.currentTimeMillis();
        try {
            Object target = SpringContextUtils.getBean(beanName);
            Method method = null;
            
            if (StringUtils.isEmpty(params)) {
                method = target.getClass().getDeclaredMethod(methodName);
                method.setAccessible(true);
                method.invoke(target);
            } else {
                method = target.getClass().getDeclaredMethod(methodName, String.class);
                method.setAccessible(true);
                method.invoke(target, params);
            }

        } catch (Exception ex) {
            logger.error(String.format("定时任务执行异常 - bean：%s，方法：%s，参数：%s "
                    , beanName, methodName, params), ex);
        }
        long times = System.currentTimeMillis() - startTime;
        logger.info("定时任务执行结束 - bean：{}，方法：{}，参数：{}，耗时：{} 毫秒"
                , beanName, methodName, params, times);

    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        JobRunnable that = (JobRunnable) o;
        if (params == null) {
            return beanName.equals(that.beanName) &&
                    methodName.equals(that.methodName) &&
                    that.params == null;
        }

        return beanName.equals(that.beanName) &&
                methodName.equals(that.methodName) &&
                params.equals(that.params);
    }

    @Override
    public int hashCode() {
        if (params == null) {
            return Objects.hash(beanName, methodName);
        }

        return Objects.hash(beanName, methodName, params);
    }
}
```



### JobStartRunner：实现CommandLineRunner接口

实现CommandLineRunner接口的对象，放入spring容器后，如果容器启动后，就开始执行此Runner的run方法

```java
@Service
public class JobStartRunner implements CommandLineRunner {

    @Resource
    JobDetailMapper jobDetailMapper;

    @Autowired
    MySchedulerConfigurer mySchedulerConfigurer;

    @Override
    public void run(String... args) throws Exception {
        //从数据库读取实际的任务数据
        List<JobDetail> jobDetailList = jobDetailMapper.selectList(null);
        JobRunnable jobRunnable;
        for (JobDetail jobDetail : jobDetailList) {
            jobRunnable = new JobRunnable(jobDetail.getBeanName()
                        ,jobDetail.getBeanClassName()
                        ,jobDetail.getMethodName()
                        ,jobDetail.getArguments() )  ;
            mySchedulerConfigurer.addCronTask(jobRunnable,jobDetail.getCronexpression());
        }
    }
}
```



### 增加数据并测试

#### 创建Job业务类

```java
@Component  //spring容器来管理
public class DemoTask1 {
    public void sayHello(){
        System.out.println("hello spring task");
    }
}
```

#### 数据库表插入数据

```mysql
-- ----------------------------
-- Records of job_details
-- ----------------------------
INSERT INTO `job_details` VALUES ('1', 'demoTask1', 'wanho.commons.job.DemoTask1', 'taskWithoutParam', null, '0/4 * * * * ?', '222', '2021-12-02 00:13:54', '2021-12-02 00:14:07', '0');
```



### 控制器管理JOB任务

```Java
@RestController
@RequestMapping("/admin/core/jobDetail")
public class JobDetailController {

    @Autowired
    MySchedulerConfigurer mySchedulerConfigurer;

    @Autowired
    IJobDetailService iJobDetailService;

    @GetMapping("/list")
    public AjaxResult getList(){
        List<JobDetail> list = iJobDetailService.list();
        return AjaxResult.ok("获取数据成功",list);
    }


    @DeleteMapping("/remove/{id}")
    public AjaxResult remove(@PathVariable  int  id){
        JobDetail jobDetail =iJobDetailService.getById(id);
        //取消（移除）Job
        JobRunnable jobRunnable = new JobRunnable(jobDetail.getBeanName()
                ,jobDetail.getBeanClassName()
                ,jobDetail.getMethodName(),jobDetail.getArguments());
        mySchedulerConfigurer.cancalCronTask(jobRunnable);

        //修改数据库
        iJobDetailService.removeById(id);
        return AjaxResult.ok("删除成功");

    }

    @PostMapping("/save")
    public AjaxResult save(@RequestBody JobDetail jobDetail){
        //先做beanName，beanClassName，Method的验证
        // 验证通过，保存数据，增加JOB
        // 验证不通过，直接会 bean内容不合理，请确认
        //保存数据
        boolean flag = iJobDetailService.save(jobDetail);
        //
        if (flag) {
            JobRunnable jobRunnable = new JobRunnable(jobDetail.getBeanName()
                    ,jobDetail.getBeanClassName()
                    ,jobDetail.getMethodName(),jobDetail.getArguments());
            mySchedulerConfigurer.addCronTask(jobRunnable,jobDetail.getCronexpression());
            return AjaxResult.ok("保存成功");
        }
        return AjaxResult.ok("保存失败");
    }

    @GetMapping("/get/{id}")
    public AjaxResult getById(@PathVariable  int  id){
        JobDetail jobDetail = iJobDetailService.getById(id);
        return AjaxResult.ok("获取数据",jobDetail);
    }

    @PutMapping("/update")
    public AjaxResult updateById(@RequestBody JobDetail jobDetail){
        //获取原有信息，先移除旧的JOB
        //增加新的JOB
        return AjaxResult.ok("更新成功");
    }

}
```

