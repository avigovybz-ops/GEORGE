import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Laptop, Copy, Check, ShieldCheck, RefreshCw } from 'lucide-react';

interface WebShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WebShareModal: React.FC<WebShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [port] = useState('8888');
  const webUrl = `http://192.168.43.1:${port}`;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(webUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Laptop className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Connect to PC</h3>
            <p className="text-xs text-neutral-400">Share with Windows, Mac, or Linux</p>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center my-4 shadow-inner">
          <QRCodeSVG value={webUrl} size={170} level="M" />
          <p className="text-[11px] text-neutral-600 font-medium mt-2">Scan with PC camera or phone browser</p>
        </div>

        {/* Connection Instructions */}
        <div className="space-y-2.5 text-xs text-neutral-300 bg-neutral-850 p-3.5 rounded-2xl border border-neutral-800">
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
            <span>Connect PC to this phone's Wi-Fi hotspot <strong>"MySender_Hotspot"</strong></span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
            <span>Open any web browser on your computer</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
            <span>Enter the address below to upload & download files</span>
          </div>
        </div>

        {/* IP Address Pill */}
        <div className="mt-4 flex items-center justify-between bg-neutral-950 px-3.5 py-2.5 rounded-xl border border-neutral-800">
          <span className="font-mono text-emerald-400 font-medium text-sm tracking-wide">{webUrl}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted Direct Local Network Transfer (0 MB Internet used)</span>
        </div>
      </div>
    </div>
  );
};
