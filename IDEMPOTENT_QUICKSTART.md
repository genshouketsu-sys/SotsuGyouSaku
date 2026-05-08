# 幂等性系统 - 快速参考卡

## 🎯 快速开始 (30 秒)

### 后端：添加注解
```java
@PostMapping("/api/order")
@Idempotent(timeout = 3000)  // 就这么简单！
public Order createOrder(@RequestBody Order order) {
    return orderService.create(order);
}
```

### 前端：传递 Token
```javascript
// 1. 生成 UUID
const token = crypto.randomUUID();

// 2. 在 Header 中传递
fetch('/api/order', {
    method: 'POST',
    headers: { 'Idempotent-Token': token },
    body: JSON.stringify(orderData)
});

// 3. 处理 409 冲突
if (response.status === 409) { 
    showWarning('请勿重复提交');
}
```

---

## 📋 三种策略对比

### 1️⃣ TOKEN 策略 (推荐)
```java
@Idempotent(strategy = IdempotentStrategy.TOKEN)
// 前端必须在 Header 中传递 Idempotent-Token
// 用于: 表单提交、创建操作
```

### 2️⃣ USER_ID 策略
```java
@Idempotent(strategy = IdempotentStrategy.USER_ID)
// 自动基于当前认证用户 + 参数
// 用于: 转账、支付等金融操作
```

### 3️⃣ PARAM_HASH 策略
```java
@Idempotent(strategy = IdempotentStrategy.PARAM_HASH)
// 自动基于方法参数
// 用于: 库存扣减、数据同步
```

---

## 🔧 常用配置

```java
// 最小配置（使用默认值）
@Idempotent
public void operation() { }

// 完整配置
@Idempotent(
    strategy = IdempotentStrategy.TOKEN,    // 策略
    timeout = 5000,                          // 超时 5秒
    message = "操作进行中，请勿重复提交",     // 错误消息
    delAfterSuccess = true,                  // 成功后删除记录
    keyPrefix = "custom"                     // 自定义前缀
)
public void operation() { }
```

---

## 📱 前端使用示例

### React
```javascript
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (data) => {
    if (isLoading) return;  // 防止多次点击
    setIsLoading(true);
    
    const token = crypto.randomUUID();
    try {
        const res = await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Idempotent-Token': token },
            body: JSON.stringify(data)
        });
        
        if (res.status === 409) {
            alert('请勿重复提交');
            return;
        }
        alert('成功');
    } finally {
        setIsLoading(false);
    }
};
```

### Vue
```javascript
const handleSubmit = async () => {
    const token = this.generateUUID();
    this.isSubmitting = true;
    
    try {
        const response = await this.$http.post('/api/submit', 
            this.form,
            { headers: { 'Idempotent-Token': token } }
        );
    } catch (error) {
        if (error.response?.status === 409) {
            this.$message.warn('请勿重复提交');
        }
    } finally {
        this.isSubmitting = false;
    }
};

generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
```

---

## 🚀 后端使用示例

### 创建订单
```java
@PostMapping("/orders")
@Idempotent(strategy = IdempotentStrategy.TOKEN)
public ResponseEntity<Order> createOrder(@RequestBody OrderRequest req) {
    Order order = orderService.create(req);
    return ResponseEntity.created(URI.create("/orders/" + order.getId()))
                        .body(order);
}
```

### 转账
```java
@PostMapping("/transfer")
@Idempotent(strategy = IdempotentStrategy.USER_ID, timeout = 5000)
public ResponseEntity<TransferResult> transfer(@RequestBody TransferRequest req) {
    TransferResult result = financeService.transfer(req);
    return ResponseEntity.ok(result);
}
```

### 库存扣减
```java
@PostMapping("/inventory/deduct")
@Idempotent(strategy = IdempotentStrategy.PARAM_HASH, timeout = 2000)
public ResponseEntity<Boolean> deductStock(@RequestBody StockRequest req) {
    boolean success = inventoryService.deduct(req.getProductId(), req.getQuantity());
    return ResponseEntity.ok(success);
}
```

---

## 🔍 错误处理

### 409 响应示例
```json
{
    "code": "DUPLICATE_SUBMIT",
    "message": "请勿重复提交，操作正在处理中",
    "status": 409,
    "timestamp": "2025-05-07T10:30:45.123456",
    "path": "/api/orders"
}
```

### 前端处理
```javascript
const safePost = async (url, data, token = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Idempotent-Token'] = token;
    
    const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
    });
    
    if (res.status === 409) {
        throw new Error('操作正在处理中，请勿重复提交');
    }
    
    if (!res.ok) {
        throw new Error(`请求失败: ${res.status}`);
    }
    
    return res.json();
};
```

