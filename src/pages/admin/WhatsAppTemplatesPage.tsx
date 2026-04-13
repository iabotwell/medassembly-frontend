import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { WhatsAppTemplate } from '../../types';

const TEMPLATE_LABELS: Record<string, { label: string; icon: string }> = {
  SOS_DOCTOR: { label: 'SOS Doctor', icon: '🚨' },
  RED_TRIAGE: { label: 'Triage Rojo', icon: '🔴' },
  CAMILLERO_REQUEST: { label: 'Solicitud de Camillero', icon: '🛏️' },
  AMBULANCE_REQUEST: { label: 'Solicitud de Ambulancia', icon: '🚑' },
  PATIENT_DISCHARGE: { label: 'Alta de Paciente', icon: '✅' },
  SHIFT_START: { label: 'Inicio de Turno', icon: '🕐' },
};

const VARIABLES = ['{paciente}', '{prioridad}', '{ubicacion}', '{hora}', '{atendido_por}', '{congregacion}', '{indicaciones}', '{motivo}', '{hora_inicio}', '{hora_fin}', '{evento}', '{rol}'];

export default function WhatsAppTemplatesPage() {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/whatsapp/templates');
      setTemplates(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar plantillas');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, []);

  const handleSave = async (id: string) => {
    try {
      await api.put(`/whatsapp/templates/${id}`, { template: editValue });
      setEditingId(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleToggle = async (t: WhatsAppTemplate) => {
    try {
      await api.put(`/whatsapp/templates/${t.id}`, { isActive: !t.isActive });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  const insertVariable = (v: string) => {
    setEditValue(prev => prev + ' ' + v);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Plantillas WhatsApp</h1>
        <p className="text-sm text-gray-500 mt-0.5">Personalice los mensajes automaticos del sistema</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-sm">{error}</div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-2">Variables disponibles</p>
        <div className="flex flex-wrap gap-1.5">
          {VARIABLES.map(v => (
            <code key={v} className="px-2 py-0.5 bg-white border border-blue-200 rounded text-xs text-blue-800">{v}</code>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {templates.map(t => {
          const info = TEMPLATE_LABELS[t.eventType] || { label: t.eventType, icon: '💬' };
          const isEditing = editingId === t.id;
          return (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <header className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg flex-shrink-0">{info.icon}</span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{info.label}</h3>
                    <code className="text-xs text-gray-500">{t.eventType}</code>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${t.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {t.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </header>

              <div className="p-5">
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Click para insertar</p>
                      <div className="flex flex-wrap gap-1.5">
                        {VARIABLES.map(v => (
                          <button
                            key={v}
                            onClick={() => insertVariable(v)}
                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded text-xs text-gray-700"
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button onClick={() => setEditingId(null)} className="sm:w-32 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancelar</button>
                      <button onClick={() => handleSave(t.id)} className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">
                        Guardar cambios
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap mb-3">
                      {t.template}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => { setEditingId(t.id); setEditValue(t.template); }}
                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-100"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggle(t)}
                        className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-100"
                      >
                        {t.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
