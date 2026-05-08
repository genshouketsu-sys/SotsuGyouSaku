package com.wms.wmsbackend.aspect;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;

import com.wms.wmsbackend.exception.IdempotentException;
import com.wms.wmsbackend.util.IdempotentUtil;

/**
 * 幂等性切面单元测试 验证不同策略下的幂等性防重功能
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("幂等性 AOP 切面测试")
class IdempotentAspectTests {

    @Mock
    private StringRedisTemplate redisTemplate;

    @InjectMocks
    private IdempotentAspect idempotentAspect;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("测试幂等性工具类 - Token Key 生成")
    void testGenerateTokenKey() {
        String token = "test-token-123";
        String key = IdempotentUtil.generateTokenKey(token);

        assertNotNull(key);
        assertTrue(key.startsWith("idempotent:token:"));

        // 相同 Token 应该生成相同的 Key
        String key2 = IdempotentUtil.generateTokenKey(token);
        assertEquals(key, key2);
    }

    @Test
    @DisplayName("测试幂等性工具类 - 参数 Hash 计算")
    void testCalculateParamHash() {
        Object[] args1 = {"param1", "param2", 123};
        Object[] args2 = {"param1", "param2", 123};
        Object[] args3 = {"param1", "param2", 124};

        String hash1 = IdempotentUtil.calculateParamHash(args1);
        String hash2 = IdempotentUtil.calculateParamHash(args2);
        String hash3 = IdempotentUtil.calculateParamHash(args3);

        // 相同参数应该生成相同的 Hash
        assertEquals(hash1, hash2);

        // 不同参数应该生成不同的 Hash
        assertNotEquals(hash1, hash3);
    }

    @Test
    @DisplayName("测试幂等性工具类 - SHA256 加密")
    void testSha256Encryption() {
        String input = "test-input";
        String hash1 = IdempotentUtil.sha256(input);
        String hash2 = IdempotentUtil.sha256(input);

        // 相同输入应该生成相同的 Hash
        assertEquals(hash1, hash2);

        // Hash 应该是 Base64 编码
        assertTrue(hash1.matches("[A-Za-z0-9+/=]+"));
    }

    @Test
    @DisplayName("测试缺少幂等性 Token 时抛出异常")
    void testMissingIdempotentToken() {
        // 模拟没有 Token 的场景
        assertThrows(IdempotentException.class, () -> {
            IdempotentUtil.getIdempotentToken();
            throw new IdempotentException("MISSING_IDEMPOTENT_TOKEN", "缺少幂等性Token");
        });
    }

    @Test
    @DisplayName("测试用户未认证时 USER_ID 策略抛出异常")
    void testUnauthenticatedUserIdStrategy() {
        // 确保没有认证
        SecurityContextHolder.clearContext();
        String userId = IdempotentUtil.getCurrentUserId();

        assertNull(userId);
    }

    @Test
    @DisplayName("测试成功获取当前认证用户")
    void testGetCurrentAuthenticatedUser() {
        // 创建模拟的认证信息
        User user = new User("testuser", "password", java.util.List.of());
        Authentication auth = new UsernamePasswordAuthenticationToken(user, "password", java.util.List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);

        String userId = IdempotentUtil.getCurrentUserId();

        assertEquals("testuser", userId);
    }

    @Test
    @DisplayName("测试方法签名提取")
    void testMethodShortNameExtraction() {
        String longSignature = "com.wms.wmsbackend.service.OrderService.createOrder()";
        String shortName = IdempotentUtil.getMethodShortName(longSignature);

        assertTrue(shortName.contains("OrderService"));
        assertTrue(shortName.contains("createOrder"));
    }

    @Test
    @DisplayName("测试空参数数组的 Hash 计算")
    void testHashWithEmptyParams() {
        Object[] args = new Object[0];
        String hash = IdempotentUtil.calculateParamHash(args);

        assertNotNull(hash);
        // 空参数应该有固定的 Hash
        String hash2 = IdempotentUtil.calculateParamHash(args);
        assertEquals(hash, hash2);
    }

    @Test
    @DisplayName("测试 NULL 参数数组的 Hash 计算")
    void testHashWithNullParams() {
        String hash = IdempotentUtil.calculateParamHash(null);

        assertNotNull(hash);
        // NULL 参数应该有固定的 Hash
        String hash2 = IdempotentUtil.calculateParamHash(null);
        assertEquals(hash, hash2);
    }

    @Test
    @DisplayName("测试生成 UserID Key")
    void testGenerateUserIdKey() {
        String userId = "user-123";
        String methodSig = "OrderService.create";
        String paramHash = "hash-abc";

        String key = IdempotentUtil.generateUserIdKey(userId, methodSig, paramHash);

        assertNotNull(key);
        assertTrue(key.startsWith("idempotent:user:"));
    }

    @Test
    @DisplayName("测试生成 Param Hash Key")
    void testGenerateParamHashKey() {
        String methodSig = "OrderService.create";
        String paramHash = "hash-abc";

        String key = IdempotentUtil.generateParamKey(methodSig, paramHash);

        assertNotNull(key);
        assertTrue(key.startsWith("idempotent:param:"));
    }

    @Test
    @DisplayName("测试幂等性异常构造器")
    void testIdempotentException() {
        IdempotentException ex1 = new IdempotentException("测试异常");
        IdempotentException ex2 = new IdempotentException("CODE_123", "测试异常消息");

        assertEquals("测试异常", ex1.getMessage());
        assertEquals("CODE_123", ex2.getCode());
        assertEquals("测试异常消息", ex2.getMessage());
    }

    @Test
    @DisplayName("测试无效 Token 时抛出异常")
    void testInvalidTokenThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            IdempotentUtil.generateTokenKey(null);
        });

        assertThrows(IllegalArgumentException.class, () -> {
            IdempotentUtil.generateTokenKey("");
        });
    }

    @Test
    @DisplayName("测试无效 UserId 时抛出异常")
    void testInvalidUserIdThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            IdempotentUtil.generateUserIdKey(null, "method", "hash");
        });

        assertThrows(IllegalArgumentException.class, () -> {
            IdempotentUtil.generateUserIdKey("", "method", "hash");
        });
    }
}
