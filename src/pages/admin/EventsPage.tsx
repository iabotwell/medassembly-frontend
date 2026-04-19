import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Event } from '../../types';
import { useDialog } from '../../components/ui/Dialog';

type FormState = { name: string; startDate: string; endDate: string; location: string; notes: string };
const EMPTY_FORM: FormState = { name: '', startDate: '', endDate: '', location: '', notes: '' };

const toLocalInput = (date?: string) => {
  if (!date) return '';
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function EventsPage() {
  const { danger, alert: showAlert } = useDialog();
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/events');
      setEvents(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchEvents(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowForm(true);
  };

  const openEdit = (e: Event) => {
    setEditingId(e.id);
    setForm({
      name: e.name,
      startDate: toLocalInput(e.startDate),
      endDate: toLocalInput(e.endDate),
      location: e.location || '',
      notes: e.notes || '',
    });
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
      if (editingId) {
        await api.put(`/events/${editingId}`, form);
      } else {
        await api.post('/events', form);
      }
      handleCancel();
      fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleActivate = async (id: string) => {
    await api.patch(`/events/${id}/activate`);
    fetchEvents();
  };

  const handleDelete = async (e: Event) => {
    const ok = await danger({ title: `Eliminar "${e.name}"?`, message: 'Esta accion es permanente y no se puede deshacer.' });
    if (!ok) return;
    try {
      await api.delete(`/events/${e.id}`);
      fetchEvents();
    } catch (err: any) {
      await showAlert({ title: 'No se pudo eliminar', message: err.response?.data?.error || 'Error desconocido' });
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Eventos / Asambleas</h1>
          <p className="text-sm text-gray-500 mt-0.5">{events.length} evento{events.length !== 1 && 's'} registrado{events.length !== 1 && 's'}</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md">
          <span>+</span> Nuevo Evento
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-bold mb-4">{editingId ? 'Editar Evento' : 'Crear Evento'}</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Nombre *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="Asamblea de Circuito" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Ubicacion</label>
              <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Inicio *</label>
                <input type="datetime-local" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Fin *</label>
                <input type="datetime-local" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Notas</label>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button onClick={handleCancel} className="sm:w-32 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancelar</button>
            <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">
              {editingId ? 'Guardar cambios' : 'Crear evento'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map(event => (
          <div key={event.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${event.isActive ? 'border-green-300 ring-2 ring-green-100' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{event.name}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(event.startDate).toLocaleDateString('es-CL')} - {new Date(event.endDate).toLocaleDateString('es-CL')}
                </p>
                {event.location && <p className="text-sm text-gray-600 mt-1 flex items-center gap-1"><span>📍</span>{event.location}</p>}
              </div>
              {event.isActive && <span className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex-shrink-0">ACTIVO</span>}
            </div>
            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
              {!event.isActive && (
                <button onClick={() => handleActivate(event.id)} className="flex-1 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100">Activar</button>
              )}
              <button onClick={() => openEdit(event)} className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100">Editar</button>
              {!event.isActive && (
                <button onClick={() => handleDelete(event)} className="flex-1 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-100">Eliminar</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
