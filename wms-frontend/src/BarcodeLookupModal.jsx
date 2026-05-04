import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

function BarcodeLookupModal({ isOpen, onClose, onBarcodeFound }) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [lastScanned, setLastScanned] = useState(null);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    // auto-focus manual input when modal opens
    setTimeout(() => inputRef.current?.focus(), 100);
    return () => stopCamera();
  }, [isOpen]);

  const stopCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleClose = () => {
    stopCamera();
    setLastScanned(null);
    setManualInput('');
    setError(null);
    onClose();
  };

  const startCamera = () => {
    setError(null);
    setIsCameraActive(true);
    setTimeout(() => {
      const scanner = new Html5Qrcode('barcodeReader');
      scannerRef.current = scanner;
      scanner.start(
        { facingMode: 'environment' },
        { fps: 12, qrbox: { width: 280, height: 140 } },
        (text) => {
          handleFound(text);
          scanner.pause();
          setTimeout(() => scanner.resume(), 1500);
        },
        () => {}
      ).catch((err) => {
        setError('カメラにアクセスできません。HTTPSまたはlocalhostで開いてください。');
        setIsCameraActive(false);
      });
    }, 150);
  };

  const handleFound = (barcode) => {
    setLastScanned(barcode);
    onBarcodeFound(barcode);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleFound(manualInput.trim());
      setManualInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#161818] border border-white/10 rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#c5ff4a]">barcode_scanner</span>
            <h2 className="text-white font-semibold font-['Space_Grotesk']">バーコードスキャン</h2>
          </div>
          <button onClick={handleClose} className="p-1 text-zinc-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Camera area */}
          {isCameraActive ? (
            <div className="relative rounded-xl overflow-hidden border border-[#c5ff4a]/30 bg-black" style={{ height: 220 }}>
              <div id="barcodeReader" className="w-full h-full" />
              {/* scan line animation */}
              <div className="absolute inset-0 pointer-events-none">
                <div
                  className="w-full h-0.5 bg-[#c5ff4a] shadow-[0_0_8px_#c5ff4a]"
                  style={{ animation: 'scanLine 1.8s ease-in-out infinite' }}
                />
              </div>
              {/* corner brackets */}
              {['top-2 left-2 border-t-2 border-l-2 rounded-tl-lg', 'top-2 right-2 border-t-2 border-r-2 rounded-tr-lg',
                'bottom-2 left-2 border-b-2 border-l-2 rounded-bl-lg', 'bottom-2 right-2 border-b-2 border-r-2 rounded-br-lg'].map((cls, i) => (
                <div key={i} className={`absolute w-5 h-5 border-[#c5ff4a] pointer-events-none ${cls}`} />
              ))}
              <button
                onClick={stopCamera}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-4 py-1.5 rounded-full border border-white/20 hover:bg-black/80 transition"
              >
                停止
              </button>
            </div>
          ) : (
            <button
              onClick={startCamera}
              className="w-full py-8 rounded-xl border-2 border-dashed border-white/15 flex flex-col items-center gap-3 text-zinc-400 hover:border-[#c5ff4a]/40 hover:text-[#c5ff4a] transition-all group"
            >
              <span className="material-symbols-outlined text-5xl group-hover:scale-110 transition-transform">photo_camera</span>
              <span className="text-sm font-medium">タップしてカメラスキャン開始</span>
            </button>
          )}

          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-zinc-500 text-xs">または手動入力</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Manual / scanner-gun input */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              placeholder="バーコードを入力またはスキャン..."
              className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#c5ff4a] focus:border-transparent font-mono"
            />
            <button
              type="submit"
              className="bg-[#c5ff4a] text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#d4ff6a] transition active:scale-95"
            >
              検索
            </button>
          </form>

          {/* Last result */}
          {lastScanned && (
            <div className="bg-[#c5ff4a]/10 border border-[#c5ff4a]/30 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#c5ff4a]">check_circle</span>
              <div>
                <p className="text-xs text-zinc-400 mb-0.5">スキャン済み</p>
                <p className="text-[#c5ff4a] font-mono text-sm font-medium">{lastScanned}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scanLine {
          0%   { transform: translateY(0); }
          50%  { transform: translateY(210px); }
          100% { transform: translateY(0); }
        }
        #barcodeReader video { width: 100% !important; height: 100% !important; object-fit: cover; }
        #barcodeReader__scan_region { height: 100% !important; }
      `}</style>
    </div>
  );
}

export default BarcodeLookupModal;
