package com.wms.wmsbackend.chat.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * オペレーターチャット用 STOMP WebSocket 設定 / 操作员聊天 STOMP WebSocket 配置
 *
 * <p>既存のスキャン用 WebSocket（{@code /ws/scan}、raw TextWebSocketHandler）とは
 * 完全に独立した STOMP ベースの構成。両者は干渉しない。
 * <p>与现有扫描 WebSocket（{@code /ws/scan}，raw TextWebSocketHandler）完全独立的
 * STOMP 配置。两者互不干扰。
 *
 * <h3>エンドポイント / 端点</h3>
 * <ul>
 *   <li>{@code /ws-chat} — SockJS フォールバック付き STOMP 接続エンドポイント</li>
 * </ul>
 *
 * <h3>トピック / 主题</h3>
 * <ul>
 *   <li>{@code /topic/chat} — 全員ブロードキャスト先 / 全员广播目标</li>
 * </ul>
 *
 * <h3>アプリケーションプレフィックス / 应用前缀</h3>
 * <ul>
 *   <li>{@code /app} — クライアントからの送信先プレフィックス / 客户端发送目标前缀</li>
 * </ul>
 */
@Configuration
@EnableWebSocketMessageBroker
public class ChatWebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private ChatHandshakeInterceptor chatHandshakeInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // サブスクリプション宛先プレフィックス / 订阅目标前缀
        config.enableSimpleBroker("/topic");
        // クライアント送信先プレフィックス / 客户端发送目标前缀
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-chat")
                .addInterceptors(chatHandshakeInterceptor)
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
