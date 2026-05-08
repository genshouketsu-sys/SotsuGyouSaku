package com.wms.wmsbackend.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;

/**
 * 幂等性工具类 - 用于生成幂等性键和处理幂等性相关的业务逻辑 支持基于Token、UserId、参数等多种方式生成唯一键
 */
public class IdempotentUtil {

    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final String IDEMPOTENT_TOKEN_HEADER = "Idempotent-Token";
    private static final String IDEMPOTENT_KEY_PREFIX = "idempotent:";

    public static String getIdempotentToken() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return null;
        }
        HttpServletRequest request = attributes.getRequest();
        return request.getHeader(IDEMPOTENT_TOKEN_HEADER);
    }

    public static String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                return ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
            }
            return principal.toString();
        }
        return null;
    }

    public static String generateTokenKey(String token) {
        if (token == null || token.isEmpty()) {
            throw new IllegalArgumentException("幂等性Token不能为空");
        }
        return IDEMPOTENT_KEY_PREFIX + "token:" + sha256(token);
    }

    public static String generateUserIdKey(String userId, String methodSignature, String paramHash) {
        if (userId == null || userId.isEmpty()) {
            throw new IllegalArgumentException("用户ID不能为空");
        }
        String key = userId + ":" + methodSignature + ":" + paramHash;
        return IDEMPOTENT_KEY_PREFIX + "user:" + sha256(key);
    }

    public static String generateParamKey(String methodSignature, String paramHash) {
        String key = methodSignature + ":" + paramHash;
        return IDEMPOTENT_KEY_PREFIX + "param:" + sha256(key);
    }

    public static String calculateParamHash(Object[] args) {
        if (args == null || args.length == 0) {
            return sha256("null");
        }

        try {
            String paramJson = objectMapper.writeValueAsString(args);
            return sha256(paramJson);
        } catch (JsonProcessingException e) {
            StringBuilder sb = new StringBuilder();
            for (Object arg : args) {
                sb.append(arg == null ? "null" : arg.toString());
            }
            return sha256(sb.toString());
        }
    }

    public static String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 算法不可用", e);
        }
    }

    public static String getMethodShortName(String methodSignature) {
        String[] parts = methodSignature.split("\\.");
        if (parts.length >= 2) {
            String methodName = parts[parts.length - 1].split("\\(")[0];
            String className = parts[parts.length - 2];
            return className + "." + methodName;
        }
        return methodSignature;
    }
}
