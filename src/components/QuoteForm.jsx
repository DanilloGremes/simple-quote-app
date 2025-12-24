import React from 'react';

export default function QuoteForm({ 
  formData, 
  setFormData, // Precisamos do setter direto agora para manipular o array
  saveQuote, 
  generatePDF, 
  t, 
  total, 
  editingId, 
  clearForm 
}) {

  // Função para alterar um item específico da lista
  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  // Função para adicionar nova linha
  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', qty: '', price: '' }]
    });
  };

  // Função para remover linha
  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  // Inputs normais (Cliente, etc)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6 space-y-4">
       {editingId && (
           <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 flex justify-between items-center">
               <p className="text-sm text-yellow-700 font-bold">⚠️ Editando</p>
               <button onClick={clearForm} className="text-xs text-gray-500 underline">{t('btnCancel')}</button>
           </div>
       )}

       {/* DADOS DO CLIENTE (Manteve igual) */}
       <div className="flex justify-between items-center border-b pb-2">
          <h2 className="font-bold">{t('clientTitle')}</h2>
          <input type="text" name="quoteNumber" value={formData.quoteNumber} onChange={handleChange} 
              className="p-1 border rounded w-24 text-right text-sm" placeholder={t('quoteNumberPH')} />
       </div>

       <div className="space-y-3">
          <input type="text" name="clientName" value={formData.clientName} onChange={handleChange} className="w-full p-3 bg-gray-50 border rounded" placeholder={t('clientNamePH')} />
          <input type="text" name="clientAddress" value={formData.clientAddress} onChange={handleChange} className="w-full p-3 bg-gray-50 border rounded" placeholder={t('clientAddressPH')} />
          <div className="grid grid-cols-2 gap-3">
              <input type="tel" name="clientPhone" value={formData.clientPhone} onChange={handleChange} className="w-full p-3 bg-gray-50 border rounded" placeholder={t('phonePH')} />
              <input type="email" name="clientEmail" value={formData.clientEmail} onChange={handleChange} className="w-full p-3 bg-gray-50 border rounded" placeholder={t('emailPH')} />
          </div>
       </div>
       
       {/* --- NOVA ÁREA DE ITENS --- */}
       <h2 className="font-bold border-b pb-2 pt-4">{t('serviceTitle')}</h2>
       
       <div className="space-y-4">
         {formData.items.map((item, index) => (
           <div key={index} className="flex gap-2 items-start bg-gray-50 p-2 rounded border border-gray-200">
              <div className="flex-1 space-y-2">
                <input 
                  type="text" 
                  placeholder={t('itemDesc')} 
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  className="w-full p-2 border rounded text-sm font-bold"
                />
                <div className="flex gap-2">
                   <div className="flex-1">
                     <input 
                       type="number" 
                       placeholder={t('itemQty')} 
                       value={item.qty}
                       onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                       className="w-full p-2 border rounded text-sm text-center"
                     />
                   </div>
                   <div className="flex-1">
                     <input 
                       type="number" 
                       placeholder={t('itemPrice')} 
                       value={item.price}
                       onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                       className="w-full p-2 border rounded text-sm text-center"
                     />
                   </div>
                </div>
              </div>
              
              {/* Botão de Remover (Lixeira) */}
              <button onClick={() => removeItem(index)} className="text-red-500 p-2 mt-1">
                🗑️
              </button>
           </div>
         ))}
         
         <button onClick={addItem} className="text-sm font-bold text-blue-600 border border-blue-600 rounded px-4 py-2 w-full hover:bg-blue-50">
           + {t('btnAddItem')}
         </button>
       </div>

      <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full p-3 border rounded text-sm mt-4" rows="2" placeholder={t('notesPH')}></textarea>

       <div className="bg-black text-white p-4 rounded mt-4">
          <div className="flex justify-between items-end mb-4">
              <p className="text-sm text-gray-400">{t('totalEst')}</p>
              {/* Total agora é calculado no App.js somando o array */}
              <p className="text-3xl font-bold">${total.toFixed(2)}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
              <button onClick={saveQuote} className={`${editingId ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-700 hover:bg-green-600'} py-3 rounded font-bold text-sm transition`}>
                  {editingId ? "✏️ " + t('btnUpdate') : "💾 " + t('btnSave')}
              </button>
              <button onClick={generatePDF} className="bg-white text-black hover:bg-gray-200 py-3 rounded font-bold text-sm">
                  📄 {t('btnPDF')}
              </button>
          </div>
          {editingId && (
               <button onClick={clearForm} className="w-full mt-2 text-xs text-gray-400 underline">
                   {t('btnCancel')}
               </button>
          )}
       </div>
    </div>
  );
}