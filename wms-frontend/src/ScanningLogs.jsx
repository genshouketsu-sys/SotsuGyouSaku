import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from './i18n/LanguageContext';

function ScanningLogs() {
  const { t } = useTranslation();
  const [currentScan, setCurrentScan] = useState(null);
  const [recentScans, setRecentScans] = useState([
    { id: '7721-ALP-001', name: 'Logic Board' },
    { id: '7721-ALP-002', name: 'Logic Board' },
    { id: '8849-QPX-2990', name: 'Quantum Processor' },
    { id: '1102-SYS-442', name: 'Cooling Array' },
    { id: '1102-SYS-443', name: 'Cooling Array' }
  ]);
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING');
  const wsRef = useRef(null);

  useEffect(() => {
    // 模拟连接到 WebSocket 后端
    const clientId = 'pc_1'; // 硬编码模拟 PC 端 ID
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/scan?clientId=${clientId}`;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('Connected to WebSocket server (Scanning Logs)');
      setConnectionStatus('ACTIVE');
    };

    wsRef.current.onmessage = (event) => {
      console.log('Received scan message:', event.data);
      const barcode = event.data;
      
      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} UTC`;
      
      const newScan = {
        barcode: barcode,
        name: 'Product Item (Auto-detected)',
        weight: (Math.random() * 5 + 0.5).toFixed(1) + ' kg',
        destination: `Aisle ${Math.floor(Math.random() * 20) + 1}, Rack ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`,
        time: timeString
      };

      setCurrentScan(newScan);
      
      setRecentScans(prev => [
        { id: barcode, name: 'Product Item' },
        ...prev.slice(0, 4)
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

  return (
    <div className="bg-transparent text-[#e2e2e2] h-[calc(100vh-64px)] w-full relative flex flex-col font-['Space_Grotesk']">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 opacity-80 pointer-events-none" style={{
        background: `radial-gradient(circle at 50% 50%, rgba(188, 245, 64, 0.05) 0%, rgba(18, 20, 20, 0) 50%),
                     radial-gradient(circle at 80% 20%, rgba(188, 245, 64, 0.03) 0%, rgba(18, 20, 20, 0) 40%),
                     radial-gradient(circle at 20% 80%, rgba(188, 245, 64, 0.04) 0%, rgba(18, 20, 20, 0) 60%)`
      }}></div>

      {/* Main Canvas (Monitoring Wall) */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        
        {/* Glassmorphism Card for Current Scan */}
        {currentScan ? (
          <div className="w-full max-w-4xl bg-[#1e2020]/30 backdrop-blur-3xl border border-white/10 rounded-xl p-8 md:p-12 flex flex-col items-center text-center relative overflow-hidden animate-in zoom-in duration-300">
            {/* Status Indicator */}
            <div className="absolute top-8 left-8 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connectionStatus === 'ACTIVE' ? 'bg-[#bcf540] animate-pulse' : 'bg-red-500'}`}></div>
              <span className="font-medium text-xs text-[#c3c9af] uppercase tracking-widest">
                {connectionStatus === 'ACTIVE' ? t('liveFeedActive') : t('disconnected')}
              </span>
            </div>
            
            {/* Abstract Decorative Elements inside card */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#bcf540]/5 rounded-full blur-3xl"></div>
            
            {/* Core Data */}
            <div className="mb-8">
              <span className="font-medium text-xs text-[#bcf540] border border-[#bcf540]/30 bg-[#bcf540]/5 px-3 py-1 rounded-full mb-6 inline-block animate-pulse">{t('justScanned')}</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">{currentScan.name}</h2>
              <p className="text-lg text-[#c3c9af] max-w-2xl mx-auto">{t('scanDesc')}</p>
            </div>
            
            {/* Massive Barcode Visual */}
            <div className="bg-[#333535]/50 border border-white/5 p-8 rounded-lg mb-8 w-full max-w-2xl flex flex-col items-center justify-center">
              <div className="flex gap-1 h-24 w-full justify-center opacity-80 mb-4">
                {/* Simulated Barcode Lines */}
                {[1,3,1,2,4,1,1,3,2,1,5,1,2,1,3,1,2,4,1].map((w, i) => (
                  <div key={i} className="bg-[#e2e2e2] h-full" style={{ width: `${w * 4}px` }}></div>
                ))}
              </div>
              <span className="text-2xl font-medium text-[#e2e2e2] tracking-[0.2em] opacity-90">ID: {currentScan.barcode}</span>
            </div>
            
            {/* Meta Details */}
            <div className="grid grid-cols-3 gap-8 w-full max-w-2xl border-t border-white/5 pt-8">
              <div className="flex flex-col items-center">
                <span className="font-medium text-xs text-[#c3c9af] mb-1 uppercase">{t('weight')}</span>
                <span className="text-xl text-[#e2e2e2] font-mono">{currentScan.weight}</span>
              </div>
              <div className="flex flex-col items-center border-l border-r border-white/5">
                <span className="font-medium text-xs text-[#c3c9af] mb-1 uppercase">{t('destination')}</span>
                <span className="text-xl text-[#e2e2e2]">{currentScan.destination}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-medium text-xs text-[#c3c9af] mb-1 uppercase">{t('timestamp')}</span>
                <span className="text-xl text-[#bcf540] font-mono">{currentScan.time}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl bg-[#1e2020]/30 backdrop-blur-3xl border border-white/10 rounded-xl p-24 flex flex-col items-center text-center relative overflow-hidden border-dashed border-2">
             <div className="absolute top-8 left-8 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connectionStatus === 'ACTIVE' ? 'bg-[#bcf540] animate-pulse' : 'bg-red-500'}`}></div>
              <span className="font-medium text-xs text-[#c3c9af] uppercase tracking-widest">
                {connectionStatus === 'ACTIVE' ? t('waitingForScan') : t('disconnected')}
              </span>
            </div>
            <span className="material-symbols-outlined text-6xl text-[#474746] mb-4">barcode_scanner</span>
            <h2 className="text-2xl font-bold text-[#c3c9af] mb-2">{t('readyToScan')}</h2>
            <p className="text-[#656464]">{t('scanInstruction')}</p>
          </div>
        )}
      </div>

      {/* Scrolling Ticker Bottom Bar */}
      <div className="h-16 border-t border-white/10 bg-[#0c0f0f]/80 backdrop-blur-md flex items-center overflow-hidden whitespace-nowrap w-full">
        <div className="flex items-center font-medium text-xs text-[#c3c9af] py-2 px-8 bg-[#282a2b] border-r border-white/10 z-10 shadow-[10px_0_20px_rgba(0,0,0,0.5)] h-full">
          <span className="material-symbols-outlined text-[16px] mr-2">history</span>
          {t('recentScans')}
        </div>
        
        {/* Ticker Content Container */}
        <div className="flex-1 flex gap-8 px-8 items-center text-sm font-['Inter'] opacity-70 overflow-x-auto no-scrollbar">
          {recentScans.map((scan, i) => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[#bcf540]">✓</span>
                <span className="font-mono text-[#e2e2e2]">{scan.id}</span>
                <span className="text-[#c3c9af]">- {scan.name}</span>
              </div>
              {i < recentScans.length - 1 && <div className="w-px h-4 bg-white/10 shrink-0"></div>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ScanningLogs;