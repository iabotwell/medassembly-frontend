import React, { useEffect, useState } from 'react';
import { shiftService } from '../../services/shiftService';
import api from '../../services/api';
import { Shift, User } from '../../types';
import { useDialog } from '../../components/ui/Dialog';

type ShiftForm = { date: string; startTime: string; endTime: string };
const EMPTY_SHIFT: ShiftForm = { date: '', startTime: '', endTime: '' };

const ROLE_OPTIONS = [
  { value: 'ENCARGADO_TURNO', label: 'Encargado de Turno' },
  { value: 'ENCARGADO_SALUD', label: 'Encargado de Salud' },
  { value: 'DOCTOR', label: 'Doctor' },
  { value: 'ASISTENTE', label: 'Asistente de Salud' },
  { value: 'CAMILLERO', label: 'Camillero' },
];

export default function ShiftsPage() {
  const { danger, alert: showAlert } = useDialog();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ShiftForm>(EMPTY_SHIFT);
  const [error, setError] = useState('');

  const [addingMemberFor, setAddingMemberFor] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState({ userId: '', role: 'ASISTENTE' });

  const fetchData = async () => {
    try {
      const [shiftsData, usersData, eventData] = await Promise.all([
        shiftService.list(),
        api.get('/users').then(r => r.data).catch(() => []),
        api.get('/events/active').then(r => r.data).catch(() => null),
      ]);
      setShifts(shiftsData);
      setUsers(usersData.filter((u: User) => u.isActive));
      if (eventData) setActiveEventId(eventData.id);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar turnos');
    }
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_SHIFT);
    setError('');
    setShowForm(true);
  };
  const openEdit = (s: Shift) => {
    setEditingId(s.id);
    setForm({
      date: new Date(s.date).toISOString().split('T')[0],
      startTime: s.startTime,
      endTime: s.endTime,
    });
    setError('');
    setShowForm(true);
  };
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_SHIFT);
    setError('');
  };
  const handleSave = async () => {
    setError('');
    if (!activeEventId && !editingId) {
      setError('No hay evento activo');
      return;
    }
    try {
      if (editingId) {
        await shiftService.update(editingId, form);
      } else {
        await shiftService.create({ eventId: activeEventId, ...form });
      }
      handleCancel();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  };
  const handleActivate = async (id: string) => {
    await shiftService.activate(id);
    fetchData();
  };
  const handleDelete = async (s: Shift) => {
    const ok = await danger({ title: 'Eliminar turno?', message: 'Esta accion es permanente.' });
    if (!ok) return;
    try {
      await api.delete(`/shifts/${s.id}`);
      fetchData();
    } catch (err: any) {
      await showAlert({ title: 'No se pudo eliminar', message: err.response?.data?.error || 'Error desconocido' });
    }
  };
  const handleAddMember = async (shiftId: string) => {
    if (!memberForm.userId) { await showAlert({ title: 'Falta usuario', message: 'Seleccione un usuario antes de continuar' }); return; }
    try {
      await shiftService.addMember(shiftId, memberForm);
      setAddingMemberFor(null);
      setMemberForm({ userId: '', role: 'ASISTENTE' });
      fetchData();
    } catch (err: any) {
      await showAlert({ title: 'Error al agregar miembro', message: err.response?.data?.error || 'Error desconocido' });
    }
  };
  const handleRemoveMember = async (shiftId: string, memberId: string) => {
    const ok = await danger({ title: 'Quitar miembro del turno?', confirmText: 'Quitar' });
    if (!ok) return;
    await shiftService.removeMember(shiftId, memberId);
    fetchData();
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Turnos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{shifts.length} turno{shifts.length !== 1 && 's'} del evento activo</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md">
          <span>+</span> Nuevo Turno
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-bold mb-4">{editingId ? 'Editar Turno' : 'Nuevo Turno'}</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Fecha</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Inicio</label>
              <input type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Fin</label>
              <input type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button onClick={handleCancel} className="sm:w-32 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancelar</button>
            <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">
              {editingId ? 'Guardar cambios' : 'Crear turno'}
            </button>
          </div>
        </div>
      )}

      {shifts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="text-5xl mb-3">🕐</div>
          <p className="text-gray-500">No hay turnos configurados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {shifts.map(shift => (
            <div key={shift.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${shift.isActive ? 'border-green-300 ring-2 ring-green-100' : 'border-gray-200'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900">{new Date(shift.date).toLocaleDateString('es-CL')}</span>
                    <span className="text-gray-600">{shift.startTime} - {shift.endTime}</span>
                    {shift.isActive && <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">ACTIVO</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{shift.members.length} miembro{shift.members.length !== 1 && 's'}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {!shift.isActive && (
                    <button onClick={() => handleActivate(shift.id)} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100">Activar</button>
                  )}
                  <button onClick={() => openEdit(shift)} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100">Editar</button>
                  <button onClick={() => setAddingMemberFor(addingMemberFor === shift.id ? null : shift.id)} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-100">+ Miembro</button>
                  {!shift.isActive && (
                    <button onClick={() => handleDelete(shift)} className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-100">Eliminar</button>
                  )}
                </div>
              </div>

              {addingMemberFor === shift.id && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 mb-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select value={memberForm.userId} onChange={e => setMemberForm(p => ({ ...p, userId: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm">
                      <option value="">Seleccionar usuario...</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                    </select>
                    <select value={memberForm.role} onChange={e => setMemberForm(p => ({ ...p, role: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm">
                      {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    <button onClick={() => handleAddMember(shift.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700">Agregar</button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {shift.members.map(m => (
                  <span key={m.id} className="inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full text-xs">
                    <span className="font-medium">{m.user.name}</span>
                    <span className="text-gray-500">({m.role})</span>
                    <button onClick={() => handleRemoveMember(shift.id, m.id)} className="ml-1 text-red-500 hover:text-red-700">×</button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
