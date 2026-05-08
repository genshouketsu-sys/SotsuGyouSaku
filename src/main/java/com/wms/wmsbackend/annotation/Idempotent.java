package com.wms.wmsbackend.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 工业级幂等性控制注解 - 确保操作的幂等性，防止并发重复提交 支持多种幂等性策略： - TOKEN: 基于 Request Header 中的
 * Idempotent-Token - USER_ID: 基于用户ID和方法签名 - PARAM_HASH: 基于方法参数的 Hash 值
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Idempotent {

    /**
     * 幂等性策略，默认为 TOKEN 方式
     */
    IdempotentStrategy strategy() default IdempotentStrategy.TOKEN;

    /**
     * 防抖/幂等超时时间，默认 3000 毫秒 (3秒)
     */
    long timeout() default 3000;

    /**
     * 重复提交时的提示信息
     */
    String message() default "请勿重复提交，操作正在处理中 (重複送信しないでください)";

    /**
     * 是否删除成功后的幂等性记录（true: 删除以支持重试；false: 保留以防止重复）
     */
    boolean delAfterSuccess() default true;

    /**
     * 自定义 Redis Key 前缀（为空则使用默认值）
     */
    String keyPrefix() default "";

    /**
     * 幂等性策略枚举
     */
    enum IdempotentStrategy {
        /**
         * 基于Token的幂等性（推荐用于前端防重） 从 Header 的 Idempotent-Token 获取唯一标识
         */
        TOKEN,
        /**
         * 基于用户ID的幂等性（适用于已认证用户） 组合：userId + methodSignature + paramHash
         */
        USER_ID,
        /**
         * 基于方法签名和参数的幂等性（通用方案） 组合：methodSignature + paramHash
         */
        PARAM_HASH
    }
}
