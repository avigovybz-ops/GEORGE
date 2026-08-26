import { CategoryType, FileItem, FileType } from '../types';

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond < 1024) {
    return `${Math.round(bytesPerSecond)} B/s`;
  } else if (bytesPerSecond < 1024 * 1024) {
    return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
  } else {
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
  }
}

export function formatSeconds(seconds: number): string {
  if (seconds <= 0 || !isFinite(seconds)) return '0s';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m > 0) {
    return `${m}m ${s}s`;
  }
  return `${s}s`;
}

export function triggerHaptic(pattern: number | number[] = 15): void {
  if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors
    }
  }
}

export function getFileCategory(file: File): { category: CategoryType; type: FileType } {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const mime = file.type.toLowerCase();

  if (extension === 'apk' || mime.includes('android.package-archive')) {
    return { category: 'apps', type: 'apk' };
  }
  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'svg'].includes(extension)) {
    return { category: 'photos', type: 'image' };
  }
  if (mime.startsWith('video/') || ['mp4', 'mkv', 'mov', 'avi', 'webm', '3gp'].includes(extension)) {
    return { category: 'videos', type: 'video' };
  }
  if (mime.startsWith('audio/') || ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg', 'opus'].includes(extension)) {
    return { category: 'music', type: 'audio' };
  }
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'epub'].includes(extension)) {
    let type: FileType = 'doc';
    if (extension === 'pdf') type = 'pdf';
    else if (['xls', 'xlsx', 'csv'].includes(extension)) type = 'sheet';
    else if (['ppt', 'pptx'].includes(extension)) type = 'slide';
    return { category: 'docs', type };
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
    return { category: 'files', type: 'archive' };
  }
  return { category: 'files', type: 'other' };
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function createDummyBlob(filename: string, sizeBytes: number): Blob {
  const dummyContent = `MY SENDER Offline Transfer file: ${filename}\nOriginal Size: ${formatBytes(sizeBytes)}\nTransferred via high-speed P2P Wi-Fi Direct simulation.\nTimestamp: ${new Date().toISOString()}`;
  return new Blob([dummyContent], { type: 'application/octet-stream' });
}
