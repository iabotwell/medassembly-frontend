import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attentionService } from '../../services/attentionService';
import { patientService } from '../../services/patientService';
import { Patient } from '../../types';

type VitalsState = {
  systolicBP: string;
  diastolicBP: string;
  heartRate: string;
  respiratoryRate: string;
  temperature: string;
  oxygenSaturation: string;
  bloodGlucose: string;
  glasgowScore: string;
  observation: string;
};

const EMPTY_VITALS: VitalsState = {
  systolicBP: '', diastolicBP: '', heartRate: '', respiratoryRate: '',
  temperature: '', oxygenSaturation: '', bloodGlucose: '', glasgowScore: '', observation: '',
};

export default function AttentionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState({ presumptiveDiagnosis: '', treatment: '', medicationsGiven: '' });
  const [vitals, setVitals] = useState<VitalsState>(EMPTY_VITALS);
  const [hasInitialMeasurement, setHasInitialMeasurement] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      patientService.getDetail(id).then(p => {
        setPatient(p);
        const att = p?.attentions?.[0];
        if (att) {
          setForm({
            presumptiveDiagnosis: att.presumptiveDiagnosis || '',
            treatment: att.treatment || '',
            medicationsGiven: att.medicationsGiven || '',
          });
          setHasInitialMeasurement((att.measurements?.length || 0) > 0);
        }
      });
    }
  }, [id]);

  const updateVital = (field: keyof VitalsState, value: string) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  const buildMeasurementPayload = () => {
    const payload: Record<string, any> = {};
    if (vitals.systolicBP) payload.systolicBP = parseInt(vitals.systolicBP);
    if (vitals.diastolicBP) payload.diastolicBP = parseInt(vitals.diastolicBP);
    if (vitals.heartRate) payload.heartRate = parseInt(vitals.heartRate);
    if (vitals.respiratoryRate) payload.respiratoryRate = parseInt(vitals.respiratoryRate);
    if (vitals.temperature) payload.temperature = parseFloat(vitals.temperature);
    if (vitals.oxygenSaturation) payload.oxygenSaturation = parseInt(vitals.oxygenSaturation);
    if (vitals.bloodGlucose) payload.bloodGlucose = parseFloat(vitals.bloodGlucose);
    if (vitals.glasgowScore) payload.glasgowScore = parseInt(vitals.glasgowScore);
    if (vitals.observation) payload.observation = vitals.observation;
    return payload;
  };

  const handleSave = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      let attention = patient?.attentions?.[0];
      if (!attention || patient?.status === 'WAITING_ATTENTION') {
        attention = await attentionService.startAttention(id);
      }
      await attentionService.update(attention!.id, form);

      const measurementPayload = buildMeasurementPayload();
      if (Object.keys(measurementPayload).length > 0) {
        await attentionService.addMeasurement(attention!.id, measurementPayload);
      }

      navigate(`/patients/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar la atencion');
    }
    setLoading(false);
  };

  if (!patient) return <div className="text-center py-12 text-gray-500">Cargando...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Atencion Medica</h1>
      <p className="text-gray-600 mb-6">Paciente: <strong>{patient.fullName}</strong> - {patient.age} anos - {patient.sex}</p>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

      <div className="bg-white rounded-xl border p-6 space-y-6">
        {/* Patient summary */}
        <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
          <p><strong>Motivo:</strong> {patient.reasonForVisit}</p>
          {patient.triage && <p><strong>Triage:</strong> <span className={`font-medium ${patient.triageColor === 'RED' ? 'text-red-600' : patient.triageColor === 'YELLOW' ? 'text-yellow-600' : 'text-blue-600'}`}>{patient.triageColor}</span></p>}
          {patient.knownAllergies && <p className="text-red-600"><strong>Alergias:</strong> {patient.knownAllergies}</p>}
          {patient.currentMedications && <p><strong>Medicamentos actuales:</strong> {patient.currentMedications}</p>}
          {patient.chronicConditions && <p><strong>Condiciones cronicas:</strong> {patient.chronicConditions}</p>}
        </div>

        {/* Vital signs */}
        <div>
          <h2 className="font-bold text-lg mb-3">Signos Vitales {hasInitialMeasurement && <span className="text-xs text-gray-500 font-normal">(se agregara una nueva medicion a la bitacora)</span>}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">PA Sistolica (mmHg)</label>
              <input type="number" value={vitals.systolicBP} onChange={e => updateVital('systolicBP', e.target.value)} className="w-full px-2 py-2 border rounded-lg text-sm" placeholder="120" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">PA Diastolica (mmHg)</label>
              <input type="number" value={vitals.diastolicBP} onChange={e => updateVital('diastolicBP', e.target.value)} className="w-full px-2 py-2 border rounded-lg text-sm" placeholder="80" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Frec. Cardiaca (lpm)</label>
              <input type="number" value={vitals.heartRate} onChange={e => updateVital('heartRate', e.target.value)} className="w-full px-2 py-2 border rounded-lg text-sm" placeholder="75" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Frec. Respiratoria (rpm)</label>
              <input type="number" value={vitals.respiratoryRate} onChange={e => updateVital('respiratoryRate', e.target.value)} className="w-full px-2 py-2 border rounded-lg text-sm" placeholder="16" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Temperatura (°C)</label>
              <input type="number" step="0.1" value={vitals.temperature} onChange={e => updateVital('temperature', e.target.value)} className="w-full px-2 py-2 border rounded-lg text-sm" placeholder="36.5" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Saturacion O₂ (%)</label>
              <input type="number" value={vitals.oxygenSaturation} onChange={e => updateVital('oxygenSaturation', e.target.value)} className="w-full px-2 py-2 border rounded-lg text-sm" placeholder="98" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Glicemia (mg/dL)</label>
              <input type="number" step="0.1" value={vitals.bloodGlucose} onChange={e => updateVital('bloodGlucose', e.target.value)} className="w-full px-2 py-2 border rounded-lg text-sm" placeholder="90" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Glasgow (3-15)</label>
              <input type="number" min={3} max={15} value={vitals.glasgowScore} onChange={e => updateVital('glasgowScore', e.target.value)} className="w-full px-2 py-2 border rounded-lg text-sm" placeholder="15" />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-xs text-gray-600 mb-1">Observacion clinica</label>
            <input type="text" value={vitals.observation} onChange={e => updateVital('observation', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Ej: paciente consciente, orientado, sin dolor toracico" />
          </div>
        </div>

        {/* Diagnosis and treatment */}
        <div className="space-y-4 pt-4 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diagnostico presuntivo</label>
            <textarea value={form.presumptiveDiagnosis} onChange={e => setForm(prev => ({ ...prev, presumptiveDiagnosis: e.target.value }))} rows={2} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tratamiento aplicado</label>
            <textarea value={form.treatment} onChange={e => setForm(prev => ({ ...prev, treatment: e.target.value }))} rows={3} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medicamentos administrados</label>
            <input type="text" value={form.medicationsGiven} onChange={e => setForm(prev => ({ ...prev, medicationsGiven: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="Medicamento + dosis" />
          </div>
        </div>

        <button onClick={handleSave} disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
          {loading ? 'Guardando...' : 'Guardar Atencion'}
        </button>
      </div>
    </div>
  );
}
