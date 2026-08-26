import React, { useState } from 'react';
import { X, Trash2, CheckCircle2, Sparkles, AlertCircle, HardDrive, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StorageCleanerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCleanSuccess: (freedBytes: number) => void;
}

export const StorageCleanerModal: React.FC<StorageCleanerModalProps> = ({
  isOpen,
  onClose,
  onCleanSuccess,
}) => {
  const [cleaning, setCleaning] = useState(false);
  const [cleaned, setCleaned] = useState(false);
  const [selectedJunk, setSelectedJunk] = useState<string[]>([
    'cache',
    'apks',
    'temp',
    'duplicates',
  ]);

  if (!isOpen) return null;

  const junkItems = [
    { id: 'cache', name: 'App Cache & Temp Files', size: '1.2 GB', desc: 'Cached thumbnails and temporary logs' },
    { id: 'apks', name: 'Leftover Installed APKs', size: '420 MB', desc: 'Installation packages no longer needed' },
    { id: 'temp', name: 'Residual File Fragments', size: '180 MB', desc: 'Leftovers from uninstalled applications' },
    { id: 'duplicates', name: 'Duplicate Photos & Screenshots', size: '350 MB', desc: 'Identical captures & burst shots' },
  ];

  const toggleJunk = (id: string) => {
    if (selectedJunk.includes(id)) {
      setSelectedJunk(selectedJunk.filter((item) => item !== id));
    } else {
      setSelectedJunk([...selectedJunk, id]);
    }
  };

  const handleClean = () => {
    setCleaning(true);
    setTimeout(() => {
      setCleaning(false);
      setCleaned(true);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10B981', '#34D399', '#6EE7B7'],
        });
      } catch (e) {
        // Confetti fallback
      }
      onCleanSuccess(2.15 * 1024 * 1024 * 1024);
    }, 1500);
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
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Storage Cleaner</h3>
            <p className="text-xs text-neutral-400">Reclaim Android device storage</p>
          </div>
        </div>

        {cleaned ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>
            <h4 className="text-xl font-bold text-white">2.15 GB Freed!</h4>
            <p className="text-xs text-neutral-400">Your Android storage is now optimized and running smoothly.</p>
            <button
              onClick={onClose}
              className="mt-4 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-bold text-neutral-950 text-sm"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-2.5 my-3">
              {junkItems.map((item) => {
                const isSelected = selectedJunk.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleJunk(item.id)}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-white'
                        : 'bg-neutral-850 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold text-neutral-200">{item.name}</p>
                      <p className="text-[10px] text-neutral-400">{item.desc}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">{item.size}</span>
                  </div>
                );
              })}
            </div>

            <button
              disabled={cleaning || selectedJunk.length === 0}
              onClick={handleClean}
              className="w-full mt-4 py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50 text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
            >
              {cleaning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Optimizing Device Storage...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Clean Junk Files (2.15 GB)</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
