import React from 'react';

export default function CompanySettings({ 
  companyData, 
  handleCompanyChange, 
  handleLogoChange, 
  saveCompanyData, 
  t 
}) {
  return (
    <div className="p-6 space-y-4">
      <h2 className="font-bold border-b pb-2">{t('companyTitle')}</h2>
      
      <div>
          <label className="block text-xs font-bold mb-1">{t('logoLabel')}</label>
          <input type="file" accept="image/*" onChange={handleLogoChange} className="text-sm w-full" />
          {companyData.logo && <img src={companyData.logo} alt="Logo Preview" className="h-16 mt-2 border" />}
      </div>
      <input type="text" name="companyName" value={companyData.companyName} onChange={handleCompanyChange} className="w-full p-2 border rounded" placeholder={t('companyNamePH')} />
      <input type="text" name="companyAddress" value={companyData.companyAddress} onChange={handleCompanyChange} className="w-full p-2 border rounded" placeholder={t('addressPH')} />
      <input type="text" name="companyWebsite" value={companyData.companyWebsite} onChange={handleCompanyChange} className="w-full p-2 border rounded" placeholder={t('websitePH')} />
      <div className="grid grid-cols-2 gap-2">
          <input type="text" name="companyPhone" value={companyData.companyPhone} onChange={handleCompanyChange} className="w-full p-2 border rounded" placeholder={t('phonePH')} />
          <input type="text" name="companyEmail" value={companyData.companyEmail} onChange={handleCompanyChange} className="w-full p-2 border rounded" placeholder={t('emailPH')} />
      </div>
      <textarea name="companyTerms" value={companyData.companyTerms} onChange={handleCompanyChange} className="w-full p-2 border rounded" rows="3" placeholder={t('termsPH')}></textarea>
      <button onClick={saveCompanyData} className="w-full bg-green-600 text-white py-3 rounded font-bold">{t('saveBtn')}</button>
    </div>
  );
}