import React, { useState } from 'react';
import { Save, Server, Wifi, Shield, Cpu, Play } from 'lucide-react';

interface SettingsViewProps {
  onSave: () => void;
  onTriggerSimulation: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onSave, onTriggerSimulation }) => {
  const [wsUrl, setWsUrl] = useState('ws://localhost:3000');
  const [autoReply, setAutoReply] = useState(false);
  const [scaningInterval, setScanningInterval] = useState('5');

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Configuration Système</h1>
          <p className="text-slate-500">Paramétrez la connexion avec le scraper WhatsApp et le comportement de l'IA.</p>
        </header>

        <div className="space-y-6">
          {/* Section Connexion Backend */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-500" />
                Connexion Scraper (Backend)
                </h2>
                <button 
                    onClick={onTriggerSimulation}
                    className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full font-medium hover:bg-indigo-100 transition-colors flex items-center gap-1"
                >
                    <Play className="w-3 h-3" />
                    Lancer démo connexion
                </button>
            </div>
            
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL du WebSocket</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={wsUrl}
                    onChange={(e) => setWsUrl(e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    placeholder="ex: ws://192.168.1.15:3000"
                  />
                  <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
                    Tester
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">L'adresse IP de la machine exécutant whatsapp-web.js</p>
              </div>
            </div>
          </div>

          {/* Section Comportement IA */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-500" />
              Comportement IA (Gemini)
            </h2>
            
            <div className="space-y-4">
               <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="block text-sm font-medium text-slate-700">Scan automatique des urgences</span>
                  <span className="text-xs text-slate-500">Analyse chaque nouveau message entrant pour détecter les crises</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={true} readOnly />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="block text-sm font-medium text-slate-700">Mode "Répondeur Intelligent"</span>
                  <span className="text-xs text-slate-500">Suggère des brouillons de réponse automatiquement</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={autoReply}
                    onChange={() => setAutoReply(!autoReply)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fréquence de synchronisation (minutes)</label>
                <select 
                    value={scaningInterval}
                    onChange={(e) => setScanningInterval(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                    <option value="1">Temps réel (1 min)</option>
                    <option value="5">Standard (5 min)</option>
                    <option value="15">Économie (15 min)</option>
                    <option value="60">Horaire (60 min)</option>
                </select>
              </div>
            </div>
          </div>

           {/* Section Sécurité */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              Zone de Danger
            </h2>
            <div className="flex gap-3">
                 <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                    Déconnecter la session WhatsApp
                 </button>
                 <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors">
                    Vider le cache IA
                 </button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
             <button 
                onClick={onSave}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 transition-all"
            >
                <Save className="w-5 h-5" />
                Enregistrer les modifications
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;