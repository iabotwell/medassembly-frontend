import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { EmergencyContact, ContactType } from '../../types';

const CONTACT_TYPES: { value: ContactType; label: string }[] = [
  { value: 'DOCTOR_GUARDIA', label: 'Doctor de Guardia' },
  { value: 'AUXILIAR_SALUD', label: 'Auxiliar de Salud' },
  { value: 'CAMILLERO', label: 'Camillero' },
  { value: 'AMBULANCIA', label: 'Ambulancia / SAMU' },
  { value: 'CENTRO_ASISTENCIAL', label: 'Centro Asistencial' },
  { value: 'AUTO_EMERGENCIA', label: 'Auto de Emergencia' },
  { value: 'OTRO', label: 'Otro' },
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ type: 'DOCTOR_GUARDIA' as ContactType, name: '', phone: '', details: '' });

  const fetchData = async () => { const { data } = await api.get('/contacts'); setContacts(data); };
  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    await api.post('/contacts', form);
    setShowCreate(false); setForm({ type: 'DOCTOR_GUARDIA', name: '', phone: '', details: '' }); fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Eliminar contacto?')) return;
    await api.delete(`/contacts/${id}`); fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Contactos de Emergencia</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ Nuevo</button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as ContactType }))} className="px-3 py-2 border rounded-lg">
              {CONTACT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <input placeholder="Nombre" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="px-3 py-2 border rounded-lg" />
            <input placeholder="Telefono" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="px-3 py-2 border rounded-lg" />
            <input placeholder="Detalles (especialidad, direccion, patente)" value={form.details} onChange={e => setForm(p => ({ ...p, details: e.target.value }))} className="px-3 py-2 border rounded-lg" />
          </div>
          <button onClick={handleCreate} className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Crear</button>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr><th className="text-left px-4 py-3">Tipo</th><th className="text-left px-4 py-3">Nombre</th><th className="text-left px-4 py-3">Telefono</th><th className="text-left px-4 py-3">Detalles</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {contacts.map(c => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-3"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{CONTACT_TYPES.find(t => t.value === c.type)?.label}</span></td>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3">{c.phone}</td>
                <td className="px-4 py-3 text-gray-500">{c.details}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(c.id)} className="text-red-600 text-sm hover:underline">Eliminar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
