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

const TYPE_LABELS: Record<string, string> = {
  text: 'Texto libre',
  boolean: 'Si / No',
  select: 'Seleccion',
  scale: 'Escala 1-10',
};

export default function TriageQuestionsPage() {
  const [questions, setQuestions] = useState<TriageQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await triageService.getQuestions(true);
      setQuestions(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar preguntas');
    } finally {
      setLoading(false);
    }
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
        setError('Debe ingresar al menos una opcion para preguntas tipo seleccion');
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

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Preguntas de Triage</h1>
          <p className="text-sm text-gray-500 mt-0.5">{questions.length} pregunta{questions.length !== 1 && 's'} configurada{questions.length !== 1 && 's'}</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md">
          <span>+</span> Nueva Pregunta
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <h2 className="font-bold text-gray-900 mb-4">{editingId ? 'Editar Pregunta' : 'Nueva Pregunta'}</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl mb-4 text-sm flex items-start gap-2">
              <span>⚠️</span><span>{error}</span>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Pregunta</label>
              <input type="text" value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Ej: ¿Cual es el sintoma principal?" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Tipo de respuesta</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="text">Texto libre</option>
                  <option value="boolean">Si / No</option>
                  <option value="select">Seleccion (opciones)</option>
                  <option value="scale">Escala (1-10)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Orden</label>
                <input type="number" min={1} value={form.order} onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
            {form.type === 'select' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Opciones (separadas por coma)</label>
                <input type="text" value={form.optionsText} onChange={e => setForm(p => ({ ...p, optionsText: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Minutos, Horas, Dias" />
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={handleCancel} className="sm:w-32 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">{editingId ? 'Guardar cambios' : 'Crear pregunta'}</button>
            </div>
          </div>
        </div>
      )}

      {questions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="text-5xl mb-3">❓</div>
          <p className="text-gray-500">No hay preguntas configuradas</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {questions.map(q => (
              <div key={q.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-400">#{q.order}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${q.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {q.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">{q.question}</h3>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                  <span className="px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">{TYPE_LABELS[q.type] || q.type}</span>
                  {Array.isArray(q.options) && q.options.length > 0 && (
                    <span className="text-gray-500 truncate">{q.options.join(', ')}</span>
                  )}
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button onClick={() => openEdit(q)} className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100">Editar</button>
                  <button onClick={() => handleToggle(q.id)} className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-100">
                    {q.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                  <button onClick={() => handleDelete(q.id)} className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-100">Eliminar</button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs w-12">#</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Pregunta</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Tipo</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Opciones</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 uppercase tracking-wide text-xs">Estado</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {questions.map(q => (
                    <tr key={q.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-gray-400 font-bold">{q.order}</td>
                      <td className="px-5 py-4 font-medium text-gray-900">{q.question}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{TYPE_LABELS[q.type] || q.type}</span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs max-w-xs truncate">{Array.isArray(q.options) ? q.options.join(', ') : '-'}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${q.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {q.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex gap-3 justify-end">
                          <button onClick={() => openEdit(q)} className="text-blue-600 text-sm hover:underline font-medium">Editar</button>
                          <button onClick={() => handleToggle(q.id)} className="text-gray-600 text-sm hover:underline font-medium">{q.isActive ? 'Desactivar' : 'Activar'}</button>
                          <button onClick={() => handleDelete(q.id)} className="text-red-600 text-sm hover:underline font-medium">Eliminar</button>
                        </div>
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
