import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import { hasPermission } from './lib/permissions';
import { DialogProvider } from './components/ui/Dialog';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import RegisterPage from './pages/patients/RegisterPage';
import TriagePage from './pages/patients/TriagePage';
import QueuePage from './pages/patients/QueuePage';
import PatientsListPage from './pages/patients/PatientsListPage';
import PatientDetailPage from './pages/patients/PatientDetailPage';
import AttentionPage from './pages/patients/AttentionPage';
import EmergencyPage from './pages/emergency/EmergencyPage';
import ShiftsPage from './pages/shifts/ShiftsPage';
import UsersPage from './pages/admin/UsersPage';
import EventsPage from './pages/admin/EventsPage';
import CongregationsPage from './pages/admin/CongregationsPage';
import ContactsPage from './pages/admin/ContactsPage';
import SuppliesPage from './pages/admin/SuppliesPage';
import TriageQuestionsPage from './pages/admin/TriageQuestionsPage';
import WhatsAppTemplatesPage from './pages/admin/WhatsAppTemplatesPage';
import ReportsPage from './pages/reports/ReportsPage';

const queryClient = new QueryClient();

function ProtectedRoute({ children, permission }: { children: React.ReactNode; permission?: string }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (permission && user && !hasPermission(user.role, permission)) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto mt-12 text-center">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Acceso Restringido</h2>
            <p className="text-sm text-gray-500 mb-4">
              Tu rol (<strong>{user.role}</strong>) no tiene permisos para acceder a esta seccion.
            </p>
            <a href="/dashboard" className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Volver al Dashboard
            </a>
          </div>
        </div>
      </MainLayout>
    );
  }

  return <MainLayout>{children}</MainLayout>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DialogProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboard - todos los roles autenticados */}
          <Route path="/dashboard" element={<ProtectedRoute permission="dashboard:read"><DashboardPage /></ProtectedRoute>} />

          {/* Pacientes */}
          <Route path="/patients" element={<ProtectedRoute permission="patients:read"><PatientsListPage /></ProtectedRoute>} />
          <Route path="/patients/register" element={<ProtectedRoute permission="patients:create"><RegisterPage /></ProtectedRoute>} />
          <Route path="/patients/:id/edit" element={<ProtectedRoute permission="patients:update"><RegisterPage /></ProtectedRoute>} />
          <Route path="/patients/queue" element={<ProtectedRoute permission="patients:read"><QueuePage /></ProtectedRoute>} />
          <Route path="/patients/:id" element={<ProtectedRoute permission="patients:read"><PatientDetailPage /></ProtectedRoute>} />
          <Route path="/patients/:id/triage" element={<ProtectedRoute permission="triage:create"><TriagePage /></ProtectedRoute>} />
          <Route path="/patients/:id/attend" element={<ProtectedRoute permission="attentions:create"><AttentionPage /></ProtectedRoute>} />

          {/* Operaciones */}
          <Route path="/emergency" element={<ProtectedRoute permission="emergency:sos"><EmergencyPage /></ProtectedRoute>} />
          <Route path="/shifts" element={<ProtectedRoute permission="shifts:read"><ShiftsPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute permission="reports:read"><ReportsPage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/users" element={<ProtectedRoute permission="users:read"><UsersPage /></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute permission="events:create"><EventsPage /></ProtectedRoute>} />
          <Route path="/admin/congregations" element={<ProtectedRoute permission="congregations:create"><CongregationsPage /></ProtectedRoute>} />
          <Route path="/admin/contacts" element={<ProtectedRoute permission="contacts:create"><ContactsPage /></ProtectedRoute>} />
          <Route path="/admin/supplies" element={<ProtectedRoute permission="supplies:create"><SuppliesPage /></ProtectedRoute>} />
          <Route path="/admin/triage-questions" element={<ProtectedRoute permission="triage:create"><TriageQuestionsPage /></ProtectedRoute>} />
          <Route path="/admin/whatsapp-templates" element={<ProtectedRoute permission="whatsapp:update"><WhatsAppTemplatesPage /></ProtectedRoute>} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      </DialogProvider>
    </QueryClientProvider>
  );
}

export default App;
