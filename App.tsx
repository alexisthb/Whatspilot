import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import InboxView from './components/InboxView';
import SettingsView from './components/SettingsView';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'chat' | 'settings'>('dashboard');

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      {activeView === 'settings' ? (
        <SettingsView 
            onSave={() => setActiveView('dashboard')}
            onTriggerSimulation={() => {}}
        />
      ) : (
        <InboxView />
      )}
    </div>
  );
};

export default App;