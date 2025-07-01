### 〇、我用的
	自定义类实现 `ApplicationListener<ContextRefreshedEvent>`，重写onApplicationEvent 方法。

在 Spring Boot 应用启动时自动执行 HTTP 请求（例如调用外部接口、初始化数据或预加载资源），可以通过利用 Spring 的​**​生命周期回调机制​**​实现。以下是具体实现方式和场景说明：

### ​一、核心实现方式​​

Spring Boot 提供了多种组件生命周期回调接口或注解，可在应用启动的不同阶段触发代码执行。针对“启动时执行 HTTP 请求”的需求，常用以下方案：

#### ​​1. 使用`CommandLineRunner` 或 `ApplicationRunner`​​

这两个接口的作用是在 ​**​Spring 应用上下文完全初始化后、主线程结束前​**​ 执行代码（此时嵌入式 Servlet 容器已启动）。适合需要在应用启动完成后立即执行的场景（如调用外部服务初始化数据）。

##### ​**​实现步骤​**​

- ​**​步骤 1​**​：定义一个 Bean 实现 `CommandLineRunner` 或 `ApplicationRunner`。
- ​**​步骤 2​**​：在 `run` 方法中编写 HTTP 请求逻辑（使用 `RestTemplate`、`WebClient` 等客户端）。
- ​**​步骤 3​**​：通过 `@Order` 注解指定执行顺序（多个 Bean 时生效）。

​**​示例代码（使用 `CommandLineRunner`）：​**​

```java fold FOLD
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class ContextRefreshedListener implements ApplicationListener<ContextRefreshedEvent> {

    private final RestTemplate restTemplate;

    public ContextRefreshedListener(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        // 注意：避免在 Root ApplicationContext 时重复执行（可能触发多次）
        if (event.getApplicationContext().getParent() == null) {
            String url = "https://api.example.com/init";
            String response = restTemplate.getForObject(url, String.class);
            System.out.println("上下文刷新完成，执行 HTTP 请求结果：" + response);
        }
    }
}
```

​**​关键说明：​**​

- `CommandLineRunner` 的 `run` 方法参数是 `String[] args`（可获取启动命令行参数）。
- `ApplicationRunner` 的 `run` 方法参数是 `ApplicationArguments`（支持更灵活的参数解析，如 `--key=value`）。

#### ​**​2. 使用 `ApplicationListener<ContextRefreshedEvent>`​**​

此方式监听 Spring 上下文刷新完成的事件（`ContextRefreshedEvent`），在 ​**​整个应用上下文初始化完成后​**​ 触发（早于 `CommandLineRunner`，但此时 Servlet 容器可能尚未完全启动）。

##### ​**​实现步骤​**​

- ​**​步骤 1​**​：定义一个 Bean 实现 `ApplicationListener<ContextRefreshedEvent>`。
- ​**​步骤 2​**​：在 `onApplicationEvent` 方法中编写 HTTP 请求逻辑。
- 
​**​示例代码：​**​
```java fold fold
import org.springframework.stereotype.Component;
import javax.annotation.PostConstruct;
import org.springframework.web.client.RestTemplate;

@Component
public class InitService {

    private final RestTemplate restTemplate;

    public InitService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @PostConstruct
    public void init() {
        String url = "https://api.example.com/init-config";
        String config = restTemplate.getForObject(url, String.class);
        System.out.println("Bean 初始化时加载配置：" + config);
    }
}
```

​**​注意事项：​**​

- `ContextRefreshedEvent` 可能在父子上下文中多次触发（如 Spring Boot 的 `DispatcherServlet` 上下文），需通过 `getParent() == null` 过滤根上下文。

#### ​**​3. 使用 `@PostConstruct` 注解​**​

`@PostConstruct` 注解标记的方法会在 ​**​Bean 初始化完成后立即执行​**​（早于 `CommandLineRunner` 和上下文刷新事件）。适合在单个 Bean 初始化时触发关联的 HTTP 请求（如初始化某个服务前调用外部配置）。

