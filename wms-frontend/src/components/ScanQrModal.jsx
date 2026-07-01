import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from '../i18n/LanguageContext';

function ScanQrModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  
  // __LOCAL_IP__ 由 vite.config.js 注入，如果是 localhost，优先使用浏览器的 hostname
  const defaultIp = window.location.hostname !== 'localhost' ? window.location.hostname : __LOCAL_IP__;
  const [customIp, setCustomIp] = useState(defaultIp);

  useEffect(() => {
    if (isOpen) {
      setCustomIp(window.location.hostname !== 'localhost' ? window.location.hostname : __LOCAL_IP__);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const username = localStorage.getItem('wms_username') || '1';
  const token = localStorage.getItem('wms_token') || '';
  const currentPort = window.location.port || '5173';
  const lanUrl = `https://${customIp}:${currentPort}/scanner?userId=${username}&token=${token}`;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-[#1e2020] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl relative overflow-hidden font-['Space_Grotesk']"
        onClick={e => e.stopPropagation()}
      >
        {/* Decorative glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#bcf540]/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#bcf540] flex items-center justify-center">
              <span className="material-symbols-outlined text-black" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_scanner</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{t('mobileScanner')}</h2>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">{t('scanToConnect')}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-xl p-4 mx-auto w-fit mb-6">
          <QRCodeSVG
            value={lanUrl}
            size={200}
            bgColor="#ffffff"
            fgColor="#121414"
            level="M"
            includeMargin={false}
          />
        </div>

        {/* URL Display and Edit */}
        <div className="bg-[#0c0f0f] border border-white/10 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">SERVER IP</p>
            {customIp === 'localhost' && (
              <span className="text-[10px] text-red-400 font-bold animate-pulse">
                ⚠️ 请修改为局域网 IP / Please change to LAN IP
              </span>
            )}
          </div>
          <input 
            type="text" 
            value={customIp}
            onChange={(e) => setCustomIp(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-[#bcf540] font-mono text-xs focus:outline-none focus:border-[#bcf540]/50 mb-2"
            placeholder="e.g. 192.168.1.100"
          />
          <p className="text-[#bcf540]/70 font-mono text-[10px] break-all select-all">{lanUrl}</p>
        </div>

        {/* Instructions */}
        <div className="space-y-2 text-xs text-zinc-400">
          <div className="flex items-start gap-2">
            <span className="text-[#bcf540] font-bold mt-px">1</span>
            <p>{t('qrStep1')} <span className="text-white font-medium">{t('qrStep1Highlight')}</span></p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[#bcf540] font-bold mt-px">2</span>
            <p>{t('qrStep2')} <span className="text-white font-medium">{t('qrStep2Highlight')}</span> {t('qrStep2End')}</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[#bcf540] font-bold mt-px">3</span>
            <p>{t('qrStep3')} <span className="text-white font-medium">{t('qrStep3Highlight')}</span>{t('qrStep3End')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScanQrModal;
