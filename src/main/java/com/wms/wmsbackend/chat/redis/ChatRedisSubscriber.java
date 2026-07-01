package com.wms.wmsbackend.chat.redis;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wms.wmsbackend.chat.dto.ChatMessageDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * チャットメッセージ Redis サブスクライバー / 聊天消息 Redis 订阅者
 *
 * <p>Redis チャネルからメッセージを受信し、このノードに接続している
 * 全 STOMP クライアントへ {@code /topic/chat} 宛てにブロードキャストする。
 * <p>从 Redis 频道接收消息，并向连接到本节点的所有 STOMP 客户端广播到 {@code /topic/chat}。
 *
 * <p>これにより、マルチインスタンス環境でも全クライアントがリアルタイムに
 * メッセージを受信できる。
 * <p>这使得多实例环境下所有客户端也能实时接收消息。
 */
@Component
public class ChatRedisSubscriber {

    private static final Logger log = LoggerFactory.getLogger(ChatRedisSubscriber.class);

    /** STOMP ブロードキャスト先 / STOMP 广播目标 */
    private static final String TOPIC_CHAT = "/topic/chat";

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Redis チャネルからメッセージを受信するコールバック
     * 从 Redis 频道接收消息的回调
     *
     * <p>{@link org.springframework.data.redis.listener.adapter.MessageListenerAdapter}
     * から呼び出される。/ 由 MessageListenerAdapter 调用。
     *
     * @param messageJson JSON 文字列 / JSON 字符串
     */
    public void onMessage(String messageJson) {
        try {
            ChatMessageDto dto = objectMapper.readValue(messageJson, ChatMessageDto.class);
            log.debug("Redis SUB → /topic/chat: senderId={}, content.length={}",
                    dto.getSenderId(),
                    dto.getContent() != null ? dto.getContent().length() : 0);

            // このノードの全 STOMP クライアントにブロードキャスト
            // 向本节点的所有 STOMP 客户端广播
            messagingTemplate.convertAndSend(TOPIC_CHAT, dto);

        } catch (Exception e) {
            log.error("Redis サブスクライバーエラー / Redis subscriber error: {}", e.getMessage(), e);
        }
    }
}
