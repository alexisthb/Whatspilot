import React from 'react';
import { LayoutDashboard, MessageSquare, Settings, Bell, LogOut } from 'lucide-react';

interface SidebarProps {
  activeView: 'dashboard' | 'chat' | 'settings';
  setActiveView: (view: 'dashboard' | 'chat' | 'settings') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <div className="w-20 bg-slate-900 flex flex-col items-center py-6 h-screen border-r border-slate-800 shrink-0">
      <div className="mb-8">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <MessageSquare className="text-white w-6 h-6" />
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-6 w-full px-2">
        <button 
          onClick={() => setActiveView('dashboard')}
          className={`p-3 rounded-xl transition-all duration-200 group relative ${activeView === 'dashboard' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Tableau de bord
          </span>
        </button>

        <button 
          onClick={() => setActiveView('chat')}
          className={`p-3 rounded-xl transition-all duration-200 group relative ${activeView === 'chat' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Messages
          </span>
        </button>
        
        <button className="p-3 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all duration-200 relative group">
          <Bell className="w-6 h-6" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
           <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Alertes
          </span>
        </button>
      </nav>

      <div className="flex flex-col gap-4 w-full px-2">
         <button 
            onClick={() => setActiveView('settings')}
            className={`p-3 rounded-xl transition-all duration-200 group relative ${activeView === 'settings' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
        >
          <Settings className="w-6 h-6" />
          <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            Configuration
          </span>
        </button>
        <button className="p-3 rounded-xl text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-all duration-200">
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;