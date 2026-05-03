import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from './i18n/LanguageContext';
import axios from 'axios';

function ScanningLogs({ connectionStatus }) {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');


  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/scan/logs');
      setHistory(response.data);
    } catch (error) {
      console.error("Failed to fetch scan history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();

    const handleNewScan = (e) => {
      console.log(`[ScanningLogs] Notified of new scan: ${e.detail.barcode}`);
      // Refresh history after a short delay to ensure DB sync
      setTimeout(fetchHistory, 500);
    };

    window.addEventListener('wms-new-scan', handleNewScan);
    
    // Fallback: refresh every 30s just in case
    const interval = setInterval(fetchHistory, 30000);

    return () => {
      window.removeEventListener('wms-new-scan', handleNewScan);
      clearInterval(interval);
    };
  }, []);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Barcode,Product Name,Time\n"
      + history.map(log => `${log.barcode},${log.productName || 'Unknown'},${log.scan_time}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "scan_logs.csv");
    document.body.appendChild(link);
    link.click();
  };

  const filteredHistory = history.filter(log => 
    (log.barcode && log.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.productName && log.productName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-transparent text-[#e2e2e2] min-h-[calc(100vh-64px)] w-full relative flex flex-col font-['Space_Grotesk'] p-8">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">{t('scanningLogs')}</h1>
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${connectionStatus === 'ACTIVE' ? 'bg-[#c5ff4a]/10 text-[#c5ff4a]' : 'bg-red-500/10 text-red-500'}`}>
              {connectionStatus}
            </div>
          </div>
          <p className="text-zinc-500 text-sm max-w-xl">Full historical record of all terminal scanning activities and inventory relay logs.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex flex-col items-end mr-4">
            <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Active Client ID</span>
            <span className="text-xs text-[#c5ff4a] font-mono">{`pc_${localStorage.getItem('wms_username') || '1'}`}</span>
          </div>
          <button 
            onClick={fetchHistory}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all active:scale-95"
            title="Manual Refresh"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
          </button>
          <div className="relative flex-1 md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">search</span>
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#c5ff4a] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            {t('export')}
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-[#1e2020]/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0c0f0f]/80 sticky top-0 z-20">
              <tr className="text-[11px] text-zinc-500 uppercase font-bold tracking-widest border-b border-white/5">
                <th className="px-8 py-5">{t('timestamp')}</th>
                <th className="px-8 py-5">{t('barcode')}</th>
                <th className="px-8 py-5">{t('productName')}</th>
                <th className="px-8 py-5 text-right">{t('status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-zinc-600">
                      <span className="material-symbols-outlined animate-spin text-3xl">refresh</span>
                      <p className="text-sm">Retrieving archive records...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-zinc-600">
                      <span className="material-symbols-outlined text-4xl opacity-20">history_off</span>
                      <p className="text-sm">No scanning activity found in the logs.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((log, i) => (
                  <tr key={i} className="hover:bg-[#c5ff4a]/5 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex flex-col">
                        <span className="text-white text-sm font-medium">{new Date(log.scan_time).toLocaleTimeString()}</span>
                        <span className="text-zinc-500 text-[10px] uppercase">{new Date(log.scan_time).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-zinc-300 font-mono text-sm tracking-wider bg-white/5 px-2 py-1 rounded-lg border border-white/5">{log.barcode}</span>
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-white text-sm font-medium group-hover:text-[#c5ff4a] transition-colors">
                        {log.productName || <span className="text-zinc-600 italic">Unidentified SKU</span>}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#c5ff4a]/10 text-[#c5ff4a] text-[10px] font-bold rounded-full uppercase tracking-tighter">
                        <span className="w-1.5 h-1.5 bg-[#c5ff4a] rounded-full animate-pulse"></span>
                        Relay Success
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="px-8 py-4 bg-[#0c0f0f]/40 border-t border-white/5 text-[11px] text-zinc-600 flex justify-between items-center">
          <div>Showing {filteredHistory.length} scan events</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#c5ff4a]"></span>
            Database Sync: Nominal
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScanningLogs;