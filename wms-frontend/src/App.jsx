import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import PcDashboard from './components/PcDashboard';
import MobileScanner from './components/MobileScanner';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [scans, setScans] = useState([
    { id: 'PRD-X92-BLA', time: '14:02:11.23', status: 'Verified' },
    { id: 'SKU-441-MET', time: '14:01:58.09', status: 'Verified' },
    { id: 'LOG-772-GRN', time: '14:01:45.55', status: 'Secondary' },
  ]);

  const [connectionStatus, setConnectionStatus] = useState('CONNECTING');
  const wsRef = useRef(null);

  // 监听窗口大小，决定是否默认展示移动端模式
  useEffect(() => {
    const handleResize = () => {
      // 在移动端设备上（比如屏幕宽度较小），或者是用户强行点击了打开扫描器
      if (window.innerWidth <= 768) {
        setIsMobileMode(true);
      } else {
        setIsMobileMode(false);
      }
    };
    
    // 初始化检测
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // 模拟连接到 WebSocket 后端
    const clientId = 'pc_1'; // 硬编码模拟 PC 端 ID
    const wsUrl = `ws://localhost:8081/ws/scan?clientId=${clientId}`;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('Connected to WebSocket server');
      setConnectionStatus('ACTIVE');
    };

    wsRef.current.onmessage = (event) => {
      console.log('Received message:', event.data);
      // 将接收到的条码添加到扫描列表头部
      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      setScans(prev => [
        { id: event.data, time: timeString, status: 'Verified' },
        ...prev.slice(0, 4) // 保持最多5条记录
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
      connectionStatus={connectionStatus}
      setIsMobileMode={setIsMobileMode}
    />
  );
}

export default App;