package com.wms.wmsbackend.handler;

import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class WmsWebSocketHandler extends TextWebSocketHandler {

    // 保存所有连接的客户端 (接続されているすべてのクライアントを保存 - 中文解释：保存所有客户端连接)
    private static final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // 从 URL 获取 clientId (例如 ws://localhost:8080/ws/scan?clientId=pc_1)
        String query = session.getUri().getQuery();
        if (query != null && query.contains("clientId=")) {
            String clientId = query.split("clientId=")[1].split("&")[0];
            sessions.put(clientId, session);
            System.out.println("WebSocket Connected: " + clientId);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        session.sendMessage(new TextMessage("Received: " + message.getPayload()));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.values().remove(session);
    }

    // 供 Controller 调用的静态方法
    // (コントローラーから呼び出すための静的メソッド - 中文解释：供Controller调用)
    public static boolean sendToPc(String pcClientId, String message) {
        WebSocketSession pcSession = sessions.get(pcClientId);
        if (pcSession != null && pcSession.isOpen()) {
            try {
                pcSession.sendMessage(new TextMessage(message));
                return true;
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return false;
    }
}