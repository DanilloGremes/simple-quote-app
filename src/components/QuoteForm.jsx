import React from 'react';

export default function QuoteForm({ 
  formData, 
  handleChange, 
  saveQuote, 
  generatePDF, 
  t, 
  total, 
  editingId, 
  clearForm 
}) {
  return (
    <div className="p-6 space-y-4">
       {editingId && (
           <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 flex justify-between items-center">
               <p className="text-sm text-yellow-700 font-bold">⚠️ Editando</p>
               <button onClick={clearForm} className="text-xs text-gray-500 underline">{t('btnCancel')}</button>
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
       
       <div>
          <label className="text-xs font-bold text-gray-500 ml-1">{t('materialLabel')}</label>
          <input type="text" name="materialType" value={formData.materialType} onChange={handleChange} 
              className="w-full p-3 border rounded" placeholder={t('materialPH')} />
       </div>

       <div className="grid grid-cols-2 gap-3">
          <div>
             <label className="text-xs font-bold text-gray-500 ml-1">{t('sqftLabel')}</label>
             <input type="number" name="sqft" value={formData.sqft} onChange={handleChange} className="w-full p-3 border rounded font-mono" placeholder="0" />
          </div>
          <div>
             <label className="text-xs font-bold text-gray-500 ml-1">{t('priceLabel')}</label>
             <input type="number" name="pricePerSqft" value={formData.pricePerSqft} onChange={handleChange} className="w-full p-3 border rounded font-mono" placeholder="0.00" />
          </div>
       </div>

      <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full p-3 border rounded text-sm" rows="2" placeholder={t('notesPH')}></textarea>

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