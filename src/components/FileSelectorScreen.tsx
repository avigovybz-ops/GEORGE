import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, 
  Package, 
  Image as ImageIcon, 
  Film, 
  Music, 
  FileText, 
  FolderArchive, 
  Check, 
  Plus, 
  UploadCloud, 
  Send, 
  Trash2, 
  SlidersHorizontal,
  Eye,
  Info,
  CheckCheck,
  FolderOpen
} from 'lucide-react';
import { CategoryType, FileItem } from '../types';
import { formatBytes, getFileCategory, triggerHaptic } from '../utils/fileUtils';

interface FileSelectorScreenProps {
  files: FileItem[];
  selectedFileIds: string[];
  onToggleSelect: (fileId: string) => void;
  onSelectAllCategory: (category: CategoryType) => void;
  onClearSelection: () => void;
  onAddUserFiles: (newFiles: FileItem[]) => void;
  onSendSelected: () => void;
  onPreviewFile: (file: FileItem) => void;
}

export const FileSelectorScreen: React.FC<FileSelectorScreenProps> = ({
  files,
  selectedFileIds,
  onToggleSelect,
  onSelectAllCategory,
  onClearSelection,
  onAddUserFiles,
  onSendSelected,
  onPreviewFile,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('apps');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'size' | 'name'>('date');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Category Tabs Configuration
  const categories: { id: CategoryType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'apps', label: 'APKs', icon: Package },
    { id: 'photos', label: 'Photos', icon: ImageIcon },
    { id: 'videos', label: 'Videos', icon: Film },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'docs', label: 'Docs', icon: FileText },
    { id: 'files', label: 'Files', icon: FolderArchive },
  ];

  // Counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryType, number> = {
      apps: 0,
      photos: 0,
      videos: 0,
      music: 0,
      docs: 0,
      files: 0,
    };
    files.forEach((f) => {
      counts[f.category] = (counts[f.category] || 0) + 1;
    });
    return counts;
  }, [files]);

  // Filtered & Sorted items for current tab
  const displayedFiles = useMemo(() => {
    return files
      .filter((item) => {
        const matchesCategory = item.category === activeCategory;
        const matchesSearch =
          !searchQuery.trim() ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.packageName && item.packageName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.artist && item.artist.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'size') return b.size - a.size;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0; // default order
      });
  }, [files, activeCategory, searchQuery, sortBy]);

  // Total selected size
  const totalSelectedSize = useMemo(() => {
    return files
      .filter((f) => selectedFileIds.includes(f.id))
      .reduce((sum, f) => sum + f.size, 0);
  }, [files, selectedFileIds]);

  // Handle local native file upload / drag-drop
  const handleNativeFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const newItems: FileItem[] = [];

    Array.from(fileList).forEach((f) => {
      const { category, type } = getFileCategory(f);
      const extension = f.name.split('.').pop()?.toLowerCase() || '';

      const newItem: FileItem = {
        id: 'user-file-' + Math.random().toString(36).substring(2, 9),
        name: f.name,
        category,
        type,
        size: f.size,
        formattedSize: formatBytes(f.size),
        date: 'Just now',
        extension,
        isUserUploaded: true,
        fileBlob: f,
        thumbnail: type === 'image' ? URL.createObjectURL(f) : undefined,
      };
      newItems.push(newItem);
    });

    onAddUserFiles(newItems);
    triggerHaptic(20);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleNativeFiles(e.dataTransfer.files);
  };

  const isCurrentCategoryAllSelected =
    displayedFiles.length > 0 &&
    displayedFiles.every((f) => selectedFileIds.includes(f.id));

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 flex flex-col overflow-hidden relative ${
        isDragging ? 'bg-emerald-950/20 border-2 border-dashed border-emerald-500' : ''
      }`}
    >
      {/* Category Pills Slider */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-3 py-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  triggerHaptic(10);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/25 font-bold scale-[1.02]'
                    : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-750'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-neutral-950/30 text-black' : 'bg-neutral-700/60 text-neutral-400'
                  }`}
                >
                  {categoryCounts[cat.id] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Actions Bar */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${activeCategory}...`}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Select All / Invert button */}
          <button
            onClick={() => onSelectAllCategory(activeCategory)}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1 transition-colors ${
              isCurrentCategoryAllSelected
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
            }`}
            title="Select all in category"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isCurrentCategoryAllSelected ? 'Deselect' : 'All'}
            </span>
          </button>

          {/* Add Real Files from User Device */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 text-[11px] font-bold flex items-center gap-1 transition-colors"
            title="Add your device files"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add File</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleNativeFiles(e.target.files)}
          />
        </div>
      </div>

      {/* File List Grid / List Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 pb-24 scrollbar-none">
        {displayedFiles.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3 text-neutral-400">
            <div className="w-14 h-14 rounded-3xl bg-neutral-850 flex items-center justify-center text-neutral-500 border border-neutral-800">
              <FolderOpen className="w-7 h-7" />
            </div>
            <div>
              <p className="font-semibold text-neutral-300 text-sm">No files found in {activeCategory}</p>
              <p className="text-xs text-neutral-500 mt-1">Tap "Add File" or drag & drop items to share</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-neutral-950 font-bold text-xs shadow-md shadow-emerald-500/20"
            >
              Browse Android Device
            </button>
          </div>
        ) : activeCategory === 'photos' ? (
          // Photos: Gallery Grid Layout
          <div className="grid grid-cols-3 gap-2">
            {displayedFiles.map((file) => {
              const isSelected = selectedFileIds.includes(file.id);
              return (
                <div
                  key={file.id}
                  onClick={() => {
                    onToggleSelect(file.id);
                    triggerHaptic(12);
                  }}
                  className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all select-none ${
                    isSelected
                      ? 'border-emerald-400 shadow-md shadow-emerald-500/30 scale-[0.98]'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <img
                    src={file.thumbnail || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=60'}
                    alt={file.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />

                  {/* Top Gradient & Selection Indicator */}
                  <div className="absolute inset-x-0 top-0 p-1.5 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreviewFile(file);
                      }}
                      className="p-1 rounded-lg bg-black/50 backdrop-blur-sm text-neutral-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-emerald-500 border-emerald-300 text-neutral-950 shadow-md'
                          : 'border-white/70 bg-black/40'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Bottom Size Label */}
                  <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-between">
                    <span className="text-[10px] font-mono text-white/90 truncate font-semibold">
                      {file.formattedSize}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List Layout for APKs, Videos, Music, Docs, Files
          displayedFiles.map((file) => {
            const isSelected = selectedFileIds.includes(file.id);
            return (
              <div
                key={file.id}
                onClick={() => {
                  onToggleSelect(file.id);
                  triggerHaptic(12);
                }}
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-white shadow-sm'
                    : 'bg-neutral-850/90 border-neutral-800/80 hover:bg-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Category Thumbnail / Glyph */}
                  {file.thumbnail ? (
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-neutral-700 bg-neutral-900">
                      <img
                        src={file.thumbnail}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                        file.category === 'apps'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : file.category === 'music'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : file.category === 'docs'
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                      }`}
                    >
                      {file.category === 'apps' && <Package className="w-6 h-6" />}
                      {file.category === 'music' && <Music className="w-6 h-6" />}
                      {file.category === 'docs' && <FileText className="w-6 h-6" />}
                      {file.category === 'videos' && <Film className="w-6 h-6" />}
                      {file.category === 'files' && <FolderArchive className="w-6 h-6" />}
                    </div>
                  )}

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-neutral-100 truncate">{file.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                      <span className="font-mono text-emerald-400 font-medium">{file.formattedSize}</span>
                      {file.version && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-neutral-400">v{file.version}</span>
                        </>
                      )}
                      {file.duration && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-neutral-300">{file.duration}</span>
                        </>
                      )}
                      {file.artist && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[120px]">{file.artist}</span>
                        </>
                      )}
                      {file.isUserUploaded && (
                        <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1 rounded font-bold">
                          Local
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Icons: Preview + Checkbox */}
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreviewFile(file);
                    }}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white"
                    title="Preview file"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <div
                    className={`w-6 h-6 rounded-xl flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-400 text-neutral-950 shadow-md shadow-emerald-500/25'
                        : 'border-neutral-700 bg-neutral-900 text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Bottom Selection Dock */}
      {selectedFileIds.length > 0 && (
        <div className="absolute bottom-3 inset-x-3 bg-neutral-900/95 backdrop-blur-xl border border-emerald-500/50 p-3 rounded-2xl shadow-2xl flex items-center justify-between z-30 animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-neutral-950 font-black text-xs flex items-center justify-center shadow-md">
              {selectedFileIds.length}
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                {selectedFileIds.length} {selectedFileIds.length === 1 ? 'file' : 'files'} selected
              </p>
              <p className="text-[11px] font-mono text-emerald-400">{formatBytes(totalSelectedSize)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClearSelection}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
              title="Clear selection"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              id="dock-send-selected-btn"
              onClick={onSendSelected}
              className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>SEND ({selectedFileIds.length})</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
