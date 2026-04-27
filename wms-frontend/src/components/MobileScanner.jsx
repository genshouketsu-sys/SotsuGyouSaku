import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';

function MobileScanner({ userId = '1', onClose }) {
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    // 初始化 Html5Qrcode 实例，但不立即启动摄像头
    scannerRef.current = new Html5Qrcode("reader");

    // 组件卸载时清理
    return () => {
      if (scannerRef.current && isCameraActive) {
        scannerRef.current.stop().catch(err => console.error("Failed to stop scanner", err));
      }
    };
  }, []);

  const startScanner = () => {
    setIsScanning(true);
    setIsCameraActive(true);

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    const onScanSuccess = async (decodedText) => {
      // 扫码成功后暂停扫描
      setIsScanning(false);
      setScanResult(decodedText);
      scannerRef.current.pause();

      try {
        // 使用相对路径或动态获取的主机名进行请求，避免写死 localhost 导致手机端连不上电脑
        const backendUrl = `http://${window.location.hostname}:8081/api/scan/push`;
        
        // 向后端发送 POST 请求
        const response = await axios.post(backendUrl, {
          barcode: decodedText,
          userId: userId 
        });
        
        console.log("推送成功:", response.data);
        
        // 2秒后恢复初始状态，等待下一次点击扫描
        setTimeout(() => {
          scannerRef.current.stop().then(() => {
            setIsCameraActive(false);
            setScanResult(null);
          });
        }, 2000);

      } catch (error) {
        console.error("推送失败:", error);
        alert("推送失败，请检查网络或PC端是否在线");
        setTimeout(() => {
          scannerRef.current.stop().then(() => {
            setIsCameraActive(false);
            setScanResult(null);
          });
        }, 2000);
      }
    };

    const onScanFailure = () => {
      // ignore
    };

    // 启动后置摄像头
    scannerRef.current.start(
      { facingMode: "environment" },
      config,
      onScanSuccess,
      onScanFailure
    ).catch(err => {
      console.error("启动摄像头失败:", err);
      alert("无法访问摄像头，请确保您在使用 HTTPS 或 localhost，并已授予摄像头权限。");
      setIsScanning(false);
      setIsCameraActive(false);
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#121414] text-[#e2e2e2] flex flex-col font-['Inter'] relative overflow-hidden selection:bg-[#bcf540] selection:text-[#141f00]">
      {/* Ambient Background Glow */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80vw] max-w-lg h-[80vw] max-h-lg bg-[#bcf540]/5 rounded-full blur-[80px] pointer-events-none -z-10"></div>
      
      {/* Header / Status Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#333535]/50 bg-[#1e2020]/60 backdrop-blur-2xl sticky top-0 z-10 border border-[#8d937c]/15">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#282a2b] flex items-center justify-center border border-[#434935]/30 text-[#e2e2e2]">
            <span className="material-symbols-outlined text-[20px]">barcode_scanner</span>
          </div>
          <h1 className="text-xl font-['Space_Grotesk'] tracking-tight text-[#e2e2e2] font-semibold">Scanner Relay</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#282a2b] border border-[#434935]/50">
            <div className="w-2 h-2 rounded-full bg-[#bcf540] animate-pulse"></div>
            <span className="font-['Space_Grotesk'] text-[#e2e2e2] tracking-wider uppercase text-[10px] font-medium">Connected</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-[#e2e2e2]">close</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full max-w-md mx-auto relative z-0">
        
        {/* Primary Action Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
          {!isCameraActive ? (
            <>
              <p className="font-['Inter'] text-[#c3c9af] text-center mb-8">
                Ready to scan payload data. Ensure barcode is well-lit and centered.
              </p>
              <button 
                onClick={startScanner}
                className="relative group w-full aspect-square max-h-[320px] max-w-[320px] rounded-full bg-[#1e2020] flex items-center justify-center border border-[#434935]/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                {/* Inner glow ring */}
                <div className="absolute inset-2 rounded-full border border-[#bcf540]/20 bg-gradient-to-b from-[#bcf540]/5 to-transparent group-hover:border-[#bcf540]/40 transition-colors duration-300"></div>
                <div className="flex flex-col items-center gap-4 text-[#bcf540] z-10">
                  <span className="material-symbols-outlined text-[80px] font-light drop-shadow-[0_0_15px_rgba(188,245,64,0.3)]" style={{fontVariationSettings: "'wght' 200"}}>photo_camera</span>
                  <span className="font-['Space_Grotesk'] text-2xl tracking-tight text-[#e2e2e2] font-medium">Tap to Scan</span>
                </div>
                {/* Corner brackets decorative */}
                <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-[#bcf540]/40 rounded-tl-lg"></div>
                <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-[#bcf540]/40 rounded-tr-lg"></div>
                <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-[#bcf540]/40 rounded-bl-lg"></div>
                <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-[#bcf540]/40 rounded-br-lg"></div>
              </button>
            </>
          ) : (
            <div className="w-full aspect-square max-h-[320px] max-w-[320px] relative rounded-3xl overflow-hidden border-2 border-[#bcf540]/40 shadow-[0_0_30px_rgba(188,245,64,0.2)]">
              <div id="reader" className="w-full h-full bg-black"></div>
              
              {/* 扫码动画线 */}
              {isScanning && (
                <div className="absolute inset-0 z-10 pointer-events-none">
                  <div className="w-full h-1 bg-[#bcf540] shadow-[0_0_10px_#bcf540] animate-[scan_2s_ease-in-out_infinite]"></div>
                </div>
              )}

              {/* 扫码成功覆盖层 */}
              {!isScanning && scanResult && (
                <div className="absolute inset-0 z-20 bg-[#bcf540]/20 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                  <div className="w-16 h-16 rounded-full bg-[#bcf540] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-black text-3xl font-bold">check</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 font-['Space_Grotesk']">Scan Successful!</h3>
                  <p className="text-[#bcf540] font-mono text-lg break-all">
                    {scanResult}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Feedback Area */}
        <div className="px-6 pb-8 w-full mt-auto">
          <h2 className="font-['Space_Grotesk'] text-[#c3c9af] uppercase tracking-widest mb-4 flex items-center gap-2 text-xs font-medium">
            <span className="material-symbols-outlined text-[16px]">history</span>
            Last Scanned
          </h2>
          
          {scanResult ? (
            <div className="bg-[#1e2020] border border-[#434935]/30 rounded-xl p-4 flex items-center gap-4 relative overflow-hidden animate-in slide-in-from-bottom-4">
              {/* Subtle status highlight edge */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#bcf540]"></div>
              <div className="w-12 h-12 shrink-0 rounded-full bg-[#333535] flex items-center justify-center text-[#bcf540]">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <p className="font-['Inter'] text-[#e2e2e2] truncate font-medium text-lg">{scanResult}</p>
                  <span className="font-['Space_Grotesk'] text-[#8d937c] shrink-0 text-xs font-medium">Just now</span>
                </div>
                <p className="font-['Inter'] text-[#bcf540]/80 truncate text-sm">Relayed to PC_{userId} - Success</p>
              </div>
            </div>
          ) : (
            <div className="bg-[#1e2020] border border-[#434935]/30 rounded-xl p-4 flex items-center justify-center text-[#8d937c] text-sm">
              Waiting for new scan...
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(0); }
        }
        #reader__dashboard_section_csr span { display: none; }
        #reader video { object-fit: cover; border-radius: 1.5rem; }
      `}</style>
    </div>
  );
}

export default MobileScanner;