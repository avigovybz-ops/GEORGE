import React from 'react';
import { Home, FolderOpen, ArrowLeftRight } from 'lucide-react';
import { PrimaryScreen } from '../types';

interface NavigationProps {
  currentScreen: PrimaryScreen;
  onSelectScreen: (screen: PrimaryScreen) => void;
  selectedFilesCount: number;
  activeTransfersCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentScreen,
  onSelectScreen,
  selectedFilesCount,
  activeTransfersCount,
}) => {
  return (
    <nav aria-label="Main Navigation" className="w-full bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-800 px-4 py-2 flex items-center justify-around z-20">
      {/* Tab 1: HOME */}
      <button
        id="nav-tab-home"
        onClick={() => onSelectScreen('home')}
        className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all relative ${
          currentScreen === 'home'
            ? 'text-emerald-400 font-semibold'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <div
          className={`p-1.5 rounded-xl transition-all ${
            currentScreen === 'home'
              ? 'bg-emerald-500/20 shadow-sm shadow-emerald-500/20'
              : 'hover:bg-neutral-800'
          }`}
        >
          <Home className="w-5 h-5" />
        </div>
        <span className="text-[11px] mt-0.5 tracking-tight">Home</span>
      </button>

      {/* Tab 2: FILES */}
      <button
        id="nav-tab-files"
        onClick={() => onSelectScreen('files')}
        className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all relative ${
          currentScreen === 'files'
            ? 'text-emerald-400 font-semibold'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <div
          className={`p-1.5 rounded-xl transition-all relative ${
            currentScreen === 'files'
              ? 'bg-emerald-500/20 shadow-sm shadow-emerald-500/20'
              : 'hover:bg-neutral-800'
          }`}
        >
          <FolderOpen className="w-5 h-5" />
          {selectedFilesCount > 0 && (
            <span className="absolute -top-1 -right-1.5 bg-emerald-500 text-neutral-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-bounce">
              {selectedFilesCount > 9 ? '9+' : selectedFilesCount}
            </span>
          )}
        </div>
        <span className="text-[11px] mt-0.5 tracking-tight">Files</span>
      </button>

      {/* Tab 3: TRANSFERS */}
      <button
        id="nav-tab-transfers"
        onClick={() => onSelectScreen('transfers')}
        className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all relative ${
          currentScreen === 'transfers'
            ? 'text-emerald-400 font-semibold'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <div
          className={`p-1.5 rounded-xl transition-all relative ${
            currentScreen === 'transfers'
              ? 'bg-emerald-500/20 shadow-sm shadow-emerald-500/20'
              : 'hover:bg-neutral-800'
          }`}
        >
          <ArrowLeftRight className="w-5 h-5" />
          {activeTransfersCount > 0 && (
            <span className="absolute -top-1 -right-1.5 bg-emerald-400 text-black font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
              {activeTransfersCount}
            </span>
          )}
        </div>
        <span className="text-[11px] mt-0.5 tracking-tight">Transfers</span>
      </button>
    </nav>
  );
};
