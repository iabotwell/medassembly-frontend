import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Supply } from '../../types';

type FormState = { name: string; category: string; unit: string };
const EMPTY_FORM: FormState = { name: '', category: '', unit: '' };

export default function SuppliesPage() {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/supplies');
      setSupplies(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar insumos');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowForm(true);
  };
  const openEdit = (s: Supply) => {
    setEditingId(s.id);
    setForm({ name: s.name, category: s.category || '', unit: s.unit || '' });
    setError('');
    setShowForm(true);
  };
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
  };
  const handleSave = async () => {
    setError('');
    try {
      if (editingId) await api.put(`/supplies/${editingId}`, form);
      else await api.post('/supplies', form);
      handleCancel();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  };
  const handleDelete = async (s: Supply) => {
    if (!window.confirm(`Eliminar insumo "${s.name}"?`)) return;
    try {
      await api.delete(`/supplies/${s.id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'No se pudo eliminar');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Insumos Medicos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{supplies.length} insumo{supplies.length !== 1 && 's'}</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md">
          <span>+</span> Nuevo Insumo
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-bold mb-4">{editingId ? 'Editar Insumo' : 'Nuevo Insumo'}</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input placeholder="Nombre" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Categoria" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Unidad (ml, mg, unidad)" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button onClick={handleCancel} className="sm:w-32 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancelar</button>
            <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">
              {editingId ? 'Guardar cambios' : 'Crear insumo'}
            </button>
          </div>
        </div>
      )}

      {supplies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="text-5xl mb-3">💊</div>
          <p className="text-gray-500">No hay insumos registrados</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {supplies.map(s => (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <h3 className="font-semibold text-gray-900">{s.name}</h3>
                <div className="text-xs text-gray-500 mt-1">{[s.category, s.unit].filter(Boolean).join(' • ')}</div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button onClick={() => openEdit(s)} className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100">Editar</button>
                  <button onClick={() => handleDelete(s)} className="flex-1 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-100">Eliminar</button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Nombre</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Categoria</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Unidad</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {supplies.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-900">{s.name}</td>
                    <td className="px-5 py-4 text-gray-600">{s.category || '-'}</td>
                    <td className="px-5 py-4 text-gray-600">{s.unit || '-'}</td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex gap-3 justify-end">
                        <button onClick={() => openEdit(s)} className="text-blue-600 text-sm hover:underline font-medium">Editar</button>
                        <button onClick={() => handleDelete(s)} className="text-red-600 text-sm hover:underline font-medium">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
