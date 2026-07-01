package com.wms.wmsbackend.chat.dto;

import java.time.LocalDateTime;

/**
 * チャットメッセージ DTO / 聊天消息 DTO
 * WebSocket 経由で送受信されるメッセージペイロード。
 * 通过 WebSocket 发送和接收的消息载荷。
 */
public class ChatMessageDto {

    /** メッセージ ID（送信時は null、レスポンス時のみ設定）/ 消息 ID（发送时为 null，仅响应时设置） */
    private Long id;

    /** 送信者ユーザー ID / 发送者用户 ID */
    private Long senderId;

    /** 送信者の表示名 / 发送者显示名 */
    private String senderDisplayName;

    /** 送信者のユーザー名 / 发送者用户名 */
    private String senderUsername;

    /** 送信者のアバター URL / 发送者头像 URL */
    private String senderAvatarUrl;

    /** メッセージ本文 / 消息正文 */
    private String content;

    /** メッセージ種別: TEXT, IMAGE, SYSTEM / 消息类型 */
    private String messageType;

    /** 送信日時 / 发送时间 */
    private LocalDateTime createdAt;

    public ChatMessageDto() {}

    // ── Getter / Setter ──

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getSenderDisplayName() {
        return senderDisplayName;
    }

    public void setSenderDisplayName(String senderDisplayName) {
        this.senderDisplayName = senderDisplayName;
    }

    public String getSenderUsername() {
        return senderUsername;
    }

    public void setSenderUsername(String senderUsername) {
        this.senderUsername = senderUsername;
    }

    public String getSenderAvatarUrl() {
        return senderAvatarUrl;
    }

    public void setSenderAvatarUrl(String senderAvatarUrl) {
        this.senderAvatarUrl = senderAvatarUrl;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getMessageType() {
        return messageType;
    }

    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
