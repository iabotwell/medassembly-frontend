import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { useActiveEvent } from '../hooks/useActiveEvent';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', permission: 'dashboard:read', icon: '📊' },
  { path: '/patients', label: 'Pacientes', permission: 'patients:read', icon: '🏥' },
  { path: '/patients/register', label: 'Registrar Paciente', permission: 'patients:create', icon: '➕' },
  { path: '/patients/queue', label: 'Cola de Espera', permission: 'patients:read', icon: '⏳' },
  { path: '/emergency', label: 'Emergencias', permission: 'emergency:sos', icon: '🚨' },
  { path: '/shifts', label: 'Turnos', permission: 'shifts:read', icon: '🕐' },
  { path: '/reports', label: 'Reportes', permission: 'reports:read', icon: '📋' },
  { path: '/admin/events', label: 'Eventos', permission: 'events:create', icon: '📅' },
  { path: '/admin/users', label: 'Usuarios', permission: 'users:read', icon: '👥' },
  { path: '/admin/congregations', label: 'Congregaciones', permission: 'congregations:create', icon: '⛪' },
  { path: '/admin/contacts', label: 'Contactos Emergencia', permission: 'contacts:create', icon: '📞' },
  { path: '/admin/supplies', label: 'Insumos', permission: 'supplies:create', icon: '💊' },
  { path: '/admin/triage-questions', label: 'Preguntas Triage', permission: 'triage:create', icon: '❓' },
  { path: '/admin/whatsapp-templates', label: 'Plantillas WhatsApp', permission: 'whatsapp:update', icon: '💬' },
];

interface Props {
  children: React.ReactNode;
}

export default function MainLayout({ children }: Props) {
  const { user, logout } = useAuth();
  const { can } = usePermissions();
  const activeEvent = useActiveEvent();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNav = NAV_ITEMS.filter(item => can(item.permission));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-700 text-2xl">☰</button>
        <span className="font-bold text-blue-800">MedAssembly</span>
        <div className="w-8" />
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-blue-800">MedAssembly</h1>
          {activeEvent && (
            <p className="text-xs text-green-600 mt-1">Evento: {activeEvent.name}</p>
          )}
        </div>

        <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
          {filteredNav.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <div className="text-sm font-medium text-gray-900">{user?.name}</div>
          <div className="text-xs text-gray-500">{user?.role}</div>
          <button onClick={handleLogout} className="mt-2 text-sm text-red-600 hover:text-red-800">
            Cerrar Sesion
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
