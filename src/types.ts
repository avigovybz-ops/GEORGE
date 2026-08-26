export type CategoryType = 'apps' | 'photos' | 'videos' | 'music' | 'docs' | 'files';

export type FileType = 'apk' | 'image' | 'video' | 'audio' | 'pdf' | 'doc' | 'sheet' | 'slide' | 'archive' | 'folder' | 'code' | 'other';

export interface FileItem {
  id: string;
  name: string;
  category: CategoryType;
  type: FileType;
  size: number; // in bytes
  formattedSize: string;
  date: string;
  iconName?: string;
  thumbnail?: string;
  extension?: string;
  // Specific metadata
  packageName?: string; // for APKs
  version?: string;     // for APKs
  duration?: string;    // for Audio/Video
  resolution?: string;  // for Photos/Videos
  artist?: string;      // for Music
  path?: string;        // for filesystem path
  isUserUploaded?: boolean;
  fileBlob?: Blob;      // For actual user uploaded files
  url?: string;
}

export interface DevicePeer {
  id: string;
  name: string;
  model: string;
  avatar: string;
  signalStrength: 'excellent' | 'good' | 'fair';
  distance: string;
  ip: string;
  status: 'available' | 'connecting' | 'connected' | 'busy';
  isRealLocalTab?: boolean;
  osVersion?: string;
}

export type TransferStatus = 'queued' | 'transferring' | 'completed' | 'paused' | 'failed';

export interface TransferItem {
  file: FileItem;
  progress: number; // 0 to 100
  speed: number;    // bytes per second
  formattedSpeed: string;
  status: TransferStatus;
  bytesTransferred: number;
  direction: 'send' | 'receive';
  targetDevice: string;
  startTime: number;
  endTime?: number;
}

export interface TransferSession {
  id: string;
  peer: DevicePeer;
  direction: 'send' | 'receive';
  mode: 'wifi_direct' | 'hotspot' | 'webrtc' | 'webshare';
  status: 'discovering' | 'pairing' | 'transferring' | 'completed' | 'cancelled';
  items: TransferItem[];
  overallProgress: number;
  currentSpeed: number; // bytes/sec
  totalBytes: number;
  transferredBytes: number;
  startedAt: number;
  estimatedRemainingSeconds: number;
}

export interface HistoryRecord {
  id: string;
  file: FileItem;
  direction: 'send' | 'receive';
  peerName: string;
  timestamp: number;
  formattedDate: string;
  durationSeconds: number;
  averageSpeed: string;
  status: 'completed' | 'failed';
}

export interface StorageBreakdown {
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  appsBytes: number;
  photosBytes: number;
  videosBytes: number;
  musicBytes: number;
  docsBytes: number;
  systemBytes: number;
}

export type PrimaryScreen = 'home' | 'files' | 'transfers';
