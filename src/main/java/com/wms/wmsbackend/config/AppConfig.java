package com.wms.wmsbackend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * アプリケーション共通 Bean 設定 / 应用通用 Bean 配置
 * RestTemplate と ObjectMapper をシングルトン Bean として管理する。
 * 将 RestTemplate 和 ObjectMapper 作为单例 Bean 统一管理。
 */
@Configuration
public class AppConfig {

    /**
     * HTTP クライアント Bean / HTTP 客户端 Bean
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    /**
     * JSON シリアライザ Bean / JSON 序列化工具 Bean
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        // Java 8 Date/Time (LocalDateTime etc.) のシリアライズを有効化
        // 启用 Java 8 日期时间（LocalDateTime 等）的序列化支持
        mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        mapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }
}
