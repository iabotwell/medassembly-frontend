import React, { useEffect, useState } from 'react';
import { shiftService } from '../../services/shiftService';
import api from '../../services/api';
import { Shift, User } from '../../types';

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newShift, setNewShift] = useState({ eventId: '', date: '', startTime: '', endTime: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const [shiftsData, usersData, eventData] = await Promise.all([
          shiftService.list(),
          api.get('/users').then(r => r.data),
          api.get('/events/active').then(r => r.data).catch(() => null),
        ]);
        setShifts(shiftsData);
        setUsers(usersData);
        if (eventData) setNewShift(prev => ({ ...prev, eventId: eventData.id }));
      } catch { }
      setLoading(false);
    };
    load();
  }, []);

  const handleCreate = async () => {
    try {
      await shiftService.create(newShift);
      const data = await shiftService.list();
      setShifts(data);
      setShowCreate(false);
    } catch { }
  };

  const handleActivate = async (id: string) => {
    await shiftService.activate(id);
    const data = await shiftService.list();
    setShifts(data);
  };

  const handleAddMember = async (shiftId: string) => {
    const userId = prompt('ID del usuario:');
    const role = prompt('Rol (ENCARGADO, DOCTOR, ASISTENTE, CAMILLERO):');
    if (!userId || !role) return;
    await shiftService.addMember(shiftId, { userId, role });
    const data = await shiftService.list();
    setShifts(data);
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Turnos</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ Nuevo Turno</button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl border p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input type="date" value={newShift.date} onChange={e => setNewShift(p => ({ ...p, date: e.target.value }))} className="px-3 py-2 border rounded-lg" />
            <input type="time" value={newShift.startTime} onChange={e => setNewShift(p => ({ ...p, startTime: e.target.value }))} className="px-3 py-2 border rounded-lg" />
            <input type="time" value={newShift.endTime} onChange={e => setNewShift(p => ({ ...p, endTime: e.target.value }))} className="px-3 py-2 border rounded-lg" />
            <button onClick={handleCreate} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Crear</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {shifts.map(shift => (
          <div key={shift.id} className={`bg-white rounded-xl border p-4 ${shift.isActive ? 'border-green-400 bg-green-50' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-bold">{new Date(shift.date).toLocaleDateString('es-CL')}</span>
                <span className="ml-2 text-gray-600">{shift.startTime} - {shift.endTime}</span>
                {shift.isActive && <span className="ml-2 px-2 py-0.5 bg-green-200 text-green-800 rounded-full text-xs">Activo</span>}
              </div>
              <div className="flex gap-2">
                {!shift.isActive && <button onClick={() => handleActivate(shift.id)} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">Activar</button>}
                <button onClick={() => handleAddMember(shift.id)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">+ Miembro</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {shift.members.map(m => (
                <span key={m.id} className="bg-gray-100 px-3 py-1 rounded-full text-xs">{m.user.name} ({m.role})</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
