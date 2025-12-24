import React, { useState } from 'react';
import { doc, deleteDoc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

export default function ClientsTab({ user, clients, fetchClients, t }) {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });
  const [editingId, setEditingId] = useState(null);

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
      fetchClients(user.uid); // Recarrega a lista
      alert(t('alertSaved'));
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar");
    }
  };

  const editClient = (client) => {
    setFormData(client);
    setEditingId(client.id);
  };

  const deleteClient = async (id) => {
    if (window.confirm(t('confirmDelete'))) {
      await deleteDoc(doc(db, "users", user.uid, "clients", id));
      fetchClients(user.uid);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* FORMULÁRIO DE CLIENTE */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
        <h3 className="font-bold text-sm uppercase text-gray-500">{editingId ? "Editar Cliente" : "Novo Cliente"}</h3>
        <input name="name" value={formData.name} onChange={handleChange} placeholder={t('clientNamePH')} className="w-full p-2 border rounded" />
        <div className="grid grid-cols-2 gap-2">
            <input name="phone" value={formData.phone} onChange={handleChange} placeholder={t('phonePH')} className="w-full p-2 border rounded" />
            <input name="email" value={formData.email} onChange={handleChange} placeholder={t('emailPH')} className="w-full p-2 border rounded" />
        </div>
        <input name="address" value={formData.address} onChange={handleChange} placeholder={t('addressPH')} className="w-full p-2 border rounded" />
        
        <button onClick={saveClient} className="w-full bg-black text-white py-3 rounded font-bold">
            {t('btnSaveClient')}
        </button>
      </div>

      {/* LISTA DE CLIENTES */}
      <div>
        <h3 className="font-bold mb-3">{t('clientListTitle')}</h3>
        <div className="space-y-2">
            {clients.map(client => (
                <div key={client.id} className="border p-3 rounded flex justify-between items-center bg-white">
                    <div>
                        <p className="font-bold">{client.name}</p>
                        <p className="text-xs text-gray-500">{client.phone}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => editClient(client)} className="text-blue-600">✏️</button>
                        <button onClick={() => deleteClient(client.id)} className="text-red-600">🗑️</button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}