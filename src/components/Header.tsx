import React from 'react';
import { Zap, Wifi, ArrowLeftRight, HardDrive, Smartphone, Radio } from 'lucide-react';
import { PrimaryScreen } from '../types';

interface HeaderProps {
  currentScreen: PrimaryScreen;
  onSelectScreen: (screen: PrimaryScreen) => void;
  activeTransferCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onSelectScreen,
  activeTransferCount,
}) => {
  return (
    <div className="w-full bg-neutral-900 border-b border-neutral-800 px-4 py-2.5 flex items-center justify-between z-20">
      {/* Brand Title */}
      <div
        onClick={() => onSelectScreen('home')}
        className="flex items-center gap-2 cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-neutral-900 rounded-[10px] flex items-center justify-center">
            <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-black tracking-tight text-white flex items-center leading-none">
            MY <span className="text-emerald-400 ml-1">SENDER</span>
          </span>
          <span className="text-[9px] font-mono text-emerald-400/80 font-medium">Offline Direct</span>
        </div>
      </div>

      {/* Right Badges */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-850 border border-neutral-800 text-[11px] text-neutral-300">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="font-mono text-[10px] text-emerald-400">Wi-Fi Direct</span>
        </div>

        {activeTransferCount > 0 && (
          <button
            onClick={() => onSelectScreen('transfers')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-[11px] shadow-md shadow-emerald-500/20 animate-pulse"
          >
            <ArrowLeftRight className="w-3 h-3" />
            <span>{activeTransferCount} Active</span>
          </button>
        )}
      </div>
    </div>
  );
};
