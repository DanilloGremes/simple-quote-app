import React from 'react';

export default function BottomNav({ activeTab, setActiveTab, t }) {
  

  const Icons = {
    home: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    clients: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    add: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-12H4" /></svg>,
    history: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    services: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg> // Usando menu icon para 'Mais'
  };

  const NavItem = ({ id, icon, label, isMain = false }) => {
  
    const isMenuActive = id === 'menu' && (activeTab === 'services' || activeTab === 'company' || activeTab === 'menu');
    const isActive = activeTab === id || isMenuActive;
    
    return (
      <button 
        onClick={() => setActiveTab(id)}
        className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300
          ${isMain ? '-mt-8' : ''} 
        `}
      >
        {isMain ? (
         
          <div className="bg-black rounded-full p-4 shadow-2xl hover:scale-110 transition-transform border-[6px] border-gray-50">
            {icon}
          </div>
        ) : (
         
          <div className={`flex flex-col items-center ${isActive ? 'text-black opacity-100 scale-105' : 'text-gray-400 opacity-70 hover:opacity-100'}`}>
            {icon}
            {/* Removemos o texto para ficar ULTRA minimalista, ou deixamos bem pequeno */}
            <span className="text-[9px] font-medium mt-1 tracking-wide">{label}</span>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 w-full h-20 bg-white/90 backdrop-blur-md border-t border-gray-100 flex justify-between items-center px-4 z-50 pb-2 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
      <NavItem id="dashboard" icon={Icons.home} label={t('tabHome')} />
      <NavItem id="clients" icon={Icons.clients} label={t('tabClients')} />
      <NavItem id="quote" icon={Icons.add} label="" isMain={true} />
      <NavItem id="history" icon={Icons.history} label={t('tabHistory')} />
      <NavItem id="menu" icon={Icons.services} label="Menu" />
    </div>
  );
}