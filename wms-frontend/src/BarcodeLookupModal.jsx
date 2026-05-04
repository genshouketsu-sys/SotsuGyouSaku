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

  const startCamera = () => {
    setError(null);
    setIsCameraActive(true);
    setTimeout(() => {
      const scanner = new Html5Qrcode('barcodeReader');
      scannerRef.current = scanner;
      
      const config = {
        fps: 25,
        // Small center box for precision scanning
        qrbox: { width: 220, height: 220 },
        aspectRatio: 1.0,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      };

      scanner.start(
        { facingMode: 'environment' },
        config,
        (text) => {
          if (navigator.vibrate) navigator.vibrate(100);
          setLastScanned(text);
          onBarcodeFound(text);
          scanner.pause();
          setTimeout(() => {
             if (scannerRef.current) scanner.resume();
          }, 800);
        },
        () => {}
      ).catch((err) => {
        setError('Camera Access Error: ' + err);
        setIsCameraActive(false);
      });
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#161818] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c5ff4a]">center_focus_strong</span>
            <h2 className="text-white font-bold text-lg">Precision Lookup</h2>
          </div>
          <button onClick={() => { stopCamera(); onClose(); }} className="text-zinc-500 hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        {isCameraActive ? (
          <div className="relative mb-6 rounded-xl overflow-hidden border border-white/5">
            <div id="barcodeReader" className="w-full aspect-square bg-black" />
            {/* Center Focus Guide */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[220px] h-[220px] border-2 border-[#c5ff4a] rounded-2xl shadow-[0_0_0_999px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#c5ff4a]/50 shadow-[0_0_10px_#c5ff4a]"></div>
                </div>
            </div>
            <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-[#c5ff4a] font-bold uppercase tracking-widest bg-black/60 px-3 py-1 rounded-full">Only center will be read</p>
          </div>
        ) : (
          <button 
            onClick={startCamera} 
            className="w-full py-16 border-2 border-dashed border-white/10 rounded-xl text-zinc-500 hover:text-[#c5ff4a] hover:border-[#c5ff4a]/40 transition-all flex flex-col items-center gap-2 mb-6"
          >
            <span className="material-symbols-outlined text-4xl">filter_center_focus</span>
            <span className="font-medium text-sm">Start Precision Scanner</span>
          </button>
        )}

        {error && <p className="text-red-500 text-xs mb-4 bg-red-500/10 p-2 rounded">{error}</p>}

        <form onSubmit={(e) => { e.preventDefault(); if(manualInput) onBarcodeFound(manualInput); }} className="flex gap-2">
          <input 
            ref={inputRef}
            className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-[#c5ff4a]/50" 
            placeholder="Manual entry..."
            value={manualInput}
            onChange={e => setManualInput(e.target.value)}
          />
          <button type="submit" className="bg-[#c5ff4a] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#d4ff6a] transition shadow-[0_0_20px_rgba(197,255,74,0.2)]">
            Find
          </button>
        </form>
      </div>
    </div>
  );
}

export default BarcodeLookupModal;
