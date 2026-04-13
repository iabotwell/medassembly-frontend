import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import { useActiveEvent } from '../../hooks/useActiveEvent';
import { useSocket } from '../../hooks/useSocket';
import { DashboardData, Patient } from '../../types';

const COLOR_MAP: Record<string, { bg: string; text: string; label: string; dot: string }> = {
  BLUE: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Azul', dot: 'bg-blue-500' },
  YELLOW: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Amarillo', dot: 'bg-yellow-500' },
  RED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rojo', dot: 'bg-red-500' },
};

const STATUS_LABELS: Record<string, string> = {
  WAITING_TRIAGE: 'Esperando Triage',
  WAITING_ATTENTION: 'Esperando Atencion',
  IN_ATTENTION: 'En Atencion',
  IN_OBSERVATION: 'En Observacion',
  IN_EMERGENCY: 'En Emergencia',
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const activeEvent = useActiveEvent();
  const socket = useSocket(activeEvent?.id);

  const fetchDashboard = useCallback(async () => {
    try {
      const result = await reportService.dashboard();
      setData(result);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 15000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  useEffect(() => {
    if (socket) {
      socket.on('dashboard:update', (update: DashboardData) => setData(update));
      socket.on('patient:statusChanged', () => fetchDashboard());
      socket.on('emergency:activated', () => fetchDashboard());
      socket.on('emergency:resolved', () => fetchDashboard());
    }
  }, [socket, fetchDashboard]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
        <p className="text-gray-500">Cargando dashboard...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="max-w-md mx-auto mt-12 text-center">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="text-5xl mb-4">📋</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No hay evento activo</h2>
        <p className="text-sm text-gray-500 mb-4">Active un evento desde Administracion para comenzar</p>
        <Link to="/admin/events" className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          Ir a Eventos
        </Link>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monitoreo en tiempo real del evento activo</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full self-start">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-sm font-medium text-green-800">{data.event.name}</span>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100 text-xs font-semibold uppercase tracking-wide">Azul</span>
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">🔵</div>
          </div>
          <div className="text-4xl font-bold">{data.activeCounts.blue}</div>
          <div className="text-xs text-blue-100 mt-1">Leve</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-5 text-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-yellow-50 text-xs font-semibold uppercase tracking-wide">Amarillo</span>
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">🟡</div>
          </div>
          <div className="text-4xl font-bold">{data.activeCounts.yellow}</div>
          <div className="text-xs text-yellow-50 mt-1">Medio</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-100 text-xs font-semibold uppercase tracking-wide">Rojo</span>
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">🔴</div>
          </div>
          <div className="text-4xl font-bold">{data.activeCounts.red}</div>
          <div className="text-xs text-red-100 mt-1">Grave</div>
        </div>
        <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl p-5 text-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-100 text-xs font-semibold uppercase tracking-wide">En Triage</span>
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">⏳</div>
          </div>
          <div className="text-4xl font-bold">{data.waitingTriage}</div>
          <div className="text-xs text-gray-100 mt-1">Pendientes</div>
        </div>
      </div>

      {/* Active emergencies */}
      {data.activeEmergencies.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-2xl p-5 shadow-sm animate-pulse-slow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white text-xl">🚨</div>
            <div>
              <h2 className="font-bold text-red-900">Emergencias Activas</h2>
              <p className="text-xs text-red-700">{data.activeEmergencies.length} emergencias requieren atencion</p>
            </div>
          </div>
          <div className="space-y-2">
            {data.activeEmergencies.map(em => (
              <Link key={em.id} to={`/patients/${em.patientId}`} className="flex items-center justify-between bg-white rounded-xl p-3 hover:shadow-md transition-shadow">
                <div>
                  <div className="font-semibold text-red-900">{em.patient.fullName}</div>
                  <div className="text-xs text-red-700">{em.level.replace(/_/g, ' ')}</div>
                </div>
                <span className="text-red-600 text-sm font-medium">Ver →</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        {/* Queue */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <header className="bg-gradient-to-r from-purple-50 to-purple-50/50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">⏳</span>
              <h2 className="font-semibold text-gray-900">Cola de Espera</h2>
            </div>
            <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">{data.queue.length}</span>
          </header>
          <div className="p-3">
            {data.queue.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">Sin pacientes en cola</p>
            ) : (
              <div className="space-y-1">
                {data.queue.map((patient: Patient, idx: number) => (
                  <Link key={patient.id} to={`/patients/${patient.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-gray-300 text-sm font-bold w-6">#{idx + 1}</span>
                      <span className={`w-3 h-3 rounded-full flex-shrink-0 ${COLOR_MAP[patient.triageColor || 'BLUE'].dot}`}></span>
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">{patient.fullName}</div>
                        <div className="text-xs text-gray-500 truncate">{patient.congregation?.name}</div>
                      </div>
                    </div>
                    <span className="text-blue-600 text-sm opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Active attentions */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <header className="bg-gradient-to-r from-blue-50 to-blue-50/50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏥</span>
              <h2 className="font-semibold text-gray-900">En Atencion</h2>
            </div>
            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">{data.activeAttentions.length}</span>
          </header>
          <div className="p-3">
            {data.activeAttentions.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">Sin pacientes en atencion</p>
            ) : (
              <div className="space-y-1">
                {data.activeAttentions.map((patient: Patient) => (
                  <Link key={patient.id} to={`/patients/${patient.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-3 h-3 rounded-full flex-shrink-0 ${COLOR_MAP[patient.triageColor || 'BLUE'].dot}`}></span>
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">{patient.fullName}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {patient.attentions?.[0] ? `Atendido por ${patient.attentions[0].attendedBy.name}` : STATUS_LABELS[patient.status]}
                        </div>
                      </div>
                    </div>
                    <span className="text-blue-600 text-sm opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Active shift */}
      {data.activeShift && (
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <header className="bg-gradient-to-r from-emerald-50 to-emerald-50/50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🕐</span>
              <h2 className="font-semibold text-gray-900">Turno Activo</h2>
              <span className="text-sm text-gray-500 font-normal">{data.activeShift.startTime} - {data.activeShift.endTime}</span>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">{data.activeShift.members.length} miembros</span>
          </header>
          <div className="p-5">
            <div className="flex flex-wrap gap-2">
              {data.activeShift.members.map(m => (
                <span key={m.id} className="inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full text-sm">
                  <span className="font-medium text-gray-800">{m.user.name}</span>
                  <span className="text-xs text-gray-500">({m.role})</span>
                </span>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
