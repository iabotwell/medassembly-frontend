import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { patientService } from '../../services/patientService';
import { attentionService } from '../../services/attentionService';
import { emergencyService } from '../../services/emergencyService';
import { usePermissions } from '../../hooks/usePermissions';
import { Patient, Measurement } from '../../types';

const STATUS_LABELS: Record<string, string> = {
  WAITING_TRIAGE: 'Esperando Triage', WAITING_ATTENTION: 'Esperando Atencion',
  IN_ATTENTION: 'En Atencion', IN_OBSERVATION: 'En Observacion',
  IN_EMERGENCY: 'En Emergencia', DISCHARGED: 'Alta', REFERRED: 'Derivado',
};

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
  const [measurementData, setMeasurementData] = useState<Partial<Measurement>>({});
  const [dischargeNotes, setDischargeNotes] = useState('');
  const [showDischarge, setShowDischarge] = useState(false);

  useEffect(() => {
    if (id) {
      patientService.getDetail(id).then(p => { setPatient(p); setLoading(false); });
    }
  }, [id]);

  const handleStartAttention = async () => {
    if (!id) return;
    try {
      await attentionService.startAttention(id);
      navigate(`/patients/${id}/attend`);
    } catch { }
  };

  const handleAddMeasurement = async () => {
    const attention = patient?.attentions?.[0];
    if (!attention) return;
    try {
      await attentionService.addMeasurement(attention.id, measurementData);
      const updated = await patientService.getDetail(id!);
      setPatient(updated);
      setShowMeasurementForm(false);
      setMeasurementData({});
    } catch { }
  };

  const handleDischarge = async () => {
    const attention = patient?.attentions?.[0];
    if (!attention) return;
    try {
      await attentionService.discharge(attention.id, dischargeNotes);
      const updated = await patientService.getDetail(id!);
      setPatient(updated);
      setShowDischarge(false);
    } catch { }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Cargando...</div>;
  if (!patient) return <div className="text-center py-12 text-gray-500">Paciente no encontrado</div>;

  const latestAttention = patient.attentions?.[0];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{patient.fullName}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${patient.triageColor === 'RED' ? 'bg-red-100 text-red-800' : patient.triageColor === 'YELLOW' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
              {patient.triageColor || 'Sin Triage'}
            </span>
            <span className="text-sm text-gray-500">{STATUS_LABELS[patient.status]}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {(patient.status === 'WAITING_TRIAGE' || patient.status === 'WAITING_ATTENTION') && can('attentions:create') && (
            <button onClick={handleStartAttention} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Iniciar Atencion</button>
          )}
          {patient.status === 'IN_ATTENTION' && can('attentions:update') && (
            <Link to={`/patients/${id}/attend`} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Editar Atencion</Link>
          )}
          {patient.status === 'IN_ATTENTION' && can('discharge') && (
            <button onClick={() => setShowDischarge(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Dar de Alta</button>
          )}
        </div>
      </div>

      {/* Patient info */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-bold text-lg mb-4">Datos del Paciente</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div><span className="text-gray-500">Edad:</span> {patient.age} anos</div>
          <div><span className="text-gray-500">Sexo:</span> {patient.sex === 'M' ? 'Masculino' : 'Femenino'}</div>
          <div><span className="text-gray-500">Congregacion:</span> {patient.congregation?.name}</div>
          <div><span className="text-gray-500">Acompanante:</span> {patient.companionName} ({patient.companionPhone})</div>
          <div><span className="text-gray-500">Motivo:</span> {patient.reasonForVisit}</div>
          {patient.knownAllergies && <div><span className="text-gray-500">Alergias:</span> {patient.knownAllergies}</div>}
          {patient.currentMedications && <div><span className="text-gray-500">Medicamentos:</span> {patient.currentMedications}</div>}
          {patient.chronicConditions && <div><span className="text-gray-500">Condiciones cronicas:</span> {patient.chronicConditions}</div>}
          <div><span className="text-gray-500">Ingreso:</span> {new Date(patient.createdAt).toLocaleString('es-CL')}</div>
        </div>
      </div>

      {/* Triage */}
      {patient.triage && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">Triage</h2>
          {patient.triage.answers.map(a => (
            <div key={a.id} className="flex justify-between py-2 border-b last:border-0 text-sm">
              <span className="text-gray-600">{a.question.question}</span>
              <span className="font-medium">{a.answer}</span>
            </div>
          ))}
          {patient.triage.notes && <p className="mt-3 text-sm text-gray-600">Observaciones: {patient.triage.notes}</p>}
        </div>
      )}

      {/* Attention & Measurements */}
      {latestAttention && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Atencion - {latestAttention.attendedBy.name}</h2>
            {patient.status === 'IN_ATTENTION' && can('measurements:create') && (
              <button onClick={() => setShowMeasurementForm(!showMeasurementForm)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                + Medicion
              </button>
            )}
          </div>

          {latestAttention.presumptiveDiagnosis && <p className="text-sm mb-2"><strong>Diagnostico:</strong> {latestAttention.presumptiveDiagnosis}</p>}
          {latestAttention.treatment && <p className="text-sm mb-2"><strong>Tratamiento:</strong> {latestAttention.treatment}</p>}
          {latestAttention.medicationsGiven && <p className="text-sm mb-2"><strong>Medicamentos:</strong> {latestAttention.medicationsGiven}</p>}
          {latestAttention.doctorNotes && <p className="text-sm mb-2"><strong>Notas del doctor:</strong> {latestAttention.doctorNotes}</p>}

          {/* Measurement form */}
          {showMeasurementForm && (
            <div className="bg-gray-50 rounded-lg p-4 mt-4 space-y-3">
              <h3 className="font-medium text-sm">Nueva Medicion</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-gray-500">PA Sistolica</label>
                  <input type="number" onChange={e => setMeasurementData(prev => ({ ...prev, systolicBP: parseInt(e.target.value) || undefined }))} className="w-full px-2 py-1 border rounded text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">PA Diastolica</label>
                  <input type="number" onChange={e => setMeasurementData(prev => ({ ...prev, diastolicBP: parseInt(e.target.value) || undefined }))} className="w-full px-2 py-1 border rounded text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">FC (lpm)</label>
                  <input type="number" onChange={e => setMeasurementData(prev => ({ ...prev, heartRate: parseInt(e.target.value) || undefined }))} className="w-full px-2 py-1 border rounded text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">FR (rpm)</label>
                  <input type="number" onChange={e => setMeasurementData(prev => ({ ...prev, respiratoryRate: parseInt(e.target.value) || undefined }))} className="w-full px-2 py-1 border rounded text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Temp (C)</label>
                  <input type="number" step="0.1" onChange={e => setMeasurementData(prev => ({ ...prev, temperature: parseFloat(e.target.value) || undefined }))} className="w-full px-2 py-1 border rounded text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">SpO2 (%)</label>
                  <input type="number" onChange={e => setMeasurementData(prev => ({ ...prev, oxygenSaturation: parseInt(e.target.value) || undefined }))} className="w-full px-2 py-1 border rounded text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Glicemia</label>
                  <input type="number" onChange={e => setMeasurementData(prev => ({ ...prev, bloodGlucose: parseFloat(e.target.value) || undefined }))} className="w-full px-2 py-1 border rounded text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Glasgow</label>
                  <input type="number" min={3} max={15} onChange={e => setMeasurementData(prev => ({ ...prev, glasgowScore: parseInt(e.target.value) || undefined }))} className="w-full px-2 py-1 border rounded text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">Observacion</label>
                <input type="text" onChange={e => setMeasurementData(prev => ({ ...prev, observation: e.target.value }))} className="w-full px-2 py-1 border rounded text-sm" />
              </div>
              <button onClick={handleAddMeasurement} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Guardar Medicion</button>
            </div>
          )}

          {/* Measurements timeline */}
          {latestAttention.measurements.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium text-sm mb-2">Bitacora de Mediciones</h3>
              <div className="space-y-3">
                {latestAttention.measurements.map(m => (
                  <div key={m.id} className="bg-gray-50 rounded-lg p-3 text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{new Date(m.createdAt).toLocaleTimeString('es-CL')}</span>
                      <span className="text-gray-500">por {m.measuredBy.name}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {m.systolicBP && <span>PA: {m.systolicBP}/{m.diastolicBP}</span>}
                      {m.heartRate && <span>FC: {m.heartRate}</span>}
                      {m.respiratoryRate && <span>FR: {m.respiratoryRate}</span>}
                      {m.temperature && <span>T: {m.temperature}C</span>}
                      {m.oxygenSaturation && <span>SpO2: {m.oxygenSaturation}%</span>}
                      {m.bloodGlucose && <span>Glic: {m.bloodGlucose}</span>}
                      {m.glasgowScore && <span>Glasgow: {m.glasgowScore}</span>}
                    </div>
                    {m.observation && <p className="mt-1 text-gray-600">{m.observation}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Discharge modal */}
      {showDischarge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">Dar de Alta</h3>
            <textarea value={dischargeNotes} onChange={e => setDischargeNotes(e.target.value)} placeholder="Indicaciones de egreso..." rows={4} className="w-full px-3 py-2 border rounded-lg mb-4" />
            <div className="flex gap-2">
              <button onClick={() => setShowDischarge(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={handleDischarge} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Confirmar Alta</button>
            </div>
          </div>
        </div>
      )}

      {/* Emergencies */}
      {patient.emergencies && patient.emergencies.length > 0 && (
        <div className="bg-red-50 rounded-xl border border-red-200 p-6 mb-6">
          <h2 className="font-bold text-lg text-red-800 mb-4">Emergencias</h2>
          {patient.emergencies.map(em => (
            <div key={em.id} className="py-2 border-b border-red-200 last:border-0 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">{em.level.replace('_', ' ')}</span>
                <span className={em.resolved ? 'text-green-600' : 'text-red-600'}>{em.resolved ? 'Resuelta' : 'Activa'}</span>
              </div>
              {em.notes && <p className="text-gray-600 mt-1">{em.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
