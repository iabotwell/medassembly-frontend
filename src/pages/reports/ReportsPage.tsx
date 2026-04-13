import React, { useState } from 'react';
import { reportService } from '../../services/reportService';
import { useActiveEvent } from '../../hooks/useActiveEvent';

const TABS = [
  { key: 'event', label: 'Evento General', icon: '📊' },
  { key: 'supplies', label: 'Insumos', icon: '💊' },
  { key: 'team', label: 'Equipo', icon: '👥' },
];

export default function ReportsPage() {
  const activeEvent = useActiveEvent();
  const [activeTab, setActiveTab] = useState('event');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async (type: string) => {
    if (!activeEvent) return;
    setLoading(true);
    setActiveTab(type);
    try {
      let result;
      switch (type) {
        case 'event': result = await reportService.eventReport(activeEvent.id); break;
        case 'supplies': result = await reportService.suppliesReport(activeEvent.id); break;
        case 'team': result = await reportService.teamReport(activeEvent.id); break;
        default: return;
      }
      setData(result);
    } catch {}
    setLoading(false);
  };

  React.useEffect(() => { if (activeEvent) fetchReport('event'); /* eslint-disable-next-line */ }, [activeEvent]);

  if (!activeEvent) return (
    <div className="max-w-md mx-auto mt-12 text-center">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="text-5xl mb-4">📋</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No hay evento activo</h2>
        <p className="text-sm text-gray-500">Active un evento para ver los reportes</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="text-sm text-gray-500 mt-0.5">Estadisticas del evento: {activeEvent.name}</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-1.5 inline-flex flex-wrap gap-1 w-full sm:w-auto">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => fetchReport(tab.key)}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="mr-1.5">{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && data && activeTab === 'event' && (
        <div className="space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total</div>
              <div className="text-3xl font-bold text-gray-900">{data.totalPatients}</div>
              <div className="text-xs text-gray-500 mt-1">Pacientes</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-sm">
              <div className="text-xs text-blue-100 uppercase tracking-wide mb-1">Azul</div>
              <div className="text-3xl font-bold">{data.byColor.BLUE}</div>
              <div className="text-xs text-blue-100 mt-1">Leve</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-5 text-white shadow-sm">
              <div className="text-xs text-yellow-50 uppercase tracking-wide mb-1">Amarillo</div>
              <div className="text-3xl font-bold">{data.byColor.YELLOW}</div>
              <div className="text-xs text-yellow-50 mt-1">Medio</div>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-sm">
              <div className="text-xs text-red-100 uppercase tracking-wide mb-1">Rojo</div>
              <div className="text-3xl font-bold">{data.byColor.RED}</div>
              <div className="text-xs text-red-100 mt-1">Grave</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <header className="bg-gray-50 border-b border-gray-200 px-5 py-3">
                <h3 className="font-semibold text-gray-900">Por Estado</h3>
              </header>
              <div className="p-5 space-y-2">
                {Object.entries(data.byStatus).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center py-1.5 text-sm">
                    <span className="text-gray-600">{key}</span>
                    <span className="font-semibold text-gray-900">{val as number}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <header className="bg-gray-50 border-b border-gray-200 px-5 py-3">
                <h3 className="font-semibold text-gray-900">Por Congregacion</h3>
              </header>
              <div className="p-5 space-y-2">
                {Object.keys(data.byCongregation).length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Sin datos</p>
                ) : (
                  Object.entries(data.byCongregation).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center py-1.5 text-sm">
                      <span className="text-gray-600 truncate">{key}</span>
                      <span className="font-semibold text-gray-900">{val as number}</span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm">
              <div className="text-3xl font-bold text-gray-900">{data.avgAttentionMinutes} min</div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Tiempo promedio</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm">
              <div className="text-3xl font-bold text-red-600">{data.totalEmergencies}</div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Emergencias</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm">
              <div className="text-3xl font-bold text-green-600">{data.byStatus.DISCHARGED}</div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Altas</div>
            </div>
          </div>
        </div>
      )}

      {!loading && data && activeTab === 'supplies' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {data.summary.length === 0 ? (
            <p className="text-center py-12 text-gray-400">Sin consumo de insumos registrado</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Insumo</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Cantidad</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Unidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.summary.map((s: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium">{s.name}</td>
                      <td className="px-5 py-3">{s.totalQuantity}</td>
                      <td className="px-5 py-3 text-gray-500">{s.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!loading && data && activeTab === 'team' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {data.memberStats.length === 0 ? (
            <p className="text-center py-12 text-gray-400">Sin atenciones registradas</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Miembro</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Rol</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Atenciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.memberStats.map((m: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium">{m.name}</td>
                      <td className="px-5 py-3 text-gray-600">{m.role}</td>
                      <td className="px-5 py-3 font-semibold">{m.attentions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
