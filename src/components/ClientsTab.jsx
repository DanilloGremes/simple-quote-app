import React, { useState } from 'react';
import { doc, deleteDoc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

export default function ClientsTab({ user, clients, fetchClients, t }) {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });
  const [editingId, setEditingId] = useState(null);
  
  // 1. Estado para a busca
  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveClient = async () => {
    if (!formData.name) return alert("Nome é obrigatório");
    
    try {
      if (editingId) {
        await updateDoc(doc(db, "users", user.uid, "clients", editingId), formData);
      } else {
        await addDoc(collection(db, "users", user.uid, "clients"), formData);
      }
      setFormData({ name: '', phone: '', email: '', address: '' });
      setEditingId(null);
      fetchClients(user.uid); 
      alert(t('alertSaved'));
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar");
    }
  };

  const editClient = (client) => {
    setFormData(client);
    setEditingId(client.id);
    // Rola para o topo para facilitar a edição
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteClient = async (id) => {
    if (window.confirm(t('confirmDelete'))) {
      await deleteDoc(doc(db, "users", user.uid, "clients", id));
      fetchClients(user.uid);
    }
  };

  // 2. Lógica de Filtro (Busca por Nome, Telefone ou Email)
  const filteredClients = clients.filter(client => {
      const term = searchTerm.toLowerCase();
      const name = (client.name || "").toLowerCase();
      const phone = (client.phone || "").toLowerCase();
      const email = (client.email || "").toLowerCase();
      
      return name.includes(term) || phone.includes(term) || email.includes(term);
  });

  return (
    <div className="p-6 space-y-6">
      {/* FORMULÁRIO DE CLIENTE */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
        <h3 className="font-bold text-sm uppercase text-gray-500">{editingId ? t('editClient') : t('newClient')}</h3>
        <input name="name" value={formData.name} onChange={handleChange} placeholder={t('clientNamePH')} className="w-full p-2 border rounded" />
        <div className="grid grid-cols-2 gap-2">
            <input name="phone" value={formData.phone} onChange={handleChange} placeholder={t('phonePH')} className="w-full p-2 border rounded" />
            <input name="email" value={formData.email} onChange={handleChange} placeholder={t('emailPH')} className="w-full p-2 border rounded" />
        </div>
        <input name="address" value={formData.address} onChange={handleChange} placeholder={t('addressPH')} className="w-full p-2 border rounded" />
        
        <div className="flex gap-2">
            <button onClick={saveClient} className="flex-1 bg-black text-white py-3 rounded font-bold">
                {t('btnSaveClient')}
            </button>
            {editingId && (
                <button 
                    onClick={() => { setEditingId(null); setFormData({ name: '', phone: '', email: '', address: '' }) }} 
                    className="bg-gray-200 text-gray-600 px-4 rounded font-bold"
                >
                    X
                </button>
            )}
        </div>
      </div>

      {/* LISTA DE CLIENTES COM BUSCA */}
      <div className="space-y-4">
        <h3 className="font-bold mb-3">{t('clientListTitle')}</h3>
        
        {/* 3. Barra de Busca */}
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
            {filteredClients.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">{t('noResults')}</p>
            ) : (
                filteredClients.map(client => (
                    <div key={client.id} className="border p-3 rounded flex justify-between items-center bg-white hover:shadow-sm transition">
                        <div>
                            <p className="font-bold">{client.name}</p>
                            <p className="text-xs text-gray-500">{client.phone} • {client.email}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => editClient(client)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">✏️</button>
                            <button onClick={() => deleteClient(client.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full">🗑️</button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}