---

## ⏱️ 超时时间建议

| 场景 | 推荐超时 | 说明 |
|------|--------|------|
| 快速操作 | 1000ms | 表单验证、简单查询 |
| 标准操作 | 3000ms | 创建、更新操作（默认） |
| 金融操作 | 5000ms | 转账、支付操作 |
| 长耗时操作 | 30000ms+ | 批量导入、报表生成 |

---

## ✅ 检查清单

部署前检查：

- [ ] @Idempotent 注解已添加到关键方法
- [ ] 前端正确生成并传递 Token
- [ ] Redis 配置正确（见 IDEMPOTENT_CONFIG.md）
- [ ] 启用了 Spring AOP 支持
- [ ] 异常处理已就位
- [ ] 日志级别已配置
- [ ] 测试用例已通过
- [ ] 文档已更新

---

## 🐛 快速排查

### 问题：幂等性未生效
```
❌ 症状：同样的请求多次成功
✅ 检查：
  1. 是否添加了 @Idempotent 注解？
  2. Redis 是否运行？ redis-cli ping
  3. 是否启用了 AOP？
  4. 查看日志是否有错误？
```

### 问题：收到 409 错误
```
❌ 症状：频繁提示"请勿重复提交"
✅ 检查：
  1. Token 是否重复使用？
  2. 超时时间是否过短？
  3. 是否修改了参数？
  4. 增加超时时间重试
```

### 问题：Redis 连接失败
```
❌ 症状：应用无法启动或功能异常
✅ 检查：
  1. Redis 服务是否运行？
  2. connection.properties 配置是否正确？
  3. 防火墙是否允许 6379 端口？
  4. 查看日志中的 Redis 错误
✅ 自动降级：
  - 系统自动降级到本地缓存
  - 单机部署仍能正常工作
```

---

## 📊 Redis 命令速查

```bash
# 查看所有幂等性键
redis-cli KEYS "idempotent:*"

# 查看特定键的值
redis-cli GET "idempotent:token:xxx"

# 查看键的剩余 TTL
redis-cli TTL "idempotent:token:xxx"

# 查看 Redis 统计信息
redis-cli INFO stats

# 清除所有幂等性键（谨慎！）
redis-cli EVAL "return redis.call('del', unpack(redis.call('keys', ARGV[1])))" 0 "idempotent:*"
```

---

## 🎓 核心概念

### 幂等性
多次执行同一操作产生相同的结果，就像只执行一次一样。

### 防重复提交
防止用户因网络延迟、误操作等原因导致同一操作被提交多次。

### 分布式锁
基于 Redis 的轻量级锁，标记某个操作正在进行中。

### Token 机制
前端生成的唯一标识，确保每个请求都是独立的。

---

## 📚 详细文档

- **完整指南** → [IDEMPOTENT_GUIDE.md](IDEMPOTENT_GUIDE.md)
- **配置说明** → [IDEMPOTENT_CONFIG.md](IDEMPOTENT_CONFIG.md)
- **项目说明** → [IDEMPOTENT_README.md](IDEMPOTENT_README.md)
- **源代码** → `src/main/java/com/wms/wmsbackend/`
- **测试代码** → `src/test/java/com/wms/wmsbackend/`
- **使用示例** → `example/IdempotentExampleController.java`

---

## 💡 最佳实践

✅ **DO**
```javascript
// ✅ 每个请求生成新 Token
const token = crypto.randomUUID();

// ✅ 在 Header 中传递
headers: { 'Idempotent-Token': token }

// ✅ 处理 409 响应
if (response.status === 409) { ... }

// ✅ 网络重试使用相同 Token
```

❌ **DON'T**
```javascript
// ❌ 重复使用 Token
const token = "fixed-token";

// ❌ 在 URL 中传递
fetch(`/api/order?token=${token}`)

// ❌ 为 GET 请求添加幂等性
@GetMapping("/list") @Idempotent

// ❌ 忽略 409 响应
```

---

## 🚀 部署命令

```bash
# 本地开发
mvn clean spring-boot:run

# 构建
mvn clean package -DskipTests

# 运行 Jar
java -jar target/wms-backend-0.0.1-SNAPSHOT.jar

# Docker 部分
docker-compose up

# 运行测试
mvn test -Dtest=IdempotentAspectTests
```

---

**最后更新**: 2025-05-07  
**版本**: 1.0.0  
**状态**: ✅ 生产就绪
