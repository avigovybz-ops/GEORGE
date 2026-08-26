import React, { useState, useEffect, useRef } from 'react';
import { AndroidFrame } from './components/AndroidFrame';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { HomeScreen } from './components/HomeScreen';
import { FileSelectorScreen } from './components/FileSelectorScreen';
import { TransferRadarScreen } from './components/TransferRadarScreen';
import { WebShareModal } from './components/WebShareModal';
import { PhoneCloneModal } from './components/PhoneCloneModal';
import { StorageCleanerModal } from './components/StorageCleanerModal';
import { MediaPreviewModal } from './components/MediaPreviewModal';
import { 
  CategoryType, 
  DevicePeer, 
  FileItem, 
  HistoryRecord, 
  PrimaryScreen, 
  StorageBreakdown, 
  TransferItem, 
  TransferSession 
} from './types';
import { 
  INITIAL_FILES, 
  INITIAL_HISTORY, 
  INITIAL_PEERS, 
  INITIAL_STORAGE 
} from './data/mockData';
import { formatBytes, formatSpeed, triggerHaptic } from './utils/fileUtils';
import { initP2PChannel, sendP2PMessage, getMyDeviceId, getMyDeviceName } from './utils/p2pSync';
import confetti from 'canvas-confetti';

export default function App() {
  // Navigation State (Strict 3-Screen architecture: 'home' | 'files' | 'transfers')
  const [currentScreen, setCurrentScreen] = useState<PrimaryScreen>('home');
  const [radarInitialMode, setRadarInitialMode] = useState<'sender' | 'receiver'>('sender');

  // Storage & Files State
  const [storage, setStorage] = useState<StorageBreakdown>(INITIAL_STORAGE);
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>(INITIAL_HISTORY);
  const [availablePeers, setAvailablePeers] = useState<DevicePeer[]>(INITIAL_PEERS);

  // Active Transfer Session State
  const [activeSession, setActiveSession] = useState<TransferSession | null>(null);

  // Modals
  const [isWebShareOpen, setIsWebShareOpen] = useState(false);
  const [isPhoneCloneOpen, setIsPhoneCloneOpen] = useState(false);
  const [isStorageCleanerOpen, setIsStorageCleanerOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  const transferIntervalRef = useRef<number | null>(null);

  // Initialize P2P Broadcast Channel for multi-tab testing
  useEffect(() => {
    const cleanup = initP2PChannel((msg) => {
      if (msg.type === 'DISCOVERY_PING') {
        // Add discovered peer from other tab
        setAvailablePeers((prev) => {
          if (prev.some((p) => p.id === msg.senderId)) return prev;
          const newPeer: DevicePeer = {
            id: msg.senderId,
            name: msg.senderName,
            model: msg.senderModel || 'Android 15 Device',
            avatar: '📱',
            signalStrength: 'excellent',
            distance: '0.3 m (Local Tab)',
            ip: '127.0.0.1',
            status: 'available',
            isRealLocalTab: true,
          };
          return [newPeer, ...prev];
        });
      }
    });

    return () => cleanup();
  }, []);

  // Handle Selection Toggle
  const handleToggleSelect = (fileId: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  // Select All in Category
  const handleSelectAllCategory = (category: CategoryType) => {
    const categoryFileIds = files.filter((f) => f.category === category).map((f) => f.id);
    const areAllSelected = categoryFileIds.every((id) => selectedFileIds.includes(id));

    if (areAllSelected) {
      setSelectedFileIds((prev) => prev.filter((id) => !categoryFileIds.includes(id)));
    } else {
      setSelectedFileIds((prev) => Array.from(new Set([...prev, ...categoryFileIds])));
    }
  };

  // Clear Selection
  const handleClearSelection = () => {
    setSelectedFileIds([]);
    triggerHaptic(10);
  };

  // Add User's Native Files (Drag & Drop or File Input)
  const handleAddUserFiles = (newFiles: FileItem[]) => {
    setFiles((prev) => [...newFiles, ...prev]);
    // Auto select uploaded files
    setSelectedFileIds((prev) => [...newFiles.map((f) => f.id), ...prev]);
  };

  // Start Transfer Session to a Peer
  const handleStartTransferToPeer = (peer: DevicePeer, filesToSend: FileItem[]) => {
    const targetFiles = filesToSend.length > 0 ? filesToSend : files.slice(0, 3);
    const totalBytes = targetFiles.reduce((acc, f) => acc + f.size, 0);

    const items: TransferItem[] = targetFiles.map((file) => ({
      file,
      progress: 0,
      speed: 42.5 * 1024 * 1024, // 42.5 MB/s initial speed
      formattedSpeed: '42.5 MB/s',
      status: 'transferring',
      bytesTransferred: 0,
      direction: 'send',
      targetDevice: peer.name,
      startTime: Date.now(),
    }));

    const session: TransferSession = {
      id: 'session-' + Date.now(),
      peer,
      direction: 'send',
      mode: 'wifi_direct',
      status: 'transferring',
      items,
      overallProgress: 0,
      currentSpeed: 42.5 * 1024 * 1024,
      totalBytes,
      transferredBytes: 0,
      startedAt: Date.now(),
      estimatedRemainingSeconds: Math.ceil(totalBytes / (42.5 * 1024 * 1024)),
    };

    setActiveSession(session);
    setCurrentScreen('transfers');
    triggerHaptic([30, 50, 30]);
  };

  // Transfer simulation tick loop
  useEffect(() => {
    if (!activeSession || activeSession.status !== 'transferring') {
      if (transferIntervalRef.current) {
        clearInterval(transferIntervalRef.current);
        transferIntervalRef.current = null;
      }
      return;
    }

    const interval = window.setInterval(() => {
      setActiveSession((prevSession) => {
        if (!prevSession || prevSession.status !== 'transferring') return prevSession;

        // Fluctuate speed realistically between 38 MB/s and 47 MB/s (5GHz Wi-Fi Direct)
        const jitter = (Math.random() - 0.5) * 6 * 1024 * 1024;
        const currentSpeed = Math.max(25 * 1024 * 1024, 43 * 1024 * 1024 + jitter);
        const bytesInTick = currentSpeed * 0.15; // 150ms step

        let newTransferredBytes = prevSession.transferredBytes + bytesInTick;
        let isDone = false;

        if (newTransferredBytes >= prevSession.totalBytes) {
          newTransferredBytes = prevSession.totalBytes;
          isDone = true;
        }

        const overallProgress = (newTransferredBytes / prevSession.totalBytes) * 100;
        const remainingBytes = prevSession.totalBytes - newTransferredBytes;
        const estimatedRemainingSeconds = Math.max(0, Math.ceil(remainingBytes / currentSpeed));

        // Update items progress
        let accumulated = 0;
        const updatedItems = prevSession.items.map((item) => {
          if (item.status === 'paused') return item;

          const itemStart = accumulated;
          const itemEnd = accumulated + item.file.size;
          accumulated = itemEnd;

          let itemBytes = 0;
          if (newTransferredBytes >= itemEnd) {
            itemBytes = item.file.size;
          } else if (newTransferredBytes > itemStart) {
            itemBytes = newTransferredBytes - itemStart;
          }

          const itemProg = (itemBytes / item.file.size) * 100;
          return {
            ...item,
            bytesTransferred: itemBytes,
            progress: Math.min(100, itemProg),
            speed: currentSpeed,
            formattedSpeed: formatSpeed(currentSpeed),
            status: itemProg >= 100 ? 'completed' : 'transferring',
          };
        });

        if (isDone) {
          try {
            confetti({
              particleCount: 70,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#10B981', '#34D399', '#6EE7B7', '#FBBF24'],
            });
          } catch (e) {}

          // Add to history
          const newHistoryRecords: HistoryRecord[] = prevSession.items.map((it) => ({
            id: 'hist-' + Math.random().toString(36).substring(2, 9),
            file: it.file,
            direction: 'send',
            peerName: prevSession.peer.name,
            timestamp: Date.now(),
            formattedDate: 'Just now',
            durationSeconds: Math.round((Date.now() - prevSession.startedAt) / 1000),
            averageSpeed: '42.8 MB/s',
            status: 'completed',
          }));

          setHistory((h) => [...newHistoryRecords, ...h]);
          setSelectedFileIds([]);
          triggerHaptic([50, 100, 50, 100]);

          return {
            ...prevSession,
            transferredBytes: newTransferredBytes,
            overallProgress: 100,
            status: 'completed',
            items: updatedItems,
            estimatedRemainingSeconds: 0,
          };
        }

        return {
          ...prevSession,
          transferredBytes: newTransferredBytes,
          overallProgress,
          currentSpeed,
          estimatedRemainingSeconds,
          items: updatedItems,
        };
      });
    }, 150);

    transferIntervalRef.current = interval;

    return () => {
      if (transferIntervalRef.current) {
        clearInterval(transferIntervalRef.current);
      }
    };
  }, [activeSession?.status]);

  // Pause / Resume Item
  const handlePauseResumeItem = (fileId: string) => {
    if (!activeSession) return;
    setActiveSession({
      ...activeSession,
      items: activeSession.items.map((item) => {
        if (item.file.id === fileId) {
          return {
            ...item,
            status: item.status === 'paused' ? 'transferring' : 'paused',
          };
        }
        return item;
      }),
    });
  };

  // Cancel Active Session
  const handleCancelSession = () => {
    setActiveSession(null);
    triggerHaptic(20);
  };

  // Start Phone Clone flow
  const handleStartClone = (selectedCategories: string[]) => {
    const cloneFiles = files.filter((f) => {
      if (selectedCategories.includes('apps') && f.category === 'apps') return true;
      if (selectedCategories.includes('photos') && f.category === 'photos') return true;
      if (selectedCategories.includes('videos') && f.category === 'videos') return true;
      if (selectedCategories.includes('music') && f.category === 'music') return true;
      if (selectedCategories.includes('documents') && f.category === 'docs') return true;
      return false;
    });

    handleStartTransferToPeer(availablePeers[0], cloneFiles);
  };

  // Clean storage action
  const handleCleanStorageSuccess = (freedBytes: number) => {
    setStorage((prev) => ({
      ...prev,
      usedBytes: Math.max(0, prev.usedBytes - freedBytes),
      freeBytes: prev.freeBytes + freedBytes,
    }));
  };

  // Selected file objects
  const selectedFilesList = files.filter((f) => selectedFileIds.includes(f.id));

  return (
    <AndroidFrame activeScreenName={currentScreen}>
      {/* Top Application Header */}
      <Header
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
        activeTransferCount={activeSession && activeSession.status === 'transferring' ? 1 : 0}
      />

      {/* Primary 3-Screen Body */}
      {currentScreen === 'home' && (
        <HomeScreen
          onGoToSend={() => {
            setCurrentScreen('files');
            triggerHaptic(15);
          }}
          onGoToReceive={() => {
            setRadarInitialMode('receiver');
            setCurrentScreen('transfers');
            triggerHaptic(15);
          }}
          onOpenWebShare={() => setIsWebShareOpen(true)}
          onOpenPhoneClone={() => setIsPhoneCloneOpen(true)}
          onOpenStorageCleaner={() => setIsStorageCleanerOpen(true)}
          onOpenQRConnect={() => {
            setRadarInitialMode('receiver');
            setCurrentScreen('transfers');
          }}
          storage={storage}
          recentHistory={history}
          onViewHistory={() => {
            setCurrentScreen('transfers');
          }}
          selectedCount={selectedFileIds.length}
        />
      )}

      {currentScreen === 'files' && (
        <FileSelectorScreen
          files={files}
          selectedFileIds={selectedFileIds}
          onToggleSelect={handleToggleSelect}
          onSelectAllCategory={handleSelectAllCategory}
          onClearSelection={handleClearSelection}
          onAddUserFiles={handleAddUserFiles}
          onSendSelected={() => {
            setRadarInitialMode('sender');
            setCurrentScreen('transfers');
            triggerHaptic(20);
          }}
          onPreviewFile={(file) => setPreviewFile(file)}
        />
      )}

      {currentScreen === 'transfers' && (
        <TransferRadarScreen
          initialMode={radarInitialMode}
          selectedFiles={selectedFilesList}
          availablePeers={availablePeers}
          activeSession={activeSession}
          history={history}
          onStartTransferToPeer={(peer, filesToSend) =>
            handleStartTransferToPeer(peer, filesToSend)
          }
          onCancelSession={handleCancelSession}
          onPauseResumeItem={handlePauseResumeItem}
          onClearHistory={() => setHistory([])}
          onPreviewFile={(file) => setPreviewFile(file)}
          onGoToFilePicker={() => setCurrentScreen('files')}
        />
      )}

      {/* Persistent Bottom 3-Screen Navigation */}
      <Navigation
        currentScreen={currentScreen}
        onSelectScreen={(screen) => {
          setCurrentScreen(screen);
          triggerHaptic(10);
        }}
        selectedFilesCount={selectedFileIds.length}
        activeTransfersCount={activeSession && activeSession.status === 'transferring' ? 1 : 0}
      />

      {/* Feature Modals */}
      <WebShareModal
        isOpen={isWebShareOpen}
        onClose={() => setIsWebShareOpen(false)}
      />

      <PhoneCloneModal
        isOpen={isPhoneCloneOpen}
        onClose={() => setIsPhoneCloneOpen(false)}
        onStartClone={handleStartClone}
      />

      <StorageCleanerModal
        isOpen={isStorageCleanerOpen}
        onClose={() => setIsStorageCleanerOpen(false)}
        onCleanSuccess={handleCleanStorageSuccess}
      />

      <MediaPreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </AndroidFrame>
  );
}
