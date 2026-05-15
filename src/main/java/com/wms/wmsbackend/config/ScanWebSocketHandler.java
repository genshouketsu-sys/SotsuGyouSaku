package com.wms.wmsbackend.config;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

/**
 * スキャン WebSocket ハンドラー / 扫描 WebSocket 处理器
 * PC クライアントの接続を管理し、モバイルからのスキャンデータを中継する。
 * 管理 PC 客户端连接，将移动端的扫描数据转发给对应 PC。
 */
@Component
public class ScanWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(ScanWebSocketHandler.class);

    /** clientId → セッション集合（複数タブ対応）/ clientId → 会话集合（支持多标签页） */
    private static final Map<String, Set<WebSocketSession>> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String clientId = extractClientId(session);
        if (clientId != null) {
            sessions.computeIfAbsent(clientId, k -> new CopyOnWriteArraySet<>()).add(session);
            log.info("PC クライアント接続 / PC 客户端已连接: clientId={}", clientId);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String clientId = extractClientId(session);
        if (clientId != null) {
            Set<WebSocketSession> clientSessions = sessions.get(clientId);
            if (clientSessions != null) {
                clientSessions.remove(session);
                if (clientSessions.isEmpty()) {
                    sessions.remove(clientId);
                }
            }
            log.info("PC クライアント切断 / PC 客户端已断开: clientId={}, reason={}", clientId, status);
        }
    }

    /**
     * 指定した clientId のセッションにメッセージを送信する。
     * 向指定 clientId 的所有会话发送消息。
     */
    public void sendMessageToClient(String clientId, String message) {
        Set<WebSocketSession> clientSessions = sessions.get(clientId);
        if (clientSessions == null || clientSessions.isEmpty()) {
            log.warn("送信先セッションなし / 未找到活跃会话: clientId={}", clientId);
            return;
        }
        log.debug("メッセージ送信 / 推送消息: clientId={}, sessions={}", clientId, clientSessions.size());
        for (WebSocketSession session : clientSessions) {
            if (session.isOpen()) {
                try {
                    session.sendMessage(new TextMessage(message));
                } catch (IOException e) {
                    log.error("メッセージ送信失敗 / 消息发送失败: sessionId={}, error={}", session.getId(), e.getMessage(), e);
                }
            } else {
                log.debug("セッションが閉じています。スキップ / 会话已关闭，跳过: sessionId={}", session.getId());
            }
        }
    }

    /**
     * WebSocket URI のクエリパラメータから clientId を取得する。
     * 从 WebSocket URI 的查询参数中提取 clientId。
     */
    private String extractClientId(WebSocketSession session) {
        String query = session.getUri() != null ? session.getUri().getQuery() : null;
        if (query == null) {
            return null;
        }
        for (String param : query.split("&")) {
            String[] pair = param.split("=", 2);
            if (pair.length == 2 && "clientId".equals(pair[0])) {
                return pair[1];
            }
        }
        return null;
    }
}