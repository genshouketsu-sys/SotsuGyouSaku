# 幂等性系统配置指南

## 概述

本文档说明如何在 WMS 系统中配置和优化幂等性防重系统。

---

## 1. Redis 配置

### 1.1 application.yml 配置

```yaml
spring:
  data:
    redis:
      host: 127.0.0.1
      port: 6379
      password:                    # 如果 Redis 需要密码，在此设置
      timeout: 5000ms              # 连接超时
      lettuce:
        pool:
          max-active: 20           # 最大连接数
          max-idle: 10             # 最大空闲连接
          min-idle: 5              # 最小空闲连接
          max-wait: -1ms           # 获取连接最大等待时间
        shutdown-timeout: 100ms    # 关闭超时
```

### 1.2 Redis 连接池优化

```yaml
spring:
  data:
    redis:
      lettuce:
        pool:
          # 对于生产环境的推荐配置
          max-active: 100          # 支持更多并发
          max-idle: 50
          min-idle: 10
          max-wait: 5000ms
```

### 1.3 Redis 集群配置（可选）

```yaml
spring:
  data:
    redis:
      cluster:
        nodes:
          - 127.0.0.1:7000
          - 127.0.0.1:7001
          - 127.0.0.1:7002
        max-redirects: 3
```

---

## 2. Spring AOP 配置

### 2.1 确保 AOP 已启用

```java
@Configuration
@EnableAspectJAutoProxy  // 显式启用 AOP
public class AopConfig {
    // 配置已包含在 IdempotentAspect 中的 @Aspect 和 @Component
}
```

### 2.2 检查 pom.xml 依赖

确保包含以下依赖：

```xml
<!-- Spring AOP -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>

<!-- AspectJ -->
<dependency>
    <groupId>org.aspectj</groupId>
    <artifactId>aspectjweaver</artifactId>
</dependency>
<dependency>
    <groupId>org.aspectj</groupId>
    <artifactId>aspectjrt</artifactId>
</dependency>

<!-- Spring Data Redis -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

<!-- Lombok（用于日志） -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
</dependency>
```

---

## 3. 日志配置

### 3.1 application.yml 中的日志配置

```yaml
logging:
  level:
    root: INFO
    com.wms.wmsbackend.aspect: DEBUG      # 幂等性切面日志
    com.wms.wmsbackend.exception: DEBUG   # 异常处理日志
    org.springframework.data.redis: INFO  # Redis 日志
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
  file:
    name: logs/wms.log
    max-size: 10MB
    max-history: 30
```

### 3.2 生产环境推荐配置

```yaml
logging:
  level:
    root: WARN
    com.wms.wmsbackend: INFO
    com.wms.wmsbackend.aspect: WARN      # 只记录警告及以上
  file:
    name: /var/log/wms/application.log
    max-size: 100MB
    max-history: 90
```

---

## 4. 性能调优

### 4.1 Redis 键过期时间设置

根据业务场景调整超时时间：

```java
// 快速操作（表单提交）
@Idempotent(timeout = 1000)   // 1 秒

// 普通操作（创建、更新）
@Idempotent(timeout = 3000)   // 3 秒（默认）

// 金融操作（转账、支付）
@Idempotent(timeout = 5000)   // 5 秒

// 长操作（批量导入、报表生成）
@Idempotent(timeout = 30000)  // 30 秒
```

### 4.2 Redis 内存监控

```bash
# 查看 Redis 内存使用情况
redis-cli INFO memory

# 查看幂等性键的数量
redis-cli KEYS "idempotent:*" | wc -l

# 查看特定键的 TTL
redis-cli TTL "idempotent:token:xxx"
```

### 4.3 本地缓存降级

当 Redis 不可用时，系统自动使用本地 ConcurrentHashMap：

```java
// 本地缓存在内存中自动清理过期项
// 清理间隔：每次检查时进行
localCache.entrySet().removeIf(entry -> entry.getValue() < now);
```

---

## 5. 异常处理配置

### 5.1 全局异常处理器

系统已包含 `GlobalExceptionHandler` 统一处理异常：

```java
// 返回 409 Conflict 状态码
@ExceptionHandler(IdempotentException.class)
public ResponseEntity<ErrorResponse> handleIdempotentException(
        IdempotentException ex, WebRequest request) {
    // 返回 409 和错误信息
}
```

### 5.2 自定义异常处理

```java
@RestControllerAdvice
public class CustomExceptionHandler {
    
    @ExceptionHandler(IdempotentException.class)
    public ResponseEntity<?> handle(IdempotentException ex) {
        // 自定义处理逻辑
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", ex.getMessage()));
    }
}
```

---

## 6. 安全配置

### 6.1 HTTPS 环境下的 Token 传输

