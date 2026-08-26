import React, { useState } from 'react';
import { X, Smartphone, CheckCircle2, ArrowRight, ShieldCheck, Database, Layers, Check } from 'lucide-react';

interface PhoneCloneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartClone: (categories: string[]) => void;
}

export const PhoneCloneModal: React.FC<PhoneCloneModalProps> = ({ isOpen, onClose, onStartClone }) => {
  const [cloneMode, setCloneMode] = useState<'old' | 'new'>('old');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'contacts',
    'photos',
    'videos',
    'apps',
    'documents',
    'music',
  ]);

  if (!isOpen) return null;

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const categories = [
    { id: 'contacts', name: 'Contacts & Call Logs', count: '1,420 entries', size: '12 MB', icon: '👤' },
    { id: 'photos', name: 'Gallery Photos', count: '3,840 items', size: '14.8 GB', icon: '🖼️' },
    { id: 'videos', name: 'Camera Videos', count: '142 clips', size: '12.1 GB', icon: '🎬' },
    { id: 'apps', name: 'Installed Applications', count: '48 APKs', size: '18.2 GB', icon: '📦' },
    { id: 'music', name: 'Music & Audio', count: '310 tracks', size: '3.8 GB', icon: '🎵' },
    { id: 'documents', name: 'Documents & Files', count: '89 files', size: '1.5 GB', icon: '📄' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Phone Clone</h3>
            <p className="text-xs text-neutral-400">Migrate everything to your new phone</p>
          </div>
        </div>

        {/* Role Selector: Old Phone (Sender) vs New Phone (Receiver) */}
        <div className="grid grid-cols-2 gap-2 my-3 p-1 bg-neutral-950 rounded-2xl border border-neutral-800">
          <button
            onClick={() => setCloneMode('old')}
            className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              cloneMode === 'old'
                ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/30 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>This is OLD Phone</span>
          </button>
          <button
            onClick={() => setCloneMode('new')}
            className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              cloneMode === 'new'
                ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/30 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>This is NEW Phone</span>
          </button>
        </div>

        {/* Category List */}
        <div className="flex-1 overflow-y-auto space-y-2 my-2 pr-1">
          {categories.map((cat) => {
            const isSelected = selectedCategories.includes(cat.id);
            return (
              <div
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-white'
                    : 'bg-neutral-850 border-neutral-800 text-neutral-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cat.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-neutral-200">{cat.name}</p>
                    <p className="text-[10px] text-neutral-400">
                      {cat.count} • {cat.size}
                    </p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                    isSelected
                      ? 'bg-emerald-500 border-emerald-400 text-black'
                      : 'border-neutral-700 bg-neutral-800'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Clone Action Button */}
        <div className="mt-4 pt-3 border-t border-neutral-800">
          <button
            onClick={() => {
              onStartClone(selectedCategories);
              onClose();
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
          >
            <span>{cloneMode === 'old' ? 'Start Clone Migration (Send)' : 'Ready to Receive Data'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Zero cloud leak • 100% Direct P2P migration</span>
          </div>
        </div>
      </div>
    </div>
  );
};
