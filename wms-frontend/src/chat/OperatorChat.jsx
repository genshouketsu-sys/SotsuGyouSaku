import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useChat } from './ChatContext';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * オペレーターチャット統合コンポーネント / 操作员聊天整合组件
 * FAB（フローティングアクションボタン）+ チャットドロワーを一体化。
 * React Portal でレンダリングし、既存レイアウトに一切影響を与えない。
 */
export default function OperatorChat() {
  const {
    messages, unreadCount, isOpen, toggleChat,
    sendMessage, connected, loadOlderMessages, hasMore, loadingHistory,
  } = useChat();
  const { t } = useTranslation();
  const location = useLocation();

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const prevMessagesLenRef = useRef(0);

  // 現在のユーザー情報 / 当前用户信息
  const currentUsername = localStorage.getItem('wms_username') || '';

  // ── 自動スクロール / 自动滚动到底部 ──
  useEffect(() => {
    if (isOpen && messages.length > prevMessagesLenRef.current) {
      // 新メッセージ到着時のみ自動スクロール / 仅新消息到达时自动滚动
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLenRef.current = messages.length;
  }, [messages, isOpen]);

  // チャットオープン時にフォーカス / 打开聊天时聚焦输入框
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [isOpen]);

  // ── メッセージ送信 / 发送消息 ──
  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return;
    const success = sendMessage(inputValue);
    if (success) setInputValue('');
  }, [inputValue, sendMessage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── 無限スクロール検知 / 无限滚动检测 ──
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    if (container.scrollTop < 60 && hasMore && !loadingHistory) {
      loadOlderMessages();
    }
  }, [hasMore, loadingHistory, loadOlderMessages]);

  // ── 時間フォーマット / 时间格式化 ──
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // ── 日付グループヘッダー / 日期分组头 ──
  const formatDateHeader = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return t('today') || 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return t('yesterday') || 'Yesterday';
    return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  // ── 日付が変わったかどうか / 日期是否变化 ──
  const isNewDay = (current, previous) => {
    if (!previous) return true;
    const a = new Date(current).toDateString();
    const b = new Date(previous).toDateString();
    return a !== b;
  };

  // ログインしていない場合は非表示 / 未登录时隐藏
  if (!localStorage.getItem('wms_token')) return null;

  return createPortal(
    <>
      {/* ═══════════════════════════════════════════════
          FAB（フローティングアクションボタン）/ 浮动按钮
          ═══════════════════════════════════════════════ */}
      {!isOpen && location.pathname !== '/scanner' && (
        <button
          id="operator-chat-fab"
          onClick={toggleChat}
          className="fixed bottom-12 right-32 w-14 h-14 rounded-full flex items-center justify-center
                     shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 group md:bottom-12 md:right-32 bottom-6 right-6"
          style={{
            zIndex: 9999,
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-alt))',
            boxShadow: 'var(--shadow-accent-fab)',
          }}
          title="Operator Chat"
        >
          <span className="material-symbols-outlined text-[24px] group-hover:rotate-12 transition-transform"
                style={{ color: 'var(--color-accent-text)', fontVariationSettings: "'FILL' 1" }}>
            chat
          </span>

          {/* 未読バッジ / 未读角标 */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center
                           rounded-full bg-red-500 text-white text-[10px] font-black px-1.5
                           animate-bounce shadow-lg">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* ═══════════════════════════════════════════════
          チャットドロワー / 聊天窗口
          ═══════════════════════════════════════════════ */}
      {isOpen && (
        <div
          id="operator-chat-drawer"
          className="fixed flex flex-col shadow-2xl overflow-hidden animate-[slideUp_0.25s_ease-out]
                     bottom-0 right-0 w-full h-[85vh] rounded-t-2xl rounded-b-none
                     md:bottom-6 md:right-6 md:w-[380px] md:h-[560px] md:rounded-2xl"
          style={{
            zIndex: 9999,
            backgroundColor: 'var(--color-bg-modal)',
            border: '1px solid var(--color-border)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* ── ヘッダー / 头部 ── */}
          <div
            className="flex items-center justify-between px-5 py-3.5 shrink-0"
            style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-alt))' }}>
                <span className="material-symbols-outlined text-[18px]"
                      style={{ color: 'var(--color-accent-text)', fontVariationSettings: "'FILL' 1" }}>
                  forum
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                  Operator Chat
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
                  <span className="text-[9px] font-bold uppercase tracking-widest"
                        style={{ color: connected ? '#34d399' : 'var(--color-text-muted)' }}>
                    {connected ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all
                         hover:bg-white/10 active:scale-90"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* ── メッセージ領域 / 消息区域 ── */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-1 no-scrollbar"
            style={{ overscrollBehavior: 'contain' }}
          >
            {/* 履歴ロードインジケーター / 加载更多指示器 */}
            {loadingHistory && (
              <div className="flex justify-center py-2">
                <span className="material-symbols-outlined text-[18px] animate-spin"
                      style={{ color: 'var(--color-text-muted)' }}>
                  progress_activity
                </span>
              </div>
            )}

            {/* メッセージが空の場合 / 无消息时 */}
            {messages.length === 0 && !loadingHistory && (
              <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
                <span className="material-symbols-outlined text-[48px]"
                      style={{ color: 'var(--color-text-faint)' }}>
                  chat_bubble_outline
                </span>
                <p className="text-xs font-bold uppercase tracking-widest"
                   style={{ color: 'var(--color-text-faint)' }}>
                  No messages yet
                </p>
                <p className="text-[10px] text-center max-w-[200px]"
                   style={{ color: 'var(--color-text-faint)' }}>
                  Start a conversation with your team
                </p>
              </div>
            )}

            {/* メッセージリスト / 消息列表 */}
            {messages.map((msg, idx) => {
              const isMe = msg.senderUsername === currentUsername;
              const showDateHeader = isNewDay(msg.createdAt, messages[idx - 1]?.createdAt);
              const showAvatar = !isMe && (
                idx === messages.length - 1 ||
                messages[idx + 1]?.senderUsername !== msg.senderUsername ||
                isNewDay(messages[idx + 1]?.createdAt, msg.createdAt)
              );
              const isConsecutive = idx > 0 &&
                messages[idx - 1]?.senderUsername === msg.senderUsername &&
                !showDateHeader;

              return (
                <React.Fragment key={msg.id || idx}>
                  {/* 日付ヘッダー / 日期头 */}
                  {showDateHeader && (
                    <div className="flex items-center gap-3 py-3">
                      <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-faint)' }} />
                      <span className="text-[9px] font-bold uppercase tracking-widest shrink-0"
                            style={{ color: 'var(--color-text-faint)' }}>
                        {formatDateHeader(msg.createdAt)}
                      </span>
                      <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border-faint)' }} />
                    </div>
                  )}

                  {/* メッセージバブル / 消息气泡 */}
                  <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-0.5' : 'mt-3'}`}>
                    {/* 他人のアバター / 他人头像 */}
                    {!isMe && (
                      <div className="w-7 shrink-0 flex flex-col justify-end mr-2">
                        {showAvatar && (
                          <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-[10px] font-black"
                               style={{
                                 backgroundColor: 'var(--color-accent-bg)',
                                 color: 'var(--color-accent)',
                                 border: '1px solid var(--color-border)',
                               }}>
                            {msg.senderAvatarUrl ? (
                              <img src={msg.senderAvatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              (msg.senderDisplayName || msg.senderUsername || '?')[0].toUpperCase()
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      {/* 送信者名（非連続メッセージの最初のみ表示）/ 发送者名（仅非连续消息首条显示） */}
                      {!isMe && !isConsecutive && (
                        <span className="text-[9px] font-bold uppercase tracking-widest mb-1 ml-1"
                              style={{ color: 'var(--color-text-muted)' }}>
                          {msg.senderDisplayName || msg.senderUsername}
                        </span>
                      )}

                      {/* バブル本体 / 气泡本体 */}
                      <div
                        className={`px-3.5 py-2 text-[13px] leading-relaxed break-words ${
                          isMe
                            ? 'rounded-2xl rounded-br-md'
                            : 'rounded-2xl rounded-bl-md'
                        }`}
                        style={isMe ? {
                          background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-alt))',
                          color: 'var(--color-accent-text)',
                        } : {
                          backgroundColor: 'var(--color-bg-card)',
                          color: 'var(--color-text-primary)',
                          border: '1px solid var(--color-border-faint)',
                        }}
                      >
                        {msg.content}
                      </div>

                      {/* タイムスタンプ / 时间戳 */}
                      <span className="text-[9px] mt-0.5 mx-1"
                            style={{ color: 'var(--color-text-faint)' }}>
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

            {/* スクロール用アンカー / 滚动锚点 */}
            <div ref={messagesEndRef} />
          </div>

          {/* ── 入力エリア / 输入区域 ── */}
          <div
            className="shrink-0 px-4 py-3 flex items-end gap-2"
            style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}
          >
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 resize-none rounded-xl px-4 py-2.5 text-[13px] outline-none
                         placeholder:text-[var(--color-text-faint)]"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-input)',
                maxHeight: '100px',
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
              }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || !connected}
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                         transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: inputValue.trim() && connected
                  ? 'linear-gradient(135deg, var(--color-accent), var(--color-accent-alt))'
                  : 'var(--color-bg-card)',
                color: inputValue.trim() && connected
                  ? 'var(--color-accent-text)'
                  : 'var(--color-text-faint)',
              }}
            >
              <span className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}>
                send
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ── CSS アニメーション / CSS 动画 ── */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>,
    document.body
  );
}
