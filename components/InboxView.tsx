
import React, { useEffect, useState, useMemo } from 'react';
import { Check, RefreshCw, Sparkles, X, MoreHorizontal, MessageCircle, Clock, Smartphone, Edit3, Send, Archive, LayoutGrid, List, AlertCircle, Users, Zap, TrendingUp, CheckCircle2, ArrowRight, Filter } from 'lucide-react';
import { fetchNewMessages } from '../services/apifyService';
import { analyzeMessagePriority } from '../services/geminiService';
import { TriagedItem, Priority } from '../types';

type FilterType = '24h' | 'priority' | 'all';
type ViewMode = 'GRID' | 'LIST';
type ModalType = 'REPLY' | 'ARCHIVE' | null;

const InboxView: React.FC = () => {
  const [items, setItems] = useState<TriagedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('24h');
  const [viewMode, setViewMode] = useState<ViewMode>('GRID');

  // Modal State
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedItem, setSelectedItem] = useState<TriagedItem | null>(null);
  const [editedReply, setEditedReply] = useState('');

  const loadData = async () => {
    setLoading(true);
    const rawData = await fetchNewMessages();
    const initialItems: TriagedItem[] = rawData.map(d => ({ ...d, status: 'PENDING' }));
    setItems(initialItems);
    setLoading(false);

    for (const item of initialItems) {
      setProcessingId(item.id);
      
      // On analyse
      const analysis = await analyzeMessagePriority(item);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, analysis } : i));
      
      // IMPORTANT: Pause de 2 secondes entre chaque requête pour éviter l'erreur 429 (Rate Limit)
      // Cela permet de lisser la charge sur l'API Gemini.
      if (initialItems.indexOf(item) < initialItems.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    setProcessingId(null);
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const recentItems = items.filter(i => new Date(i.timestamp).getTime() > now - oneDay);
    const total24h = recentItems.length;
    const pendingCount = items.filter(i => i.status === 'PENDING').length;
    const criticalCount = items.filter(i => i.analysis?.priority === Priority.CRITICAL && i.status === 'PENDING').length;
    const progress = items.length > 0 ? Math.round(((items.length - pendingCount) / items.length) * 100) : 100;
    return { total24h, pendingCount, criticalCount, progress };
  }, [items]);

  const openReplyModal = (item: TriagedItem, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setSelectedItem(item);
      setEditedReply(item.analysis?.suggestedReply || '');
      setActiveModal('REPLY');
  };

  const openArchiveModal = (item: TriagedItem, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setSelectedItem(item);
      setActiveModal('ARCHIVE');
  };

  const closeModal = () => {
      setActiveModal(null);
      setSelectedItem(null);
  };

  const handleConfirmAction = () => {
      if (selectedItem) {
          setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, status: 'ARCHIVED' } : i));
      }
      closeModal();
  };

  const visibleItems = useMemo(() => {
    let filtered = items.filter(i => i.status === 'PENDING');
    if (activeFilter === '24h') {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        filtered = filtered.filter(item => new Date(item.timestamp) > oneDayAgo);
    }
    return filtered.sort((a, b) => {
        if (activeFilter === 'priority') {
            const priorityOrder = { [Priority.CRITICAL]: 0, [Priority.HIGH]: 1, [Priority.NORMAL]: 2, [Priority.LOW]: 3, [Priority.SPAM]: 4 };
            const pA = a.analysis?.priority ? priorityOrder[a.analysis.priority] : 10;
            const pB = b.analysis?.priority ? priorityOrder[b.analysis.priority] : 10;
            if (pA !== pB) return pA - pB;
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [items, activeFilter]);

  return (
    <div className="flex-1 h-screen overflow-y-auto font-sans relative">
      <div className="max-w-[1800px] mx-auto p-8 lg:p-12">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl lg:text-5xl font-serif font-black text-slate-900 mb-4 tracking-tight">
              Inbox <span className="text-slate-300 font-light">Zero</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-md leading-relaxed">
              Votre assistant IA a trié <strong className="text-slate-900">{stats.total24h} messages</strong> ces dernières 24h.
              <br/>Il vous reste <strong className="text-emerald-600">{stats.pendingCount} conversations</strong> à traiter.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white border border-slate-200 p-2 rounded-2xl shadow-sm">
             <button 
                onClick={loadData} 
                disabled={loading || processingId !== null}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
              >
                <RefreshCw className={`w-5 h-5 ${processingId ? 'animate-spin' : ''}`} />
              </button>
             <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>
             <button 
                onClick={() => setViewMode('GRID')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'GRID' ? 'bg-slate-100 text-slate-900 font-bold shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
             >
                <LayoutGrid className="w-5 h-5" />
             </button>
             <button 
                onClick={() => setViewMode('LIST')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'LIST' ? 'bg-slate-100 text-slate-900 font-bold shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
             >
                <List className="w-5 h-5" />
             </button>
          </div>
        </header>

        {/* --- HERO STATS (Bento Grid) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {/* Critical Alert Widget */}
            <div className={`col-span-1 md:col-span-2 relative overflow-hidden rounded-[2rem] p-8 flex flex-col justify-between transition-all hover:scale-[1.01] duration-300 ${stats.criticalCount > 0 ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20' : 'bg-white border border-slate-200 shadow-xl shadow-slate-200/50'}`}>
                 <div className="flex justify-between items-start z-10">
                    <div>
                        <h3 className={`text-sm font-bold uppercase tracking-wider mb-1 ${stats.criticalCount > 0 ? 'text-slate-400' : 'text-slate-400'}`}>Priorité Haute</h3>
                        <p className={`text-3xl font-serif font-bold ${stats.criticalCount > 0 ? 'text-white' : 'text-slate-800'}`}>
                            {stats.criticalCount > 0 ? `${stats.criticalCount} Urgences` : 'Tout est calme'}
                        </p>
                    </div>
                    <div className={`p-3 rounded-2xl ${stats.criticalCount > 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                        <AlertCircle className="w-6 h-6" />
                    </div>
                 </div>
                 
                 {stats.criticalCount > 0 && (
                     <div className="mt-8 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                         {items.filter(i => i.analysis?.priority === Priority.CRITICAL && i.status === 'PENDING').slice(0,3).map(i => (
                             <div key={i.id} onClick={() => openReplyModal(i)} className="shrink-0 bg-white/10 backdrop-blur-md rounded-xl p-3 w-48 border border-white/20 cursor-pointer hover:bg-white/20 transition-colors shadow-lg">
                                 <div className="text-xs font-bold text-red-300 mb-1">{i.sender}</div>
                                 <div className="text-xs text-slate-300 truncate">{i.content}</div>
                             </div>
                         ))}
                     </div>
                 )}
                 
                 {/* Decorative Gradient */}
                 {stats.criticalCount > 0 && <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>}
            </div>

            {/* Progress Widget */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/50 hover:scale-[1.02] transition-transform duration-300 flex flex-col justify-between">
                <div>
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Objectif Zero</h3>
                        <Zap className="w-5 h-5 text-emerald-500" />
                     </div>
                     <div className="text-4xl font-serif font-bold text-slate-900 mb-2">{stats.progress}%</div>
                     <p className="text-xs text-slate-500">des messages traités</p>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mt-4 ring-1 ring-slate-200">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${stats.progress}%` }}></div>
                </div>
            </div>

            {/* Filter Widget */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col justify-center gap-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Filtres Rapides</h3>
                {(['24h', 'priority', 'all'] as FilterType[]).map(f => (
                    <button 
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex justify-between items-center ${activeFilter === f ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30 transform scale-[1.02]' : 'text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-100'}`}
                    >
                        {f === '24h' && 'Dernières 24h'}
                        {f === 'priority' && 'Par Priorité'}
                        {f === 'all' && 'Historique'}
                        {activeFilter === f && <Check className="w-4 h-4" />}
                    </button>
                ))}
            </div>
        </div>

        {/* --- GRID VIEW --- */}
        {viewMode === 'GRID' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
          {visibleItems.map((item, idx) => {
             const isCritical = item.analysis?.priority === Priority.CRITICAL;
             
             return (
                <div 
                  key={item.id} 
                  className={`group relative flex flex-col bg-white rounded-[2rem] p-6 transition-all duration-300 hover:-translate-y-2
                  border border-slate-200 hover:border-slate-300
                  shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)]
                  ${isCritical ? 'ring-2 ring-red-500/30' : ''}`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black shadow-inner ring-1 ring-inset ring-black/5 ${isCritical ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-700'}`}>
                                  {item.sender.substring(0,2).toUpperCase()}
                              </div>
                              <div>
                                  <h3 className="font-serif font-bold text-slate-900 leading-none mb-1 text-lg">
                                    {item.sender}
                                  </h3>
                                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </p>
                              </div>
                          </div>
                          {isCritical && <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping shadow-sm"></span>}
                      </div>

                      {/* Message Body */}
                      <div className="flex-1 mb-6 relative">
                          <div className="relative z-10 pl-4 border-l-[3px] border-slate-200 py-1">
                             <p className="text-sm text-slate-600 leading-relaxed line-clamp-4 font-medium">
                                "{item.content}"
                             </p>
                          </div>
                          
                          {/* AI Insight */}
                          {item.analysis && (
                            <div className="mt-5 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/80 group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-colors">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="bg-indigo-100 p-1 rounded-md">
                                        <Sparkles className="w-3 h-3 text-indigo-600" />
                                    </div>
                                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide">Suggestion IA</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-800 leading-snug">
                                    {item.analysis.suggestedReply || item.analysis.summary}
                                </p>
                            </div>
                          )}
                      </div>

                      {/* Floating Action Bar (Always visible but highlighted on hover) */}
                      <div className="flex items-center gap-2 mt-auto pt-5 border-t border-slate-100">
                          <button 
                            onClick={(e) => openArchiveModal(item, e)}
                            className="p-3 rounded-xl text-slate-400 bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:text-slate-600 hover:border-slate-200 transition-colors"
                            title="Archiver"
                          >
                              <Archive className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={(e) => openReplyModal(item, e)}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${isCritical ? 'bg-red-500 shadow-red-500/30 hover:bg-red-600' : 'bg-slate-900 shadow-slate-900/20 hover:bg-emerald-600 hover:shadow-emerald-500/30'}`}
                          >
                              {isCritical ? 'Gérer Urgence' : 'Répondre'} <ArrowRight className="w-4 h-4" />
                          </button>
                      </div>
                </div>
             );
          })}
        </div>
        )}

        {/* --- LIST VIEW --- */}
        {viewMode === 'LIST' && (
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden pb-0">
                <div className="grid grid-cols-1 divide-y divide-slate-100">
                    {visibleItems.map((item) => {
                         const isCritical = item.analysis?.priority === Priority.CRITICAL;
                         return (
                            <div 
                                key={item.id}
                                onClick={() => openReplyModal(item)}
                                className="group flex items-center px-8 py-6 hover:bg-slate-50 cursor-pointer transition-all hover:pl-10"
                            >
                                <div className={`w-3 h-3 rounded-full mr-6 shadow-sm ${isCritical ? 'bg-red-500 animate-pulse' : 'bg-slate-200 group-hover:bg-emerald-400 transition-colors'}`}></div>
                                
                                <div className="w-64 shrink-0">
                                    <h4 className={`font-serif font-bold text-lg ${isCritical ? 'text-red-900' : 'text-slate-900'}`}>{item.sender}</h4>
                                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>

                                <div className="flex-1 pr-12 min-w-0">
                                    <p className="text-sm text-slate-600 truncate font-medium">{item.content}</p>
                                    {item.analysis?.suggestedReply && (
                                        <div className="flex items-center gap-1.5 mt-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-md">
                                            <Sparkles className="w-3 h-3" />
                                            {item.analysis.suggestedReply}
                                        </div>
                                    )}
                                </div>

                                <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-300 opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-900 hover:text-white hover:border-transparent hover:shadow-lg transform translate-x-4 group-hover:translate-x-0">
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                         );
                    })}
                </div>
            </div>
        )}

      </div>

      {/* --- MODAL (Glassmorphism Style) --- */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
            
            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] border border-white/20">
                {/* Modal Header */}
                <div className="px-8 py-6 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center backdrop-blur-xl">
                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{activeModal === 'REPLY' ? 'Studio de Réponse' : 'Archivage'}</span>
                        <h2 className="text-2xl font-serif font-bold text-slate-900 mt-1">
                            {selectedItem?.sender}
                        </h2>
                    </div>
                    <button onClick={closeModal} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors shadow-sm hover:shadow-md">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {activeModal === 'REPLY' && selectedItem && (
                    <>
                    <div className="p-8 overflow-y-auto">
                        <div className="flex gap-4 mb-8">
                            <div className="w-1 bg-slate-200 rounded-full"></div>
                            <div className="flex-1 text-slate-600 italic leading-relaxed font-medium">
                                "{selectedItem.content}"
                            </div>
                        </div>

                        <div className="relative group">
                            <textarea
                                value={editedReply}
                                onChange={(e) => setEditedReply(e.target.value)}
                                className="w-full h-48 p-6 bg-slate-50 border-2 border-transparent rounded-2xl text-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/10 outline-none resize-none font-medium leading-relaxed transition-all"
                                placeholder="Commencez à écrire..."
                                autoFocus
                            />
                            <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> IA Assisted
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-white border-t border-slate-100 flex justify-end gap-3 z-10 relative">
                         <button onClick={closeModal} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                            Annuler
                         </button>
                         <button onClick={handleConfirmAction} className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold shadow-xl shadow-slate-900/20 hover:bg-emerald-600 hover:shadow-emerald-500/30 transition-all flex items-center gap-2 active:scale-95">
                            Envoyer <Send className="w-4 h-4" />
                         </button>
                    </div>
                    </>
                )}
                
                {activeModal === 'ARCHIVE' && (
                     <div className="p-10 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Archive className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Confirmer l'archivage ?</h3>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto">Le message sera marqué comme traité. Cette action est réversible depuis l'historique.</p>
                        <div className="flex justify-center gap-3">
                            <button onClick={closeModal} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">Non, retour</button>
                            <button onClick={handleConfirmAction} className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all">Oui, archiver</button>
                        </div>
                     </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default InboxView;
