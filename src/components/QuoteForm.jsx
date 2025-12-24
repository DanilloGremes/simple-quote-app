import React from 'react';

export default function QuoteForm({ 
  formData, 
  setFormData, 
  saveQuote, 
  generatePDF, 
  t, 
  total, 
  editingId, 
  clearForm,
  clients,
  services // <--- RECEBENDO A LISTA DE SERVIÇOS
}) {

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  // --- NOVA FUNÇÃO: SELECIONAR SERVIÇO NA LINHA ---
  const handleSelectServiceForItem = (index, e) => {
      const serviceId = e.target.value;
      if (!serviceId) return;

      const service = services.find(s => s.id === serviceId);
      if (service) {
          const newItems = [...formData.items];
          // Preenche a descrição e o preço automaticamente
          newItems[index].description = service.description;
          newItems[index].price = service.price;
          setFormData({ ...formData, items: newItems });
          
          // Reseta o select para o usuário poder escolher outro se quiser, ou deixa visível.
          // Aqui vamos resetar o value do select visualmente para "Select...", 
          // mas os dados já foram para os inputs.
          e.target.value = ""; 
      }
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', qty: '', price: '' }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectClient = (e) => {
      const clientId = e.target.value;
      if (!clientId) return;
      const client = clients.find(c => c.id === clientId);
      if (client) {
          setFormData(prev => ({
              ...prev,
              clientName: client.name || '',
              clientPhone: client.phone || '',
              clientEmail: client.email || '',
              clientAddress: client.address || ''
          }));
      }
  };

  return (
    <div className="p-6 space-y-4">
       {editingId && (
           <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 flex justify-between items-center">
               <p className="text-sm text-yellow-700 font-bold">⚠️ Editando</p>
               <button onClick={clearForm} className="text-xs text-gray-500 underline">{t('btnCancel')}</button>
           </div>
       )}

       {/* SELETOR DE CLIENTES */}
       {clients && clients.length > 0 && (
           <div className="bg-blue-50 p-2 rounded border border-blue-100">
               <select onChange={handleSelectClient} className="w-full bg-transparent font-bold text-blue-800 outline-none text-sm">
                   <option value="">{t('selectClient')}</option>
                   {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
           </div>
       )}

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
       
       <h2 className="font-bold border-b pb-2 pt-4">{t('serviceTitle')}</h2>
       
       <div className="space-y-4">
         {formData.items.map((item, index) => (
           <div key={index} className="bg-gray-50 p-3 rounded border border-gray-200 shadow-sm">
              
              {/* --- NOVO: SELETOR DE SERVIÇO RÁPIDO --- */}
              {services && services.length > 0 && (
                  <div className="mb-2">
                      <select 
                        onChange={(e) => handleSelectServiceForItem(index, e)} 
                        className="w-full text-xs bg-white border border-gray-300 rounded p-1 text-gray-600 outline-none"
                      >
                          <option value="">{t('selectService')}</option>
                          {services.map(s => (
                              <option key={s.id} value={s.id}>{s.description} - ${s.price}</option>
                          ))}
                      </select>
                  </div>
              )}

              <div className="space-y-2">
                <input 
                  type="text" 
                  placeholder={t('itemDesc')} 
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  className="w-full p-2 border rounded text-sm font-bold"
                />
                <div className="flex gap-2 items-center">
                   <div className="flex-1">
                     <label className="text-[10px] text-gray-500 font-bold ml-1">{t('itemQty')}</label>
                     <input 
                       type="number" 
                       placeholder="0" 
                       value={item.qty}
                       onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                       className="w-full p-2 border rounded text-sm text-center"
                     />
                   </div>
                   <div className="flex-1">
                     <label className="text-[10px] text-gray-500 font-bold ml-1">{t('itemPrice')}</label>
                     <input 
                       type="number" 
                       placeholder="0.00" 
                       value={item.price}
                       onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                       className="w-full p-2 border rounded text-sm text-center"
                     />
                   </div>
                   {/* Lixeira alinhada embaixo */}
                   <button onClick={() => removeItem(index)} className="text-red-500 p-2 mt-4 bg-white rounded border border-red-100 hover:bg-red-50">🗑️</button>
                </div>
              </div>
           </div>
         ))}
         
         <button onClick={addItem} className="text-sm font-bold text-blue-600 border border-blue-600 rounded px-4 py-3 w-full hover:bg-blue-50 border-dashed">
           + {t('btnAddItem')}
         </button>
       </div>

      <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full p-3 border rounded text-sm mt-4" rows="2" placeholder={t('notesPH')}></textarea>

       <div className="bg-black text-white p-4 rounded mt-4">
          <div className="flex justify-between items-end mb-4">
              <p className="text-sm text-gray-400">{t('totalEst')}</p>
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