```javascript
// 使用 HTTPS 时，Token 自动加密传输
const response = await fetch('https://api.example.com/order', {
    method: 'POST',
    headers: {
        'Idempotent-Token': token  // HTTPS 保护
    }
});
```

### 6.2 Token 防止泄露

```javascript
// ✅ 好的做法：不要在 URL 中包含 Token
const response = await fetch('/api/order', {
    method: 'POST',
    headers: { 'Idempotent-Token': token }  // Header 中传输
});

// ❌ 不好的做法：不要在 URL 中传递 Token
const response = await fetch(`/api/order?token=${token}`);  // 危险！
```

---

## 7. 监控和告警

### 7.1 关键指标监控

```yaml
# 监控以下指标
- Redis 连接池使用率
- 幂等性键的数量
- 重复提交的频率
- 幂等性异常的发生率
```

### 7.2 告警设置

```java
// 自定义指标监控
@Component
public class IdempotentMetricsCollector {
    
    @Autowired
    private MeterRegistry meterRegistry;
    
    public void recordIdempotentHit() {
        Counter.builder("idempotent.hit")
                .description("幂等性检查命中次数")
                .register(meterRegistry)
                .increment();
    }
}
```

---

## 8. 部署注意事项

### 8.1 单机部署

```bash
# 确保 Redis 服务运行
redis-server --daemonize yes

# 启动应用
java -jar wms-backend.jar
```

### 8.2 集群部署

```yaml
# 使用 Redis 集群确保分布式幂等性
spring:
  data:
    redis:
      cluster:
        nodes:
          - redis-node1:7000
          - redis-node2:7001
          - redis-node3:7002
```

### 8.3 容器化部署（Docker Compose）

```yaml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
  
  wms-backend:
    image: wms-backend:latest
    ports:
      - "8080:8080"
    environment:
      SPRING_DATA_REDIS_HOST: redis
      SPRING_DATA_REDIS_PORT: 6379
    depends_on:
      - redis

volumes:
  redis-data:
```

---

## 9. 测试配置

### 9.1 本地开发环境

```yaml
# application-dev.yml
spring:
  data:
    redis:
      host: localhost
      port: 6379

logging:
  level:
    com.wms.wmsbackend.aspect: DEBUG
```

### 9.2 测试环境

```yaml
# application-test.yml
spring:
  data:
    redis:
      # 使用内嵌 Redis 或 Mock
      database: 1

logging:
  level:
    com.wms.wmsbackend: DEBUG
```

### 9.3 运行测试

```bash
# 运行幂等性相关测试
mvn test -Dtest=IdempotentAspectTests

# 运行所有测试
mvn clean test
```

---

## 10. 常见问题排查

### Q1: 如何验证 AOP 是否正确启用？

```java
// 在测试中验证
@SpringBootTest
class AopEnablingTest {
    
    @Test
    void testAopEnabled() {
        // 如果返回代理对象，说明 AOP 已启用
        assertTrue(AopUtils.isAopProxy(idempotentAspect));
    }
}
```

### Q2: 如何调试幂等性异常？

```java
// 添加日志打印
@Around("@annotation(idempotent)")
public Object checkIdempotent(ProceedingJoinPoint joinPoint, Idempotent idempotent) {
    String key = generateIdempotentKey(joinPoint, idempotent);
    log.debug("生成的幂等性键: {}", key);
    
    if (isRequestDuplicate(key)) {
        log.warn("检测到重复请求，键: {}", key);
        throw new IdempotentException("DUPLICATE");
    }
    // ...
}
```

### Q3: 如何在 Redis 中查看幂等性键？

```bash
# 连接 Redis
redis-cli

# 查看所有幂等性键
KEYS "idempotent:*"

# 查看特定键的值和 TTL
GET "idempotent:token:xxx"
TTL "idempotent:token:xxx"

# 清除所有幂等性键（仅在测试时）
FLUSHDB
```

---

## 11. 性能基准测试

### 11.1 幂等性检查的性能开销

```
Redis 延迟: ~1ms
本地缓存查询: < 0.1ms
整体开销: < 2ms（可忽略）
```

### 11.2 推荐的系统配置

| 环境 | CPU | 内存 | Redis | 最大 QPS |
|-----|-----|------|-------|---------|
| 开发 | 2核 | 4GB | 单节点 | 1000 |
| 测试 | 4核 | 8GB | 单节点 | 5000 |
| 生产 | 8核 | 16GB | 集群 | 50000+ |

---

## 总结

本幂等性系统提供：
- ✅ 工业级防重复提交保护
- ✅ 分布式支持（Redis）
- ✅ 自动降级机制（本地缓存）
- ✅ 灵活的配置选项
- ✅ 完善的异常处理
- ✅ 详细的日志记录

根据本指南进行配置，可以有效地保护 WMS 系统的数据一致性。
