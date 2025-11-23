
import { IncomingData } from '../types';

/**
 * Ce service simule la récupération des données depuis l'API Apify.
 * Dans la réalité, tu ferais un fetch sur :
 * https://api.apify.com/v2/datasets/[DATASET_ID]/items?token=[TON_TOKEN]
 */

const MOCK_APIFY_DATA: IncomingData[] = [
  {
    id: 'msg_001',
    sender: 'Marc (CTO)',
    content: '🚨 Le serveur de prod est down (Error 503 Gateway Timeout). On a besoin de ton accès root maintenant pour redémarrer le cluster.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // Il y a 5 min
    platform: 'whatsapp',
    isGroup: false
  },
  {
    id: 'msg_002',
    sender: 'Sarah Design',
    content: 'Salut ! J\'ai fini les maquettes pour la home, tu pourras jeter un oeil quand tu as 5 min ? Pas d\'urgence, c\'est pour la semaine pro.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // Il y a 2h
    platform: 'whatsapp',
    isGroup: false
  },
  {
    id: 'msg_003',
    sender: 'Groupe Famille',
    groupName: 'Famille Dupont',
    content: 'Tata : Regardez la photo du chat ! Trop mignon 😻',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    platform: 'whatsapp',
    isGroup: true
  },
  {
    id: 'msg_004',
    sender: 'Client Martin',
    content: 'Je n\'ai toujours pas reçu la facture de janvier. Pouvez-vous me la renvoyer ? Sinon je ne pourrai pas déclencher le paiement vendredi.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    platform: 'whatsapp',
    isGroup: false
  },
  {
    id: 'msg_005',
    sender: 'Amazon Livraison',
    content: 'Votre colis #29382 sera livré demain entre 8h et 13h.',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    platform: 'whatsapp',
    isGroup: false
  },
  {
    id: 'msg_006',
    sender: 'Thomas (Dev)',
    content: 'Tu as vu la PR sur le module de paiement ? J\'ai un doute sur la sécurité.',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // Il y a 2h
    platform: 'whatsapp',
    isGroup: false
  },
  {
    id: 'msg_007',
    sender: 'Julie Marketing',
    content: 'On lance la campagne Lundi ou Mardi ? Il faut valider le budget.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // Il y a 5h
    platform: 'whatsapp',
    isGroup: false
  },
  {
    id: 'msg_008',
    sender: 'Spam Crypto',
    content: 'Gagnez 5000€ par jour sans effort ! Cliquez ici.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), // Il y a 1h
    platform: 'whatsapp',
    isGroup: false
  },
  {
    id: 'msg_009',
    sender: 'Maman',
    content: 'Tu viens manger dimanche midi ?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // Il y a 12h
    platform: 'whatsapp',
    isGroup: false
  },
  // --- Messages plus anciens pour tester le filtre 24h ---
  {
    id: 'msg_old_01',
    sender: 'Philippe (Vieux message)',
    content: 'C\'était sympa ce resto avant-hier ! On se refait ça ?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // Il y a 48h
    platform: 'whatsapp',
    isGroup: false
  },
  {
    id: 'msg_old_02',
    sender: 'Service Client SFR',
    content: 'Votre facture du mois dernier est disponible.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // Il y a 3 jours
    platform: 'whatsapp',
    isGroup: false
  }
];

export const fetchNewMessages = async (): Promise<IncomingData[]> => {
  // Simulation d'un délai réseau
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Ici, on pourrait ajouter une logique pour ne récupérer que ce qui n'a pas déjà été traité
  return MOCK_APIFY_DATA;
};
