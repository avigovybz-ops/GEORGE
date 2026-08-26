import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Download, Volume2, FileText, Music, Image as ImageIcon, Video as VideoIcon, Package } from 'lucide-react';
import { FileItem } from '../types';
import { downloadBlob, createDummyBlob } from '../utils/fileUtils';

interface MediaPreviewModalProps {
  file: FileItem | null;
  onClose: () => void;
}

export const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({ file, onClose }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch (e) {}
      }
    };
  }, []);

  if (!file) return null;

  const togglePlayAudio = () => {
    if (isPlayingAudio) {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
          oscRef.current.disconnect();
        } catch (e) {}
      }
      setIsPlayingAudio(false);
    } else {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        // Play pleasant harmonic melody preview
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        osc.frequency.exponentialRampToValueAtTime(587.33, ctx.currentTime + 0.5); // D5
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 1.0); // E5

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscRef.current = osc;
        setIsPlayingAudio(true);

        setTimeout(() => {
          setIsPlayingAudio(false);
        }, 3000);
      } catch (e) {
        setIsPlayingAudio(false);
      }
    }
  };

  const handleDownload = () => {
    if (file.fileBlob) {
      downloadBlob(file.fileBlob, file.name);
    } else {
      const dummy = createDummyBlob(file.name, file.size);
      downloadBlob(dummy, file.name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl relative flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Viewer based on category */}
        {file.category === 'photos' && file.thumbnail ? (
          <div className="w-full h-56 rounded-2xl overflow-hidden bg-neutral-950 flex items-center justify-center my-3 border border-neutral-800 shadow-inner">
            <img
              src={file.thumbnail}
              alt={file.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : file.category === 'videos' && file.thumbnail ? (
          <div className="w-full h-56 rounded-2xl overflow-hidden bg-neutral-950 relative flex items-center justify-center my-3 border border-neutral-800 shadow-inner">
            <img
              src={file.thumbnail}
              alt={file.name}
              className="w-full h-full object-cover opacity-80"
              referrerPolicy="no-referrer"
            />
            <div className="absolute p-4 rounded-full bg-emerald-500/90 text-neutral-950 shadow-xl cursor-pointer hover:scale-105 transition-transform">
              <Play className="w-7 h-7 fill-neutral-950 translate-x-0.5" />
            </div>
            {file.duration && (
              <span className="absolute bottom-2.5 right-2.5 bg-black/80 px-2 py-0.5 rounded text-[11px] font-mono text-white">
                {file.duration}
              </span>
            )}
          </div>
        ) : file.category === 'music' ? (
          <div className="w-full p-6 rounded-2xl bg-gradient-to-br from-emerald-950/50 to-neutral-950 flex flex-col items-center justify-center my-3 border border-emerald-900/40">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4 shadow-lg">
              <Music className="w-10 h-10" />
            </div>
            <button
              onClick={togglePlayAudio}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs shadow-md shadow-emerald-500/30 transition-all"
            >
              {isPlayingAudio ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Playing Preview...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current translate-x-0.5" />
                  <span>Play Sample Audio</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="w-full p-8 rounded-2xl bg-neutral-950 flex flex-col items-center justify-center my-3 border border-neutral-800">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-3">
              {file.category === 'apps' ? <Package className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
            </div>
            <span className="text-xs uppercase font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/60">
              {file.extension || file.type}
            </span>
          </div>
        )}

        {/* Metadata Details */}
        <div className="w-full text-left space-y-1.5 my-2">
          <h4 className="font-bold text-sm text-white truncate">{file.name}</h4>
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
            <span className="font-mono text-emerald-400 font-semibold">{file.formattedSize}</span>
            <span>•</span>
            <span>{file.date}</span>
            {file.resolution && (
              <>
                <span>•</span>
                <span>{file.resolution}</span>
              </>
            )}
            {file.packageName && (
              <p className="w-full text-[11px] font-mono text-neutral-500 truncate mt-1">
                Package: {file.packageName}
              </p>
            )}
          </div>
        </div>

        {/* Download / Export Button */}
        <button
          onClick={handleDownload}
          className="w-full mt-3 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs flex items-center justify-center gap-2 border border-neutral-700 transition-colors"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Save / Download to Device</span>
        </button>
      </div>
    </div>
  );
};
