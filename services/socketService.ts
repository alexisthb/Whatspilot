import { io, Socket } from 'socket.io-client';
import { ScraperStatus, SystemLog } from '../types';

interface SocketCallbacks {
  onStatusChange: (status: ScraperStatus) => void;
  onLog: (log: SystemLog) => void;
  onQrCode: (qr: string) => void;
  onMessageReceived: (data: any) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private url: string = 'http://localhost:3000'; // Default URL
  private callbacks: SocketCallbacks | null = null;

  connect(url: string, callbacks: SocketCallbacks) {
    this.url = url;
    this.callbacks = callbacks;

    if (this.socket) {
      this.socket.disconnect();
    }

    console.log(`Connecting to ${url}...`);
    this.socket = io(url, {
      reconnection: true,
      reconnectionAttempts: Infinity, // Retry forever until user starts the server
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      // Connected to socket server, status update usually follows
    });

    this.socket.on('connect_error', (err) => {
      // Silent error, we just keep trying
    });

    this.socket.on('status', (status: string) => {
      let appStatus = ScraperStatus.DISCONNECTED;
      if (status === 'CONNECTED') appStatus = ScraperStatus.CONNECTED;
      if (status === 'WAITING_QR') appStatus = ScraperStatus.WAITING_QR;
      if (status === 'CONNECTING') appStatus = ScraperStatus.CONNECTING;
      
      this.callbacks?.onStatusChange(appStatus);
    });

    this.socket.on('log', (logData: any) => {
      this.callbacks?.onLog({
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        level: logData.level || 'info',
        message: logData.message || 'Log received'
      });
    });

    this.socket.on('qr_code', (qr: string) => {
        this.callbacks?.onStatusChange(ScraperStatus.WAITING_QR);
        this.callbacks?.onQrCode(qr);
    });

    this.socket.on('message_received', (data) => {
        this.callbacks?.onMessageReceived(data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();