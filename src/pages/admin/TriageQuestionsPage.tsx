import React, { useEffect, useState } from 'react';
import { triageService } from '../../services/triageService';
import { TriageQuestion } from '../../types';

type FormState = {
  question: string;
  type: string;
  order: number;
  optionsText: string;
};

const EMPTY_FORM: FormState = { question: '', type: 'text', order: 1, optionsText: '' };

export default function TriageQuestionsPage() {
  const [questions, setQuestions] = useState<TriageQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState('');

  const fetchData = async () => {
    const data = await triageService.getQuestions(true);
    setQuestions(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, order: questions.length + 1 });
    setShowForm(true);
    setError('');
  };

  const openEdit = (q: TriageQuestion) => {
    setEditingId(q.id);
    setForm({
      question: q.question,
      type: q.type,
      order: q.order,
      optionsText: Array.isArray(q.options) ? q.options.join(', ') : '',
    });
    setShowForm(true);
    setError('');
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
  };

  const handleSave = async () => {
    setError('');
    if (!form.question.trim()) {
      setError('La pregunta es requerida');
      return;
    }
    const payload: any = {
      question: form.question.trim(),
      type: form.type,
      order: Number(form.order),
    };
    if (form.type === 'select') {
      const opts = form.optionsText.split(',').map(o => o.trim()).filter(Boolean);
      if (opts.length === 0) {
        setError('Debe ingresar al menos una opcion para preguntas tipo select');
        return;
      }
      payload.options = opts;
    }

    try {
      if (editingId) {
        await triageService.updateQuestion(editingId, payload);
      } else {
        await triageService.createQuestion(payload);
      }
      handleCancel();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleToggle = async (id: string) => {
    await triageService.toggleQuestion(id);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Eliminar esta pregunta de forma permanente?')) return;
    try {
      await triageService.deleteQuestion(id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al eliminar');
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Preguntas de Triage</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ Nueva Pregunta</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-4 mb-6">
          <h2 className="font-bold mb-3">{editingId ? 'Editar Pregunta' : 'Nueva Pregunta'}</h2>
          {error && <div className="bg-red-50 text-red-700 p-2 rounded mb-3 text-sm">{error}</div>}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pregunta</label>
              <input type="text" value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="Ej: ¿Cual es el sintoma principal?" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de respuesta</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 border rounded-lg">
                  <option value="text">Texto libre</option>
                  <option value="boolean">Si / No</option>
                  <option value="select">Seleccion (opciones)</option>
                  <option value="scale">Escala (1-10)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                <input type="number" min={1} value={form.order} onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            {form.type === 'select' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opciones (separadas por coma)</label>
                <input type="text" value={form.optionsText} onChange={e => setForm(p => ({ ...p, optionsText: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="Minutos, Horas, Dias" />
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">{editingId ? 'Guardar cambios' : 'Crear'}</button>
              <button onClick={handleCancel} className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 w-12">#</th>
              <th className="text-left px-4 py-3">Pregunta</th>
              <th className="text-left px-4 py-3">Tipo</th>
              <th className="text-left px-4 py-3">Opciones</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {questions.map(q => (
              <tr key={q.id} className="border-t">
                <td className="px-4 py-3 text-gray-400">{q.order}</td>
                <td className="px-4 py-3 font-medium">{q.question}</td>
                <td className="px-4 py-3 text-gray-600">{q.type}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{Array.isArray(q.options) ? q.options.join(', ') : '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${q.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {q.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => openEdit(q)} className="text-blue-600 text-sm hover:underline">Editar</button>
                    <button onClick={() => handleToggle(q.id)} className="text-gray-600 text-sm hover:underline">{q.isActive ? 'Desactivar' : 'Activar'}</button>
                    <button onClick={() => handleDelete(q.id)} className="text-red-600 text-sm hover:underline">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
