import { useRef, useCallback, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';

/**
 * オペレーターチャット STOMP WebSocket フック
 * 操作员聊天 STOMP WebSocket Hook
 *
 * 機能 / 功能:
 *   - JWT 認証付き自動接続 / JWT 认证自动连接
 *   - 断線時の自動再接続（指数バックオフ）/ 断线自动重连（指数退避）
 *   - /topic/chat サブスクリプション / 订阅 /topic/chat
 *   - メッセージ送信ヘルパー / 消息发送辅助函数
 *
 * @param {Function} onMessageReceived  新メッセージ受信コールバック / 新消息接收回调
 * @returns {{ sendMessage, connected, connectionError }}
 */
export function useOperatorChat(onMessageReceived) {
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // コールバック ref で常に最新のハンドラーを参照 / 用 ref 始终引用最新回调
  const onMessageRef = useRef(onMessageReceived);
  useEffect(() => {
    onMessageRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    const token = localStorage.getItem('wms_token');
    if (!token) return;

    // ── STOMP クライアント構築 / 构建 STOMP 客户端 ──
    const wsProtocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const sockJsUrl = `${wsProtocol}//${window.location.host}/ws-chat?token=${encodeURIComponent(token)}`;

    const stompClient = new Client({
      // SockJS ファクトリ / SockJS 工厂
      webSocketFactory: () => new SockJS(sockJsUrl),

      // 再接続遅延（ミリ秒）— 指数バックオフ / 重连延迟（毫秒）— 指数退避
      reconnectDelay: 3000,

      // ハートビート: 10s 送信 / 10s 受信 / 心跳: 10s 发 / 10s 收
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      // デバッグログ（開発時のみ有効化推奨）/ 调试日志（建议仅开发时启用）
      // debug: (str) => console.log('[STOMP]', str),

      onConnect: () => {
        console.log('[Chat WS] Connected');
        setConnected(true);
        setConnectionError(null);

        // /topic/chat をサブスクライブ / 订阅 /topic/chat
        stompClient.subscribe('/topic/chat', (message) => {
          try {
            const dto = JSON.parse(message.body);
            if (onMessageRef.current) {
              onMessageRef.current(dto);
            }
          } catch (e) {
            console.error('[Chat WS] Parse error:', e);
          }
        });
      },

      onDisconnect: () => {
        console.log('[Chat WS] Disconnected');
        setConnected(false);
      },

      onStompError: (frame) => {
        console.error('[Chat WS] STOMP error:', frame.headers['message']);
        setConnectionError(frame.headers['message'] || 'Connection error');
        setConnected(false);
      },

      onWebSocketError: (event) => {
        console.error('[Chat WS] WebSocket error:', event);
        setConnectionError('WebSocket connection failed');
        setConnected(false);
      },
    });

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, []); // トークンはページロード時に1回のみ読み込み / Token 仅在页面加载时读取一次

  /**
   * /app/chat.send にメッセージを送信する / 向 /app/chat.send 发送消息
   * @param {string} content メッセージ本文 / 消息正文
   */
  const sendMessage = useCallback((content) => {
    if (!clientRef.current || !clientRef.current.connected) {
      console.warn('[Chat WS] Not connected, cannot send');
      return false;
    }
    if (!content || !content.trim()) return false;

    clientRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ content: content.trim() }),
    });
    return true;
  }, []);

  return { sendMessage, connected, connectionError };
}
