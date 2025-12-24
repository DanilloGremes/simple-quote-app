import React from 'react';
import appLogo from '../assets/logo.png'; 

export default function Login({ loginGoogle, t, setLang, lang }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-10 rounded-xl shadow-xl text-center max-w-md w-full">
        
        {/* 2. ADICIONAMOS A TAG DE IMAGEM AQUI */}
        {/* w-32 define a largura (ajuste se ficar grande/pequeno) */}
        {/* mx-auto centraliza a imagem */}
        {/* mb-6 dá um espaço embaixo antes do título */}
        <img src={appLogo} alt="SquarePro Logo" className="w-50 mx-auto" />
        
        <div className="flex justify-center gap-4">
          <button onClick={() => setLang('en')} className={`text-xs font-bold ${lang==='en'?'underline':''}`}>EN</button>
          <button onClick={() => setLang('pt')} className={`text-xs font-bold ${lang==='pt'?'underline':''}`}>PT</button>
          <button onClick={() => setLang('es')} className={`text-xs font-bold ${lang==='es'?'underline':''}`}>ES</button>
        </div>
        <button onClick={loginGoogle} className="w-full bg-black text-white py-3 rounded mt-4">{t('loginBtn')}</button>
      </div>
    </div>
  );
}