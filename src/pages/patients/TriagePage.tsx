import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { triageService } from '../../services/triageService';
import { patientService } from '../../services/patientService';
import { TriageQuestion, Patient, TriageColor } from '../../types';

const COLOR_OPTIONS: { value: TriageColor; label: string; sublabel: string; bg: string; hover: string }[] = [
  { value: 'BLUE', label: 'Azul', sublabel: 'Leve', bg: 'bg-blue-500', hover: 'hover:border-blue-500' },
  { value: 'YELLOW', label: 'Amarillo', sublabel: 'Medio', bg: 'bg-yellow-500', hover: 'hover:border-yellow-500' },
  { value: 'RED', label: 'Rojo', sublabel: 'Grave', bg: 'bg-red-500', hover: 'hover:border-red-500' },
];

export default function TriagePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [questions, setQuestions] = useState<TriageQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [color, setColor] = useState<TriageColor>('BLUE');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      patientService.getDetail(id).then(setPatient);
      triageService.getQuestions().then(setQuestions);
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const answersList = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
      await triageService.performTriage(id, { color, notes, answers: answersList });
      navigate(`/patients/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al realizar triage');
    } finally {
      setLoading(false);
    }
  };

  if (!patient) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Triage</h1>
        <p className="text-sm text-gray-500 mt-0.5">Clasifique la prioridad del paciente</p>
      </div>

      {/* Patient card */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-4 sm:p-5 mb-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm">
            {patient.sex === 'M' ? '👨' : '👩'}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-gray-900">{patient.fullName}</h2>
            <p className="text-sm text-gray-600">{patient.age} anos • {patient.congregation?.name}</p>
            <p className="text-sm text-gray-700 mt-1"><strong>Motivo:</strong> {patient.reasonForVisit}</p>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Questions */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <header className="bg-gradient-to-r from-purple-50 to-purple-50/50 border-b border-gray-200 px-5 py-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <span>❓</span> Cuestionario de Triage
            </h2>
          </header>
          <div className="p-5 space-y-5">
            {questions.map(q => (
              <div key={q.id}>
                <label className="block text-sm font-semibold text-gray-800 mb-2">{q.order}. {q.question}</label>
                {q.type === 'boolean' ? (
                  <div className="grid grid-cols-2 gap-2">
                    {['Si', 'No'].map(opt => (
                      <button type="button" key={opt} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                        className={`py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${answers[q.id] === opt ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : q.type === 'select' ? (
                  <div className="flex flex-wrap gap-2">
                    {(q.options || []).map(opt => (
                      <button type="button" key={opt} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                        className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${answers[q.id] === opt ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : q.type === 'scale' ? (
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <button type="button" key={n} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: String(n) }))}
                        className={`aspect-square rounded-lg border-2 text-sm font-semibold transition-all ${answers[q.id] === String(n) ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input type="text" onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Classification */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <header className="bg-gradient-to-r from-amber-50 to-amber-50/50 border-b border-gray-200 px-5 py-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <span>🎯</span> Clasificacion de Prioridad
            </h2>
          </header>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {COLOR_OPTIONS.map(opt => (
                <button type="button" key={opt.value} onClick={() => setColor(opt.value)}
                  className={`relative py-4 rounded-xl border-2 transition-all ${color === opt.value ? `${opt.bg} text-white border-transparent shadow-lg` : `border-gray-200 ${opt.hover}`}`}>
                  <div className={`w-10 h-10 rounded-full ${opt.bg} mx-auto mb-2 ${color === opt.value ? 'ring-4 ring-white/30' : ''}`}></div>
                  <div className={`font-bold ${color === opt.value ? 'text-white' : 'text-gray-900'}`}>{opt.label}</div>
                  <div className={`text-xs ${color === opt.value ? 'text-white/80' : 'text-gray-500'}`}>{opt.sublabel}</div>
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Observaciones adicionales</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Observaciones del triage..." />
            </div>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-3">
          <button type="button" onClick={() => navigate(-1)} className="sm:w-32 px-6 py-3.5 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-semibold shadow-lg shadow-blue-600/20">
            {loading ? 'Guardando...' : '✓ Completar Triage'}
          </button>
        </div>
      </form>
    </div>
  );
}
