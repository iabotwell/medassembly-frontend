import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { patientService } from '../../services/patientService';
import { Patient } from '../../types';

const COLOR_STYLES: Record<string, { ring: string; bg: string; text: string; label: string }> = {
  RED: { ring: 'ring-red-500', bg: 'bg-red-100', text: 'text-red-700', label: 'GRAVE' },
  YELLOW: { ring: 'ring-yellow-500', bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'MEDIO' },
  BLUE: { ring: 'ring-blue-500', bg: 'bg-blue-100', text: 'text-blue-700', label: 'LEVE' },
};

export default function QueuePage() {
  const [queue, setQueue] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const data = await patientService.getQueue();
        setQueue(data);
      } catch {}
      setLoading(false);
    };
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  const getWaitMinutes = (createdAt: string) => Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="inline-block w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cola de Espera</h1>
          <p className="text-sm text-gray-500 mt-0.5">Pacientes con triage listo, ordenados por prioridad</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
            <span className="text-sm font-semibold text-blue-900">{queue.length} pacientes</span>
          </div>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="text-5xl mb-3">✅</div>
          <h2 className="text-lg font-semibold text-gray-900">No hay pacientes en cola</h2>
          <p className="text-sm text-gray-500 mt-1">Todos los pacientes estan siendo atendidos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((patient, index) => {
            const color = COLOR_STYLES[patient.triageColor || 'BLUE'];
            const wait = getWaitMinutes(patient.createdAt);
            return (
              <div key={patient.id} className={`bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden ${patient.triageColor === 'RED' ? 'ring-2 ring-red-300' : ''}`}>
                <div className="flex items-stretch">
                  <div className={`w-2 ${color.ring.replace('ring-', 'bg-')}`}></div>
                  <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{patient.fullName}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${color.bg} ${color.text}`}>{color.label}</span>
                        </div>
                        <div className="text-sm text-gray-500 truncate">{patient.congregation?.name} • {patient.reasonForVisit}</div>
                        <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-3">
                          <span>⏱ {wait} min esperando</span>
                          <span>{new Date(patient.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 md:flex-shrink-0">
                      <Link to={`/patients/${patient.id}`} className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">Ver</Link>
                      <Link to={`/patients/${patient.id}/attend`} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm">Atender →</Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
