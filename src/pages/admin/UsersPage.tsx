import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { User, Role } from '../../types';

const ROLE_LABELS: Record<Role, { label: string; color: string }> = {
  ADMIN: { label: 'Super Admin', color: 'bg-purple-100 text-purple-800' },
  ENCARGADO: { label: 'Encargado', color: 'bg-blue-100 text-blue-800' },
  DOCTOR: { label: 'Doctor', color: 'bg-green-100 text-green-800' },
  ASISTENTE: { label: 'Asistente', color: 'bg-cyan-100 text-cyan-800' },
  CAMILLERO: { label: 'Camillero', color: 'bg-orange-100 text-orange-800' },
  CONSULTA: { label: 'Consulta', color: 'bg-gray-100 text-gray-800' },
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ email: '', name: '', password: '', phone: '', role: 'ASISTENTE' as Role });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    const { data } = await api.get('/users');
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const hasAdmin = users.some(u => u.role === 'ADMIN');

  const handleCreate = async () => {
    setError('');
    try {
      await api.post('/users', form);
      setShowCreate(false);
      setForm({ email: '', name: '', password: '', phone: '', role: 'ASISTENTE' });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear usuario');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.patch(`/users/${id}/toggle`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} usuarios registrados</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md">
          <span>+</span> Nuevo Usuario
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-bold mb-4">Crear Usuario</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Nombre" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Contrasena" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            <input placeholder="Telefono" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as Role }))} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 sm:col-span-2">
              <option value="ENCARGADO">Encargado</option>
              <option value="DOCTOR">Doctor</option>
              <option value="ASISTENTE">Asistente</option>
              <option value="CAMILLERO">Camillero</option>
              <option value="CONSULTA">Consulta</option>
              {!hasAdmin && <option value="ADMIN">Super Administrador (unico)</option>}
            </select>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button onClick={() => setShowCreate(false)} className="sm:w-32 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancelar</button>
            <button onClick={handleCreate} className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">Crear Usuario</button>
          </div>
        </div>
      )}

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {users.map(u => (
          <div key={u.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{u.name}</h3>
                <p className="text-xs text-gray-500 truncate">{u.email}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_LABELS[u.role].color}`}>{ROLE_LABELS[u.role].label}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className={`px-2 py-0.5 rounded-full text-xs ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {u.isActive ? 'Activo' : 'Inactivo'}
              </span>
              {u.role !== 'ADMIN' && (
                <button onClick={() => handleToggle(u.id)} className="text-sm text-blue-600 hover:underline">
                  {u.isActive ? 'Desactivar' : 'Activar'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Nombre</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Email</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Rol</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Estado</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 font-medium text-gray-900">{u.name}</td>
                <td className="px-5 py-4 text-gray-600">{u.email}</td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_LABELS[u.role].color}`}>{ROLE_LABELS[u.role].label}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {u.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  {u.role !== 'ADMIN' && (
                    <button onClick={() => handleToggle(u.id)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      {u.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
