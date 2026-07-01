import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { useOperatorChat } from './useOperatorChat';

/**
 * チャットコンテキスト / 聊天上下文
 *
 * グローバル状態を管理する / 管理全局状态:
 *   - messages:       メッセージ履歴 / 消息历史
 *   - unreadCount:    未読バッジカウント / 未读角标计数
 *   - isOpen:         チャットウィンドウ開閉状態 / 聊天窗口开关状态
 *   - connected:      WebSocket 接続状態 / WebSocket 连接状态
 *   - sendMessage:    メッセージ送信関数 / 消息发送函数
 *   - loadOlderMessages: 履歴ロード関数 / 加载更早消息函数
 *   - hasMore:        さらに古い履歴があるか / 是否还有更早的消息
 */
const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const isOpenRef = useRef(isOpen);

  // isOpen の ref を同期 / 同步 isOpen 的 ref
  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // ── 初期履歴ロード / 初始历史加载 ──
  useEffect(() => {
    const token = localStorage.getItem('wms_token');
    if (!token) return;

    axios.get('/api/chat/history')
      .then(res => {
        if (Array.isArray(res.data)) {
          setMessages(res.data);
          if (res.data.length < 50) setHasMore(false);
        }
      })
      .catch(err => {
        console.error('[Chat] Failed to load history:', err);
      });
  }, []);

  // ── 新メッセージ受信コールバック / 新消息接收回调 ──
  const handleIncomingMessage = useCallback((dto) => {
    setMessages(prev => {
      // 重複防止（同一 ID のメッセージは無視）/ 防重（忽略同 ID 消息）
      if (prev.some(m => m.id === dto.id)) return prev;
      return [...prev, dto];
    });

    // チャットウィンドウが閉じている場合は未読カウントを増加
    // 聊天窗口关闭时增加未读计数
    if (!isOpenRef.current) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // ── STOMP WebSocket フック / STOMP WebSocket Hook ──
  const { sendMessage, connected } = useOperatorChat(handleIncomingMessage);

  // ── 古いメッセージのロード（無限スクロール）/ 加载更早消息（无限滚动） ──
  const loadOlderMessages = useCallback(async () => {
    if (loadingHistory || !hasMore || messages.length === 0) return;
    setLoadingHistory(true);

    const oldestId = messages[0]?.id;
    try {
      const res = await axios.get(`/api/chat/history?beforeId=${oldestId}`);
      if (Array.isArray(res.data)) {
        if (res.data.length === 0) {
          setHasMore(false);
        } else {
          setMessages(prev => [...res.data, ...prev]);
          if (res.data.length < 30) setHasMore(false);
        }
      }
    } catch (err) {
      console.error('[Chat] Failed to load older messages:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, [loadingHistory, hasMore, messages]);

  // ── チャットウィンドウ開閉トグル / 聊天窗口开关切换 ──
  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const value = {
    messages,
    unreadCount,
    isOpen,
    toggleChat,
    sendMessage,
    connected,
    loadOlderMessages,
    hasMore,
    loadingHistory,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

/**
 * チャットコンテキストフック / 聊天上下文 Hook
 */
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
