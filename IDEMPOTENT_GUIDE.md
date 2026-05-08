# 工业级幂等性防重系统 - 前端集成指南

## 概述

本系统采用自定义 `@Idempotent` 注解结合 Spring AOP 和 Redis，为 WMS 系统提供工业级的防重复提交保护。

## 核心特性

✅ **三种幂等性策略**
- `TOKEN`: 基于前端传递的唯一 Token（推荐用于表单防重）
- `USER_ID`: 基于认证用户 ID（适用于已登录的用户操作）
- `PARAM_HASH`: 基于参数内容（通用方案，无需额外参数）

✅ **分布式支持**
- 优先使用 Redis 进行分布式幂等性控制
- Redis 不可用时自动降级到本地缓存

✅ **灵活配置**
- 可配置超时时间（默认 3000ms）
- 支持自定义错误提示信息
- 支持自定义 Redis Key 前缀

✅ **异常处理**
- 返回 HTTP 409 Conflict 状态码
- 幂等性异常与业务异常分离处理

---

## 前端集成方案

### 方案1: TOKEN 策略（推荐）

**场景**: 创建订单、发布商品、提交表单等修改操作

**前端代码示例**:

```javascript
// 生成唯一的幂等性 Token
function generateIdempotentToken() {
    // 使用 UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// 创建订单
async function createOrder(orderData) {
    const token = generateIdempotentToken();
    
    try {
        const response = await fetch('/api/orders/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Idempotent-Token': token  // 关键：传递 Token
            },
            body: JSON.stringify(orderData)
        });

        if (response.status === 409) {
            // 幂等性冲突：请求正在处理中或已完成
            console.warn('请勿重复提交');
            return;
        }

        return await response.json();
    } catch (error) {
        console.error('请求失败:', error);
    }
}
```

**使用示例**:

```javascript
// 用户点击"创建订单"按钮时
const orderData = {
    productId: 'PROD-001',
    quantity: 5,
    totalPrice: 199.99
};

const result = await createOrder(orderData);
console.log('订单已创建:', result);
```

---

### 方案2: USER_ID 策略

**场景**: 转账、提现等已认证用户的金融操作

**前端代码示例**:

```javascript
// 转账操作
async function transferMoney(toUserId, amount) {
    try {
        const response = await fetch('/api/finance/transfer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`  // JWT Token
            },
            body: JSON.stringify({ toUserId, amount })
        });

        if (response.status === 409) {
            alert('转账正在处理中，请稍候');
            return;
        }

        return await response.json();
    } catch (error) {
        console.error('转账失败:', error);
    }
}

// 获取保存的 JWT Token
function getToken() {
    return localStorage.getItem('jwt_token');
}
```

---

### 方案3: PARAM_HASH 策略

**场景**: 库存扣减、数据同步等操作

**前端代码示例**:

```javascript
// 库存扣减（不需要额外传递 Token）
async function deductStock(productId, quantity) {
    try {
        const response = await fetch('/api/inventory/deduct', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, quantity })
        });

        if (response.status === 409) {
            console.warn('库存操作正在处理中');
            return;
        }

        return await response.json();
    } catch (error) {
        console.error('库存扣减失败:', error);
    }
}
```

---

## 错误处理

### 409 Conflict 响应示例

```json
{
    "code": "DUPLICATE_SUBMIT",
    "message": "请勿重复提交，操作正在处理中",
    "status": 409,
    "timestamp": "2025-05-07T10:30:45.123",
    "path": "/api/orders/create"
}
```

### 前端错误处理

```javascript
async function safeApiCall(url, options = {}) {
    try {
        const response = await fetch(url, options);
        
        if (response.status === 409) {
            // 处理幂等性冲突
            const error = await response.json();
            showWarning(error.message);  // "请勿重复提交"
            return null;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API 调用失败:', error);
        throw error;
    }
}
```

---

## 后端集成示例

### 在控制器方法上使用注解

```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    // 基于 TOKEN 的幂等性防重
    @PostMapping("/create")
    @Idempotent(
        strategy = Idempotent.IdempotentStrategy.TOKEN,
        timeout = 5000,
        message = "订单正在创建中，请勿重复提交"
    )
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request) {
        // 业务逻辑
        Order order = orderService.create(request);
        return ResponseEntity.ok(order);
    }

    // 基于参数的幂等性防重
    @PostMapping("/deduct-stock")
    @Idempotent(
        strategy = Idempotent.IdempotentStrategy.PARAM_HASH,
        timeout = 3000
    )
    public ResponseEntity<?> deductStock(@RequestBody StockRequest request) {
        // 业务逻辑
        boolean success = inventoryService.deduct(request.getProductId(), request.getQuantity());
        return ResponseEntity.ok(success);
    }
}
```

---

## 架构设计

### 工作流程

```
请求到达
    ↓
