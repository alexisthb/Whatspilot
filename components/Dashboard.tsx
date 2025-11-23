
import React, { useEffect, useState, useRef } from 'react';
import { AlertCircle, MessageCircle, TrendingUp, Zap, Terminal, Activity, Smartphone, QrCode, WifiOff, Server, LayoutTemplate, Download, Copy, Play, RefreshCw, X, ShieldCheck, MousePointerClick } from 'lucide-react';
import { Alert, Chat, ScraperStatus, SystemLog } from '../types';
import { analyzeForAlerts } from '../services/geminiService';

interface DashboardProps {
  chats: Chat[];
  onNavigateToChat: (chatId: string) => void;
  scraperStatus: ScraperStatus;
  logs: SystemLog[];
  qrCodeData?: string | null;
  onRetryConnection: () => void;
  onStartDemo: () => void;
}

const SERVER_CODE_JS = `const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Initialisation du client WhatsApp
// headless: true signifie que le navigateur tourne en fond sans fenêtre visible
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// --- Événements WhatsApp ---

client.on('qr', (qr) => {
  console.log('QR Code reçu, envoi au frontend...');
  io.emit('qr_code', qr);
  io.emit('log', { level: 'warn', message: 'Authentification requise : Scannez le QR Code.' });
});

client.on('ready', () => {
  console.log('Client WhatsApp prêt !');
  io.emit('status', 'CONNECTED');
  io.emit('log', { level: 'success', message: 'Client WhatsApp connecté et prêt.' });
});

client.on('auth_failure', msg => {
  console.error('Erreur authentification', msg);
  io.emit('log', { level: 'error', message: 'Échec authentification: ' + msg });
});

client.on('message', async msg => {
  const contact = await msg.getContact();
  const chat = await msg.getChat();

  console.log(\`Message de \${contact.pushname}: \${msg.body}\`);

  io.emit('message_received', {
    id: msg.id.id,
    content: msg.body,
    timestamp: new Date().toISOString(),
    sender: contact.pushname || contact.number,
    chatName: chat.name,
    isGroup: chat.isGroup
  });
});

// --- Gestion des connexions Frontend (Socket.io) ---

io.on('connection', (socket) => {
  console.log('Nouvelle connexion frontend détectée');
  socket.emit('log', { level: 'info', message: 'Interface connectée au scraper.' });
  
  if (client.info) {
     socket.emit('status', 'CONNECTED');
  } else {
     socket.emit('status', 'WAITING_QR');
  }
});

// Démarrage
console.log('Démarrage du client WhatsApp...');
client.initialize();

const PORT = 3000;
server.listen(PORT, () => {
  console.log(\`Serveur Scraper écoutant sur le port \${PORT}\`);
});`;

const PACKAGE_JSON = `{
  "name": "whatsapp-pilot-scraper",
  "version": "1.0.0",
  "description": "Backend pour WhatsPilot",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "whatsapp-web.js": "^1.23.0",
    "qrcode-terminal": "^0.12.0",
    "express": "^4.18.2",
    "socket.io": "^4.7.4",
    "cors": "^2.8.5"
  }
}`;

