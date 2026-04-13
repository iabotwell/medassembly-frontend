import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { emergencyService } from '../../services/emergencyService';
import { Emergency } from '../../types';

const LEVEL_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  SOS_DOCTOR: { label: 'SOS Doctor', icon: '🚨', color: 'bg-orange-100 text-orange-800' },
  EMERGENCY_VEHICLE: { label: 'Auto de Emergencia', icon: '🚗', color: 'bg-amber-100 text-amber-800' },
  TRANSFER: { label: 'Traslado', icon: '🏥', color: 'bg-purple-100 text-purple-800' },
  AMBULANCE: { label: 'Ambulancia', icon: '🚑', color: 'bg-red-100 text-red-800' },
};

export default function EmergencyPage() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');

  const fetchEmergencies = async () => {
    try {
      const data = await emergencyService.listActive();
      setEmergencies(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchEmergencies();
    const interval = setInterval(fetchEmergencies, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleConfirmResolve = async () => {
    if (!resolvingId) return;
    await emergencyService.resolve(resolvingId, resolveNotes);
    setResolvingId(null);
    setResolveNotes('');
    fetchEmergencies();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Emergencias Activas</h1>
          <p className="text-sm text-gray-500 mt-0.5">{emergencies.length} emergencia{emergencies.length !== 1 && 's'} en curso</p>
        </div>
      </div>

      {emergencies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="text-5xl mb-3">✅</div>
          <h2 className="text-lg font-semibold text-gray-900">Sin emergencias activas</h2>
          <p className="text-sm text-gray-500 mt-1">Todos los pacientes estan estables</p>
        </div>
      ) : (
        <div className="space-y-3">
          {emergencies.map(em => {
            const level = LEVEL_LABELS[em.level] || { label: em.level, icon: '⚠️', color: 'bg-gray-100 text-gray-800' };
            return (
              <div key={em.id} className="bg-gradient-to-r from-red-50 to-white border-2 border-red-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-stretch">
                  <div className="w-2 bg-red-500"></div>
                  <div className="flex-1 p-4 sm:p-5">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-2xl flex-shrink-0">
                          {level.icon}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-red-900 text-lg">{em.patient.fullName}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${level.color}`}>{level.label}</span>
                            <span className="text-xs text-gray-600">Autorizado por {em.authorizedBy.name}</span>
                          </div>
                          {em.notes && <p className="text-sm text-gray-700 mt-2">{em.notes}</p>}
                          <p className="text-xs text-gray-500 mt-1">{new Date(em.createdAt).toLocaleString('es-CL')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 md:flex-shrink-0">
                        <Link to={`/patients/${em.patientId}`} className="flex-1 md:flex-none px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 text-center">Ver Paciente</Link>
                        <button onClick={() => setResolvingId(em.id)} className="flex-1 md:flex-none px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">Resolver</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resolve modal */}
      {resolvingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Resolver Emergencia</h3>
            <textarea value={resolveNotes} onChange={e => setResolveNotes(e.target.value)} placeholder="Notas de resolucion..." rows={4} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm mb-4" />
            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={() => { setResolvingId(null); setResolveNotes(''); }} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">Cancelar</button>
              <button onClick={handleConfirmResolve} className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
