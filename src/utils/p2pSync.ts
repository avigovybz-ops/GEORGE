/**
 * P2P Broadcast Channel manager
 * Allows cross-tab discovery and real-time offline transmission between multiple browser tabs
 */

export interface P2PMessage {
  type: 'DISCOVERY_PING' | 'DISCOVERY_PONG' | 'PAIR_REQUEST' | 'PAIR_ACCEPT' | 'TRANSFER_START' | 'TRANSFER_CHUNK' | 'TRANSFER_COMPLETE' | 'TRANSFER_CANCEL';
  senderId: string;
  senderName: string;
  senderModel: string;
  payload?: any;
  timestamp: number;
}

let channel: BroadcastChannel | null = null;
const myId = 'device-' + Math.random().toString(36).substring(2, 9);
const myDeviceName = 'My Android Device (' + myId.substring(7, 10).toUpperCase() + ')';

export function getMyDeviceId() {
  return myId;
}

export function getMyDeviceName() {
  return myDeviceName;
}

export function initP2PChannel(onMessage: (msg: P2PMessage) => void): () => void {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return () => {};
  }

  try {
    channel = new BroadcastChannel('my_sender_offline_p2p');
    channel.onmessage = (event) => {
      if (event.data && event.data.senderId !== myId) {
        onMessage(event.data);
      }
    };

    // Broadcast presence
    sendP2PMessage({
      type: 'DISCOVERY_PING',
      senderId: myId,
      senderName: myDeviceName,
      senderModel: 'Android 15 Device',
      timestamp: Date.now(),
    });
  } catch (err) {
    console.warn('BroadcastChannel not supported or restricted:', err);
  }

  return () => {
    if (channel) {
      channel.close();
      channel = null;
    }
  };
}

export function sendP2PMessage(msg: P2PMessage) {
  if (channel) {
    try {
      channel.postMessage(msg);
    } catch (e) {
      console.warn('Failed to send P2P message', e);
    }
  }
}
