package com.wms.wmsbackend.chat.controller;

import com.wms.wmsbackend.chat.dto.ChatMessageDto;
import com.wms.wmsbackend.chat.service.ChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Map;

/**
 * オペレーターチャットコントローラー / 操作员聊天控制器
 *
 * <p>STOMP メッセージング（WebSocket 送信）と REST（履歴取得）の両方を処理する。
 * <p>同时处理 STOMP 消息（WebSocket 发送）和 REST（历史获取）。
 *
 * <h3>STOMP エンドポイント</h3>
 * <ul>
 *   <li>クライアント送信先: {@code /app/chat.send} → {@link #sendMessage}</li>
 *   <li>サブスクリプション: {@code /topic/chat}（Redis 経由で配信）</li>
 * </ul>
 *
 * <h3>REST エンドポイント</h3>
 * <ul>
 *   <li>{@code GET /api/chat/history} — 最新メッセージ取得</li>
 *   <li>{@code GET /api/chat/history?beforeId=N} — 過去メッセージ取得</li>
 * </ul>
 */
@Controller
@RequestMapping("/api/chat")
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    @Autowired
    private ChatService chatService;

    /**
     * STOMP メッセージ受信ハンドラー / STOMP 消息接收处理器
     *
     * <p>クライアントが {@code /app/chat.send} に送信したメッセージを処理する。
     * ハンドシェイク時に格納されたセッション属性からユーザー情報を取得する。
     *
     * @param payload        クライアント送信ペイロード（content フィールドのみ必須）
     * @param headerAccessor STOMP ヘッダー（セッション属性へのアクセス用）
     */
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload Map<String, String> payload,
                            SimpMessageHeaderAccessor headerAccessor) {
        Map<String, Object> attrs = headerAccessor.getSessionAttributes();
        if (attrs == null) {
            log.warn("チャット送信失敗: セッション属性なし / Chat send failed: no session attributes");
            return;
        }

        Long senderId = (Long) attrs.get("chatUserId");
        String username = (String) attrs.get("chatUsername");
        String displayName = (String) attrs.get("chatDisplayName");
        String avatarUrl = (String) attrs.get("chatAvatarUrl");
        String content = payload.get("content");

        if (senderId == null || content == null || content.isBlank()) {
            log.warn("チャット送信失敗: 送信者IDまたは本文が空 / Chat send failed: empty senderId or content");
            return;
        }

        // XSS 対策: HTML タグを除去 / XSS 防护: 移除 HTML 标签
        content = content.replaceAll("<[^>]*>", "").trim();
        if (content.isEmpty()) {
            return;
        }

        // 文字数制限（1000 文字）/ 字符数限制（1000 字）
        if (content.length() > 1000) {
            content = content.substring(0, 1000);
        }

        log.debug("Chat STOMP received: senderId={}, content.length={}", senderId, content.length());
        chatService.processAndBroadcast(senderId, displayName, username, avatarUrl, content);
    }

    /**
     * チャット履歴 REST API / 聊天历史 REST API
     *
     * @param beforeId 指定時: この ID より前のメッセージを返す / 指定时: 返回此 ID 之前的消息
     * @return メッセージリスト（時系列昇順）/ 消息列表（时间升序）
     */
    @GetMapping("/history")
    @ResponseBody
    public ResponseEntity<List<ChatMessageDto>> getHistory(
            @RequestParam(required = false) Long beforeId) {
        List<ChatMessageDto> messages;
        if (beforeId != null) {
            messages = chatService.getMessagesBefore(beforeId);
        } else {
            messages = chatService.getRecentMessages();
        }
        return ResponseEntity.ok(messages);
    }
}
