import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <MainLayout>{children}</MainLayout>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/patients" element={<ProtectedRoute><PatientsListPage /></ProtectedRoute>} />
          <Route path="/patients/register" element={<ProtectedRoute><RegisterPage /></ProtectedRoute>} />
          <Route path="/patients/queue" element={<ProtectedRoute><QueuePage /></ProtectedRoute>} />
          <Route path="/patients/:id" element={<ProtectedRoute><PatientDetailPage /></ProtectedRoute>} />
          <Route path="/patients/:id/triage" element={<ProtectedRoute><TriagePage /></ProtectedRoute>} />
          <Route path="/patients/:id/attend" element={<ProtectedRoute><AttentionPage /></ProtectedRoute>} />
          <Route path="/emergency" element={<ProtectedRoute><EmergencyPage /></ProtectedRoute>} />
          <Route path="/shifts" element={<ProtectedRoute><ShiftsPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
          <Route path="/admin/congregations" element={<ProtectedRoute><CongregationsPage /></ProtectedRoute>} />
          <Route path="/admin/contacts" element={<ProtectedRoute><ContactsPage /></ProtectedRoute>} />
          <Route path="/admin/supplies" element={<ProtectedRoute><SuppliesPage /></ProtectedRoute>} />
          <Route path="/admin/triage-questions" element={<ProtectedRoute><TriageQuestionsPage /></ProtectedRoute>} />
          <Route path="/admin/whatsapp-templates" element={<ProtectedRoute><WhatsAppTemplatesPage /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
