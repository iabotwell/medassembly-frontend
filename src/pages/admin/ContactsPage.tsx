import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { EmergencyContact, ContactType } from '../../types';
import { useDialog } from '../../components/ui/Dialog';

const CONTACT_TYPES: { value: ContactType; label: string; icon: string }[] = [
  { value: 'DOCTOR_GUARDIA', label: 'Doctor de Guardia', icon: '👨‍⚕️' },
  { value: 'AUXILIAR_SALUD', label: 'Auxiliar de Salud', icon: '🧑‍⚕️' },
  { value: 'CAMILLERO', label: 'Camillero', icon: '🛏️' },
  { value: 'AMBULANCIA', label: 'Ambulancia / SAMU', icon: '🚑' },
  { value: 'CENTRO_ASISTENCIAL', label: 'Centro Asistencial', icon: '🏥' },
  { value: 'AUTO_EMERGENCIA', label: 'Auto de Emergencia', icon: '🚗' },
  { value: 'OTRO', label: 'Otro', icon: '📞' },
];

type FormState = { type: ContactType; name: string; phone: string; details: string };
const EMPTY_FORM: FormState = { type: 'DOCTOR_GUARDIA', name: '', phone: '', details: '' };

export default function ContactsPage() {
  const { danger, alert: showAlert } = useDialog();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/contacts');
      setContacts(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar contactos');
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
  const openEdit = (c: EmergencyContact) => {
    setEditingId(c.id);
    setForm({ type: c.type, name: c.name, phone: c.phone, details: c.details || '' });
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
      if (editingId) await api.put(`/contacts/${editingId}`, form);
      else await api.post('/contacts', form);
      handleCancel();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  };
  const handleDelete = async (c: EmergencyContact) => {
    const ok = await danger({ title: `Eliminar "${c.name}"?`, message: 'Esta accion es permanente.' });
    if (!ok) return;
    try {
      await api.delete(`/contacts/${c.id}`);
      fetchData();
    } catch (err: any) {
      await showAlert({ title: 'No se pudo eliminar', message: err.response?.data?.error || 'Error desconocido' });
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>;

  const typeLabel = (type: string) => CONTACT_TYPES.find(t => t.value === type);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Contactos de Emergencia</h1>
          <p className="text-sm text-gray-500 mt-0.5">{contacts.length} contacto{contacts.length !== 1 && 's'}</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md">
          <span>+</span> Nuevo
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-bold mb-4">{editingId ? 'Editar Contacto' : 'Nuevo Contacto'}</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Tipo</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as ContactType }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                {CONTACT_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Nombre</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Telefono</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Detalles (especialidad, direccion, patente)</label>
              <input value={form.details} onChange={e => setForm(p => ({ ...p, details: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button onClick={handleCancel} className="sm:w-32 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancelar</button>
            <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">
              {editingId ? 'Guardar cambios' : 'Crear contacto'}
            </button>
          </div>
        </div>
      )}

      {contacts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="text-5xl mb-3">📞</div>
          <p className="text-gray-500">No hay contactos registrados</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {contacts.map(c => {
              const tl = typeLabel(c.type);
              return (
                <div key={c.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">{tl?.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">{c.name}</h3>
                      </div>
                      <p className="text-xs text-gray-500">{tl?.label}</p>
                      <p className="text-sm text-gray-700 mt-1">{c.phone}</p>
                      {c.details && <p className="text-xs text-gray-500 mt-1">{c.details}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button onClick={() => openEdit(c)} className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100">Editar</button>
                    <button onClick={() => handleDelete(c)} className="flex-1 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-100">Eliminar</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Tipo</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Nombre</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Telefono</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Detalles</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contacts.map(c => {
                  const tl = typeLabel(c.type);
                  return (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4"><span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">{tl?.icon} {tl?.label}</span></td>
                      <td className="px-5 py-4 font-medium text-gray-900">{c.name}</td>
                      <td className="px-5 py-4 text-gray-700">{c.phone}</td>
                      <td className="px-5 py-4 text-gray-500">{c.details}</td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex gap-3 justify-end">
                          <button onClick={() => openEdit(c)} className="text-blue-600 text-sm hover:underline font-medium">Editar</button>
                          <button onClick={() => handleDelete(c)} className="text-red-600 text-sm hover:underline font-medium">Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