IdempotentAspect 拦截
    ↓
根据策略生成幂等性 Key
    ├─ TOKEN: 从 Header 中获取
    ├─ USER_ID: 基于认证用户
    └─ PARAM_HASH: 基于参数 Hash
    ↓
检查 Redis 中是否存在 Key
    ├─ 存在 → 抛出 IdempotentException (409)
    └─ 不存在 → 继续
    ↓
设置 Redis Key（带过期时间）
    ↓
执行业务逻辑
    ↓
根据配置删除或保留 Key
    ↓
返回响应
```

### Redis 键结构

```
idempotent:token:{base64(sha256(token))}
idempotent:user:{base64(sha256(userId:method:paramHash))}
idempotent:param:{base64(sha256(method:paramHash))}
```

---

## 最佳实践

### ✅ DO - 应该做

1. **为每个 API 请求生成新 Token**
   ```javascript
   const token = generateUUID();  // 每次请求都生成
   ```

2. **在网络请求重试时重用同一 Token**
   ```javascript
   // 第一次请求失败后重试，使用相同的 Token
   const token = generateUUID();
   for (let i = 0; i < maxRetries; i++) {
       try {
           return await apiCall(url, { token });
       } catch (error) {
           if (i < maxRetries - 1) continue;
           throw error;
       }
   }
   ```

3. **根据业务场景选择合适的策略**
   - 前端防重 → TOKEN 策略
   - 认证用户操作 → USER_ID 策略
   - 同步类操作 → PARAM_HASH 策略

4. **为长操作设置较长的超时时间**
   ```java
   @Idempotent(timeout = 30000)  // 30秒用于批量导入
   ```

### ❌ DON'T - 不应该做

1. **重用多个请求的 Token**
   ```javascript
   // ❌ 错误：多个请求用同一个 Token
   const token = "fixed-token";
   await api1(token);
   await api2(token);
   ```

2. **在幂等性超时前删除缓存**
   ```javascript
   // ❌ 不要这样做
   setTimeout(() => {
       removeIdempotentToken(token);  // 不必要
   }, 1000);
   ```

3. **为 GET 请求添加幂等性防重**
   ```java
   // ❌ 错误：GET 是幂等的，不需要防重
   @GetMapping("/list")
   @Idempotent
   public List<Item> getItems() { ... }
   ```

---

## 性能考虑

- **Redis 延迟**: 通常 < 1ms，极大降低幂等性检查的性能开销
- **本地缓存降级**: 当 Redis 不可用时自动降级，保证系统可用性
- **超时清理**: Redis 自动过期，本地缓存定期清理，避免内存泄漏

---

## 故障排查

### 问题1: 频繁收到 409 错误

**原因**: Token 重复使用或超时时间过短
**解决**: 每个请求生成新 Token，增加超时时间

### 问题2: Redis 连接失败

**表现**: 自动降级到本地缓存，系统继续运行
**检查**: 
```bash
redis-cli ping  # 应返回 PONG
```

### 问题3: 幂等性未生效

**检查清单**:
1. 是否在方法上添加了 @Idempotent 注解
2. 是否使用了正确的策略
3. 是否正确传递了 Token/认证信息
4. 是否启用了 Spring AOP 支持

---

## 配置建议

| 操作类型 | 策略 | 超时时间 | delAfterSuccess |
|---------|------|--------|-----------------|
| 表单提交 | TOKEN | 3000ms | true |
| 金融转账 | USER_ID | 5000ms | false |
| 库存扣减 | PARAM_HASH | 2000ms | false |
| 批量导入 | TOKEN | 30000ms | false |
| 快速操作 | TOKEN | 1000ms | true |

---

## 相关文件

- 注解定义: `annotation/Idempotent.java`
- AOP 实现: `aspect/IdempotentAspect.java`
- 工具类: `util/IdempotentUtil.java`
- 异常处理: `exception/IdempotentException.java`, `exception/GlobalExceptionHandler.java`
- 使用示例: `example/IdempotentExampleController.java`
