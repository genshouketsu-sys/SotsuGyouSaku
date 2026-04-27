import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCatalog from '../ProductCatalog';
import ScanningLogs from '../ScanningLogs';

function PcDashboard({ 
  currentView, 
  setCurrentView, 
  scans, 
  connectionStatus, 
  setIsMobileMode 
}) {
  const [totalSkus, setTotalSkus] = useState(0);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' or 'asc'

  useEffect(() => {
    if (currentView === 'dashboard') {
      fetchSkuCount();
    }
  }, [currentView]);

  const fetchSkuCount = async () => {
    try {
      const response = await axios.get('http://localhost:8081/api/products/count');
      if (response.data.success) {
        setTotalSkus(response.data.count);
      }
    } catch (err) {
      console.error('Failed to fetch SKU count:', err);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  // 排序 scans 数组
  const sortedScans = [...scans].sort((a, b) => {
    if (sortOrder === 'desc') {
      return b.time.localeCompare(a.time); // 假设时间格式可以直接字符串比较，或者可以解析成 Date 比较
    } else {
      return a.time.localeCompare(b.time);
    }
  });

  const renderContent = () => {
    if (currentView === 'catalog') {
      return <ProductCatalog />;
    }

    if (currentView === 'logs') {
      return <ScanningLogs />;
    }

    // Dashboard View
    return (
      <div className="p-margin max-w-7xl mx-auto space-y-lg">
        {/* Inventory Overview Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-8">
          <div className="space-y-2">
            <h1 className="font-h1 text-h1 text-primary">Inventory Overview</h1>
            <p className="text-on-surface-variant font-body-lg">Real-time predictive telemetry and logistical forecasting.</p>
          </div>
          <div className="flex items-center gap-4 pb-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
              <div className={`w-2 h-2 rounded-full ${connectionStatus === 'ACTIVE' ? 'bg-[#c5ff4a] animate-pulse' : 'bg-zinc-500'}`}></div>
              <span className={`text-xs uppercase tracking-widest ${connectionStatus === 'ACTIVE' ? 'text-[#c5ff4a]' : 'text-zinc-500'}`}>
                Live Sync {connectionStatus}
              </span>
            </div>
          </div>
        </section>

        {/* Metric Cards (Bento Style) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Metric 1 */}
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl space-y-4 border border-white/10 hover:border-[#c5ff4a]/30 transition-all group">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-zinc-500 group-hover:text-[#c5ff4a]">category</span>
              <span className="text-[#c5ff4a] font-bold text-xs bg-[#c5ff4a]/10 px-2 py-1 rounded">+12%</span>
            </div>
            <div>
              <h3 className="text-zinc-400 text-xs uppercase tracking-tighter mb-1">Total Active SKUs</h3>
              <p className="text-4xl font-bold text-white mt-1">{totalSkus}</p>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl space-y-4 border border-white/10 hover:border-[#c5ff4a]/30 transition-all group">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-zinc-500 group-hover:text-[#c5ff4a]">qr_code_scanner</span>
              <span className="text-zinc-400 font-bold text-xs bg-white/5 px-2 py-1 rounded">99.9% Uptime</span>
            </div>
            <div>
              <h3 className="text-zinc-400 text-xs uppercase tracking-tighter mb-1">Scans Today</h3>
              <p className="text-4xl font-bold text-white mt-1">2.1M</p>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl space-y-4 border border-red-500/20 hover:border-red-500 transition-all group">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-red-500">warning</span>
              <span className="text-red-200 font-bold text-xs bg-red-900/50 px-2 py-1 rounded uppercase tracking-wider">Action Required</span>
            </div>
            <div>
              <h3 className="text-zinc-400 text-xs uppercase tracking-tighter mb-1">Low Stock Alerts</h3>
              <p className="text-4xl font-bold text-white mt-1">14</p>
            </div>
          </div>
        </section>

        {/* System Health & Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8 pb-12">
          {/* Activity Table (Left) */}
          <div className="lg:col-span-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-white text-xl font-medium">Recent Scanning Activity</h3>
              <span className="material-symbols-outlined text-zinc-500 cursor-pointer hover:text-white">filter_list</span>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-zinc-400 text-xs uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4 font-semibold">SKU ID</th>
                    <th className="px-6 py-4 font-semibold cursor-pointer group hover:text-white transition-colors select-none" onClick={toggleSortOrder}>
                      <div className="flex items-center gap-1">
                        Timestamp
                        <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${sortOrder === 'desc' ? 'rotate-0' : 'rotate-180'}`}>
                          arrow_drop_down
                        </span>
                      </div>
                    </th>
                    <th className="px-6 py-4 font-semibold">Relay Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedScans.map((scan, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 font-medium text-white">{scan.id}</td>
                      <td className="px-6 py-4 text-zinc-400 text-sm">{scan.time}</td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-2 text-xs ${scan.status === 'Verified' ? 'text-[#c5ff4a]' : 'text-zinc-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${scan.status === 'Verified' ? 'bg-[#c5ff4a]' : 'bg-zinc-500'}`}></span>
                          {scan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-zinc-500 hover:text-[#c5ff4a] material-symbols-outlined">more_vert</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Health (Right) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-xl space-y-6">
              <h3 className="text-white text-xl font-medium">System Health</h3>
              <div className="space-y-4">
                {/* Relay Status */}
                <div className="p-4 rounded-lg bg-white/5 flex items-center justify-between border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#c5ff4a]">hub</span>
                    <span className="text-sm font-medium text-white">Scanning Relay</span>
                  </div>
                  <div className="px-2 py-1 rounded bg-[#c5ff4a]/10 text-[#c5ff4a] text-[10px] font-bold uppercase tracking-wider">{connectionStatus}</div>
                </div>
                {/* WebSocket Status */}
                <div className="p-4 rounded-lg bg-white/5 flex items-center justify-between border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#c5ff4a]">swap_calls</span>
                    <span className="text-sm font-medium text-white">WebSocket Bridge</span>
                  </div>
                  <div className="px-2 py-1 rounded bg-[#c5ff4a]/10 text-[#c5ff4a] text-[10px] font-bold uppercase tracking-wider">{connectionStatus}</div>
                </div>
                {/* Database Status */}
                <div className="p-4 rounded-lg bg-white/5 flex items-center justify-between border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-zinc-500">storage</span>
                    <span className="text-sm font-medium text-white">Local Cache</span>
                  </div>
                  <div className="px-2 py-1 rounded bg-zinc-400/10 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">SYNCING</div>
                </div>
              </div>

              {/* Visualization Mockup */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="h-32 w-full relative overflow-hidden rounded-lg bg-[#0c0f0f]">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#c5ff4a]/20 to-transparent"></div>
                  <svg className="absolute bottom-0 left-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d="M0,80 Q10,75 20,85 T40,60 T60,70 T80,40 T100,50 L100,100 L0,100 Z" fill="rgba(197, 255, 74, 0.15)"></path>
                    <path d="M0,80 Q10,75 20,85 T40,60 T60,70 T80,40 T100,50" fill="none" stroke="#C5FF4A" strokeWidth="1.5"></path>
                  </svg>
                  <div className="absolute top-2 left-2 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#c5ff4a] uppercase tracking-widest">Network Latency</span>
                    <span className="text-[10px] text-zinc-500">12ms avg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Card */}
            <div className="relative overflow-hidden group rounded-xl p-6 h-48 flex flex-col justify-end border border-white/10">
              <img alt="abstract" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuClDYoSRWhGyXZjaJjKtIhvqZyErwAgSQSTuIrk4wjPnvQTjli7GupF7BddMfOW6nv1kAwb_ynWDONUDcac5Q3UKcWKYG4M9BpO7QXjdSfI9kojWYYp_tfxCLfA0s6hvN-V8A_gWsmUyhxJwPn3OVpTjooUTVK5viLcd-dKxKLjMlkmdnfUHbI6O00cVAn186iQdG7asgA95l6SHyVTy1OPyA3jzkPaDIj3oikbHUR_dV8Mq8MqO_Av6BFbX5aHBDB31oieDQDL42nP" />
              <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-[2px]"></div>
              <div className="relative z-10 space-y-2">
                <h4 className="text-white font-bold">Predictive Restock</h4>
                <p className="text-xs text-zinc-300">AI suggests ordering 42 units of 'PRD-X92' based on next week's volatility forecast.</p>
                <button className="mt-2 text-xs font-bold text-[#c5ff4a] uppercase tracking-wider flex items-center gap-1 group/btn">
                  Execute Order
                  <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  };

  return (
    <>
      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 flex flex-col h-full z-40 bg-[#0c0f0f]/90 backdrop-blur-xl w-64 border-r rounded-none border-white/10 font-['Space_Grotesk'] antialiased">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-[#c5ff4a] flex items-center justify-center">
              <span className="material-symbols-outlined text-black" style={{ fontVariationSettings: "'FILL' 1" }}>dataset</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-[#c5ff4a]">OmniWMS</h2>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Predictive Logistics</p>
            </div>
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ease-in-out duration-200 ${
                currentView === 'dashboard' 
                  ? 'bg-[#c5ff4a]/10 text-[#c5ff4a] border-r-2 border-[#c5ff4a]' 
                  : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'
              }`}
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span className="font-medium text-left">Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentView('catalog')}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ease-in-out duration-200 ${
                currentView === 'catalog' 
                  ? 'bg-[#c5ff4a]/10 text-[#c5ff4a] border-r-2 border-[#c5ff4a]' 
                  : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'
              }`}
            >
              <span className="material-symbols-outlined">inventory_2</span>
              <span className="font-medium text-left">Product Catalog</span>
            </button>
            <button
              onClick={() => setCurrentView('logs')}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ease-in-out duration-200 ${
                currentView === 'logs' 
                  ? 'bg-[#c5ff4a]/10 text-[#c5ff4a] border-r-2 border-[#c5ff4a]' 
                  : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'
              }`}
            >
              <span className="material-symbols-outlined">barcode_scanner</span>
              <span className="font-medium text-left">Scanning Logs</span>
            </button>
          </nav>
        </div>
        <div className="mt-auto p-6">
          <button 
            onClick={() => setIsMobileMode(true)}
            className="w-full bg-[#c5ff4a] text-black py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Scan
          </button>
        </div>
      </aside>

      {/* Content Wrapper */}
      <main className="flex-1 ml-64 min-h-screen bg-[#121414] relative font-['Space_Grotesk']">

        {/* Background Grid Pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(197, 255, 74, 0.05) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>

        {/* TopAppBar */}
        <header className="sticky top-0 z-30 flex justify-between items-center w-full px-6 py-3 bg-[#0c0f0f]/80 backdrop-blur-2xl border-b border-white/10 shadow-none">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-[#c5ff4a] tracking-tighter">WMS Core</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-zinc-400 cursor-pointer hover:text-[#c5ff4a]">sensors</span>
              <span className="material-symbols-outlined text-zinc-400 cursor-pointer hover:text-[#c5ff4a]">wifi</span>
            </div>
            <div className="h-8 w-[1px] bg-white/10"></div>
            <div className="flex items-center gap-3 cursor-pointer">
              <img alt="User profile" className="w-8 h-8 rounded-full border border-white/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYNj53lBGrxai69qsW3mDAsRrXKoTv5SbjVvId_9fOVPJtFyH40YjbExepiZ_oR6R3MJGPLWDceB_9b-_nirk0_NNZZKLxbYWSLT5_o_ZFtRD0ml4qodNXu7nC4KJZNDtJgwnxQW2bi6IAFvdE2Fxz6O3Q2vjDD_3ek-_z3JQto5Vv8ga0-TFrurSkkGTC3p6O5cnj6Gbvy6F2eGeXFCBmR1ct49nJO9UZt72sk1W5jSUpSHA5E6rc0rhFTq2yaOWEhQrQtWz8MxcR" />
              <span className="text-zinc-400 font-medium text-sm">Admin Node-01</span>
            </div>
          </div>
        </header>

        {/* Rendered View Component */}
        {renderContent()}

      </main>

      {/* Floating Action Button - Only for Primary View */}
      {currentView === 'dashboard' && (
        <button 
          onClick={() => setIsMobileMode(true)}
          className="fixed bottom-12 right-12 bg-[#c5ff4a] text-black w-14 h-14 rounded-full shadow-2xl shadow-[#c5ff4a]/20 flex items-center justify-center hover:scale-105 transition-transform z-50"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_scanner</span>
        </button>
      )}

    </>
  );
}

export default PcDashboard;