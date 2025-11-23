
export enum Priority {
  CRITICAL = 'CRITICAL', // À traiter dans l'heure (Problème prod, urgence familiale)
  HIGH = 'HIGH',         // À traiter dans la journée (Client, business)
  NORMAL = 'NORMAL',     // Discussion standard
  LOW = 'LOW',           // Peut attendre ou être ignoré
  SPAM = 'SPAM'          // Pub, message automatique
}

export enum ActionType {
  REPLY_NEEDED = 'REPLY_NEEDED',
  READ_ONLY = 'READ_ONLY',
  SCHEDULING = 'SCHEDULING', // Demande de rdv
  PAYMENT = 'PAYMENT'        // Question facturation
}

export interface SmartAnalysis {
  priority: Priority;
  actionType: ActionType;
  summary: string;
  reasoning: string; // Pourquoi l'IA a classé ça comme urgent
  suggestedReply?: string;
}

export interface IncomingData {
  id: string;
  sender: string;
  senderPhone?: string;
  content: string;
  timestamp: string;
  platform: 'whatsapp';
  isGroup: boolean;
  groupName?: string;
}

export interface TriagedItem extends IncomingData {
  status: 'PENDING' | 'DONE' | 'ARCHIVED';
  analysis?: SmartAnalysis;
}

// Stats pour le dashboard
export interface InboxStats {
  pendingCount: number;
  criticalCount: number;
  savedTime: string;
}

export enum SenderType {
  ME = 'ME',
  OTHER = 'OTHER'
}

export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ'
}

export interface Message {
  id: string;
  sender: string;
  senderType: SenderType;
  content: string;
  timestamp: string;
  status: MessageStatus;
}

export interface Chat {
  id: string;
  name: string;
  isGroup: boolean;
  avatarUrl: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  messages: Message[];
}

export enum ScraperStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  WAITING_QR = 'WAITING_QR',
  SYNCING = 'SYNCING'
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface Alert {
  id: string;
  chatId: string;
  chatName: string;
  severity: 'critical' | 'high';
  timestamp: string;
  reason: string;
}
