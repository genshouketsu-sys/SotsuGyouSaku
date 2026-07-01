package com.wms.wmsbackend.chat.config;

import com.wms.wmsbackend.entity.User;
import com.wms.wmsbackend.mapper.UserMapper;
import com.wms.wmsbackend.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

/**
 * チャット WebSocket ハンドシェイク時の JWT 認証インターセプター
 * 聊天 WebSocket 握手时的 JWT 认证拦截器
 *
 * <p>クライアントは接続時にクエリパラメータ {@code ?token=xxx} で JWT を渡す。
 * <p>客户端在连接时通过查询参数 {@code ?token=xxx} 传递 JWT。
 *
 * <p>認証成功時、WebSocket セッション属性に以下を格納する:
 * <ul>
 *   <li>{@code chatUserId} — ユーザー ID</li>
 *   <li>{@code chatUsername} — ユーザー名</li>
 *   <li>{@code chatDisplayName} — 表示名</li>
 *   <li>{@code chatAvatarUrl} — アバター URL</li>
 * </ul>
 */
@Component
public class ChatHandshakeInterceptor implements HandshakeInterceptor {

    private static final Logger log = LoggerFactory.getLogger(ChatHandshakeInterceptor.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserMapper userMapper;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        try {
            String token = extractToken(request);
            if (token == null || token.isBlank()) {
                log.warn("チャット WS ハンドシェイク失敗: トークンなし / Chat WS handshake failed: no token");
                return false;
            }

            String username = jwtUtil.extractUsername(token);
            if (username == null) {
                log.warn("チャット WS ハンドシェイク失敗: 無効なトークン / Chat WS handshake failed: invalid token");
                return false;
            }

            User user = userMapper.findByUsername(username);
            if (user == null) {
                log.warn("チャット WS ハンドシェイク失敗: ユーザー未存在 / Chat WS handshake failed: user not found: {}", username);
                return false;
            }

            // セッション属性にユーザー情報を格納（ChatController で使用）
            // 将用户信息存入 session 属性（供 ChatController 使用）
            attributes.put("chatUserId", user.getId());
            attributes.put("chatUsername", user.getUsername());
            attributes.put("chatDisplayName", user.getDisplayName() != null ? user.getDisplayName() : user.getUsername());
            attributes.put("chatAvatarUrl", user.getAvatarUrl());

            log.info("チャット WS ハンドシェイク成功 / Chat WS handshake OK: userId={}, username={}",
                    user.getId(), user.getUsername());
            return true;

        } catch (Exception e) {
            log.error("チャット WS ハンドシェイク例外 / Chat WS handshake exception", e);
            return false;
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // No-op — ハンドシェイク後の追加処理は不要 / 握手后无需额外处理
    }

    /**
     * リクエスト URL のクエリパラメータから JWT トークンを抽出する。
     * 从请求 URL 的查询参数中提取 JWT token。
     * 例: /ws-chat?token=eyJhbGci...
     */
    private String extractToken(ServerHttpRequest request) {
        if (request instanceof ServletServerHttpRequest servletRequest) {
            return servletRequest.getServletRequest().getParameter("token");
        }
        // SockJS フォールバック時も URI からパース
        // SockJS fallback 时也从 URI 解析
        String query = request.getURI().getQuery();
        if (query != null) {
            for (String param : query.split("&")) {
                String[] pair = param.split("=", 2);
                if (pair.length == 2 && "token".equals(pair[0])) {
                    return pair[1];
                }
            }
        }
        return null;
    }
}
