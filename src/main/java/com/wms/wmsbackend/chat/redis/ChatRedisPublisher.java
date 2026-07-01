package com.wms.wmsbackend.chat.redis;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Component;

/**
 * チャットメッセージ Redis パブリッシャー / 聊天消息 Redis 发布者
 *
 * <p>WebSocket 経由で受信したチャットメッセージを JSON 文字列として
 * Redis Pub/Sub チャネルに発行する。
 * <p>将通过 WebSocket 接收到的聊天消息以 JSON 字符串形式发布到 Redis Pub/Sub 频道。
 */
@Component
public class ChatRedisPublisher {

    private static final Logger log = LoggerFactory.getLogger(ChatRedisPublisher.class);

    @Autowired
    private StringRedisTemplate chatStringRedisTemplate;

    @Autowired
    private ChannelTopic chatChannelTopic;

    /**
     * メッセージを Redis チャネルに発行する / 将消息发布到 Redis 频道
     *
     * @param messageJson JSON シリアライズ済みメッセージ / JSON 序列化后的消息
     */
    public void publish(String messageJson) {
        log.debug("Redis PUBLISH → channel={}, length={}",
                chatChannelTopic.getTopic(), messageJson.length());
        chatStringRedisTemplate.convertAndSend(chatChannelTopic.getTopic(), messageJson);
    }
}
