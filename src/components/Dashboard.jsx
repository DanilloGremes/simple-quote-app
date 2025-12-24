import React from 'react';

export default function Dashboard({ savedQuotes, t, setActiveTab }) {
  // 1. Calcular o Total de Dinheiro Orçado
  const totalValue = savedQuotes.reduce((acc, quote) => acc + (Number(quote.total) || 0), 0);

  // 2. Contar quantos orçamentos existem
  const count = savedQuotes.length;

  // 3. Calcular a Média (Total / Quantidade)
  const average = count > 0 ? totalValue / count : 0;

  return (
    <div className="p-6 space-y-6">
      {/* CARD PRETO (DESTAQUE) */}
      <div className="bg-black text-white p-6 rounded-xl shadow-lg">
        <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mb-1">{t('dashTotal')}</p>
        <h2 className="text-4xl font-bold">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
      </div>

      {/* GRID COM OS OUTROS DOIS CARDS */}
      <div className="grid grid-cols-2 gap-4">
        
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500 font-bold uppercase mb-1">{t('dashCount')}</p>
          <h3 className="text-2xl font-bold text-gray-800">{count}</h3>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500 font-bold uppercase mb-1">{t('dashAvg')}</p>
          <h3 className="text-2xl font-bold text-gray-800">${average.toLocaleString('en-US', { minimumFractionDigits: 0 })}</h3>
        </div>
      </div>

      {/* BOTÃO DE AÇÃO RÁPIDA */}
      <div className="mt-8">
        <button 
            onClick={() => setActiveTab('quote')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md transition transform hover:scale-[1.02]"
        >
            + {t('tabNew')}
        </button>
      </div>
    </div>
  );
}