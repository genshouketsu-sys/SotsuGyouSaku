package com.wms.wmsbackend.chat.redis;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;

/**
 * チャット専用 Redis Pub/Sub 設定 / 聊天专用 Redis Pub/Sub 配置
 *
 * <p>マルチインスタンスデプロイ対応のため、チャットメッセージを Redis チャネル経由で
 * 全ノードにブロードキャストする。
 * <p>为支持多实例部署，通过 Redis 频道将聊天消息广播到所有节点。
 *
 * <pre>
 *   Node A (receives STOMP msg)
 *       → Redis PUBLISH "operator-chat-channel"
 *       → Node A subscriber → SimpMessagingTemplate → /topic/chat
 *       → Node B subscriber → SimpMessagingTemplate → /topic/chat
 * </pre>
 */
@Configuration
public class ChatRedisConfig {

    /** Redis Pub/Sub チャネル名 / Redis Pub/Sub 频道名 */
    public static final String CHAT_CHANNEL = "operator-chat-channel";

    /**
     * チャットチャネルのトピック Bean / 聊天频道 Topic Bean
     */
    @Bean
    public ChannelTopic chatChannelTopic() {
        return new ChannelTopic(CHAT_CHANNEL);
    }

    /**
     * Redis メッセージリスナーコンテナ / Redis 消息监听容器
     * サブスクライバーをチャネルに紐付ける。/ 将订阅者绑定到频道。
     */
    @Bean
    public RedisMessageListenerContainer chatRedisListenerContainer(
            RedisConnectionFactory connectionFactory,
            MessageListenerAdapter chatMessageListenerAdapter,
            ChannelTopic chatChannelTopic) {

        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(chatMessageListenerAdapter, chatChannelTopic);
        return container;
    }

    /**
     * メッセージリスナーアダプター / 消息监听适配器
     * {@link ChatRedisSubscriber#onMessage(String)} を呼び出すよう設定する。
     * 配置为调用 {@link ChatRedisSubscriber#onMessage(String)}。
     */
    @Bean
    public MessageListenerAdapter chatMessageListenerAdapter(ChatRedisSubscriber subscriber) {
        return new MessageListenerAdapter(subscriber, "onMessage");
    }

    /**
     * StringRedisTemplate Bean（既に存在する場合は Spring が再利用する）
     * StringRedisTemplate Bean（如已存在，Spring 会复用）
     */
    @Bean
    public StringRedisTemplate chatStringRedisTemplate(RedisConnectionFactory connectionFactory) {
        return new StringRedisTemplate(connectionFactory);
    }
}
