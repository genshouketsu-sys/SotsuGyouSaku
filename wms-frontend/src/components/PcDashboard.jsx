import React, { useState } from 'react';
import ProductCatalog from '../ProductCatalog';
import ScanningLogs from '../ScanningLogs';
import ScanQrModal from './ScanQrModal';
import AdminSettingsModal from './AdminSettingsModal';
import { useTranslation } from '../i18n/LanguageContext';

function PcDashboard({ 
  currentView, 
  setCurrentView, 
  scans, 
  setScans,
  connectionStatus, 
  setIsMobileMode 
}) {
  const { t, language, setLanguage } = useTranslation();
  const [showQr, setShowQr] = useState(false);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  
  // Predictive Restocking State
  const [predictions, setPredictions] = useState([]);
  const [showPredictionsModal, setShowPredictionsModal] = useState(false);

  React.useEffect(() => {
    // Fetch predictions on mount and interval
    const fetchPredictions = async () => {
      try {
        const response = await fetch('/api/predictions/restock');
        if (response.ok) {
          const data = await response.json();
          setPredictions(data);
        }
      } catch (error) {
        console.error("Failed to fetch predictions:", error);
      }
    };
    fetchPredictions();
    const interval = setInterval(fetchPredictions, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const onSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedScans = [...scans]
    .filter(scan => statusFilter === 'All' ? true : scan.status === statusFilter)
    .sort((a, b) => {
      if (!sortColumn) return 0;
      const valA = a[sortColumn] || '';
      const valB = b[sortColumn] || '';
      const cmp = valA.localeCompare(valB);
      return sortDirection === 'asc' ? cmp : -cmp;
    });

  const handleDeleteScan = (idToDelete) => {
    if (setScans) {
      setScans(prev => prev.filter(scan => scan.id !== idToDelete));
    }
  };

  const handleExecuteOrder = async (skuCode, quantity) => {
    try {
      // In a real app, this would hit an order execution endpoint
      alert(`Predictive order of ${quantity} units for '${skuCode}' executed successfully!`);
      // Update UI optimistically or fetch again
      setPredictions(prev => prev.filter(p => p.skuCode !== skuCode));
    } catch (error) {
      console.error('Failed to execute order:', error);
      alert('Failed to execute predictive order.');
    }
  };

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
            <h1 className="font-h1 text-h1 text-primary">{t('inventoryOverview')}</h1>
            <p className="text-on-surface-variant font-body-lg">{t('overviewDesc')}</p>
          </div>
          <div className="flex items-center gap-4 pb-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
              <div className={`w-2 h-2 rounded-full ${connectionStatus === 'ACTIVE' ? 'bg-[#c5ff4a] animate-pulse' : 'bg-zinc-500'}`}></div>
              <span className={`text-xs uppercase tracking-widest ${connectionStatus === 'ACTIVE' ? 'text-[#c5ff4a]' : 'text-zinc-500'}`}>
                {t('liveSync')} {connectionStatus}
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
              <h3 className="text-zinc-400 text-xs uppercase tracking-tighter mb-1">{t('totalActiveSKUs')}</h3>
              <p className="text-4xl font-bold text-white mt-1">4,821</p>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl space-y-4 border border-white/10 hover:border-[#c5ff4a]/30 transition-all group">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-zinc-500 group-hover:text-[#c5ff4a]">qr_code_scanner</span>
              <span className="text-zinc-400 font-bold text-xs bg-white/5 px-2 py-1 rounded">99.9% {t('uptime')}</span>
            </div>
            <div>
              <h3 className="text-zinc-400 text-xs uppercase tracking-tighter mb-1">{t('scansToday')}</h3>
              <p className="text-4xl font-bold text-white mt-1">2.1M</p>
            </div>
          </div>

          {/* Metric 3 */}
          <div 
            onClick={() => predictions.length > 0 && setShowPredictionsModal(true)}
            className={`bg-white/5 backdrop-blur-md p-6 rounded-xl space-y-4 border transition-all group ${predictions.length > 0 ? 'border-red-500/20 hover:border-red-500 cursor-pointer' : 'border-white/10'}`}
          >
            <div className="flex justify-between items-start">
              <span className={`material-symbols-outlined ${predictions.length > 0 ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`}>warning</span>
              <span className={`font-bold text-xs px-2 py-1 rounded uppercase tracking-wider ${predictions.length > 0 ? 'text-red-200 bg-red-900/50' : 'text-zinc-400 bg-white/5'}`}>{t('actionRequired')}</span>
            </div>
            <div>
              <h3 className="text-zinc-400 text-xs uppercase tracking-tighter mb-1">{t('lowStockAlerts')}</h3>
              <p className="text-4xl font-bold text-white mt-1">{predictions.length}</p>
            </div>
          </div>
        </section>

        {/* System Health & Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8 pb-12">
          {/* Activity Table (Left) */}
          <div className="lg:col-span-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-white text-xl font-medium">{t('recentScanningActivity')}</h3>
              <button 
                onClick={() => setStatusFilter(prev => prev === 'All' ? 'Verified' : 'All')}
                className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${statusFilter !== 'All' ? 'bg-[#c5ff4a]/20 text-[#c5ff4a]' : 'text-zinc-500 hover:text-white'}`}
              >
                <span className="material-symbols-outlined text-sm">filter_list</span>
                {statusFilter === 'All' ? t('filterAll') : t('filterVerified')}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-zinc-400 text-xs uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4 font-semibold">{t('skuId')}</th>
                    <th className="px-6 py-4 font-semibold">{t('productName')}</th>
                    <th 
                      className="px-6 py-4 font-semibold cursor-pointer hover:text-white transition-colors select-none"
                      onClick={() => onSort('time')}
                    >
                      <span className="flex items-center gap-1">
                        {t('timestamp')}
                        <span className="material-symbols-outlined text-sm">
                          {sortColumn === 'time' ? (sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                        </span>
                      </span>
                    </th>
                    <th 
                      className="px-6 py-4 font-semibold cursor-pointer hover:text-white transition-colors select-none"
                      onClick={() => onSort('status')}
                    >
                      <span className="flex items-center gap-1">
                        {t('relayStatus')}
                        <span className="material-symbols-outlined text-sm">
                          {sortColumn === 'status' ? (sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                        </span>
                      </span>
                    </th>
                    <th className="px-6 py-4 font-semibold text-right">{t('action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedScans.map((scan, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 font-medium text-white">{scan.id}</td>
                      <td className="px-6 py-4 text-zinc-300 text-sm">{scan.name || '—'}</td>
                      <td className="px-6 py-4 text-zinc-400 text-sm">{scan.time}</td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-2 text-xs ${scan.status === 'Verified' ? 'text-[#c5ff4a]' : 'text-zinc-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${scan.status === 'Verified' ? 'bg-[#c5ff4a]' : 'bg-zinc-500'}`}></span>
                          {scan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteScan(scan.id)}
                          title="Remove from Activity Log"
                          className="text-zinc-500 hover:text-red-500 material-symbols-outlined transition-colors"
                        >
                          delete
                        </button>
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
              <h3 className="text-white text-xl font-medium">{t('systemHealth')}</h3>
              <div className="space-y-4">
                {/* Relay Status */}
                <div className="p-4 rounded-lg bg-white/5 flex items-center justify-between border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#c5ff4a]">hub</span>
                    <span className="text-sm font-medium text-white">{t('scanningRelay')}</span>
                  </div>
                  <div className="px-2 py-1 rounded bg-[#c5ff4a]/10 text-[#c5ff4a] text-[10px] font-bold uppercase tracking-wider">{connectionStatus}</div>
                </div>
                {/* WebSocket Status */}
                <div className="p-4 rounded-lg bg-white/5 flex items-center justify-between border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#c5ff4a]">swap_calls</span>
                    <span className="text-sm font-medium text-white">{t('websocketBridge')}</span>
                  </div>
                  <div className="px-2 py-1 rounded bg-[#c5ff4a]/10 text-[#c5ff4a] text-[10px] font-bold uppercase tracking-wider">{connectionStatus}</div>
                </div>
                {/* Database Status */}
                <div className="p-4 rounded-lg bg-white/5 flex items-center justify-between border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-zinc-500">storage</span>
                    <span className="text-sm font-medium text-white">{t('localCache')}</span>
                  </div>
                  <div className="px-2 py-1 rounded bg-zinc-400/10 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{t('syncing')}</div>
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
                    <span className="text-[10px] font-bold text-[#c5ff4a] uppercase tracking-widest">{t('networkLatency')}</span>
                    <span className="text-[10px] text-zinc-500">12ms avg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Card */}
            <div className="relative overflow-hidden group rounded-xl p-6 h-48 flex flex-col justify-end border border-white/10 cursor-pointer" onClick={() => setShowPredictionsModal(true)}>
              <img alt="abstract" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuClDYoSRWhGyXZjaJjKtIhvqZyErwAgSQSTuIrk4wjPnvQTjli7GupF7BddMfOW6nv1kAwb_ynWDONUDcac5Q3UKcWKYG4M9BpO7QXjdSfI9kojWYYp_tfxCLfA0s6hvN-V8A_gWsmUyhxJwPn3OVpTjooUTVK5viLcd-dKxKLjMlkmdnfUHbI6O00cVAn186iQdG7asgA95l6SHyVTy1OPyA3jzkPaDIj3oikbHUR_dV8Mq8MqO_Av6BFbX5aHBDB31oieDQDL42nP" />
              <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-[2px]"></div>
              <div className="relative z-10 space-y-2">
                <h4 className="text-white font-bold">{t('predictiveRestock')}</h4>
                <p className="text-xs text-zinc-300">
                  {predictions.length > 0 
                    ? `${predictions.length} items require your attention based on AI usage forecasting.` 
                    : t('predictiveDesc')}
                </p>
                <button 
                  className="mt-2 text-xs font-bold text-[#c5ff4a] uppercase tracking-wider flex items-center gap-1 group/btn hover:text-white transition-colors"
                >
                  {t('executeOrder')}
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
              <h2 className="text-lg font-black text-[#c5ff4a]">{t('omniWMS')}</h2>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{t('predictiveLogistics')}</p>
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
              <span className="font-medium text-left">{t('dashboard')}</span>
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
              <span className="font-medium text-left">{t('productCatalog')}</span>
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
              <span className="font-medium text-left">{t('scanningLogs')}</span>
            </button>
          </nav>
        </div>
        <div className="mt-auto p-6">
          <button 
            onClick={() => setShowQr(true)}
            className="w-full bg-[#c5ff4a] text-black py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            {t('newScan')}
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
            <div className="flex bg-white/5 rounded-lg border border-white/10 overflow-hidden">
              <button onClick={() => setLanguage('en')} className={`px-3 py-1 text-xs font-medium transition-colors ${language === 'en' ? 'bg-[#c5ff4a] text-black' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>EN</button>
              <button onClick={() => setLanguage('zh')} className={`px-3 py-1 text-xs font-medium transition-colors ${language === 'zh' ? 'bg-[#c5ff4a] text-black' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>中</button>
              <button onClick={() => setLanguage('ja')} className={`px-3 py-1 text-xs font-medium transition-colors ${language === 'ja' ? 'bg-[#c5ff4a] text-black' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>日</button>
            </div>
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-zinc-400 cursor-pointer hover:text-[#c5ff4a]">sensors</span>
              <span className="material-symbols-outlined text-zinc-400 cursor-pointer hover:text-[#c5ff4a]">wifi</span>
            </div>
            <div className="h-8 w-[1px] bg-white/10"></div>
            <div className="relative">
              <div 
                className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-1.5 rounded-lg transition-colors"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <img alt="User profile" className="w-8 h-8 rounded-full border border-white/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYNj53lBGrxai69qsW3mDAsRrXKoTv5SbjVvId_9fOVPJtFyH40YjbExepiZ_oR6R3MJGPLWDceB_9b-_nirk0_NNZZKLxbYWSLT5_o_ZFtRD0ml4qodNXu7nC4KJZNDtJgwnxQW2bi6IAFvdE2Fxz6O3Q2vjDD_3ek-_z3JQto5Vv8ga0-TFrurSkkGTC3p6O5cnj6Gbvy6F2eGeXFCBmR1ct49nJO9UZt72sk1W5jSUpSHA5E6rc0rhFTq2yaOWEhQrQtWz8MxcR" />
                <span className="text-zinc-400 font-medium text-sm">Admin Node-01</span>
                <span className="material-symbols-outlined text-zinc-500 text-sm transition-transform duration-200" style={{ transform: showUserMenu ? 'rotate(180deg)' : 'none' }}>expand_more</span>
              </div>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1e2020] border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <button className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">login</span>
                    {t('login') || 'Login'}
                  </button>
                  <button 
                    onClick={() => { setShowAdminSettings(true); setShowUserMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                    {t('editAdmin') || 'Edit Admin Options'}
                  </button>
                  <div className="h-px bg-white/10 my-1"></div>
                  <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    {t('logout') || 'Logout'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Rendered View Component */}
        {renderContent()}

      </main>

      {/* Floating Action Button - Only for Primary View */}
      {currentView === 'dashboard' && (
        <button 
          onClick={() => setShowQr(true)}
          className="fixed bottom-12 right-12 bg-[#c5ff4a] text-black w-14 h-14 rounded-full shadow-2xl shadow-[#c5ff4a]/20 flex items-center justify-center hover:scale-105 transition-transform z-50"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_scanner</span>
        </button>
      )}

      <ScanQrModal isOpen={showQr} onClose={() => setShowQr(false)} />
      <AdminSettingsModal isOpen={showAdminSettings} onClose={() => setShowAdminSettings(false)} />

      {/* Predictions Modal */}
      {showPredictionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1e2020] border border-white/10 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c5ff4a]">auto_awesome</span>
                {t('predictiveRestock')}
              </h2>
              <button onClick={() => setShowPredictionsModal(false)} className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-auto pr-2">
              {predictions.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <span className="material-symbols-outlined text-4xl mb-2">check_circle</span>
                  <p>All stock levels are healthy.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {predictions.map((p, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between md:items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs px-2 py-1 bg-white/10 rounded text-zinc-300">{p.skuCode}</span>
                          <h4 className="font-medium text-white">{p.name}</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-xs text-zinc-400">
                          <div>Current: <span className="text-white font-medium">{p.currentStock}</span></div>
                          <div>ROP: <span className="text-[#c5ff4a] font-medium">{p.reorderPoint}</span></div>
                          <div>Daily: <span className="text-white font-medium">{p.dailyUsage}</span>/d</div>
                          <div>Depletion in: <span className="text-red-400 font-bold">{p.daysUntilDepletion} days</span></div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-xs text-zinc-400">Suggested: <span className="text-white font-bold text-base">{p.suggestedOrderQuantity}</span> units</div>
                        <button 
                          onClick={() => handleExecuteOrder(p.skuCode, p.suggestedOrderQuantity)}
                          className="bg-[#c5ff4a] text-black px-4 py-2 rounded-lg text-sm font-bold hover:brightness-110 transition-all flex items-center gap-1 active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span>
                          {t('executeOrder')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PcDashboard;