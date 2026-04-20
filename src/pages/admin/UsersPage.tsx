import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { User, Role } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import ContactActions from '../../components/ui/ContactActions';
import { useDialog } from '../../components/ui/Dialog';

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  ADMIN: { label: 'Super Admin', color: 'bg-purple-100 text-purple-800' },
  ENCARGADO_TURNO: { label: 'Encargado de Turno', color: 'bg-blue-100 text-blue-800' },
  ENCARGADO_SALUD: { label: 'Encargado de Salud', color: 'bg-teal-100 text-teal-800' },
  DOCTOR: { label: 'Doctor', color: 'bg-green-100 text-green-800' },
  ASISTENTE: { label: 'Asistente de Salud', color: 'bg-cyan-100 text-cyan-800' },
  CAMILLERO: { label: 'Camillero', color: 'bg-orange-100 text-orange-800' },
  CONSULTA: { label: 'Consulta / Reportes', color: 'bg-gray-100 text-gray-800' },
  ENCARGADO: { label: 'Encargado (legacy)', color: 'bg-yellow-100 text-yellow-800' },
};

const getRoleLabel = (role: string) => ROLE_LABELS[role] || { label: role, color: 'bg-gray-100 text-gray-600' };

type FormState = { email: string; name: string; password: string; phone: string; role: Role };
const EMPTY_FORM: FormState = { email: '', name: '', password: '', phone: '', role: 'ASISTENTE' };

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const { danger, alert: showAlert } = useDialog();
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo cargar la lista de usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const hasAdmin = users.some(u => u.role === 'ADMIN');

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowForm(true);
  };

  const openEdit = (u: User) => {
    setEditingId(u.id);
    setForm({
      email: u.email,
      name: u.name,
      phone: u.phone || '',
      password: '',
      role: u.role as Role,
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
        const payload: any = { name: form.name, phone: form.phone, role: form.role };
        if (form.password) payload.password = form.password;
        if (form.email !== users.find(u => u.id === editingId)?.email) payload.email = form.email;
        await api.put(`/users/${editingId}`, payload);
      } else {
        await api.post('/users', form);
      }
      handleCancel();
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar usuario');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.patch(`/users/${id}/toggle`);
      fetchUsers();
    } catch (err: any) {
      await showAlert({ title: 'Error', message: err.response?.data?.error || 'Error desconocido' });
    }
  };

  const handleDelete = async (u: User) => {
    // First attempt: normal delete
    try {
      const ok = await danger({
        title: `Eliminar a ${u.name}?`,
        message: 'Esta accion es permanente y no se puede deshacer.',
      });
      if (!ok) return;
      await api.delete(`/users/${u.id}`);
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.error || '';
      // If blocked due to related records, offer cascade delete
      if (msg.includes('registros asociados')) {
        const cascade = await danger({
          title: `${u.name} tiene registros medicos`,
          message: `${msg}\n\nLos datos medicos se reasignaran al administrador y el usuario sera eliminado. Desea continuar?`,
          confirmText: 'Eliminar con cascada',
        });
        if (!cascade) return;
        try {
          await api.delete(`/users/${u.id}?force=true`);
          fetchUsers();
        } catch (err2: any) {
          await showAlert({ title: 'No se pudo eliminar', message: err2.response?.data?.error || 'Error desconocido' });
        }
      } else {
        await showAlert({ title: 'No se pudo eliminar', message: msg || 'Error desconocido' });
      }
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
        <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md">
          <span>+</span> Nuevo Usuario
        </button>
      </div>

      {error && !showForm && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-sm flex items-start gap-2">
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-bold mb-4">{editingId ? 'Editar Usuario' : 'Crear Usuario'}</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Nombre *</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                {editingId ? 'Nueva contrasena (opcional)' : 'Contrasena'}
              </label>
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder={editingId ? 'Dejar vacio para mantener' : ''} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Telefono</label>
              <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Rol *</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as Role }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                <option value="ENCARGADO_TURNO">Encargado de Turno</option>
                <option value="ENCARGADO_SALUD">Encargado de Salud</option>
                <option value="DOCTOR">Doctor</option>
                <option value="ASISTENTE">Asistente de Salud</option>
                <option value="CAMILLERO">Camillero</option>
                <option value="CONSULTA">Consulta / Reportes</option>
                {(!hasAdmin || (editingId && form.role === 'ADMIN')) && <option value="ADMIN">Super Administrador (unico)</option>}
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button onClick={handleCancel} className="sm:w-32 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancelar</button>
            <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">
              {editingId ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </div>
      )}

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {users.map(u => {
          const rl = getRoleLabel(u.role);
          const isSelf = currentUser?.id === u.id;
          return (
            <div key={u.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{u.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  {u.phone && <p className="text-xs text-gray-500">{u.phone}</p>}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${rl.color}`}>{rl.label}</span>
              </div>
              {(u.phone || u.email) && (
                <div className="mt-2 pb-2 border-b border-gray-100">
                  <ContactActions phone={u.phone} email={u.email} name={u.name} />
                </div>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {u.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button onClick={() => openEdit(u)} className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100">Editar</button>
                {u.role !== 'ADMIN' && (
                  <button onClick={() => handleToggle(u.id)} className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-100">
                    {u.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                )}
                {u.role !== 'ADMIN' && !isSelf && (
                  <button onClick={() => handleDelete(u)} className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-100">Eliminar</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Nombre</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Email</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Contacto</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Rol</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Estado</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => {
                const rl = getRoleLabel(u.role);
                const isSelf = currentUser?.id === u.id;
                return (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900">{u.name}</div>
                      {u.phone && <div className="text-xs text-gray-500">{u.phone}</div>}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{u.email}</td>
                    <td className="px-5 py-4">
                      <ContactActions phone={u.phone} email={u.email} name={u.name} />
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${rl.color}`}>{rl.label}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {u.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex gap-3 justify-end">
                        <button onClick={() => openEdit(u)} className="text-blue-600 text-sm hover:underline font-medium">Editar</button>
                        {u.role !== 'ADMIN' && (
                          <button onClick={() => handleToggle(u.id)} className="text-gray-600 text-sm hover:underline font-medium">
                            {u.isActive ? 'Desactivar' : 'Activar'}
                          </button>
                        )}
                        {u.role !== 'ADMIN' && !isSelf && (
                          <button onClick={() => handleDelete(u)} className="text-red-600 text-sm hover:underline font-medium">Eliminar</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
