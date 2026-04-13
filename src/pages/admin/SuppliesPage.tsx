import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Supply } from '../../types';

export default function SuppliesPage() {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', unit: '' });

  const fetchData = async () => { const { data } = await api.get('/supplies'); setSupplies(data); };
  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    await api.post('/supplies', form);
    setShowCreate(false); setForm({ name: '', category: '', unit: '' }); fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Insumos Medicos</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ Nuevo</button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl border p-4 mb-6">
          <div className="grid grid-cols-3 gap-3">
            <input placeholder="Nombre" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="px-3 py-2 border rounded-lg" />
            <input placeholder="Categoria" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="px-3 py-2 border rounded-lg" />
            <input placeholder="Unidad (ml, mg, unidad)" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} className="px-3 py-2 border rounded-lg" />
          </div>
          <button onClick={handleCreate} className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Crear</button>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="text-left px-4 py-3">Nombre</th><th className="text-left px-4 py-3">Categoria</th><th className="text-left px-4 py-3">Unidad</th></tr></thead>
          <tbody>{supplies.map(s => <tr key={s.id} className="border-t"><td className="px-4 py-3 font-medium">{s.name}</td><td className="px-4 py-3 text-gray-600">{s.category}</td><td className="px-4 py-3 text-gray-600">{s.unit}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
