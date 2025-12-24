import React from 'react';
import appLogo from '../assets/logonb.png';

export default function NavBar({ user, t, logout, setLang, lang }) {
  return (
    <div className="w-full max-w-2xl flex justify-between items-center mb-4 px-2 pt-2">
      
      <button 
        onClick={logout} 
        className="text-gray-400 hover:text-red-600 transition p-2"
        title={t('logout')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>

      <img src={appLogo} alt="SquarePro" className="h-20 object-contain" />

      <div className="flex gap-3 text-xs font-bold text-gray-400">
        <button onClick={() => setLang('en')} className={`${lang==='en' ? 'text-black' : 'hover:text-black'} transition`}>EN</button>
        <button onClick={() => setLang('pt')} className={`${lang==='pt' ? 'text-black' : 'hover:text-black'} transition`}>PT</button>
        <button onClick={() => setLang('es')} className={`${lang==='es' ? 'text-black' : 'hover:text-black'} transition`}>ES</button>
      </div>
      
    </div>
  );
}