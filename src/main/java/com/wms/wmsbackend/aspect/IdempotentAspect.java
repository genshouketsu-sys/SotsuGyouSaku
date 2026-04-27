package com.wms.wmsbackend.aspect;

import com.wms.wmsbackend.annotation.Idempotent;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import java.util.concurrent.TimeUnit;

@Aspect
@Component
public class IdempotentAspect {

    private final StringRedisTemplate redisTemplate;

    @Autowired
    public IdempotentAspect(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Around("@annotation(idempotent)")
    public Object checkIdempotent(ProceedingJoinPoint joinPoint, Idempotent idempotent) throws Throwable {
        // 简单模拟：使用方法名+参数作为唯一Key，实际项目中应结合Token
        String key = "idempotent:" + joinPoint.getSignature().toShortString();
        Boolean success = redisTemplate.opsForValue().setIfAbsent(key, "1", idempotent.expire(), TimeUnit.MILLISECONDS);
        if (Boolean.FALSE.equals(success)) {
            throw new RuntimeException(idempotent.message());
        }
        return joinPoint.proceed();
    }
}