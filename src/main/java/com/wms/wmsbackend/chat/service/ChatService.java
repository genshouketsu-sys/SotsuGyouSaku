package com.wms.wmsbackend.chat.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wms.wmsbackend.chat.dto.ChatMessageDto;
import com.wms.wmsbackend.chat.entity.OperatorMessage;
import com.wms.wmsbackend.chat.mapper.ChatMessageMapper;
import com.wms.wmsbackend.chat.redis.ChatRedisPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * オペレーターチャットサービス / 操作员聊天服务
 * メッセージの永続化 → Redis Pub/Sub 発行 → 履歴取得を担当する。
 */
@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);
    private static final int DEFAULT_RECENT_LIMIT = 50;
    private static final int DEFAULT_HISTORY_LIMIT = 30;

    @Autowired
    private ChatMessageMapper chatMessageMapper;

    @Autowired
    private ChatRedisPublisher chatRedisPublisher;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * メッセージを永続化し Redis 経由で全ノードにブロードキャスト
     */
    public void processAndBroadcast(Long senderId, String displayName,
                                    String username, String avatarUrl, String content) {
        OperatorMessage entity = new OperatorMessage();
        entity.setSenderId(senderId);
        entity.setContent(content);
        entity.setMessageType("TEXT");
        entity.setCreatedAt(LocalDateTime.now());

        chatMessageMapper.insert(entity);
        log.debug("Chat message saved: id={}, senderId={}", entity.getId(), senderId);

        ChatMessageDto dto = new ChatMessageDto();
        dto.setId(entity.getId());
        dto.setSenderId(senderId);
        dto.setSenderDisplayName(displayName);
        dto.setSenderUsername(username);
        dto.setSenderAvatarUrl(avatarUrl);
        dto.setContent(content);
        dto.setMessageType("TEXT");
        dto.setCreatedAt(entity.getCreatedAt());

        try {
            String json = objectMapper.writeValueAsString(dto);
            chatRedisPublisher.publish(json);
        } catch (Exception e) {
            log.error("Redis publish failed: {}", e.getMessage(), e);
        }
    }

    /** 最新メッセージ取得（初期ロード用）/ 获取最近消息 */
    public List<ChatMessageDto> getRecentMessages() {
        List<OperatorMessage> messages = chatMessageMapper.findRecentMessages(DEFAULT_RECENT_LIMIT);
        Collections.reverse(messages);
        return messages.stream().map(this::toDto).collect(Collectors.toList());
    }

    /** 指定 ID より前のメッセージ取得（無限スクロール用）/ 获取更早消息 */
    public List<ChatMessageDto> getMessagesBefore(Long beforeId) {
        List<OperatorMessage> messages = chatMessageMapper.findMessagesBefore(beforeId, DEFAULT_HISTORY_LIMIT);
        Collections.reverse(messages);
        return messages.stream().map(this::toDto).collect(Collectors.toList());
    }

    private ChatMessageDto toDto(OperatorMessage entity) {
        ChatMessageDto dto = new ChatMessageDto();
        dto.setId(entity.getId());
        dto.setSenderId(entity.getSenderId());
        dto.setSenderDisplayName(entity.getSenderDisplayName());
        dto.setSenderUsername(entity.getSenderUsername());
        dto.setSenderAvatarUrl(entity.getSenderAvatarUrl());
        dto.setContent(entity.getContent());
        dto.setMessageType(entity.getMessageType());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
