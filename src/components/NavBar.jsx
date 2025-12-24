import React from 'react';

export default function NavBar({ user, t, logout, setLang, lang }) {
  return (
    <div className="w-full max-w-2xl flex justify-between items-center mb-4 px-2">
      <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{t('welcome')}, {user.displayName ? user.displayName.split(' ')[0] : ""}</span>
          <div className="flex gap-2 bg-gray-200 px-2 py-1 rounded text-[10px] font-bold">
              <button onClick={() => setLang('en')} className={lang==='en'?'text-black':'text-gray-400'}>EN</button>
              <button onClick={() => setLang('pt')} className={lang==='pt'?'text-black':'text-gray-400'}>PT</button>
              <button onClick={() => setLang('es')} className={lang==='es'?'text-black':'text-gray-400'}>ES</button>
          </div>
      </div>
      <button onClick={logout} className="text-xs text-red-500">{t('logout')}</button>
    </div>
  );
}