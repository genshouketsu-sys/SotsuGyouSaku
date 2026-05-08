package com.wms.wmsbackend.example;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wms.wmsbackend.annotation.Idempotent;

/**
 * 幂等性使用示例 - 展示三种不同的幂等性策略
 *
 * 使用场景： 1. 创建订单、添加产品等修改操作 2. 支付、转账等金融操作 3. 库存扣减等库存操作
 */
@RestController
@RequestMapping("/api/examples")
public class IdempotentExampleController {

    /**
     * 示例1: 基于 TOKEN 的幂等性（推荐用于前端防重）
     *
     * 前端调用方式： - 生成唯一的 Token (UUID) - 在 HTTP Header 中传递: Idempotent-Token:
     * {token} - 同一个 Token 在 3 秒内的重复请求会被拒绝
     *
     * 示例请求： POST /api/examples/create-order Header: Idempotent-Token:
     * 123e4567-e89b-12d3-a456-426614174000 Body: { "orderId": "ORD-001",
     * "amount": 99.99 }
     */
    @PostMapping("/create-order")
    @Idempotent(
            strategy = Idempotent.IdempotentStrategy.TOKEN,
            timeout = 3000,
            message = "订单正在创建中，请勿重复提交"
    )
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request) {
        // 业务逻辑：创建订单
        return ResponseEntity.ok("订单创建成功");
    }

    /**
     * 示例2: 基于 USER_ID 的幂等性（适用于已认证用户）
     *
     * 特点： - 自动基于当前认证的用户 ID - 结合方法签名和参数 Hash - 同一用户在 5 秒内对同一参数的重复请求会被拒绝
     *
     * 示例请求： POST /api/examples/transfer-money Authorization: Bearer {jwt_token}
     * Body: { "toUserId": "user-123", "amount": 100.00 }
     */
    @PostMapping("/transfer-money")
    @Idempotent(
            strategy = Idempotent.IdempotentStrategy.USER_ID,
            timeout = 5000,
            message = "转账正在处理中，请勿重复提交"
    )
    public ResponseEntity<?> transferMoney(@RequestBody TransferRequest request) {
        // 业务逻辑：转账
        return ResponseEntity.ok("转账成功");
    }

    /**
     * 示例3: 基于参数的幂等性（通用方案）
     *
     * 特点： - 自动基于方法签名和参数内容 - 不依赖 Token 或认证用户 - 同样的参数在 2 秒内的重复请求会被拒绝
     *
     * 示例请求（3 次相同请求，第 2、3 次会被拒绝）： POST /api/examples/deduct-stock Body: {
     * "productId": "PROD-001", "quantity": 10 }
     */
    @PostMapping("/deduct-stock")
    @Idempotent(
            strategy = Idempotent.IdempotentStrategy.PARAM_HASH,
            timeout = 2000,
            message = "库存扣减操作正在处理中"
    )
    public ResponseEntity<?> deductStock(@RequestBody StockRequest request) {
        // 业务逻辑：库存扣减
        return ResponseEntity.ok("库存已扣减");
    }

    /**
     * 示例4: 自定义 Key 前缀
     *
     * 适用场景：需要针对特定业务区分幂等性键 delAfterSuccess=false: 成功后保留幂等性记录（防止意外重试被识别为新请求）
     */
    @PostMapping("/batch-import")
    @Idempotent(
            strategy = Idempotent.IdempotentStrategy.TOKEN,
            timeout = 30000, // 长操作，允许 30 秒
            keyPrefix = "batch_import", // 自定义前缀
            delAfterSuccess = false, // 成功后保留记录
            message = "批量导入正在进行中，请耐心等待"
    )
    public ResponseEntity<?> batchImport(@RequestBody ImportRequest request) {
        // 模拟耗时操作
        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return ResponseEntity.ok("批量导入完成");
    }

    // ==================== 请求数据模型 ====================
    public static class OrderRequest {

        public String orderId;
        public Double amount;
    }

    public static class TransferRequest {

        public String toUserId;
        public Double amount;
    }

    public static class StockRequest {

        public String productId;
        public Integer quantity;
    }

    public static class ImportRequest {

        public String fileUrl;
        public String importType;
    }
}
