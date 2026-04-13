import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Congregation, Elder } from '../../types';

export default function CongregationsPage() {
  const [congregations, setCongregations] = useState<Congregation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [elders, setElders] = useState<Elder[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', circuit: '', city: '' });
  const [elderForm, setElderForm] = useState({ name: '', phone: '', role: '' });

  const fetchData = async () => { const { data } = await api.get('/congregations'); setCongregations(data); };
  useEffect(() => { fetchData(); }, []);

  const fetchElders = async (id: string) => { const { data } = await api.get(`/congregations/${id}/elders`); setElders(data); setSelectedId(id); };

  const handleCreate = async () => {
    await api.post('/congregations', form);
    setShowCreate(false); setForm({ name: '', circuit: '', city: '' }); fetchData();
  };

  const handleAddElder = async () => {
    if (!selectedId) return;
    await api.post(`/congregations/${selectedId}/elders`, elderForm);
    setElderForm({ name: '', phone: '', role: '' });
    fetchElders(selectedId);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Eliminar congregacion?')) return;
    await api.delete(`/congregations/${id}`);
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Congregaciones</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ Nueva</button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl border p-4 mb-6">
          <div className="grid grid-cols-3 gap-3">
            <input placeholder="Nombre" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="px-3 py-2 border rounded-lg" />
            <input placeholder="Circuito" value={form.circuit} onChange={e => setForm(p => ({ ...p, circuit: e.target.value }))} className="px-3 py-2 border rounded-lg" />
            <input placeholder="Ciudad" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="px-3 py-2 border rounded-lg" />
          </div>
          <button onClick={handleCreate} className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Crear</button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          {congregations.map(c => (
            <div key={c.id} className={`bg-white rounded-xl border p-4 cursor-pointer hover:border-blue-300 ${selectedId === c.id ? 'border-blue-400 bg-blue-50' : ''}`} onClick={() => fetchElders(c.id)}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{c.name}</h3>
                  <p className="text-xs text-gray-500">{c.circuit} - {c.city}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} className="text-red-500 text-sm hover:underline">Eliminar</button>
              </div>
            </div>
          ))}
        </div>

        {selectedId && (
          <div className="bg-white rounded-xl border p-4">
            <h2 className="font-bold mb-4">Ancianos</h2>
            <div className="space-y-2 mb-4">
              {elders.map(e => (
                <div key={e.id} className="flex justify-between items-center py-2 border-b text-sm">
                  <div><span className="font-medium">{e.name}</span> <span className="text-gray-500">({e.phone})</span></div>
                  {e.role && <span className="text-xs bg-gray-100 px-2 py-1 rounded">{e.role}</span>}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input placeholder="Nombre" value={elderForm.name} onChange={e => setElderForm(p => ({ ...p, name: e.target.value }))} className="px-2 py-1 border rounded text-sm" />
              <input placeholder="Telefono" value={elderForm.phone} onChange={e => setElderForm(p => ({ ...p, phone: e.target.value }))} className="px-2 py-1 border rounded text-sm" />
              <button onClick={handleAddElder} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Agregar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
