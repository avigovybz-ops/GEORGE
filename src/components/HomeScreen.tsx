import React from 'react';
import { 
  Send, 
  Download, 
  Laptop, 
  QrCode, 
  Smartphone, 
  Trash2, 
  HardDrive, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle, 
  Zap, 
  Radio,
  Share2,
  FileCheck
} from 'lucide-react';
import { HistoryRecord, StorageBreakdown } from '../types';
import { formatBytes } from '../utils/fileUtils';

interface HomeScreenProps {
  onGoToSend: () => void;
  onGoToReceive: () => void;
  onOpenWebShare: () => void;
  onOpenPhoneClone: () => void;
  onOpenStorageCleaner: () => void;
  onOpenQRConnect: () => void;
  storage: StorageBreakdown;
  recentHistory: HistoryRecord[];
  onViewHistory: () => void;
  selectedCount: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onGoToSend,
  onGoToReceive,
  onOpenWebShare,
  onOpenPhoneClone,
  onOpenStorageCleaner,
  onOpenQRConnect,
  storage,
  recentHistory,
  onViewHistory,
  selectedCount,
}) => {
  const usedPercentage = Math.round((storage.usedBytes / storage.totalBytes) * 100);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 pb-20 scrollbar-none">
      {/* Top Header / Branding */}
      <header aria-label="Brand Header" className="text-center pt-2 pb-1">
        <div className="inline-flex items-center justify-center gap-2 mb-1">
          {/* Logo Mark: Stylized geometric send glyph */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-neutral-900 rounded-[14px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400 animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-sans flex items-center">
            MY <span className="text-emerald-400 ml-1.5">SENDER</span>
          </h1>
        </div>
        <p className="text-[12px] font-medium text-neutral-400 tracking-wide">
          Share Anything. Anywhere. Offline.
        </p>
      </header>

      {/* Primary Action Buttons: SEND & RECEIVE */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* SEND BUTTON */}
        <button
          id="home-action-send-btn"
          onClick={onGoToSend}
          className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 active:scale-[0.97] p-5 rounded-3xl shadow-xl shadow-emerald-900/40 text-left transition-all duration-200 border border-emerald-400/40 flex flex-col justify-between h-36"
        >
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none group-hover:scale-125 transition-transform"></div>
          <div className="flex items-center justify-between w-full">
            <div className="w-11 h-11 rounded-2xl bg-neutral-950/30 backdrop-blur-md flex items-center justify-center text-neutral-950 font-bold border border-white/20">
              <Send className="w-6 h-6 text-white stroke-[2.5] -translate-y-0.5 translate-x-0.5" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-neutral-950/40 text-emerald-100 backdrop-blur-sm">
              Sender Mode
            </span>
          </div>

          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
              <span>SEND</span>
              {selectedCount > 0 && (
                <span className="text-xs bg-white text-neutral-950 font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                  {selectedCount}
                </span>
              )}
            </h2>
            <p className="text-[11px] text-emerald-100/90 font-medium mt-0.5">
              Select files, apps & media
            </p>
          </div>
        </button>

        {/* RECEIVE BUTTON */}
        <button
          id="home-action-receive-btn"
          onClick={onGoToReceive}
          className="group relative overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900 hover:from-neutral-750 hover:to-neutral-850 active:scale-[0.97] p-5 rounded-3xl shadow-xl shadow-black/60 text-left transition-all duration-200 border border-neutral-700/80 flex flex-col justify-between h-36"
        >
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none group-hover:scale-125 transition-transform"></div>
          <div className="flex items-center justify-between w-full">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
              <Download className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              Radar On
            </span>
          </div>

          <div>
            <h2 className="text-xl font-black text-white tracking-tight">RECEIVE</h2>
            <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
              Open Hotspot & QR code
            </p>
          </div>
        </button>
      </div>

      {/* Storage Breakdown Widget */}
      <section aria-label="Device Storage" className="bg-neutral-850 border border-neutral-800/80 rounded-3xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-neutral-800 text-emerald-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-neutral-200">Device Internal Storage</span>
          </div>
          <span className="text-xs font-mono font-bold text-neutral-300">
            {formatBytes(storage.usedBytes)} <span className="text-neutral-500">/ {formatBytes(storage.totalBytes)}</span>
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden flex p-0.5 border border-neutral-800">
          <div
            style={{ width: `${(storage.appsBytes / storage.totalBytes) * 100}%` }}
            className="h-full bg-emerald-500 rounded-l-full"
            title="Apps"
          />
          <div
            style={{ width: `${(storage.photosBytes / storage.totalBytes) * 100}%` }}
            className="h-full bg-teal-400"
            title="Photos"
          />
          <div
            style={{ width: `${(storage.videosBytes / storage.totalBytes) * 100}%` }}
            className="h-full bg-cyan-500"
            title="Videos"
          />
          <div
            style={{ width: `${(storage.musicBytes / storage.totalBytes) * 100}%` }}
            className="h-full bg-amber-400"
            title="Music"
          />
          <div
            style={{ width: `${(storage.docsBytes / storage.totalBytes) * 100}%` }}
            className="h-full bg-rose-400"
            title="Docs"
          />
        </div>

        {/* Category Legend */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-neutral-800/60 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-neutral-400">Apps ({formatBytes(storage.appsBytes, 0)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            <span className="text-neutral-400">Photos ({formatBytes(storage.photosBytes, 0)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
            <span className="text-neutral-400">Videos ({formatBytes(storage.videosBytes, 0)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="text-neutral-400">Music ({formatBytes(storage.musicBytes, 0)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span className="text-neutral-400">Docs ({formatBytes(storage.docsBytes, 0)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-neutral-600"></span>
            <span className="text-emerald-400 font-semibold">{formatBytes(storage.freeBytes, 0)} Free</span>
          </div>
        </div>
      </section>

      {/* Quick Tools Grid */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Quick Tools</h3>
          <span className="text-[11px] text-emerald-400 font-medium">No Internet Needed</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Tool 1: Connect PC */}
          <button
            id="tool-connect-pc-btn"
            onClick={onOpenWebShare}
            className="p-3.5 rounded-2xl bg-neutral-850 hover:bg-neutral-800 active:scale-[0.98] border border-neutral-800 text-left transition-all flex items-start gap-3"
          >
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20 shrink-0">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-200">Connect PC</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Browser WebShare</p>
            </div>
          </button>

          {/* Tool 2: QR Quick Connect */}
          <button
            id="tool-qr-connect-btn"
            onClick={onOpenQRConnect}
            className="p-3.5 rounded-2xl bg-neutral-850 hover:bg-neutral-800 active:scale-[0.98] border border-neutral-800 text-left transition-all flex items-start gap-3"
          >
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-200">QR Connect</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Scan to Pair</p>
            </div>
          </button>

          {/* Tool 3: Phone Clone */}
          <button
            id="tool-phone-clone-btn"
            onClick={onOpenPhoneClone}
            className="p-3.5 rounded-2xl bg-neutral-850 hover:bg-neutral-800 active:scale-[0.98] border border-neutral-800 text-left transition-all flex items-start gap-3"
          >
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/20 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-200">Phone Clone</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">1-Tap Switch</p>
            </div>
          </button>

          {/* Tool 4: Storage Cleaner */}
          <button
            id="tool-clean-storage-btn"
            onClick={onOpenStorageCleaner}
            className="p-3.5 rounded-2xl bg-neutral-850 hover:bg-neutral-800 active:scale-[0.98] border border-neutral-800 text-left transition-all flex items-start gap-3"
          >
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20 shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-200">Clean Junk</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Free up 2.1 GB</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Transfers Feed */}
      <section aria-label="Recent Transfers">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Recent Transfers</h3>
          </div>
          <button
            onClick={onViewHistory}
            className="text-[11px] text-emerald-400 font-semibold hover:underline"
          >
            View All
          </button>
        </div>

        <div className="space-y-2">
          {recentHistory.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-neutral-850 border border-neutral-800/80 flex items-center justify-between hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    item.direction === 'send'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                  }`}
                >
                  {item.direction === 'send' ? (
                    <ArrowUpRight className="w-5 h-5" />
                  ) : (
                    <ArrowDownLeft className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-neutral-200 truncate">{item.file.name}</p>
                  <p className="text-[10px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-neutral-300 font-medium">{item.file.formattedSize}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-mono">{item.averageSpeed}</span>
                    <span>•</span>
                    <span>{item.peerName}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-emerald-400 shrink-0 ml-2">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
