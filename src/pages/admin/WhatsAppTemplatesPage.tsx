import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { WhatsAppTemplate } from '../../types';

export default function WhatsAppTemplatesPage() {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const fetchData = async () => { const { data } = await api.get('/whatsapp/templates'); setTemplates(data); };
  useEffect(() => { fetchData(); }, []);

  const handleSave = async (id: string) => {
    await api.put(`/whatsapp/templates/${id}`, { template: editValue });
    setEditing(null); fetchData();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Plantillas WhatsApp</h1>
      <p className="text-sm text-gray-500 mb-4">Variables disponibles: {'{paciente}'}, {'{prioridad}'}, {'{ubicacion}'}, {'{hora}'}, {'{atendido_por}'}, {'{congregacion}'}, {'{indicaciones}'}, {'{motivo}'}</p>
      <div className="space-y-4">
        {templates.map(t => (
          <div key={t.id} className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm">{t.eventType}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${t.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{t.isActive ? 'Activa' : 'Inactiva'}</span>
            </div>
            {editing === t.id ? (
              <div>
                <textarea value={editValue} onChange={e => setEditValue(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm mb-2" />
                <div className="flex gap-2">
                  <button onClick={() => handleSave(t.id)} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Guardar</button>
                  <button onClick={() => setEditing(null)} className="px-3 py-1 border rounded text-sm">Cancelar</button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600">{t.template}</p>
                <button onClick={() => { setEditing(t.id); setEditValue(t.template); }} className="mt-2 text-blue-600 text-sm hover:underline">Editar</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
