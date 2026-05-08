package com.wms.wmsbackend.aspect;

import java.util.concurrent.TimeUnit;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import com.wms.wmsbackend.annotation.Idempotent;
import com.wms.wmsbackend.exception.IdempotentException;
import com.wms.wmsbackend.util.IdempotentUtil;

import lombok.extern.slf4j.Slf4j;

/**
 * 幂等性拦截切面 - 工业级防重复提交解决方案
 *
 * 核心机制： 1. 在方法执行前检查 Redis 中是否存在幂等性键 2. 如果存在，说明请求在处理中或已完成，拒绝重复提交 3. 如果不存在，设置
 * Redis Key（带过期时间），执行业务逻辑 4. 执行完成后，根据配置决定是否删除 Redis Key
 *
 * 支持三种幂等性策略： - TOKEN: 基于客户端传入的 Token - USER_ID: 基于认证用户 ID - PARAM_HASH: 基于方法参数
 */
@Aspect
@Component
@Slf4j
public class IdempotentAspect {

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    // 本地降级缓存（Redis 不可用时的备选方案）
    private static final java.util.concurrent.ConcurrentHashMap<String, Long> localCache
            = new java.util.concurrent.ConcurrentHashMap<>();

    @Around("@annotation(idempotent)")
    public Object checkIdempotent(ProceedingJoinPoint joinPoint, Idempotent idempotent) throws Throwable {
        String idempotentKey = null;

        try {
            // 1. 根据策略生成幂等性键
            idempotentKey = generateIdempotentKey(joinPoint, idempotent);

            if (idempotentKey == null) {
                log.warn("无法生成幂等性键，跳过幂等性检查");
                return joinPoint.proceed();
            }

            // 2. 检查是否存在重复提交
            if (isRequestDuplicate(idempotentKey)) {
                log.warn("检测到重复提交请求，幂等性键: {}", idempotentKey);
                throw new IdempotentException("DUPLICATE_SUBMIT", idempotent.message());
            }

            // 3. 记录请求（设置幂等性锁）
            setIdempotentLock(idempotentKey, idempotent.timeout());

            // 4. 执行业务逻辑
            Object result = joinPoint.proceed();

            // 5. 根据配置决定是否删除幂等性键
            if (idempotent.delAfterSuccess()) {
                deleteIdempotentLock(idempotentKey);
            }

            return result;

        } catch (IdempotentException e) {
            // 幂等性异常直接抛出
            throw e;
        } catch (Exception e) {
            // 业务逻辑异常：保留幂等性键以防止重试被误认为是重复提交
            log.error("业务逻辑执行异常，保留幂等性键以便重试: {}", idempotentKey, e);
            throw e;
        }
    }

    /**
     * 根据指定策略生成幂等性键
     */
    private String generateIdempotentKey(ProceedingJoinPoint joinPoint, Idempotent idempotent) {
        String methodSignature = joinPoint.getSignature().toLongString();
        String shortMethodName = IdempotentUtil.getMethodShortName(methodSignature);

        switch (idempotent.strategy()) {
            case TOKEN:
                return generateTokenKey(idempotent.keyPrefix());

            case USER_ID:
                return generateUserIdKey(shortMethodName, joinPoint.getArgs(), idempotent.keyPrefix());

            case PARAM_HASH:
                return generateParamHashKey(shortMethodName, joinPoint.getArgs(), idempotent.keyPrefix());

            default:
                throw new IllegalArgumentException("不支持的幂等性策略: " + idempotent.strategy());
        }
    }

    /**
     * 生成基于 Token 的幂等性键
     */
    private String generateTokenKey(String keyPrefix) {
        String token = IdempotentUtil.getIdempotentToken();
        if (token == null || token.isEmpty()) {
            log.error("TOKEN 策略下，未从 HTTP Header 获取到幂等性 Token");
            throw new IdempotentException("MISSING_IDEMPOTENT_TOKEN",
                    "缺少幂等性Token (Header: Idempotent-Token)");
        }
        return keyPrefix.isEmpty() ? IdempotentUtil.generateTokenKey(token)
                : keyPrefix + ":" + IdempotentUtil.generateTokenKey(token);
    }

