import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Chat } from '../types';

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (id: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, selectedChatId, onSelectChat }) => {
  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0">
      <div className="p-4 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Discussions</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          />
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
          <button className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full whitespace-nowrap">Tout</button>
          <button className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full hover:bg-slate-200 whitespace-nowrap">Non lus</button>
          <button className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full hover:bg-slate-200 whitespace-nowrap">Groupes</button>
          <button className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full hover:bg-slate-200 whitespace-nowrap">Urgent</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div 
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`p-4 flex gap-3 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-50 ${selectedChatId === chat.id ? 'bg-emerald-50/60 border-l-4 border-l-emerald-500' : 'border-l-4 border-l-transparent'}`}
          >
            <div className="relative shrink-0">
              <img src={chat.avatarUrl} alt={chat.name} className="w-12 h-12 rounded-full object-cover bg-slate-200" />
              {chat.isGroup && (
                <div className="absolute -bottom-1 -right-1 bg-slate-100 border border-white rounded-full p-0.5">
                    {/* Tiny icon for group indicator could go here */}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h3 className={`text-sm font-semibold truncate pr-2 ${selectedChatId === chat.id ? 'text-emerald-900' : 'text-slate-800'}`}>
                  {chat.name}
                </h3>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'font-semibold text-slate-700' : 'text-slate-500'}`}>
                {chat.lastMessage}
              </p>
            </div>

            {chat.unreadCount > 0 && (
              <div className="flex flex-col justify-center items-end ml-1">
                <span className="bg-emerald-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full">
                  {chat.unreadCount}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;