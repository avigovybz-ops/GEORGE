import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Radio, 
  ArrowLeftRight, 
  Clock, 
  Smartphone, 
  QrCode, 
  Wifi, 
  Zap, 
  CheckCircle2, 
  Pause, 
  Play, 
  X, 
  Download, 
  Share2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  FileText, 
  Package, 
  Image as ImageIcon, 
  Film, 
  Music, 
  FolderArchive,
  RefreshCw,
  Eye,
  Trash2,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DevicePeer, FileItem, HistoryRecord, TransferItem, TransferSession } from '../types';
import { formatBytes, formatSpeed, formatSeconds, triggerHaptic, downloadBlob, createDummyBlob } from '../utils/fileUtils';

interface TransferRadarScreenProps {
  initialMode?: 'sender' | 'receiver';
  selectedFiles: FileItem[];
  availablePeers: DevicePeer[];
  activeSession: TransferSession | null;
  history: HistoryRecord[];
  onStartTransferToPeer: (peer: DevicePeer, filesToSend: FileItem[]) => void;
  onCancelSession: () => void;
  onPauseResumeItem: (fileId: string) => void;
  onClearHistory: () => void;
  onPreviewFile: (file: FileItem) => void;
  onGoToFilePicker: () => void;
}

export const TransferRadarScreen: React.FC<TransferRadarScreenProps> = ({
  initialMode = 'sender',
  selectedFiles,
  availablePeers,
  activeSession,
  history,
  onStartTransferToPeer,
  onCancelSession,
  onPauseResumeItem,
  onClearHistory,
  onPreviewFile,
  onGoToFilePicker,
}) => {
  const [subTab, setSubTab] = useState<'radar' | 'qr' | 'history'>('radar');
  const [filterHistory, setFilterHistory] = useState<'all' | 'sent' | 'received'>('all');
  const [selectedRadarPeer, setSelectedRadarPeer] = useState<DevicePeer | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);

  // If there's an active transfer session, switch focus to it
  useEffect(() => {
    if (activeSession && activeSession.status === 'transferring') {
      triggerHaptic([30, 50, 30]);
    }
  }, [activeSession?.status]);

  const handleSelectPeerToTransfer = (peer: DevicePeer) => {
    setSelectedRadarPeer(peer);
    triggerHaptic(20);
    onStartTransferToPeer(peer, selectedFiles);
  };

  const filteredHistory = history.filter((h) => {
    if (filterHistory === 'sent') return h.direction === 'send';
    if (filterHistory === 'received') return h.direction === 'receive';
    return true;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-neutral-900 text-neutral-100">
      {/* Top Header & Sub-Navigation */}
      <div className="bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <h2 className="text-sm font-bold tracking-tight text-white">
            {activeSession ? 'Live Transfer' : 'Offline Connection Hub'}
          </h2>
        </div>

        {/* Sub-tab pills */}
        {!activeSession && (
          <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
            <button
              onClick={() => {
                setSubTab('radar');
                triggerHaptic(10);
              }}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                subTab === 'radar'
                  ? 'bg-emerald-500 text-neutral-950 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Radar
            </button>
            <button
              onClick={() => {
                setSubTab('qr');
                triggerHaptic(10);
              }}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                subTab === 'qr'
                  ? 'bg-emerald-500 text-neutral-950 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              QR Code
            </button>
            <button
              onClick={() => {
                setSubTab('history');
                triggerHaptic(10);
              }}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                subTab === 'history'
                  ? 'bg-emerald-500 text-neutral-950 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              History
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: ACTIVE LIVE TRANSFER SESSION */}
      {activeSession ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 scrollbar-none">
          {/* Peer Card & Real-time Speedometer */}
          <div className="bg-gradient-to-br from-neutral-850 to-neutral-900 border border-emerald-500/40 rounded-3xl p-4 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-inner">
                  {activeSession.peer.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-white">{activeSession.peer.name}</h3>
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.2 rounded font-bold">
                      {activeSession.direction === 'send' ? 'Sending' : 'Receiving'}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Wi-Fi Direct 5GHz • {activeSession.peer.distance}
                  </p>
                </div>
              </div>

              {/* Live Transfer Speed */}
              <div className="text-right">
                <span className="text-lg font-mono font-black text-emerald-400">
                  {activeSession.status === 'completed' ? 'Done' : formatSpeed(activeSession.currentSpeed)}
                </span>
                <p className="text-[10px] text-neutral-400 font-mono">
                  {activeSession.status === 'completed'
                    ? '100% Completed'
                    : `ETA: ~${formatSeconds(activeSession.estimatedRemainingSeconds)}`}
                </p>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs font-mono text-neutral-300 mb-1.5">
                <span>
                  {formatBytes(activeSession.transferredBytes)} / {formatBytes(activeSession.totalBytes)}
                </span>
                <span className="font-bold text-emerald-400">{Math.round(activeSession.overallProgress)}%</span>
              </div>
              <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden p-0.5 border border-neutral-800">
                <div
                  style={{ width: `${activeSession.overallProgress}%` }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300 shadow-sm shadow-emerald-500/50"
                />
              </div>
            </div>

            {/* Visual Beam Animation */}
            {activeSession.status === 'transferring' && (
              <div className="mt-3 py-1 px-3 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-center justify-between text-[11px] text-neutral-300">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Zap className="w-3.5 h-3.5 animate-bounce" />
                  <span>5.8 GHz Direct P2P Channel</span>
                </div>
                <span className="font-mono text-neutral-400">0 KB Mobile Data Used</span>
              </div>
            )}
          </div>

          {/* Transfer Files Queue */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Transfer Queue ({activeSession.items.length})
              </h4>
              {activeSession.status === 'completed' && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  All Files Transferred!
                </span>
              )}
            </div>

            {activeSession.items.map((item) => (
              <div
                key={item.file.id}
                className="p-3 rounded-2xl bg-neutral-850 border border-neutral-800 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-emerald-400 shrink-0">
                      {item.file.category === 'apps' && <Package className="w-5 h-5" />}
                      {item.file.category === 'photos' && <ImageIcon className="w-5 h-5" />}
                      {item.file.category === 'videos' && <Film className="w-5 h-5" />}
                      {item.file.category === 'music' && <Music className="w-5 h-5" />}
                      {item.file.category === 'docs' && <FileText className="w-5 h-5" />}
                      {item.file.category === 'files' && <FolderArchive className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white truncate">{item.file.name}</p>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        {formatBytes(item.bytesTransferred)} / {item.file.formattedSize}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {item.status === 'completed' ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onPreviewFile(item.file)}
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white"
                          title="Open/Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (item.file.fileBlob) {
                              downloadBlob(item.file.fileBlob, item.file.name);
                            } else {
                              downloadBlob(createDummyBlob(item.file.name, item.file.size), item.file.name);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                          title="Save File"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onPauseResumeItem(item.file.id)}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                      >
                        {item.status === 'paused' ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Individual progress bar */}
                <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${item.progress}%` }}
                    className={`h-full rounded-full transition-all duration-200 ${
                      item.status === 'completed' ? 'bg-emerald-400' : 'bg-emerald-500 animate-pulse'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Session Action Footer */}
          <div className="pt-2">
            <button
              onClick={onCancelSession}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                activeSession.status === 'completed'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-emerald-500/25'
                  : 'bg-neutral-800 hover:bg-neutral-750 text-rose-400 border border-neutral-700'
              }`}
            >
              {activeSession.status === 'completed' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Transfer Finished • Back to Radar</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4" />
                  <span>Cancel Transfer Session</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : subTab === 'radar' ? (
        /* VIEW 2: RADAR DEVICE SCANNER */
        <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4 pb-20 scrollbar-none">
          {/* Radar Screen Area */}
          <div className="relative w-full h-64 rounded-3xl bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 border border-neutral-800 flex items-center justify-center overflow-hidden shadow-inner">
            {/* Animated Radar Rings */}
            <div className="absolute w-52 h-52 rounded-full border border-emerald-500/20 animate-ping duration-1000 pointer-events-none"></div>
            <div className="absolute w-44 h-44 rounded-full border border-emerald-500/30 pointer-events-none"></div>
            <div className="absolute w-28 h-28 rounded-full border border-emerald-500/40 pointer-events-none"></div>
            <div className="absolute w-12 h-12 rounded-full border border-emerald-500/60 pointer-events-none"></div>

            {/* Radar Sweeping Beam */}
            <div className="absolute w-52 h-52 rounded-full bg-gradient-to-tr from-emerald-500/15 via-transparent to-transparent animate-spin duration-3000 pointer-events-none"></div>

            {/* Central Local Device Node */}
            <div className="z-10 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/40 border-2 border-white">
                <Radio className="w-7 h-7 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold mt-1 bg-neutral-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                You (Sender)
              </span>
            </div>

            {/* Nearby Floating Device Peers on Radar */}
            {availablePeers.map((peer, idx) => {
              // Position peers around radar
              const positions = [
                'top-4 left-6',
                'top-6 right-6',
                'bottom-6 left-8',
                'bottom-4 right-8',
              ];
              const pos = positions[idx % positions.length];

              return (
                <button
                  key={peer.id}
                  onClick={() => handleSelectPeerToTransfer(peer)}
                  className={`absolute ${pos} z-20 group flex flex-col items-center active:scale-90 transition-transform`}
                  title={`Connect to ${peer.name}`}
                >
                  <div className="w-11 h-11 rounded-2xl bg-neutral-850 hover:bg-emerald-500 text-white hover:text-neutral-950 border border-emerald-500/50 flex items-center justify-center text-xl shadow-lg transition-colors">
                    {peer.avatar}
                  </div>
                  <span className="text-[9px] font-semibold text-neutral-300 bg-neutral-950/90 px-1.5 py-0.5 rounded-md mt-1 border border-neutral-800 max-w-[80px] truncate">
                    {peer.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Files Ready for Transfer Banner */}
          {selectedFiles.length > 0 ? (
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">
                  {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} ready to send
                </p>
                <p className="text-[11px] font-mono text-emerald-400">
                  Tap any nearby device below to start
                </p>
              </div>
              <button
                onClick={onGoToFilePicker}
                className="text-[11px] font-bold text-neutral-300 hover:text-white bg-neutral-800 px-2.5 py-1.5 rounded-xl"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-neutral-850 border border-neutral-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-neutral-300">No files selected yet</p>
                <p className="text-[10px] text-neutral-500">Pick files, apps, or music to send</p>
              </div>
              <button
                onClick={onGoToFilePicker}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs shadow-md"
              >
                Select Files
              </button>
            </div>
          )}

          {/* Discovered Nearby Devices List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Nearby Android Devices ({availablePeers.length})
              </h4>
              <span className="text-[10px] font-mono text-emerald-400 animate-pulse flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> Scanning
              </span>
            </div>

            {availablePeers.map((peer) => (
              <div
                key={peer.id}
                onClick={() => handleSelectPeerToTransfer(peer)}
                className="p-3 rounded-2xl bg-neutral-850 hover:bg-neutral-800 border border-neutral-800/90 hover:border-emerald-500/50 cursor-pointer flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 group-hover:border-emerald-500/50 flex items-center justify-center text-xl">
                    {peer.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {peer.name}
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      {peer.model} • {peer.distance} • <span className="text-emerald-400">{peer.osVersion || 'Android'}</span>
                    </p>
                  </div>
                </div>

                <button className="px-3 py-1.5 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs shadow-md group-hover:bg-emerald-400 transition-colors">
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : subTab === 'qr' ? (
        /* VIEW 3: QR CODE HOTSPOT MODE */
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-center space-y-4 pb-20 scrollbar-none">
          <div className="bg-neutral-850 p-6 rounded-3xl border border-neutral-800 max-w-xs w-full shadow-xl flex flex-col items-center">
            <h3 className="font-bold text-base text-white">Direct QR Pairing</h3>
            <p className="text-xs text-neutral-400 mt-1 mb-4">
              Receiver scans this code to establish a high-speed Wi-Fi Direct connection
            </p>

            <div className="bg-white p-4 rounded-2xl shadow-inner mb-4">
              <QRCodeSVG
                value="MYSENDER:P2P:WIFI-DIRECT:SSID=MySender_5G_A89B:KEY=offline9988"
                size={180}
                level="M"
              />
            </div>

            <div className="w-full bg-neutral-950 p-3 rounded-2xl border border-neutral-800 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-neutral-500">Wi-Fi Direct:</span>
                <span className="font-mono text-emerald-400 font-bold">MySender_5G_A89B</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Frequency:</span>
                <span className="font-mono text-neutral-300">5.8 GHz (High Speed)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Max Speed:</span>
                <span className="font-mono text-neutral-300">480 Mbps</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 4: TRANSFER HISTORY */
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20 scrollbar-none">
          {/* Filter pills & Clear */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
              <button
                onClick={() => setFilterHistory('all')}
                className={`px-2.5 py-1 rounded-lg ${
                  filterHistory === 'all' ? 'bg-emerald-500 text-neutral-950 font-bold' : 'text-neutral-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterHistory('sent')}
                className={`px-2.5 py-1 rounded-lg ${
                  filterHistory === 'sent' ? 'bg-emerald-500 text-neutral-950 font-bold' : 'text-neutral-400'
                }`}
              >
                Sent
              </button>
              <button
                onClick={() => setFilterHistory('received')}
                className={`px-2.5 py-1 rounded-lg ${
                  filterHistory === 'received' ? 'bg-emerald-500 text-neutral-950 font-bold' : 'text-neutral-400'
                }`}
              >
                Received
              </button>
            </div>

            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-[11px] text-neutral-400 hover:text-rose-400 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {filteredHistory.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-neutral-500 space-y-2">
              <Clock className="w-10 h-10 stroke-1 text-neutral-600" />
              <p className="text-xs font-semibold text-neutral-400">No transfer history yet</p>
              <p className="text-[11px]">Transferred files and speeds will appear here.</p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-neutral-850 border border-neutral-800/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
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
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">{item.file.name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                      <span className="font-mono text-neutral-300 font-semibold">{item.file.formattedSize}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-mono">{item.averageSpeed}</span>
                      <span>•</span>
                      <span>{item.formattedDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <button
                    onClick={() => onPreviewFile(item.file)}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300"
                    title="Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (item.file.fileBlob) {
                        downloadBlob(item.file.fileBlob, item.file.name);
                      } else {
                        downloadBlob(createDummyBlob(item.file.name, item.file.size), item.file.name);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                    title="Download / Save"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
