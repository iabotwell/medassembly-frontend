import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { patientService } from '../../services/patientService';
import { attentionService } from '../../services/attentionService';
import { emergencyService } from '../../services/emergencyService';
import { usePermissions } from '../../hooks/usePermissions';
import { useDialog } from '../../components/ui/Dialog';
import ContactActions from '../../components/ui/ContactActions';
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
  const { danger, alert: showAlert } = useDialog();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
  const [measurementData, setMeasurementData] = useState<Partial<Measurement>>({});
  const [dischargeNotes, setDischargeNotes] = useState('');
  const [showDischarge, setShowDischarge] = useState(false);
  const [editingMeasurementId, setEditingMeasurementId] = useState<string | null>(null);
  const [editMeasurementData, setEditMeasurementData] = useState<Partial<Measurement>>({});

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

  const handleDeletePatient = async () => {
    if (!id || !patient) return;
    const hasData = (patient.attentions?.length || 0) > 0 || (patient.emergencies?.length || 0) > 0;
    let force = false;
    if (hasData) {
      const ok = await danger({
        title: `Eliminar ${patient.fullName}?`,
        message: 'El paciente tiene atenciones o emergencias registradas.\n\nSe eliminaran TODOS sus datos: atenciones, mediciones, emergencias y triage.',
        confirmText: 'Eliminar todo',
      });
      if (!ok) return;
      force = true;
    } else {
      const ok = await danger({
        title: `Eliminar ${patient.fullName}?`,
        message: 'Esta accion es permanente y no se puede deshacer.',
      });
      if (!ok) return;
    }
    try {
      await patientService.remove(id, force);
      navigate('/patients');
    } catch (err: any) {
      await showAlert({ title: 'No se pudo eliminar', message: err.response?.data?.error || 'Error desconocido' });
    }
  };

  const handleDeleteAttention = async () => {
    const attention = patient?.attentions?.[0];
    if (!attention) return;
    const ok = await danger({
      title: 'Eliminar atencion?',
      message: 'Se eliminaran todas las mediciones y registros de insumos asociados.',
    });
    if (!ok) return;
    try {
      await attentionService.remove(attention.id);
      const updated = await patientService.getDetail(id!);
      setPatient(updated);
    } catch (err: any) {
      await showAlert({ title: 'No se pudo eliminar', message: err.response?.data?.error || 'Error desconocido' });
    }
  };

  const handleDeleteMeasurement = async (measurementId: string) => {
    const attention = patient?.attentions?.[0];
    if (!attention) return;
    const ok = await danger({ title: 'Eliminar medicion?', message: 'Esta accion es permanente.' });
    if (!ok) return;
    try {
      await attentionService.removeMeasurement(attention.id, measurementId);
      const updated = await patientService.getDetail(id!);
      setPatient(updated);
    } catch (err: any) {
      await showAlert({ title: 'No se pudo eliminar', message: err.response?.data?.error || 'Error desconocido' });
    }
  };

  const openEditMeasurement = (m: Measurement) => {
    setEditingMeasurementId(m.id);
    setEditMeasurementData({
      systolicBP: m.systolicBP,
      diastolicBP: m.diastolicBP,
      heartRate: m.heartRate,
      respiratoryRate: m.respiratoryRate,
      temperature: m.temperature,
      oxygenSaturation: m.oxygenSaturation,
      bloodGlucose: m.bloodGlucose,
      glasgowScore: m.glasgowScore,
      observation: m.observation,
    });
  };

  const handleSaveEditMeasurement = async () => {
    const attention = patient?.attentions?.[0];
    if (!attention || !editingMeasurementId) return;
    try {
      await attentionService.updateMeasurement(attention.id, editingMeasurementId, editMeasurementData);
      setEditingMeasurementId(null);
      setEditMeasurementData({});
      const updated = await patientService.getDetail(id!);
      setPatient(updated);
    } catch (err: any) {
      await showAlert({ title: 'No se pudo actualizar', message: err.response?.data?.error || 'Error desconocido' });
    }
  };

  const cancelEditMeasurement = () => {
    setEditingMeasurementId(null);
    setEditMeasurementData({});
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
      {/* Header — stacks on mobile, row on sm+ */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold break-words">{patient.fullName}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${patient.triageColor === 'RED' ? 'bg-red-100 text-red-800' : patient.triageColor === 'YELLOW' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
              {patient.triageColor || 'Sin Triage'}
            </span>
            <span className="text-sm text-gray-500">{STATUS_LABELS[patient.status]}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-shrink-0">
          {(patient.status === 'WAITING_TRIAGE' || patient.status === 'WAITING_ATTENTION') && can('attentions:create') && (
            <button onClick={handleStartAttention} className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 whitespace-nowrap">Iniciar Atencion</button>
          )}
          {patient.status === 'IN_ATTENTION' && can('attentions:update') && (
            <Link to={`/patients/${id}/attend`} className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 text-center whitespace-nowrap">Editar Atencion</Link>
          )}
          {patient.status === 'IN_ATTENTION' && can('discharge') && (
            <button onClick={() => setShowDischarge(true)} className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 whitespace-nowrap">Dar de Alta</button>
          )}
          {can('patients:update') && (
            <Link to={`/patients/${id}/edit`} className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 font-medium text-center">Editar</Link>
          )}
          {can('patients:delete') && (
            <button onClick={handleDeletePatient} className="flex-1 sm:flex-none px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm hover:bg-red-100 font-medium">Eliminar</button>
          )}
        </div>
      </div>

      {/* Patient info */}
      <div className="bg-white rounded-xl border p-4 sm:p-6 mb-6">
        <h2 className="font-bold text-lg mb-4">Datos del Paciente</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          <div className="break-words"><span className="text-gray-500">Edad:</span> {patient.age} anos</div>
          <div className="break-words"><span className="text-gray-500">Sexo:</span> {patient.sex === 'M' ? 'Masculino' : 'Femenino'}</div>
          <div className="break-words"><span className="text-gray-500">Congregacion:</span> {patient.congregation?.name}</div>
          {patient.phone && (
            <div className="flex items-center gap-2 flex-wrap">
              <span><span className="text-gray-500">Telefono:</span> {patient.phone}</span>
              <ContactActions phone={patient.phone} name={patient.fullName} />
            </div>
          )}
          <div className="break-words flex items-center gap-2 flex-wrap">
            <span><span className="text-gray-500">Acompanante:</span> {patient.companionName} ({patient.companionPhone})</span>
            <ContactActions phone={patient.companionPhone} name={patient.companionName} />
          </div>
          {patient.elderName && patient.elderPhone && (
            <div className="break-words flex items-center gap-2 flex-wrap">
              <span><span className="text-gray-500">Anciano:</span> {patient.elderName} ({patient.elderPhone})</span>
              <ContactActions phone={patient.elderPhone} name={patient.elderName} />
            </div>
          )}
          <div className="break-words sm:col-span-2 lg:col-span-1"><span className="text-gray-500">Motivo:</span> {patient.reasonForVisit}</div>
          {patient.knownAllergies && <div className="break-words"><span className="text-gray-500">Alergias:</span> {patient.knownAllergies}</div>}
          {patient.currentMedications && <div className="break-words"><span className="text-gray-500">Medicamentos:</span> {patient.currentMedications}</div>}
          {patient.chronicConditions && <div className="break-words"><span className="text-gray-500">Condiciones cronicas:</span> {patient.chronicConditions}</div>}
          <div className="break-words"><span className="text-gray-500">Ingreso:</span> {new Date(patient.createdAt).toLocaleString('es-CL')}</div>
        </div>
      </div>

      {/* Triage */}
      {patient.triage && (
        <div className="bg-white rounded-xl border p-4 sm:p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">Triage</h2>
          {patient.triage.answers.map(a => (
            <div key={a.id} className="flex flex-col sm:flex-row sm:justify-between py-2 border-b last:border-0 text-sm gap-1">
              <span className="text-gray-600 sm:flex-1">{a.question.question}</span>
              <span className="font-medium sm:text-right">{a.answer}</span>
            </div>
          ))}
          {patient.triage.notes && <p className="mt-3 text-sm text-gray-600 break-words">Observaciones: {patient.triage.notes}</p>}
        </div>
      )}

      {/* Attention & Measurements */}
      {latestAttention && (
        <div className="bg-white rounded-xl border p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <h2 className="font-bold text-lg break-words">Atencion - {latestAttention.attendedBy.name}</h2>
            <div className="flex gap-2 flex-wrap">
              {patient.status === 'IN_ATTENTION' && can('measurements:create') && (
                <button onClick={() => setShowMeasurementForm(!showMeasurementForm)} className="flex-1 sm:flex-none px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 whitespace-nowrap">
                  + Medicion
                </button>
              )}
              {can('attentions:update') && (
                <Link to={`/patients/${id}/attend`} className="flex-1 sm:flex-none px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 text-center">Editar</Link>
              )}
              {can('attentions:delete') && (
                <button onClick={handleDeleteAttention} className="flex-1 sm:flex-none px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm hover:bg-red-100 whitespace-nowrap">Eliminar</button>
              )}
            </div>
          </div>

          {latestAttention.presumptiveDiagnosis && <p className="text-sm mb-2 break-words"><strong>Diagnostico:</strong> {latestAttention.presumptiveDiagnosis}</p>}
          {latestAttention.treatment && <p className="text-sm mb-2 break-words"><strong>Tratamiento:</strong> {latestAttention.treatment}</p>}
          {latestAttention.medicationsGiven && <p className="text-sm mb-2 break-words"><strong>Medicamentos:</strong> {latestAttention.medicationsGiven}</p>}
          {latestAttention.doctorNotes && <p className="text-sm mb-2 break-words"><strong>Notas del doctor:</strong> {latestAttention.doctorNotes}</p>}

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
                    <div className="flex justify-between mb-1 items-center gap-2">
                      <div>
                        <span className="font-medium">{new Date(m.createdAt).toLocaleTimeString('es-CL')}</span>
                        <span className="text-gray-500 ml-2">por {m.measuredBy.name}</span>
                      </div>
                      {editingMeasurementId !== m.id && (
                        <div className="flex gap-2">
                          {can('measurements:update') && (
                            <button onClick={() => openEditMeasurement(m)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Editar</button>
                          )}
                          {can('measurements:delete') && (
                            <button onClick={() => handleDeleteMeasurement(m.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Eliminar</button>
                          )}
                        </div>
                      )}
                    </div>
                    {editingMeasurementId === m.id ? (
                      <div className="mt-2 bg-white rounded-lg p-3 border border-blue-200 space-y-2">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div><label className="text-xs text-gray-500">PA Sistolica</label><input type="number" value={editMeasurementData.systolicBP ?? ''} onChange={e => setEditMeasurementData(p => ({ ...p, systolicBP: e.target.value ? parseInt(e.target.value) : undefined }))} className="w-full px-2 py-1 border rounded text-xs" /></div>
                          <div><label className="text-xs text-gray-500">PA Diastolica</label><input type="number" value={editMeasurementData.diastolicBP ?? ''} onChange={e => setEditMeasurementData(p => ({ ...p, diastolicBP: e.target.value ? parseInt(e.target.value) : undefined }))} className="w-full px-2 py-1 border rounded text-xs" /></div>
                          <div><label className="text-xs text-gray-500">FC</label><input type="number" value={editMeasurementData.heartRate ?? ''} onChange={e => setEditMeasurementData(p => ({ ...p, heartRate: e.target.value ? parseInt(e.target.value) : undefined }))} className="w-full px-2 py-1 border rounded text-xs" /></div>
                          <div><label className="text-xs text-gray-500">FR</label><input type="number" value={editMeasurementData.respiratoryRate ?? ''} onChange={e => setEditMeasurementData(p => ({ ...p, respiratoryRate: e.target.value ? parseInt(e.target.value) : undefined }))} className="w-full px-2 py-1 border rounded text-xs" /></div>
                          <div><label className="text-xs text-gray-500">Temp</label><input type="number" step="0.1" value={editMeasurementData.temperature ?? ''} onChange={e => setEditMeasurementData(p => ({ ...p, temperature: e.target.value ? parseFloat(e.target.value) : undefined }))} className="w-full px-2 py-1 border rounded text-xs" /></div>
                          <div><label className="text-xs text-gray-500">SpO2</label><input type="number" value={editMeasurementData.oxygenSaturation ?? ''} onChange={e => setEditMeasurementData(p => ({ ...p, oxygenSaturation: e.target.value ? parseInt(e.target.value) : undefined }))} className="w-full px-2 py-1 border rounded text-xs" /></div>
                          <div><label className="text-xs text-gray-500">Glicemia</label><input type="number" step="0.1" value={editMeasurementData.bloodGlucose ?? ''} onChange={e => setEditMeasurementData(p => ({ ...p, bloodGlucose: e.target.value ? parseFloat(e.target.value) : undefined }))} className="w-full px-2 py-1 border rounded text-xs" /></div>
                          <div><label className="text-xs text-gray-500">Glasgow</label><input type="number" min={3} max={15} value={editMeasurementData.glasgowScore ?? ''} onChange={e => setEditMeasurementData(p => ({ ...p, glasgowScore: e.target.value ? parseInt(e.target.value) : undefined }))} className="w-full px-2 py-1 border rounded text-xs" /></div>
                        </div>
                        <input type="text" value={editMeasurementData.observation ?? ''} onChange={e => setEditMeasurementData(p => ({ ...p, observation: e.target.value }))} placeholder="Observacion" className="w-full px-2 py-1 border rounded text-xs" />
                        <div className="flex gap-2">
                          <button onClick={cancelEditMeasurement} className="px-3 py-1 border rounded text-xs font-medium">Cancelar</button>
                          <button onClick={handleSaveEditMeasurement} className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold">Guardar cambios</button>
                        </div>
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Discharge modal */}
      {showDischarge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-5 sm:p-6 w-full max-w-md my-8">
            <h3 className="text-lg font-bold mb-4">Dar de Alta</h3>
            <textarea value={dischargeNotes} onChange={e => setDischargeNotes(e.target.value)} placeholder="Indicaciones de egreso..." rows={4} className="w-full px-3 py-2 border rounded-lg mb-4 text-sm" />
            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={() => setShowDischarge(false)} className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 text-sm font-medium">Cancelar</button>
              <button onClick={handleDischarge} className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold">Confirmar Alta</button>
            </div>
          </div>
        </div>
      )}

      {/* Emergencies */}
      {patient.emergencies && patient.emergencies.length > 0 && (
        <div className="bg-red-50 rounded-xl border border-red-200 p-4 sm:p-6 mb-6">
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
