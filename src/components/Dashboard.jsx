import React from 'react';

export default function Dashboard({ savedQuotes, t, setActiveTab }) {
  
  // Filtrando por status
  const pendingQuotes = savedQuotes.filter(q => !q.status || q.status === 'pending');
  const approvedQuotes = savedQuotes.filter(q => q.status === 'approved' || q.status === 'paid');

  // Somando valores
  const totalPending = pendingQuotes.reduce((acc, q) => acc + (Number(q.total) || 0), 0);
  const totalApproved = approvedQuotes.reduce((acc, q) => acc + (Number(q.total) || 0), 0);

  return (
    <div className="p-6 space-y-6">
      
      {/* CARD DE APROVADOS (DINHEIRO GARANTIDO) */}
      <div className="bg-green-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
            <span className="text-9xl">💰</span>
        </div>
        <p className="text-xs text-green-100 font-bold tracking-widest uppercase mb-1">{t('statusApproved')} / {t('statusPaid')}</p>
        <h2 className="text-4xl font-bold">${totalApproved.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
        <p className="text-xs text-green-200 mt-2">{approvedQuotes.length} {t('dashCount')}</p>
      </div>

      {/* CARD DE PENDENTES (DINHEIRO POTENCIAL) */}
      <div className="bg-yellow-500 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
        <p className="text-xs text-yellow-100 font-bold tracking-widest uppercase mb-1">{t('statusPending')}</p>
        <h2 className="text-3xl font-bold">${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
        <p className="text-xs text-yellow-100 mt-2">{pendingQuotes.length} {t('dashCount')}</p>
      </div>

      {/* BOTÃO DE AÇÃO */}
      <div className="mt-4">
        <button 
            onClick={() => setActiveTab('quote')}
            className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-xl shadow-md transition"
        >
            + {t('tabNew')}
        </button>
      </div>
    </div>
  );
}