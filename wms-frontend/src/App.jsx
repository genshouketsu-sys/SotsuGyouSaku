import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import PcDashboard from './components/PcDashboard';
import MobileScanner from './components/MobileScanner';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [scans, setScans] = useState([
    { id: 'PRD-X92-BLA', name: 'Black T-Shirt', time: '14:02:11', status: 'Verified' },
    { id: 'SKU-441-MET', name: 'Metal Water Bottle', time: '14:01:58', status: 'Verified' },
    { id: 'LOG-772-GRN', name: 'Green Notebook', time: '14:01:45', status: 'Secondary' },
  ]);

  const [connectionStatus, setConnectionStatus] = useState('CONNECTING');
  const wsRef = useRef(null);
  const productsCache = useRef([]);

  // 获取产品列表用于名称查询
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => { productsCache.current = data; })
      .catch(() => {});
  }, []);

  // 监听窗口大小，决定是否默认展示移动端模式
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsMobileMode(true);
      } else {
        setIsMobileMode(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const clientId = 'pc_1';
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/scan?clientId=${clientId}`;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('Connected to WebSocket server');
      setConnectionStatus('ACTIVE');
    };

    wsRef.current.onmessage = (event) => {
      const barcode = event.data;
      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      // 从缓存中查找产品名称
      const product = productsCache.current.find(p => p.barcode === barcode || p.skuCode === barcode);
      const productName = product ? product.name : 'Unknown Product';

      setScans(prev => [
        { id: barcode, name: productName, time: timeString, status: 'Verified' },
        ...prev.slice(0, 9) // 保持最多10条记录
      ]);
    };

    wsRef.current.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setConnectionStatus('OFFLINE');
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // 如果处于移动端模式，或者强制开启了扫码器，直接返回全屏的 MobileScanner
  if (isMobileMode) {
    return <MobileScanner onClose={() => {
      // 如果屏幕依然很小，不允许关闭（强制保持在手机视图）
      if (window.innerWidth > 768) {
        setIsMobileMode(false);
      }
    }} />;
  }

  // 否则，渲染电脑端的大屏面板
  return (
    <PcDashboard 
      currentView={currentView}
      setCurrentView={setCurrentView}
      scans={scans}
      setScans={setScans}
      connectionStatus={connectionStatus}
      setIsMobileMode={setIsMobileMode}
    />
  );
}

export default App;