    /**
     * 生成基于用户ID的幂等性键
     */
    private String generateUserIdKey(String methodSignature, Object[] args, String keyPrefix) {
        String userId = IdempotentUtil.getCurrentUserId();
        if (userId == null) {
            log.error("USER_ID 策略下，用户未认证或无法获取用户ID");
            throw new IdempotentException("UNAUTHENTICATED", "用户未认证");
        }
        String paramHash = IdempotentUtil.calculateParamHash(args);
        return keyPrefix.isEmpty() ? IdempotentUtil.generateUserIdKey(userId, methodSignature, paramHash)
                : keyPrefix + ":" + IdempotentUtil.generateUserIdKey(userId, methodSignature, paramHash);
    }

    /**
     * 生成基于参数哈希的幂等性键
     */
    private String generateParamHashKey(String methodSignature, Object[] args, String keyPrefix) {
        String paramHash = IdempotentUtil.calculateParamHash(args);
        return keyPrefix.isEmpty() ? IdempotentUtil.generateParamKey(methodSignature, paramHash)
                : keyPrefix + ":" + IdempotentUtil.generateParamKey(methodSignature, paramHash);
    }

    /**
     * 检查是否存在重复提交 优先使用 Redis，Redis 不可用时使用本地缓存
     */
    private boolean isRequestDuplicate(String key) {
        if (redisTemplate != null) {
            try {
                // 使用 Redis 检查
                Boolean exists = redisTemplate.hasKey(key);
                return Boolean.TRUE.equals(exists);
            } catch (Exception e) {
                log.warn("Redis 检查失败，降级到本地缓存", e);
                return checkLocalCache(key);
            }
        } else {
            // Redis 不可用，使用本地缓存
            return checkLocalCache(key);
        }
    }

    /**
     * 使用本地缓存检查重复提交
     */
    private boolean checkLocalCache(String key) {
        long now = System.currentTimeMillis();

        // 清理过期数据
        localCache.entrySet().removeIf(entry -> entry.getValue() < now);

        // 检查是否存在
        return localCache.containsKey(key);
    }

    /**
     * 设置幂等性锁 优先使用 Redis，Redis 不可用时使用本地缓存
     */
    private void setIdempotentLock(String key, long timeout) {
        if (redisTemplate != null) {
            try {
                // 使用 Redis 设置，带过期时间
                redisTemplate.opsForValue().set(key, "1", timeout, TimeUnit.MILLISECONDS);
                log.debug("幂等性锁已设置 (Redis): key={}, timeout={}ms", key, timeout);
            } catch (Exception e) {
                log.warn("Redis 写入失败，降级到本地缓存", e);
                setLocalCacheLock(key, timeout);
            }
        } else {
            // Redis 不可用，使用本地缓存
            setLocalCacheLock(key, timeout);
        }
    }

    /**
     * 在本地缓存中设置幂等性锁
     */
    private void setLocalCacheLock(String key, long timeout) {
        long expireTime = System.currentTimeMillis() + timeout;
        localCache.put(key, expireTime);
        log.debug("幂等性锁已设置 (本地缓存): key={}, timeout={}ms", key, timeout);
    }

    /**
     * 删除幂等性锁 适用于成功完成且允许删除的场景
     */
    private void deleteIdempotentLock(String key) {
        if (redisTemplate != null) {
            try {
                redisTemplate.delete(key);
                log.debug("幂等性锁已删除 (Redis): key={}", key);
            } catch (Exception e) {
                log.warn("Redis 删除失败", e);
                localCache.remove(key);
            }
        } else {
            localCache.remove(key);
            log.debug("幂等性锁已删除 (本地缓存): key={}", key);
        }
    }
}
