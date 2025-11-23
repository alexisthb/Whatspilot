import React from 'react';
import { LayoutDashboard, MessageSquare, Settings, Bell, Command } from 'lucide-react';

interface SidebarProps {
  activeView: 'dashboard' | 'chat' | 'settings';
  setActiveView: (view: 'dashboard' | 'chat' | 'settings') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Pilotage' },
    { id: 'chat', icon: MessageSquare, label: 'Messages' },
    { id: 'settings', icon: Settings, label: 'Réglages' },
  ];

  return (
    <div className="h-screen w-24 flex flex-col items-center py-8 z-50 shrink-0">
      {/* Logo Area */}
      <div className="mb-10 group cursor-pointer">
        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-900/20 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
            <Command className="w-6 h-6" />
        </div>
      </div>

      {/* Navigation Dock */}
      <nav className="flex-1 flex flex-col gap-4 w-full px-4">
        {menuItems.map((item) => {
           const isActive = activeView === item.id;
           const Icon = item.icon;
           
           return (
            <button 
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={`relative group w-full aspect-square flex items-center justify-center rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'bg-white text-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100' 
                  : 'text-slate-400 hover:bg-white/50 hover:text-slate-600'
              }`}
            >
              <Icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              
              {/* Active Dot */}
              {isActive && (
                <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-slate-900 rounded-l-full"></span>
              )}

              {/* Tooltip */}
              <span className="absolute left-16 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg translate-x-2 group-hover:translate-x-0 transition-transform">
                {item.label}
              </span>
            </button>
           );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-4 w-full px-4">
         <button className="relative w-full aspect-square flex items-center justify-center rounded-2xl text-slate-400 hover:bg-white/50 hover:text-red-500 transition-all duration-300 group">
            <Bell className="w-6 h-6 group-hover:animate-swing" />
            <span className="absolute top-3 right-4 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
         </button>
         
         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 p-0.5 cursor-pointer hover:scale-105 transition-transform">
            <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                alt="User" 
                className="w-full h-full rounded-full bg-white border-2 border-white"
            />
         </div>
      </div>
    </div>
  );
};

export default Sidebar;