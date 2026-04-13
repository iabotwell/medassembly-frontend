import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Event } from '../../types';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', location: '', notes: '' });
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => { const { data } = await api.get('/events'); setEvents(data); setLoading(false); };
  useEffect(() => { fetchEvents(); }, []);

  const handleCreate = async () => {
    await api.post('/events', form);
    setShowCreate(false);
    setForm({ name: '', startDate: '', endDate: '', location: '', notes: '' });
    fetchEvents();
  };

  const handleActivate = async (id: string) => {
    await api.patch(`/events/${id}/activate`);
    fetchEvents();
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Eventos / Asambleas</h1>
          <p className="text-sm text-gray-500 mt-0.5">{events.length} eventos registrados</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md">
          <span>+</span> Nuevo Evento
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-bold mb-4">Crear Evento</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Nombre del evento" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 sm:col-span-2" />
            <input placeholder="Ubicacion" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 sm:col-span-2" />
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Inicio</label>
              <input type="datetime-local" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Fin</label>
              <input type="datetime-local" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <textarea placeholder="Notas" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 mt-3" rows={2} />
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button onClick={() => setShowCreate(false)} className="sm:w-32 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancelar</button>
            <button onClick={handleCreate} className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">Crear Evento</button>
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
            {!event.isActive && (
              <button onClick={() => handleActivate(event.id)} className="w-full mt-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-100">
                Activar Evento
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
