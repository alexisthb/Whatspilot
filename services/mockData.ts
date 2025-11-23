import { Chat, Message, SenderType, MessageStatus } from '../types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const now = new Date();
const timeAgo = (minutes: number) => new Date(now.getTime() - minutes * 60000).toISOString();

export const MOCK_CHATS: Chat[] = [
  {
    id: '1',
    name: 'Projet Alpha - Dev Team',
    isGroup: true,
    avatarUrl: 'https://picsum.photos/200/200?random=1',
    unreadCount: 12,
    lastMessage: 'On déploie quand ?',
    lastMessageTime: timeAgo(5),
    messages: [
      { id: generateId(), sender: 'Thomas', senderType: SenderType.OTHER, content: 'Salut l\'équipe, le fix est prêt ?', timestamp: timeAgo(120), status: MessageStatus.READ },
      { id: generateId(), sender: 'Sarah', senderType: SenderType.OTHER, content: 'Oui, j\'ai pushé sur la branche staging.', timestamp: timeAgo(115), status: MessageStatus.READ },
      { id: generateId(), sender: 'Moi', senderType: SenderType.ME, content: 'Top, je regarde ça dans 10min.', timestamp: timeAgo(110), status: MessageStatus.READ },
      { id: generateId(), sender: 'Thomas', senderType: SenderType.OTHER, content: 'Attention, il y a un bug critique sur le login.', timestamp: timeAgo(60), status: MessageStatus.READ },
      { id: generateId(), sender: 'Thomas', senderType: SenderType.OTHER, content: 'Le client s\'impatiente.', timestamp: timeAgo(59), status: MessageStatus.READ },
      { id: generateId(), sender: 'Marc', senderType: SenderType.OTHER, content: 'Je suis dessus. C\'est lié à l\'API Auth0.', timestamp: timeAgo(30), status: MessageStatus.READ },
      { id: generateId(), sender: 'Sarah', senderType: SenderType.OTHER, content: 'On déploie quand ?', timestamp: timeAgo(5), status: MessageStatus.DELIVERED },
    ]
  },
  {
    id: '2',
    name: 'Famille Dupont',
    isGroup: true,
    avatarUrl: 'https://picsum.photos/200/200?random=2',
    unreadCount: 0,
    lastMessage: 'Ok pour dimanche',
    lastMessageTime: timeAgo(300),
    messages: [
      { id: generateId(), sender: 'Maman', senderType: SenderType.OTHER, content: 'Qui vient déjeuner dimanche ?', timestamp: timeAgo(400), status: MessageStatus.READ },
      { id: generateId(), sender: 'Papa', senderType: SenderType.OTHER, content: 'Moi !', timestamp: timeAgo(390), status: MessageStatus.READ },
      { id: generateId(), sender: 'Moi', senderType: SenderType.ME, content: 'Ok pour dimanche', timestamp: timeAgo(300), status: MessageStatus.READ },
    ]
  },
  {
    id: '3',
    name: 'Client - Agence Immo',
    isGroup: false,
    avatarUrl: 'https://picsum.photos/200/200?random=3',
    unreadCount: 1,
    lastMessage: 'Le virement est parti.',
    lastMessageTime: timeAgo(10),
    messages: [
      { id: generateId(), sender: 'Client', senderType: SenderType.OTHER, content: 'Bonjour, avez-vous reçu les documents ?', timestamp: timeAgo(1400), status: MessageStatus.READ },
      { id: generateId(), sender: 'Moi', senderType: SenderType.ME, content: 'Oui, tout est en ordre.', timestamp: timeAgo(1000), status: MessageStatus.READ },
      { id: generateId(), sender: 'Client', senderType: SenderType.OTHER, content: 'Parfait. Le virement est parti.', timestamp: timeAgo(10), status: MessageStatus.DELIVERED },
    ]
  },
  {
    id: '4',
    name: 'Urgence Serveur',
    isGroup: true,
    avatarUrl: 'https://picsum.photos/200/200?random=4',
    unreadCount: 5,
    lastMessage: 'SERVER DOWN',
    lastMessageTime: timeAgo(2),
    messages: [
      { id: generateId(), sender: 'SysAdmin', senderType: SenderType.OTHER, content: 'Alerte : CPU à 99%', timestamp: timeAgo(15), status: MessageStatus.READ },
      { id: generateId(), sender: 'Bot', senderType: SenderType.OTHER, content: 'Auto-scaling failed.', timestamp: timeAgo(10), status: MessageStatus.READ },
      { id: generateId(), sender: 'SysAdmin', senderType: SenderType.OTHER, content: 'SERVER DOWN', timestamp: timeAgo(2), status: MessageStatus.DELIVERED },
    ]
  }
];