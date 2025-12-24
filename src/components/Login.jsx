import React from 'react';

export default function Login({ loginGoogle, t, setLang, lang }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-10 rounded-xl shadow-xl text-center max-w-md w-full">
        <h1 className="text-3xl font-bold mb-2">{t('appTitle')}</h1>
        <div className="flex justify-center gap-4 mb-6">
          <button onClick={() => setLang('en')} className={`text-xs font-bold ${lang==='en'?'underline':''}`}>EN</button>
          <button onClick={() => setLang('pt')} className={`text-xs font-bold ${lang==='pt'?'underline':''}`}>PT</button>
          <button onClick={() => setLang('es')} className={`text-xs font-bold ${lang==='es'?'underline':''}`}>ES</button>
        </div>
        <button onClick={loginGoogle} className="w-full bg-black text-white py-3 rounded mt-4">{t('loginBtn')}</button>
      </div>
    </div>
  );
}