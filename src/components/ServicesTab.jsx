import React, { useState } from 'react';
import { doc, deleteDoc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

export default function ServicesTab({ user, services, fetchServices, t }) {
  const [formData, setFormData] = useState({ description: '', price: '' });
  const [editingId, setEditingId] = useState(null);

  // Filtro de busca
  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveService = async () => {
    if (!formData.description) return alert("Descrição é obrigatória");
    
    try {
      if (editingId) {
        await updateDoc(doc(db, "users", user.uid, "services", editingId), formData);
      } else {
        await addDoc(collection(db, "users", user.uid, "services"), formData);
      }
      setFormData({ description: '', price: '' });
      setEditingId(null);
      fetchServices(user.uid); 
      alert(t('alertSaved'));
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar");
    }
  };

  const editService = (service) => {
    setFormData(service);
    setEditingId(service.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteService = async (id) => {
    if (window.confirm(t('confirmDelete'))) {
      await deleteDoc(doc(db, "users", user.uid, "services", id));
      fetchServices(user.uid);
    }
  };

  const filteredServices = services.filter(service => {
      const term = searchTerm.toLowerCase();
      const desc = (service.description || "").toLowerCase();
      return desc.includes(term);
  });

  return (
    <div className="p-6 space-y-6">
      {/* FORMULÁRIO */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
        <h3 className="font-bold text-sm uppercase text-gray-500">{editingId ? t('editService') : t('newService')}</h3>
        
        <input name="description" value={formData.description} onChange={handleChange} placeholder={t('serviceNamePH')} className="w-full p-2 border rounded" />
        
        <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder={t('servicePricePH')} className="w-full p-2 pl-6 border rounded" />
        </div>
        
        <div className="flex gap-2">
            <button onClick={saveService} className="flex-1 bg-black text-white py-3 rounded font-bold">
                {t('btnSaveService')}
            </button>
            {editingId && (
                <button 
                    onClick={() => { setEditingId(null); setFormData({ description: '', price: '' }) }} 
                    className="bg-gray-200 text-gray-600 px-4 rounded font-bold"
                >
                    X
                </button>
            )}
        </div>
      </div>

      {/* LISTA */}
      <div className="space-y-4">
        <h3 className="font-bold mb-3">{t('serviceListTitle')}</h3>
        
        {/* Busca */}
        <div className="relative">
            <input 
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 border rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition"
            />
            <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>

        <div className="space-y-2">
            {filteredServices.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">{t('noResults')}</p>
            ) : (
                filteredServices.map(service => (
                    <div key={service.id} className="border p-3 rounded flex justify-between items-center bg-white hover:shadow-sm transition">
                        <div>
                            <p className="font-bold">{service.description}</p>
                            <p className="text-xs text-green-600 font-bold">${Number(service.price).toFixed(2)} / unit</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => editService(service)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">✏️</button>
                            <button onClick={() => deleteService(service.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full">🗑️</button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}