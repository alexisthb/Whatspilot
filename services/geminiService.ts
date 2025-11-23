
import { GoogleGenAI, Type } from "@google/genai";
import { IncomingData, SmartAnalysis, Priority, ActionType, Chat, Message, Alert } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
const MODEL_NAME = 'gemini-2.5-flash';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isQuotaError = (error: any): boolean => {
  return (
    error.code === 429 || 
    error.status === 429 || 
    error.status === 'RESOURCE_EXHAUSTED' ||
    (error.message && (error.message.includes('429') || error.message.includes('quota') || error.message.includes('exhausted')))
  );
};

export const analyzeMessagePriority = async (message: IncomingData): Promise<SmartAnalysis> => {
  if (!process.env.API_KEY) {
    return {
      priority: Priority.NORMAL,
      actionType: ActionType.REPLY_NEEDED,
      summary: message.content,
      reasoning: "Mode démo (sans clé API)",
      suggestedReply: "Bien reçu, je regarde ça."
    };
  }

  const runAnalysis = async (retries = 3): Promise<SmartAnalysis> => {
    try {
      const prompt = `
        Analyse ce message WhatsApp entrant. Tu es mon assistant personnel de triage.
        
        Contexte:
        - Expéditeur: ${message.sender} ${message.isGroup ? '(Groupe: ' + message.groupName + ')' : ''}
        - Message: "${message.content}"
        - Date: ${message.timestamp}

        Ta mission :
        1. Détermine la priorité (CRITICAL = urgence absolue/financier, HIGH = pro important, NORMAL = discussion, LOW = info, SPAM).
        2. Détermine l'action (REPLY_NEEDED, READ_ONLY, SCHEDULING, PAYMENT).
        3. Résume en une phrase très courte.
        4. Si une réponse est nécessaire, rédige un brouillon de réponse poli et contextuel (vouvoiement pour pro, tutoiement si ami).
      `;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              priority: { type: Type.STRING, enum: Object.values(Priority) },
              actionType: { type: Type.STRING, enum: Object.values(ActionType) },
              summary: { type: Type.STRING },
              reasoning: { type: Type.STRING },
              suggestedReply: { type: Type.STRING }
            },
            required: ["priority", "actionType", "summary", "reasoning"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      return result as SmartAnalysis;

    } catch (error: any) {
      if (isQuotaError(error) && retries > 0) {
        console.warn(`Quota dépassé pour le message ${message.id}. Nouvelle tentative dans 5s...`);
        await delay(5000);
        return runAnalysis(retries - 1);
      }

      console.error("Erreur Gemini (analyzeMessagePriority):", error);
      return {
        priority: Priority.NORMAL,
        actionType: ActionType.REPLY_NEEDED,
        summary: "Analyse indisponible",
        reasoning: "Erreur API ou Quota: " + (error.message || "Unknown"),
        suggestedReply: ""
      };
    }
  };

  return runAnalysis();
};

export const summarizeConversation = async (messages: Message[]): Promise<string> => {
  if (!process.env.API_KEY) return "Résumé non disponible (Clé API manquante)";

  const runSummary = async (retries = 3): Promise<string> => {
    try {
      const transcript = messages.map(m => `${m.sender}: ${m.content}`).join('\n');
      const prompt = `Résume cette conversation WhatsApp de manière concise en soulignant les points clés et les actions à prendre.\n\nConversation:\n${transcript}`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });

      return response.text || "Impossible de générer le résumé.";
    } catch (error: any) {
       if (isQuotaError(error) && retries > 0) {
        console.warn(`Quota dépassé (Summary). Nouvelle tentative dans 5s...`);
        await delay(5000);
        return runSummary(retries - 1);
      }
      console.error("Erreur Gemini Summary:", error);
      return "Erreur lors de la génération du résumé.";
    }
  };
  
  return runSummary();
};

export const generateSmartReply = async (chat: Chat): Promise<string[]> => {
  if (!process.env.API_KEY) return ["Ok", "Bien reçu", "Je reviens vers toi"];

  const runSmartReply = async (retries = 3): Promise<string[]> => {
    try {
      const lastMessages = chat.messages.slice(-10); // Context window
      const transcript = lastMessages.map(m => `${m.sender}: ${m.content}`).join('\n');
      const prompt = `Tu es l'utilisateur participant à cette conversation. Suggère 3 réponses courtes et pertinentes pour répondre au dernier message reçu.\n\nContexte:\n${transcript}`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      return JSON.parse(response.text || '[]');
    } catch (error: any) {
      if (isQuotaError(error) && retries > 0) {
        console.warn(`Quota dépassé (SmartReply). Nouvelle tentative dans 5s...`);
        await delay(5000);
        return runSmartReply(retries - 1);
      }
      console.error("Erreur Gemini Smart Reply:", error);
      return ["Merci", "Ok", "Je regarde ça"];
    }
  };

  return runSmartReply();
};

export const analyzeForAlerts = async (chat: Chat): Promise<Alert | null> => {
  if (!process.env.API_KEY) return null;

  const runAlertAnalysis = async (retries = 3): Promise<Alert | null> => {
    try {
      const lastMessages = chat.messages.slice(-5);
      if (lastMessages.length === 0) return null;
      
      const transcript = lastMessages.map(m => `${m.sender}: ${m.content}`).join('\n');
      const prompt = `Analyse cette conversation récente pour détecter une urgence critique (panne serveur, problème de sécurité, urgence vitale, crise financière majeure).
      Si une alerte est nécessaire, renvoie true pour isUrgent.
      
      Conversation:
      ${transcript}`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isUrgent: { type: Type.BOOLEAN },
              severity: { type: Type.STRING, enum: ['critical', 'high'], nullable: true },
              reason: { type: Type.STRING, nullable: true }
            },
            required: ["isUrgent"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      
      if (result.isUrgent && result.reason) {
        return {
          id: Math.random().toString(36).substr(2, 9),
          chatId: chat.id,
          chatName: chat.name,
          severity: (result.severity as 'critical' | 'high') || 'high',
          timestamp: new Date().toISOString(),
          reason: result.reason
        };
      }
      
      return null;
    } catch (error: any) {
      if (isQuotaError(error) && retries > 0) {
         // Pour les alertes background, on attend un peu plus longtemps
        console.warn(`Quota dépassé (Alerts). Nouvelle tentative dans 10s...`);
        await delay(10000);
        return runAlertAnalysis(retries - 1);
      }
      console.error("Erreur Gemini Alert:", error);
      return null;
    }
  };

  return runAlertAnalysis();
};
