import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import PcDashboard from './components/PcDashboard';
import MobileScanner from './components/MobileScanner';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

// ── Axios グローバル設定 / Axios 全局配置 ──────────────────────────────────
// リクエストインターセプター: JWT を Authorization ヘッダーに付加
// 请求拦截器：自动在请求头注入 JWT Token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// レスポンスインターセプター: 401/403 時は自動ログアウト
// 响应拦截器：401/403 时自动清除 Token 并跳转登录页
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('wms_token');
      localStorage.removeItem('wms_username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  // スキャン記録: 初期値は空配列、バックエンドから非同期ロード
  // 扫描记录：初始为空数组，启动后从后端加载历史日志
  const [scans, setScans] = useState([]);

  const [connectionStatus, setConnectionStatus] = useState('OFFLINE');
  const wsRef = useRef(null);
  const productsCache = useRef([]);

  // ── 商品キャッシュのロード / 加载商品缓存（用于 WebSocket 消息的名称解析）──
  useEffect(() => {
    const token = localStorage.getItem('wms_token');
    if (!token) return;
    axios.get('/api/products')
      .then(res => { productsCache.current = res.data; })
      .catch(() => {});
  }, []);

  // ── 起動時スキャンログのロード / 启动时加载历史扫描日志 ──────────────────
  useEffect(() => {
    const token = localStorage.getItem('wms_token');
    if (!token) return;

    axios.get('/api/scan/logs')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          // バックエンドのログを UI のフォーマットに変換
          // 将后端日志格式转换为前端 UI 格式
          const loaded = res.data.slice(0, 20).map(log => ({
            id:     log.barcode || log.id || '—',
            name:   log.productName || log.name || '—',
            time:   log.scanTime
                      ? new Date(log.scanTime).toLocaleTimeString('ja-JP', { hour12: false })
                      : (log.time || '—'),
            status: log.status || 'Verified',
          }));
          setScans(loaded);
        }
      })
      .catch(() => {
        // ログ取得失敗でも UI は動作を継続 / 日志加载失败不影响页面功能
      });
  }, []);

  // ── WebSocket 接続（ログイン済み時のみ）/ WebSocket 连接（仅已登录时）────
  useEffect(() => {
    const token = localStorage.getItem('wms_token');
    if (!token) return;

    const username  = localStorage.getItem('wms_username') || '1';
    const clientId  = `pc_${username}`;
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl     = `${wsProtocol}//${window.location.host}/ws/scan?clientId=${clientId}`;

    const connect = () => {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('[WS] Connected');
        setConnectionStatus('ACTIVE');
      };

      wsRef.current.onmessage = (event) => {
        const rawData = event.data;
        console.log(`[WS] Received: ${rawData}`);

        // UNDO シグナル / 撤销信号
        if (rawData === 'UNDO_LAST_ACTION') {
          setScans(prev => prev.slice(1));
          return;
        }

        let barcode, resolvedName;
        try {
          const data = JSON.parse(rawData);
          barcode      = data.barcode;
          resolvedName = data.name;
        } catch {
          barcode = rawData;
          const product = productsCache.current.find(
            p => p.barcode === barcode || p.skuCode === barcode
          );
          resolvedName = product ? product.name : 'Unknown Product';
        }

        const now        = new Date();
        const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

        setScans(prev => [
          { id: barcode, name: resolvedName, time: timeString, status: 'Verified' },
          ...prev.slice(0, 19), // 最大20件 / Keep latest 20
        ]);

        window.dispatchEvent(new CustomEvent('wms-new-scan', { detail: { barcode } }));
      };

      wsRef.current.onclose = (e) => {
        console.log('[WS] Disconnected. Code:', e.code);
        setConnectionStatus('OFFLINE');
        // 異常切断の場合は5秒後に再接続 / 非正常断开则5秒后重连
        if (e.code !== 1000) {
          setTimeout(connect, 5000);
        }
      };

      wsRef.current.onerror = (err) => {
        console.error('[WS] Error:', err);
      };
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null; // 再接続ループを防止 / 防止重连循环
        wsRef.current.close(1000);
      }
    };
  }, []);

  return (
    <Router>
      <Routes>
        {/* パブリック: ログインページ / 公开路由：登录页 */}
        <Route path="/login" element={<LoginPage />} />

        {/* 保護ルート: PC ダッシュボード / 受保护路由：PC 仪表板 */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <PcDashboard
                currentView={currentView}
                setCurrentView={setCurrentView}
                scans={scans}
                setScans={setScans}
                connectionStatus={connectionStatus}
              />
            </ProtectedRoute>
          }
        />

        {/* モバイルスキャナー / 移动端扫码页 */}
        <Route
          path="/scanner"
          element={<MobileScanner onClose={() => window.location.href = '/'} />}
        />

        {/* フォールバック / 兜底路由 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;