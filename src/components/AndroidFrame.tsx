import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery, Smartphone, Maximize2, Minimize2 } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  activeScreenName: string;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  const [isFramed, setIsFramed] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center sm:p-4 md:p-6 select-none font-sans">
      {/* Top Floating Utility Bar */}
      <header aria-label="Desktop Controls" className="w-full max-w-md hidden sm:flex items-center justify-between px-3 py-2 text-xs text-neutral-400 bg-neutral-900/80 backdrop-blur-md rounded-2xl mb-3 border border-neutral-800/80 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-medium text-neutral-200">MY SENDER</span>
          <span className="text-neutral-500">•</span>
          <span className="text-emerald-400 font-mono text-[11px]">Wi-Fi Direct Active</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="toggle-frame-mode-btn"
            onClick={() => setIsFramed(!isFramed)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors text-[11px] font-medium"
            title="Toggle Android Device Frame"
          >
            {isFramed ? (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Full Width</span>
              </>
            ) : (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Phone Frame</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container / Android Device Mockup */}
      <div
        className={`w-full transition-all duration-300 relative flex flex-col ${
          isFramed
            ? 'max-w-[430px] h-[92vh] max-h-[880px] rounded-[44px] border-[6px] border-neutral-800 bg-neutral-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(16,185,129,0.12)] overflow-hidden'
            : 'max-w-2xl min-h-[95vh] rounded-3xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden'
        }`}
      >
        {/* Android Status Bar */}
        <div className="w-full bg-neutral-900/95 backdrop-blur-md px-6 pt-3 pb-2 flex items-center justify-between text-xs font-semibold text-neutral-300 z-30 select-none border-b border-neutral-800/40">
          <span className="font-mono tracking-tight text-[13px]">{currentTime || '10:42'}</span>

          {/* Android Punch-hole Camera */}
          <div className="w-3.5 h-3.5 rounded-full bg-black border border-neutral-800 shadow-inner flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-emerald-950/60"></div>
          </div>

          <div className="flex items-center gap-2 text-neutral-300">
            <div className="flex items-center gap-0.5 text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-800/50">
              5G
            </div>
            <Wifi className="w-3.5 h-3.5 text-neutral-200" />
            <Signal className="w-3.5 h-3.5 text-neutral-200" />
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-neutral-400 font-mono">98%</span>
              <Battery className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            </div>
          </div>
        </div>

        {/* Screen Application Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>

        {/* Android Gesture Navigation Pill */}
        <div className="w-full py-2 bg-neutral-950 flex items-center justify-center z-30 border-t border-neutral-900">
          <div className="w-32 h-1 bg-neutral-600 rounded-full hover:bg-neutral-400 transition-colors cursor-pointer"></div>
        </div>
      </div>
    </div>
  );
};
