package com.wms.wmsbackend.chat.entity;

import java.time.LocalDateTime;

/**
 * オペレーターチャットメッセージエンティティ / 操作员聊天消息实体
 * wms_operator_messages テーブルに対応する。/ 对应 wms_operator_messages 表。
 *
 * <p>設計方針 / 设计方针:
 * <ul>
 *   <li>既存の User エンティティを変更せず、senderId で外部キー参照のみ行う</li>
 *   <li>不修改现有 User 实体，仅通过 senderId 进行外键关联</li>
 * </ul>
 */
public class OperatorMessage {

    private Long id;

    /** 送信者ユーザー ID（wms_user.id への FK）/ 发送者用户 ID（FK → wms_user.id） */
    private Long senderId;

    /** メッセージ本文 / 消息正文 */
    private String content;

    /** メッセージ種別: TEXT, IMAGE, SYSTEM / 消息类型: TEXT, IMAGE, SYSTEM */
    private String messageType;

    /** 送信日時 / 发送时间 */
    private LocalDateTime createdAt;

    // ── 以下はクエリ結果マッピング用（JOINで取得）/ 以下为查询结果映射用（JOIN 获取）──

    /** 送信者の表示名（wms_user.display_name）/ 发送者显示名 */
    private String senderDisplayName;

    /** 送信者のユーザー名（wms_user.username）/ 发送者用户名 */
    private String senderUsername;

    /** 送信者のアバターURL（wms_user.avatar_url）/ 发送者头像 URL */
    private String senderAvatarUrl;

    public OperatorMessage() {}

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
}
