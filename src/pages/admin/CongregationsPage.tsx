import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Congregation, Elder } from '../../types';

type CongForm = { name: string; circuit: string; city: string };
type ElderForm = { name: string; phone: string; role: string };

const EMPTY_CONG: CongForm = { name: '', circuit: '', city: '' };
const EMPTY_ELDER: ElderForm = { name: '', phone: '', role: '' };

export default function CongregationsPage() {
  const [congregations, setCongregations] = useState<Congregation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [elders, setElders] = useState<Elder[]>([]);

  const [showCongForm, setShowCongForm] = useState(false);
  const [editingCongId, setEditingCongId] = useState<string | null>(null);
  const [congForm, setCongForm] = useState<CongForm>(EMPTY_CONG);

  const [showElderForm, setShowElderForm] = useState(false);
  const [editingElderId, setEditingElderId] = useState<string | null>(null);
  const [elderForm, setElderForm] = useState<ElderForm>(EMPTY_ELDER);

  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const { data } = await api.get('/congregations');
      setCongregations(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar congregaciones');
    }
  };
  useEffect(() => { fetchData(); }, []);

  const fetchElders = async (id: string) => {
    try {
      const { data } = await api.get(`/congregations/${id}/elders`);
      setElders(data);
      setSelectedId(id);
    } catch { }
  };

  // Congregation CRUD
  const openCreateCong = () => {
    setEditingCongId(null);
    setCongForm(EMPTY_CONG);
    setShowCongForm(true);
    setError('');
  };
  const openEditCong = (c: Congregation) => {
    setEditingCongId(c.id);
    setCongForm({ name: c.name, circuit: c.circuit || '', city: c.city || '' });
    setShowCongForm(true);
    setError('');
  };
  const handleSaveCong = async () => {
    try {
      if (editingCongId) {
        await api.put(`/congregations/${editingCongId}`, congForm);
      } else {
        await api.post('/congregations', congForm);
      }
      setShowCongForm(false);
      setEditingCongId(null);
      setCongForm(EMPTY_CONG);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  };
  const handleDeleteCong = async (c: Congregation) => {
    if (!window.confirm(`Eliminar congregacion "${c.name}"?`)) return;
    try {
      await api.delete(`/congregations/${c.id}`);
      if (selectedId === c.id) { setSelectedId(null); setElders([]); }
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'No se pudo eliminar');
    }
  };

  // Elder CRUD
  const openCreateElder = () => {
    setEditingElderId(null);
    setElderForm(EMPTY_ELDER);
    setShowElderForm(true);
  };
  const openEditElder = (e: Elder) => {
    setEditingElderId(e.id);
    setElderForm({ name: e.name, phone: e.phone, role: e.role || '' });
    setShowElderForm(true);
  };
  const handleSaveElder = async () => {
    if (!selectedId) return;
    try {
      if (editingElderId) {
        await api.put(`/congregations/${selectedId}/elders/${editingElderId}`, elderForm);
      } else {
        await api.post(`/congregations/${selectedId}/elders`, elderForm);
      }
      setShowElderForm(false);
      setEditingElderId(null);
      setElderForm(EMPTY_ELDER);
      fetchElders(selectedId);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al guardar anciano');
    }
  };
  const handleDeleteElder = async (e: Elder) => {
    if (!window.confirm(`Eliminar a ${e.name}?`)) return;
    try {
      await api.delete(`/congregations/${selectedId}/elders/${e.id}`);
      fetchElders(selectedId!);
    } catch (err: any) {
      alert(err.response?.data?.error || 'No se pudo eliminar');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Congregaciones</h1>
          <p className="text-sm text-gray-500 mt-0.5">{congregations.length} congregacion{congregations.length !== 1 && 'es'}</p>
        </div>
        <button onClick={openCreateCong} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md">
          <span>+</span> Nueva
        </button>
      </div>

      {error && !showCongForm && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-sm">{error}</div>
      )}

      {showCongForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-bold mb-4">{editingCongId ? 'Editar Congregacion' : 'Nueva Congregacion'}</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input placeholder="Nombre" value={congForm.name} onChange={e => setCongForm(p => ({ ...p, name: e.target.value }))} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Circuito" value={congForm.circuit} onChange={e => setCongForm(p => ({ ...p, circuit: e.target.value }))} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Ciudad" value={congForm.city} onChange={e => setCongForm(p => ({ ...p, city: e.target.value }))} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => { setShowCongForm(false); setEditingCongId(null); }} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancelar</button>
            <button onClick={handleSaveCong} className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">
              {editingCongId ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-3">
          {congregations.map(c => (
            <div key={c.id} className={`bg-white rounded-2xl border p-4 transition-all ${selectedId === c.id ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div onClick={() => fetchElders(c.id)} className="cursor-pointer flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{c.name}</h3>
                  <p className="text-xs text-gray-500">{[c.circuit, c.city].filter(Boolean).join(' • ')}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button onClick={() => fetchElders(c.id)} className="flex-1 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-100">Ver ancianos</button>
                <button onClick={() => openEditCong(c)} className="flex-1 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100">Editar</button>
                <button onClick={() => handleDeleteCong(c)} className="flex-1 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-100">Eliminar</button>
              </div>
            </div>
          ))}
        </div>

        {selectedId && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Ancianos ({elders.length})</h2>
              <button onClick={openCreateElder} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700">+ Agregar</button>
            </div>

            {showElderForm && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                <div className="grid grid-cols-1 gap-2">
                  <input placeholder="Nombre" value={elderForm.name} onChange={e => setElderForm(p => ({ ...p, name: e.target.value }))} className="px-2 py-2 border rounded-lg text-sm" />
                  <input placeholder="Telefono" value={elderForm.phone} onChange={e => setElderForm(p => ({ ...p, phone: e.target.value }))} className="px-2 py-2 border rounded-lg text-sm" />
                  <input placeholder="Cargo (opcional)" value={elderForm.role} onChange={e => setElderForm(p => ({ ...p, role: e.target.value }))} className="px-2 py-2 border rounded-lg text-sm" />
                  <div className="flex gap-2">
                    <button onClick={() => { setShowElderForm(false); setEditingElderId(null); }} className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium">Cancelar</button>
                    <button onClick={handleSaveElder} className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold">
                      {editingElderId ? 'Guardar' : 'Crear'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {elders.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Sin ancianos registrados</p>
              ) : elders.map(e => (
                <div key={e.id} className="flex items-center justify-between gap-2 py-2 border-b border-gray-100 last:border-0">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm text-gray-900 truncate">{e.name}</div>
                    <div className="text-xs text-gray-500">{e.phone} {e.role && `• ${e.role}`}</div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEditElder(e)} className="px-2 py-1 text-blue-600 text-xs hover:underline font-medium">Editar</button>
                    <button onClick={() => handleDeleteElder(e)} className="px-2 py-1 text-red-600 text-xs hover:underline font-medium">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
