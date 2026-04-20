import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { patientService } from '../../services/patientService';
import api from '../../services/api';
import { Congregation, Elder } from '../../types';

const CHRONIC_OPTIONS = ['Diabetes', 'Hipertension', 'Asma', 'Cardiopatia', 'Epilepsia', 'Cancer', 'Otro'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const isEdit = !!editId;
  const [congregations, setCongregations] = useState<Congregation[]>([]);
  const [elders, setElders] = useState<Elder[]>([]);
  const [elderSelection, setElderSelection] = useState<string>('');
  const [saveElder, setSaveElder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chronicSelected, setChronicSelected] = useState<Set<string>>(new Set());
  const [chronicOther, setChronicOther] = useState('');
  const [form, setForm] = useState({
    fullName: '', documentId: '', phone: '', age: '', sex: 'M', congregationId: '',
    companionName: '', companionPhone: '', elderName: '', elderPhone: '',
    reasonForVisit: '', knownAllergies: '', currentMedications: '', chronicConditions: '',
  });

  useEffect(() => {
    api.get('/congregations').then(({ data }) => setCongregations(data));
  }, []);

  useEffect(() => {
    if (!editId) return;
    patientService.getDetail(editId).then(p => {
      setForm({
        fullName: p.fullName || '',
        documentId: p.documentId || '',
        phone: p.phone || '',
        age: String(p.age || ''),
        sex: p.sex || 'M',
        congregationId: p.congregationId || '',
        companionName: p.companionName || '',
        companionPhone: p.companionPhone || '',
        elderName: p.elderName || '',
        elderPhone: p.elderPhone || '',
        reasonForVisit: p.reasonForVisit || '',
        knownAllergies: p.knownAllergies || '',
        currentMedications: p.currentMedications || '',
        chronicConditions: p.chronicConditions || '',
      });
      // Parse chronicConditions back to Set
      if (p.chronicConditions) {
        const parts = p.chronicConditions.split(',').map((s: string) => s.trim()).filter(Boolean);
        const known = new Set<string>();
        const others: string[] = [];
        parts.forEach((part: string) => {
          if (CHRONIC_OPTIONS.includes(part)) known.add(part);
          else others.push(part);
        });
        if (others.length) { known.add('Otro'); setChronicOther(others.join(', ')); }
        setChronicSelected(known);
      }
    }).catch(() => setError('No se pudo cargar el paciente'));
  }, [editId]);

  useEffect(() => {
    if (form.congregationId) {
      api.get(`/congregations/${form.congregationId}/elders`).then(({ data }) => setElders(data));
      setElderSelection('');
      setForm(prev => ({ ...prev, elderName: '', elderPhone: '' }));
    }
  }, [form.congregationId]);

  const handleElderSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setElderSelection(value);
    if (value === 'OTRO' || value === '') {
      setForm(prev => ({ ...prev, elderName: '', elderPhone: '' }));
    } else {
      const elder = elders.find(el => el.id === value);
      if (elder) {
        setForm(prev => ({ ...prev, elderName: elder.name, elderPhone: elder.phone }));
      }
    }
  };

  const toggleChronic = (option: string) => {
    const next = new Set(chronicSelected);
    if (next.has(option)) next.delete(option); else next.add(option);
    setChronicSelected(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const chronicList = Array.from(chronicSelected).filter(c => c !== 'Otro');
      if (chronicSelected.has('Otro') && chronicOther.trim()) chronicList.push(chronicOther.trim());
      const chronicConditions = chronicList.join(', ');

      if (elderSelection === 'OTRO' && saveElder && form.congregationId && form.elderName && form.elderPhone) {
        try {
          await api.post(`/congregations/${form.congregationId}/elders`, {
            name: form.elderName,
            phone: form.elderPhone,
          });
        } catch { }
      }
      const payload = { ...form, age: parseInt(form.age), chronicConditions };
      const patient = isEdit
        ? await patientService.update(editId!, payload)
        : await patientService.create(payload);
      navigate(`/patients/${patient.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || (isEdit ? 'Error al actualizar paciente' : 'Error al registrar paciente'));
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const inputCls = "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";
  const labelCls = "block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar Paciente' : 'Registrar Paciente'}</h1>
        <p className="text-sm text-gray-500 mt-1">{isEdit ? 'Modifique los datos del paciente' : 'Complete los datos del paciente para iniciar el flujo de atencion'}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-4 flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <span className="text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Sección 1: Datos personales */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <header className="bg-gradient-to-r from-blue-50 to-blue-50/50 border-b border-gray-200 px-6 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">1</div>
            <div>
              <h2 className="font-semibold text-gray-900">Datos Personales</h2>
              <p className="text-xs text-gray-500">Identificacion del paciente</p>
            </div>
          </header>
          <div className="p-6 grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-4">
              <label className={labelCls}>Nombre completo *</label>
              <input type="text" required value={form.fullName} onChange={e => updateField('fullName', e.target.value)} className={inputCls} placeholder="Juan Perez Gonzalez" />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>RUT / Documento ID</label>
              <input type="text" value={form.documentId} onChange={e => updateField('documentId', e.target.value)} className={inputCls} placeholder="12.345.678-9" />
            </div>
            <div className="md:col-span-3">
              <label className={labelCls}>Telefono del paciente</label>
              <input type="tel" value={form.phone} onChange={e => updateField('phone', e.target.value)} className={inputCls} placeholder="+56 9 1234 5678" />
            </div>
            <div className="md:col-span-3">
              <label className={labelCls}>Edad *</label>
              <div className="relative">
                <input type="number" required min={0} max={150} value={form.age} onChange={e => updateField('age', e.target.value)} className={inputCls} placeholder="0" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">anos</span>
              </div>
            </div>
            <div className="md:col-span-6">
              <label className={labelCls}>Sexo *</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => updateField('sex', 'M')}
                  className={`py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${form.sex === 'M' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  👨 Masculino
                </button>
                <button type="button" onClick={() => updateField('sex', 'F')}
                  className={`py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${form.sex === 'F' ? 'border-pink-600 bg-pink-50 text-pink-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  👩 Femenino
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 2: Congregación y contactos */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <header className="bg-gradient-to-r from-purple-50 to-purple-50/50 border-b border-gray-200 px-6 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm">2</div>
            <div>
              <h2 className="font-semibold text-gray-900">Congregacion y Contactos</h2>
              <p className="text-xs text-gray-500">Informacion de la congregacion y persona de contacto</p>
            </div>
          </header>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Congregacion *</label>
                <select required value={form.congregationId} onChange={e => updateField('congregationId', e.target.value)} className={inputCls}>
                  <option value="">Seleccionar congregacion...</option>
                  {congregations.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Anciano de congregacion</label>
                <select value={elderSelection} onChange={handleElderSelect} disabled={!form.congregationId} className={`${inputCls} disabled:bg-gray-50 disabled:text-gray-400`}>
                  <option value="">{form.congregationId ? 'Seleccionar anciano...' : 'Seleccione primero una congregacion'}</option>
                  {elders.map(el => <option key={el.id} value={el.id}>{el.name} - {el.phone}</option>)}
                  {form.congregationId && <option value="OTRO">+ Otro (ingresar manualmente)</option>}
                </select>
              </div>
            </div>

            {elderSelection === 'OTRO' && (
              <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-blue-900 font-semibold">
                  <span>✍️</span>
                  <span>Ingresar datos del anciano manualmente</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Nombre</label>
                    <input type="text" value={form.elderName} onChange={e => updateField('elderName', e.target.value)} className={inputCls} placeholder="Nombre del anciano" />
                  </div>
                  <div>
                    <label className={labelCls}>Telefono</label>
                    <input type="tel" value={form.elderPhone} onChange={e => updateField('elderPhone', e.target.value)} className={inputCls} placeholder="+56 9 1234 5678" />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-blue-900 cursor-pointer select-none">
                  <input type="checkbox" checked={saveElder} onChange={e => setSaveElder(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                  <span>Guardar este anciano en la congregacion para futuros registros</span>
                </label>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">👤 Acompanante del paciente</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nombre del acompanante *</label>
                  <input type="text" required value={form.companionName} onChange={e => updateField('companionName', e.target.value)} className={inputCls} placeholder="Nombre completo" />
                </div>
                <div>
                  <label className={labelCls}>Telefono *</label>
                  <input type="tel" required value={form.companionPhone} onChange={e => updateField('companionPhone', e.target.value)} className={inputCls} placeholder="+56 9 1234 5678" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 3: Motivo */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <header className="bg-gradient-to-r from-amber-50 to-amber-50/50 border-b border-gray-200 px-6 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-sm">3</div>
            <div>
              <h2 className="font-semibold text-gray-900">Motivo de Atencion</h2>
              <p className="text-xs text-gray-500">Describa por que el paciente solicita atencion</p>
            </div>
          </header>
          <div className="p-6">
            <textarea required value={form.reasonForVisit} onChange={e => updateField('reasonForVisit', e.target.value)} rows={3} className={inputCls} placeholder="Ej: Dolor de cabeza intenso desde hace 2 horas, mareo, nauseas..." />
          </div>
        </section>

        {/* Sección 4: Antecedentes */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <header className="bg-gradient-to-r from-rose-50 to-rose-50/50 border-b border-gray-200 px-6 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-sm">4</div>
            <div>
              <h2 className="font-semibold text-gray-900">Antecedentes Medicos</h2>
              <p className="text-xs text-gray-500">Informacion relevante para el tratamiento (opcional)</p>
            </div>
          </header>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>🚨 Alergias conocidas</label>
                <input type="text" value={form.knownAllergies} onChange={e => updateField('knownAllergies', e.target.value)} className={inputCls} placeholder="Penicilina, aspirina, latex..." />
              </div>
              <div>
                <label className={labelCls}>💊 Medicamentos actuales</label>
                <input type="text" value={form.currentMedications} onChange={e => updateField('currentMedications', e.target.value)} className={inputCls} placeholder="Que medicamentos toma regularmente" />
              </div>
            </div>

            <div>
              <label className={labelCls}>⚕️ Condiciones cronicas</label>
              <div className="flex flex-wrap gap-2">
                {CHRONIC_OPTIONS.map(option => (
                  <button type="button" key={option} onClick={() => toggleChronic(option)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                      chronicSelected.has(option)
                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}>
                    {chronicSelected.has(option) && '✓ '}{option}
                  </button>
                ))}
              </div>
              {chronicSelected.has('Otro') && (
                <input
                  type="text"
                  value={chronicOther}
                  onChange={e => setChronicOther(e.target.value)}
                  placeholder="Especifique otra condicion..."
                  className={`${inputCls} mt-3`}
                />
              )}
            </div>
          </div>
        </section>

        {/* Botón de acción */}
        <div className="flex flex-col md:flex-row gap-3 pt-2 pb-6">
          <button type="button" onClick={() => navigate(-1)} className="md:w-32 px-6 py-3.5 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-blue-600/20 transition-all">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                {isEdit ? 'Guardando...' : 'Registrando...'}
              </span>
            ) : (isEdit ? '✓ Guardar cambios' : '✓ Registrar Paciente')}
          </button>
        </div>
      </form>
    </div>
  );
}