##### ​**​实现步骤​**​

- ​**​步骤 1​**​：在 Bean 的方法上添加 `@PostConstruct` 注解。
- ​**​步骤 2​**​：在方法中编写 HTTP 请求逻辑。

​**​示例代码：​**​

```java fold fold
import org.springframework.stereotype.Component;
import javax.annotation.PostConstruct;
import org.springframework.web.client.RestTemplate;

@Component
public class InitService {

    private final RestTemplate restTemplate;

    public InitService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @PostConstruct
    public void init() {
        String url = "https://api.example.com/init-config";
        String config = restTemplate.getForObject(url, String.class);
        System.out.println("Bean 初始化时加载配置：" + config);
    }
}
```

​**​注意：​**​

- `@PostConstruct` 属于 JSR-250 规范，需确保类路径包含 `javax.annotation-api`（Spring Boot 已默认引入）。
- 执行时机早于 `CommandLineRunner`，适合 Bean 自身的初始化依赖外部数据。

### ​**​二、HTTP 客户端选择​**​

Spring Boot 推荐使用以下客户端发送 HTTP 请求（需添加对应依赖）：

| 客户端            | 特点                                                  | 适用场景         |
| -------------- | --------------------------------------------------- | ------------ |
| `RestTemplate` | 同步阻塞，简单易用（已标记为过时，推荐迁移至 `WebClient`）                 | 传统同步请求       |
| `WebClient`    | 非阻塞响应式，支持异步/流式（Spring WebFlux 核心组件，也可用于 Spring MVC） | 高并发、异步请求     |
| `OkHttp`       | 轻量高效，支持连接池和缓存                                       | 需要细粒度控制请求的场景 |
|                |                                                     |              |

#### ​**​示例：使用 `WebClient`（响应式客户端）​**​

```java fold
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
public class WebClientExample {

    private final WebClient webClient;

    public WebClientExample(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://api.example.com").build();
    }

    // 在 CommandLineRunner 中调用
    public Mono<String> fetchData() {
        return webClient.get()
                .uri("/init")
                .retrieve()
                .bodyToMono(String.class);
    }
}
```
​**​注意：​**​ 使用 `WebClient` 需添加依赖：

```xml 
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

### ​**​三、注意事项​**​

1. ​**​启动耗时​**​：HTTP 请求可能耗时较长，若请求阻塞会导致应用启动延迟。建议：
    
    - 对非关键请求异步执行（使用 `@Async` 注解 + 启用异步支持）。
    - 设置超时时间（如 `RestTemplate` 的 `setConnectTimeout`）。
2. ​**​依赖顺序​**​：确保 HTTP 客户端（如 `RestTemplate`）在 Spring 上下文初始化完成后可用（通过构造注入或 `@Autowired`）。
    
3. ​**​异常处理​**​：启动时的 HTTP 请求失败可能导致应用无法启动（默认行为）。可通过 `try-catch` 捕获异常并记录日志，避免阻塞启动：
    
```java fold
@Override
public void run(String... args) {
	try {
		// 执行 HTTP 请求
	} catch (Exception e) {
		System.err.println("启动时 HTTP 请求失败：" + e.getMessage());
		// 可选：抛出异常终止启动（根据业务需求）
		// throw new RuntimeException("初始化失败", e);
	}
}
```
4. ​**​生产环境验证​**​：在测试环境验证启动请求的稳定性，避免因外部服务不可用导致生产环境启动失败。

### ​四、总结​​

根据需求选择合适的生命周期回调方式：

- ​**​通用场景​**​：优先使用 `CommandLineRunner`（简单易用，支持顺序控制）。
- ​**​Bean 初始化依赖​**​：使用 `@PostConstruct`（单个 Bean 内部逻辑）。
- ​**​上下文全局事件​**​：使用 `ApplicationListener<ContextRefreshedEvent>`（需处理多上下文问题）。

结合异步执行和异常处理，可确保应用启动的稳定性和效率。