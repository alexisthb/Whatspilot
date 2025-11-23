import React, { useState, useEffect, useRef } from 'react';
import { Send, MoreVertical, Paperclip, Bot, Sparkles, AlertTriangle, Check, X } from 'lucide-react';
import { Chat, Message, SenderType } from '../types';
import { summarizeConversation, generateSmartReply } from '../services/geminiService';

interface ChatViewProps {
  chat: Chat;
  onSendMessage: (text: string) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ chat, onSendMessage }) => {
  const [inputValue, setInputValue] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset state when chat changes
    setSummary(null);
    setSuggestions([]);
    scrollToBottom();
  }, [chat.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    const result = await summarizeConversation(chat.messages);
    setSummary(result);
    setIsSummarizing(false);
  };

  const handleGenerateSuggestions = async () => {
    setLoadingSuggestions(true);
    const result = await generateSmartReply(chat);
    setSuggestions(result);
    setLoadingSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#ece5dd] relative">
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#4a5568 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      {/* Header */}
      <div className="bg-white px-6 py-3 border-b border-slate-200 flex justify-between items-center shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3">
          <img src={chat.avatarUrl} alt={chat.name} className="w-10 h-10 rounded-full" />
          <div>
            <h2 className="font-semibold text-slate-800">{chat.name}</h2>
            <p className="text-xs text-emerald-600">En ligne</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleSummarize}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-medium transition-colors"
                disabled={isSummarizing}
            >
                <Sparkles className="w-4 h-4" />
                {isSummarizing ? 'Analyse...' : 'Résumer (IA)'}
            </button>
            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                <MoreVertical className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* AI Summary Panel */}
      {summary && (
        <div className="bg-indigo-50 border-b border-indigo-100 p-4 animate-in slide-in-from-top-2 duration-300">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
              <Bot className="w-4 h-4" /> Résumé Intelligent
            </h3>
            <button onClick={() => setSummary(null)} className="text-indigo-400 hover:text-indigo-700">
                <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-indigo-800 whitespace-pre-line leading-relaxed">
            {summary}
          </p>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 z-0">
        {chat.messages.map((msg) => {
            const isMe = msg.senderType === SenderType.ME;
            return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] md:max-w-[60%] rounded-lg p-3 shadow-sm relative ${isMe ? 'bg-[#dcf8c6]' : 'bg-white'}`}>
                        {!isMe && <p className="text-xs font-bold text-slate-500 mb-1">{msg.sender}</p>}
                        <p className="text-sm text-slate-800 leading-relaxed">{msg.content}</p>
                        <div className="flex justify-end items-center gap-1 mt-1">
                            <span className="text-[10px] text-slate-500">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && <Check className="w-3 h-3 text-emerald-500" />}
                        </div>
                    </div>
                </div>
            );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-slate-200 z-10">
        {/* Smart Suggestions */}
        {suggestions.length > 0 && (
             <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                {suggestions.map((sugg, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => setInputValue(sugg)}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs hover:bg-emerald-100 transition-colors whitespace-nowrap"
                    >
                        {sugg}
                    </button>
                ))}
             </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex gap-2 pb-3">
                 <button type="button" className="text-slate-400 hover:text-slate-600">
                    <Paperclip className="w-5 h-5" />
                 </button>
                 <button 
                    type="button" 
                    onClick={handleGenerateSuggestions}
                    disabled={loadingSuggestions}
                    className={`text-slate-400 hover:text-indigo-500 transition-colors ${loadingSuggestions ? 'animate-pulse text-indigo-400' : ''}`}
                    title="Générer des réponses"
                >
                    <Bot className="w-6 h-6" />
                 </button>
            </div>
            
            <div className="flex-1 bg-slate-100 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-emerald-500/30 transition-all">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Tapez un message..."
                    className="w-full bg-transparent border-none outline-none text-sm text-slate-800"
                />
            </div>
            
            <button 
                type="submit" 
                className={`p-3 rounded-xl transition-all ${inputValue.trim() ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600' : 'bg-slate-200 text-slate-400'}`}
            >
                <Send className="w-5 h-5" />
            </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;