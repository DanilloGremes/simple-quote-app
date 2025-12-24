import React from 'react';

export default function HistoryList({ 
  savedQuotes, 
  loadQuoteView, 
  startEditing, 
  deleteQuote, 
  updateStatus, 
  t 
}) {

  const getStatusColor = (status) => {
      switch(status) {
          case 'approved': return 'bg-green-100 text-green-800 border-green-200';
          case 'paid': return 'bg-blue-100 text-blue-800 border-blue-200';
          case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
          default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'; 
      }
  }

  // --- NOVA FUNÇÃO DE COMPARTILHAMENTO NATIVO ---
  const handleShare = async (quote, e) => {
    e.stopPropagation();
    
    // Monta a mensagem
    let message = t('shareMsg')
        .replace('{material}', quote.materialType || 'Service')
        .replace('{total}', Number(quote.total).toFixed(2));
    
    // Adiciona o nome do cliente se existir
    if (quote.clientName) {
        message = `${t('clientTitle')}: ${quote.clientName}\n` + message;
    }

    // Tenta usar a API nativa do celular (iOS/Android)
    if (navigator.share) {
        try {
            await navigator.share({
                title: `Quote - ${quote.clientName}`,
                text: message,
            });
        } catch (error) {
            console.log('Error sharing:', error);
        }
    } else {
        // Fallback para PC/Desktop: Copia o texto
        navigator.clipboard.writeText(message);
        alert(t('msgCopied'));
    }
  }

  return (
    <div className="p-4">
        <h2 className="font-bold mb-4">{t('historyTitle')}</h2>
        {savedQuotes.length === 0 ? <p className="text-gray-500 text-sm">{t('emptyHistory')}</p> : (
            <div className="space-y-3">
                {savedQuotes.map(quote => (
                    <div key={quote.id} onClick={() => loadQuoteView(quote)} className="border border-gray-200 p-4 rounded-xl hover:shadow-md transition bg-white cursor-pointer relative overflow-hidden">
                        
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

                        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2 justify-between items-center pl-3">
                            
                            <select 
                                value={quote.status || 'pending'} 
                                onClick={(e) => e.stopPropagation()} 
                                onChange={(e) => updateStatus(quote.id, e.target.value, e)}
                                className={`text-xs font-bold py-1 px-2 rounded-lg border ${getStatusColor(quote.status || 'pending')} cursor-pointer outline-none`}
                            >
                                <option value="pending">{t('statusPending')}</option>
                                <option value="approved">{t('statusApproved')}</option>
                                <option value="paid">{t('statusPaid')}</option>
                                <option value="rejected">{t('statusRejected')}</option>
                            </select>

                            <div className="flex gap-1">
                                {/* BOTÃO SHARE NATIVO */}
                                <button 
                                    onClick={(e) => handleShare(quote, e)}
                                    className="p-2 bg-gray-800 text-white rounded-full hover:bg-black transition shadow-sm"
                                    title={t('btnShare')}
                                >
                                    {/* Ícone Genérico de Compartilhar (Seta saindo da caixa) */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                </button>

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