const Dashboard: React.FC<DashboardProps> = ({ chats, onNavigateToChat, scraperStatus, logs, qrCodeData, onRetryConnection, onStartDemo }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll logs to bottom
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    // Determine alerts on mount
    const fetchAlerts = async () => {
        setLoadingAlerts(true);
        const newAlerts: Alert[] = [];
        
        for (const chat of chats) {
            const alert = await analyzeForAlerts(chat);
            if (alert) newAlerts.push(alert);
            
            // Throttle alert analysis to respect API limits (1s delay)
            if (chats.indexOf(chat) < chats.length - 1) {
                await new Promise(r => setTimeout(r, 1000));
            }
        }
        setAlerts(newAlerts);
        setLoadingAlerts(false);
    };

    if(chats.length > 0 && scraperStatus === ScraperStatus.CONNECTED) fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats, scraperStatus]);

  const copyToClipboard = (text: string, id: string) => {
      navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
  };

  const downloadFile = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // --- MODE LOGIN / SCAN (Plein Écran) ---
  const showLoginScreen = scraperStatus === ScraperStatus.WAITING_QR || scraperStatus === ScraperStatus.DISCONNECTED || scraperStatus === ScraperStatus.SYNCING;

  if (showLoginScreen && scraperStatus !== ScraperStatus.SYNCING) {
      const isRealConnection = scraperStatus === ScraperStatus.WAITING_QR;
      const demoQrData = "DEMO-MODE-SCAN-ME-TO-START-SIMULATION";
      
      return (
          <div className="flex-1 h-screen bg-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
               {/* Decorative background */}
               <div className="absolute top-0 left-0 w-full h-32 bg-emerald-500 z-0"></div>
               <div className="absolute top-10 left-10 flex items-center gap-3 z-10 text-white">
                    <MessageCircle className="w-8 h-8" />
                    <h1 className="text-xl font-bold tracking-tight">WhatsPilot</h1>
               </div>

               <div className="bg-white rounded-xl shadow-2xl z-10 max-w-4xl w-full h-[75vh] flex overflow-hidden animate-in zoom-in-95 duration-500">
                    <div className="flex-1 p-12 flex flex-col justify-center items-center border-r border-slate-100 bg-white">
                        <h2 className="text-3xl font-light text-slate-800 mb-10">
                            {isRealConnection ? "Connectez votre WhatsApp" : "Démarrez l'expérience"}
                        </h2>
                        
                        <div className="space-y-8 max-w-md w-full">
                            <div className="flex gap-5 items-start text-slate-600">
                                <span className="font-bold text-lg pt-0.5">1.</span>
                                <span className="text-lg">Ouvrez WhatsApp sur votre téléphone</span>
                            </div>
                            <div className="flex gap-5 items-start text-slate-600">
                                <span className="font-bold text-lg pt-0.5">2.</span>
                                <span className="text-lg">Appuyez sur <strong>Menu</strong> ou <strong>Réglages</strong> et sélectionnez <strong>Appareils connectés</strong></span>
                            </div>
                            <div className="flex gap-5 items-start text-slate-600">
                                <span className="font-bold text-lg pt-0.5">3.</span>
                                <span className="text-lg">Pointez votre téléphone vers cet écran</span>
                            </div>
                        </div>

                         <div className="mt-auto text-emerald-600 flex items-center gap-2 text-sm font-medium bg-emerald-50 px-4 py-2 rounded-full">
                            <ShieldCheck className="w-4 h-4" />
                            {isRealConnection ? "Connexion sécurisée via Serveur Local" : "Mode Démo Sécurisé (Simulation)"}
                        </div>
                    </div>

                    <div className="w-[420px] bg-white flex flex-col items-center justify-center p-8 border-l border-slate-50">
                         {/* QR CODE AREA */}
                         <div 
                            className="relative group cursor-pointer"
                            onClick={() => !isRealConnection && onStartDemo()}
                            title={!isRealConnection ? "Cliquez pour simuler le scan" : ""}
                         >
                            <div className={`absolute inset-0 bg-emerald-500/10 blur-xl rounded-full ${!isRealConnection ? 'group-hover:bg-emerald-500/30 transition-all duration-500' : ''}`}></div>
                            
                            {/* QR Image */}
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(isRealConnection && qrCodeData ? qrCodeData : demoQrData)}&color=${isRealConnection ? '000000' : '2d3748'}`} 
                                alt="Scan QR Code" 
                                className={`w-64 h-64 relative z-10 border-4 border-white shadow-lg rounded-lg transition-transform duration-300 ${!isRealConnection ? 'group-hover:scale-105' : ''}`}
                            />

                            {/* Overlay for Demo Mode */}
                            {!isRealConnection && (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg backdrop-blur-sm">
                                    <MousePointerClick className="w-12 h-12 text-emerald-600 mb-2" />
                                    <span className="text-emerald-800 font-bold">Cliquez pour simuler</span>
                                    <span className="text-emerald-600 text-sm">le scan QR code</span>
                                </div>
                            )}

                            {/* Center Icon */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg z-20 pointer-events-none">
                                <Smartphone className={`w-8 h-8 ${isRealConnection ? 'text-emerald-600' : 'text-slate-400'}`} />
                            </div>
                         </div>
                        
                        <div className="mt-10 text-center space-y-4">
                            {!isRealConnection ? (
                                <>
                                    <h3 className="text-xl font-bold text-slate-800">Serveur non détecté</h3>
                                    <p className="text-slate-500 max-w-xs mx-auto">
                                        Cliquez sur le QR Code pour lancer la <strong>Démo Instantanée</strong>.
                                    </p>
                                    <button 
                                        onClick={() => setShowInstallModal(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors mt-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Installer le serveur local
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center justify-center gap-2 text-emerald-600 font-medium">
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        En attente du scan...
                                    </div>
                                    <p className="text-sm text-slate-400">Le code change automatiquement pour votre sécurité</p>
                                </>
                            )}
                        </div>
                    </div>
               </div>
          </div>
      );
  }

  if (scraperStatus === ScraperStatus.SYNCING) {
      return (
           <div className="flex-1 h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Synchronisation...</h2>
                <p className="text-slate-500">Récupération de vos conversations et analyse IA</p>
           </div>
      );
  }

  // --- MODE CONNECTÉ (Dashboard Normal) ---
  return (
    <div className="flex-1 h-screen overflow-y-auto bg-slate-50 p-6 md:p-8 relative">
      
      {/* Install Modal */}
      {showInstallModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <div>
                          <h2 className="text-xl font-bold text-slate-800">Installation du Serveur Local</h2>
                          <p className="text-sm text-slate-500">Nécessaire pour connecter votre vrai compte WhatsApp.</p>
                      </div>
                      <button onClick={() => setShowInstallModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                          <X className="w-6 h-6 text-slate-500" />
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-8 space-y-8">
                      {/* Step 1 */}
                      <div className="flex gap-4">
                          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                          <div>
                              <h3 className="font-bold text-slate-800 mb-1">Installer Node.js</h3>
                              <p className="text-sm text-slate-600 mb-2">Si ce n'est pas déjà fait, installez l'environnement Node.js (version LTS) depuis le site officiel.</p>
                              <a href="https://nodejs.org/" target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline font-medium flex items-center gap-1">
                                  Aller sur nodejs.org <Terminal className="w-3 h-3" />
                              </a>
                          </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex gap-4">
                          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                          <div className="w-full">
                              <h3 className="font-bold text-slate-800 mb-2">Télécharger les fichiers</h3>
                              <p className="text-sm text-slate-600 mb-4">Créez un dossier sur votre ordinateur (ex: <code>whats-server</code>) et placez-y ces deux fichiers.</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Package.json card */}
                                  <div className="border border-slate-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                                      <div className="flex justify-between items-center mb-2">
                                          <span className="font-mono font-bold text-slate-700">package.json</span>
                                          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">Config</span>
                                      </div>
                                      <div className="flex gap-2 mt-3">
                                          <button 
                                              onClick={() => downloadFile('package.json', PACKAGE_JSON)}
                                              className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white text-xs py-2 rounded-md hover:bg-slate-800"
                                          >
                                              <Download className="w-3 h-3" /> Télécharger
                                          </button>
                                          <button 
                                              onClick={() => copyToClipboard(PACKAGE_JSON, 'pkg')}
                                              className="px-3 py-2 border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600"
                                              title="Copier le code"
                                          >
                                              {copied === 'pkg' ? <ShieldCheck className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                          </button>
                                      </div>
                                  </div>

                                  {/* Server.js card */}
                                   <div className="border border-slate-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                                      <div className="flex justify-between items-center mb-2">
                                          <span className="font-mono font-bold text-slate-700">server.js</span>
                                          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">Script</span>
                                      </div>
                                      <div className="flex gap-2 mt-3">
                                          <button 
                                              onClick={() => downloadFile('server.js', SERVER_CODE_JS)}
                                              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white text-xs py-2 rounded-md hover:bg-emerald-700"
                                          >
                                              <Download className="w-3 h-3" /> Télécharger
                                          </button>
                                          <button 
                                              onClick={() => copyToClipboard(SERVER_CODE_JS, 'server')}
                                              className="px-3 py-2 border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600"
                                              title="Copier le code"
                                          >
                                              {copied === 'server' ? <ShieldCheck className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>

                       {/* Step 3 */}
                       <div className="flex gap-4">
                          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold shrink-0">3</div>
                          <div className="w-full">
                              <h3 className="font-bold text-slate-800 mb-2">Lancer le serveur</h3>
                              <p className="text-sm text-slate-600 mb-3">Ouvrez un terminal dans ce dossier et lancez ces 2 commandes :</p>
                              <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-300 space-y-2">
                                  <div className="flex gap-2">
                                      <span className="text-slate-500 select-none">$</span>
                                      <span className="text-emerald-400">npm install</span>
                                      <span className="text-slate-500 text-xs italic ml-auto select-none">// Installe les dépendances</span>
                                  </div>
                                  <div className="flex gap-2">
                                      <span className="text-slate-500 select-none">$</span>
                                      <span className="text-emerald-400">npm start</span>
                                      <span className="text-slate-500 text-xs italic ml-auto select-none">// Démarre le serveur</span>
                                  </div>
                              </div>
                              <p className="text-xs text-slate-500 mt-2">Le QR Code apparaîtra automatiquement sur cette page une fois le serveur lancé.</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Centre de Pilotage</h1>
                <p className="text-slate-500">Surveillance temps réel de l'instance WhatsApp et des alertes IA.</p>
            </div>
            {scraperStatus === ScraperStatus.CONNECTED && (
                <div className={`px-4 py-2 rounded-full flex items-center gap-2 font-medium text-sm text-emerald-500 bg-emerald-100`}>
                    <div className={`w-2 h-2 rounded-full bg-current`}></div>
                    Connecté
                </div>
            )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Status Panel */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white col-span-1 lg:col-span-2 shadow-lg shadow-slate-900/10 flex flex-col h-[28rem] relative overflow-hidden">
                <div className="flex justify-between items-center mb-4 z-10">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-emerald-400" />
                        État du Serveur
                    </h2>
                    <span className="text-xs text-slate-500 font-mono">ws://localhost:3000</span>
                </div>
                
               
                <div className="flex-1 overflow-y-auto font-mono text-xs space-y-2 pr-2 z-10 custom-scrollbar">
                    {logs.map((log) => (
                        <div key={log.id} className="flex gap-2 opacity-80 hover:opacity-100 transition-opacity">
                            <span className="text-slate-500 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                            <span className={`${
                                log.level === 'error' ? 'text-red-400' :
                                log.level === 'warn' ? 'text-yellow-400' :
                                log.level === 'success' ? 'text-emerald-400' : 'text-blue-300'
                            }`}>
                                {log.level.toUpperCase()}
                            </span>
                            <span className="text-slate-300">{log.message}</span>
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </div>
                
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-rows-2 gap-6 h-[28rem]">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center relative overflow-hidden group">
                     <div className="absolute right-4 top-4 p-2 bg-emerald-100 rounded-lg text-emerald-600 group-hover:scale-110 transition-transform">
                        <MessageCircle className="w-5 h-5" />
                    </div>
                    <span className="text-slate-400 text-sm font-medium mb-1">Messages (24h)</span>
                    <span className="text-4xl font-bold text-slate-800">
                        {scraperStatus === ScraperStatus.CONNECTED ? '128' : '--'}
                    </span>
                    <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Connecté au flux
                    </div>
                </div>

                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center relative overflow-hidden group">
                     <div className="absolute right-4 top-4 p-2 bg-purple-100 rounded-lg text-purple-600 group-hover:scale-110 transition-transform">
                        <Zap className="w-5 h-5" />
                    </div>
                    <span className="text-slate-400 text-sm font-medium mb-1">Gemini AI</span>
                    <span className="text-4xl font-bold text-slate-800">
                         {scraperStatus === ScraperStatus.CONNECTED ? 'Active' : '--'}
                    </span>
                     <div className="mt-2 text-xs text-slate-400">
                        Analyse temps réel
                    </div>
                </div>
            </div>
        </div>

        {/* Alert Section */}
        {scraperStatus === ScraperStatus.CONNECTED && (
        <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Alertes Prioritaires
            </h2>
            
            {loadingAlerts ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse"></div>)}
                </div>
            ) : alerts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {alerts.map(alert => (
                         <div 
                            key={alert.id} 
                            onClick={() => onNavigateToChat(alert.chatId)}
                            className="bg-white border-l-4 border-red-500 rounded-r-xl p-5 shadow-sm cursor-pointer hover:bg-red-50/30 transition-colors group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${alert.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {alert.severity}
                                </span>
                                <span className="text-xs text-slate-400">
                                    {new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-red-600 transition-colors">{alert.chatName}</h3>
                            <p className="text-sm text-slate-600">{alert.reason}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl p-8 text-center border border-slate-200 border-dashed">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Activity className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500">Aucune alerte critique détectée. Le système veille.</p>
                </div>
            )}
        </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
