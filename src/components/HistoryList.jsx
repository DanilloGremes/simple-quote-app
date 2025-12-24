import React from 'react';

export default function HistoryList({ 
  savedQuotes, 
  loadQuoteView, 
  startEditing, 
  deleteQuote, 
  t 
}) {
  return (
    <div className="p-4">
        <h2 className="font-bold mb-4">{t('historyTitle')}</h2>
        {savedQuotes.length === 0 ? <p className="text-gray-500 text-sm">{t('emptyHistory')}</p> : (
            <div className="space-y-2">
                {savedQuotes.map(quote => (
                    <div key={quote.id} onClick={() => loadQuoteView(quote)} className="border p-3 rounded hover:bg-gray-50 cursor-pointer flex justify-between items-center bg-gray-50">
                        <div>
                            <p className="font-bold text-sm">{quote.clientName || "-"}</p>
                            <p className="text-xs text-gray-500">#{quote.quoteNumber} • {quote.materialType}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="font-bold">${quote.total?.toFixed(2)}</p>
                                <span className="text-xs text-blue-600">{t('openBtn')}</span>
                            </div>
                            
                            <button 
                                onClick={(e) => startEditing(quote, e)}
                                className="bg-blue-100 p-2 rounded text-blue-600 hover:bg-blue-200 transition"
                                title="Editar"
                            >
                                ✏️
                            </button>

                            <button 
                                onClick={(e) => deleteQuote(quote.id, e)}
                                className="bg-red-100 p-2 rounded text-red-600 hover:bg-red-200 transition"
                                title="Apagar"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}