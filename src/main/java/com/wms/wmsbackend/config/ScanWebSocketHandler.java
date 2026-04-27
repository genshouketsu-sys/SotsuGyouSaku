package com.wms.wmsbackend.config;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ScanWebSocketHandler extends TextWebSocketHandler {

    // 用于存储所有连接的 PC 客户端，Key 为 clientId (如: pc_1)
    private static final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String clientId = getClientId(session);
        if (clientId != null) {
            sessions.put(clientId, session);
            System.out.println("PC 客户端已连接 (Client connected): " + clientId);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String clientId = getClientId(session);
        if (clientId != null) {
            sessions.remove(clientId);
            System.out.println("PC 客户端已断开 (Client disconnected): " + clientId);
        }
    }

    // 供 Controller 调用的推送方法
    public void sendMessageToClient(String clientId, String message) {
        WebSocketSession session = sessions.get(clientId);
        if (session != null && session.isOpen()) {
            try {
                session.sendMessage(new TextMessage(message));
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private String getClientId(WebSocketSession session) {
        String query = session.getUri().getQuery();
        if (query == null) return null;
        for (String param : query.split("&")) {
            String[] pair = param.split("=");
            if (pair.length == 2 && "clientId".equals(pair[0])) {
                return pair[1];
            }
        }
        return null;
    }
}