import React from 'react';

export default function HistoryList({ 
  savedQuotes, 
  loadQuoteView, 
  startEditing, 
  deleteQuote, 
  updateStatus, // Recebendo a nova função
  t 
}) {

  // Função auxiliar para cor do badge
  const getStatusColor = (status) => {
      switch(status) {
          case 'approved': return 'bg-green-100 text-green-800 border-green-200';
          case 'paid': return 'bg-blue-100 text-blue-800 border-blue-200';
          case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
          default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // Pending
      }
  }

  return (
    <div className="p-4">
        <h2 className="font-bold mb-4">{t('historyTitle')}</h2>
        {savedQuotes.length === 0 ? <p className="text-gray-500 text-sm">{t('emptyHistory')}</p> : (
            <div className="space-y-3">
                {savedQuotes.map(quote => (
                    <div key={quote.id} onClick={() => loadQuoteView(quote)} className="border border-gray-200 p-4 rounded-xl hover:shadow-md transition bg-white cursor-pointer relative overflow-hidden">
                        
                        {/* Linha colorida lateral indicando status */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusColor(quote.status || 'pending').replace('bg-', 'bg-').split(' ')[0]}`}></div>

                        <div className="flex justify-between items-start pl-3">
                            <div>
                                <h3 className="font-bold text-gray-800">{quote.clientName || "Cliente sem nome"}</h3>
                                <p className="text-xs text-gray-500 mt-1">#{quote.quoteNumber || "?"} • {quote.materialType}</p>
                                <p className="text-xs text-gray-400">{new Date(quote.date).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg text-gray-900">${Number(quote.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>

                        {/* Barra de Ações Inferior */}
                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center pl-3">
                            
                            {/* Seletor de Status */}
                            <select 
                                value={quote.status || 'pending'} 
                                onClick={(e) => e.stopPropagation()} // Para não abrir o card ao clicar
                                onChange={(e) => updateStatus(quote.id, e.target.value, e)}
                                className={`text-xs font-bold py-1 px-2 rounded-lg border ${getStatusColor(quote.status || 'pending')} cursor-pointer outline-none`}
                            >
                                <option value="pending">{t('statusPending')}</option>
                                <option value="approved">{t('statusApproved')}</option>
                                <option value="paid">{t('statusPaid')}</option>
                                <option value="rejected">{t('statusRejected')}</option>
                            </select>

                            <div className="flex gap-2">
                                <button 
                                    onClick={(e) => startEditing(quote, e)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                                    title="Editar"
                                >
                                    ✏️
                                </button>

                                <button 
                                    onClick={(e) => deleteQuote(quote.id, e)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
                                    title="Apagar"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}