import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { patientService } from '../../services/patientService';
import { Patient, PatientStatus } from '../../types';

const STATUS_LABELS: Record<PatientStatus, string> = {
  WAITING_TRIAGE: 'Esperando Triage',
  WAITING_ATTENTION: 'Esperando Atencion',
  IN_ATTENTION: 'En Atencion',
  IN_OBSERVATION: 'En Observacion',
  IN_EMERGENCY: 'En Emergencia',
  DISCHARGED: 'Alta',
  REFERRED: 'Derivado',
};

const STATUS_STYLES: Record<PatientStatus, string> = {
  WAITING_TRIAGE: 'bg-gray-100 text-gray-700',
  WAITING_ATTENTION: 'bg-purple-100 text-purple-700',
  IN_ATTENTION: 'bg-blue-100 text-blue-700',
  IN_OBSERVATION: 'bg-indigo-100 text-indigo-700',
  IN_EMERGENCY: 'bg-red-200 text-red-900',
  DISCHARGED: 'bg-green-100 text-green-700',
  REFERRED: 'bg-orange-100 text-orange-700',
};

const COLOR_DOT: Record<string, string> = {
  RED: 'bg-red-500', YELLOW: 'bg-yellow-500', BLUE: 'bg-blue-500',
};

export default function PatientsListPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [colorFilter, setColorFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  const fetchPatients = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (colorFilter) params.triageColor = colorFilter;
      const data = await patientService.list(params);
      setPatients(data);
    } catch {}
    setLoading(false);
  }, [statusFilter, colorFilter]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const filtered = patients.filter(p =>
    !search || p.fullName.toLowerCase().includes(search.toLowerCase()) || p.congregation?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} paciente{filtered.length !== 1 && 's'}</p>
        </div>
        <Link to="/patients/register" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md">
          <span>+</span> Registrar Paciente
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Buscar por nombre o congregacion..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
            <option value="">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select value={colorFilter} onChange={e => setColorFilter(e.target.value)} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
            <option value="">Todos los colores</option>
            <option value="BLUE">🔵 Azul (Leve)</option>
            <option value="YELLOW">🟡 Amarillo (Medio)</option>
            <option value="RED">🔴 Rojo (Grave)</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-gray-500">No hay pacientes que coincidan con los filtros</p>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map(p => (
              <Link key={p.id} to={`/patients/${p.id}`} className="block bg-white rounded-2xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">{p.fullName}</h3>
                    <p className="text-xs text-gray-500">{p.age} anos • {p.sex === 'M' ? 'Masculino' : 'Femenino'}</p>
                  </div>
                  {p.triageColor && <span className={`flex-shrink-0 w-3 h-3 rounded-full ${COLOR_DOT[p.triageColor]}`}></span>}
                </div>
                <p className="text-sm text-gray-600 truncate mb-2">{p.reasonForVisit}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[p.status]}`}>
                    {STATUS_LABELS[p.status]}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{p.congregation?.name}</p>
              </Link>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Paciente</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Congregacion</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Edad/Sexo</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Triage</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Estado</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Ingreso</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900">{p.fullName}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{p.reasonForVisit}</div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{p.congregation?.name}</td>
                      <td className="px-5 py-4 text-gray-600">{p.age} / {p.sex}</td>
                      <td className="px-5 py-4">
                        {p.triageColor ? (
                          <span className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${COLOR_DOT[p.triageColor]}`}></span>
                            <span className="text-xs font-medium">{p.triageColor}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Sin triage</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[p.status]}`}>
                          {STATUS_LABELS[p.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500">{new Date(p.createdAt).toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-5 py-4 text-right">
                        <Link to={`/patients/${p.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Ver →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
