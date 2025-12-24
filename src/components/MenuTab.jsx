import React from 'react';

export default function MenuTab({ setActiveTab, t, logout }) {
  
  const MenuItem = ({ label, icon, onClick, isDestructive = false }) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition mb-3
        ${isDestructive ? 'text-red-600' : 'text-gray-800'}
      `}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span className="font-bold">{label}</span>
      </div>
      <span className="text-gray-300">❯</span>
    </button>
  );

  return (
    <div className="p-6">
      <h2 className="font-bold text-xl mb-6 text-gray-800">Menu</h2>
      
      <div className="space-y-1">
        <MenuItem 
            icon="🛠️" 
            label={t('tabServices')} 
            onClick={() => setActiveTab('services')} 
        />
        
        <MenuItem 
            icon="🏢" 
            label={t('tabCompany')} 
            onClick={() => setActiveTab('company')} 
        />
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <MenuItem 
            icon="🚪" 
            label={t('logout')} 
            onClick={logout} 
            isDestructive={true}
        />
      </div>
      
      <p className="text-center text-xs text-gray-400 mt-8">SquarePro v1.0.0</p>
    </div>
  );
}