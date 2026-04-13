export type Role = 'ADMIN' | 'ENCARGADO' | 'DOCTOR' | 'ASISTENTE' | 'CAMILLERO' | 'CONSULTA';
export type PatientStatus = 'WAITING_TRIAGE' | 'WAITING_ATTENTION' | 'IN_ATTENTION' | 'IN_OBSERVATION' | 'IN_EMERGENCY' | 'DISCHARGED' | 'REFERRED';
export type TriageColor = 'BLUE' | 'YELLOW' | 'RED';
export type EmergencyLevel = 'SOS_DOCTOR' | 'EMERGENCY_VEHICLE' | 'TRANSFER' | 'AMBULANCE';
export type ContactType = 'DOCTOR_GUARDIA' | 'AUXILIAR_SALUD' | 'CAMILLERO' | 'AMBULANCIA' | 'CENTRO_ASISTENCIAL' | 'AUTO_EMERGENCIA' | 'OTRO';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Event {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Congregation {
  id: string;
  name: string;
  circuit?: string;
  city?: string;
  _count?: { elders: number };
}

export interface Elder {
  id: string;
  name: string;
  phone: string;
  role?: string;
  congregationId: string;
}

export interface Patient {
  id: string;
  eventId: string;
  fullName: string;
  documentId?: string;
  age: number;
  sex: string;
  congregationId: string;
  congregation: Congregation;
  companionName: string;
  companionPhone: string;
  elderName?: string;
  elderPhone?: string;
  reasonForVisit: string;
  knownAllergies?: string;
  currentMedications?: string;
  chronicConditions?: string;
  status: PatientStatus;
  triageColor?: TriageColor;
  createdAt: string;
  updatedAt: string;
  triage?: Triage;
  attentions?: Attention[];
  emergencies?: Emergency[];
}

export interface TriageQuestion {
  id: string;
  question: string;
  type: string;
  options?: string[];
  order: number;
  isActive: boolean;
}

export interface Triage {
  id: string;
  patientId: string;
  color: TriageColor;
  notes?: string;
  performedBy: string;
  createdAt: string;
  answers: TriageAnswer[];
}

export interface TriageAnswer {
  id: string;
  questionId: string;
  answer: string;
  question: TriageQuestion;
}

export interface Attention {
  id: string;
  patientId: string;
  attendedById: string;
  attendedBy: { id: string; name: string; role: string };
  presumptiveDiagnosis?: string;
  treatment?: string;
  medicationsGiven?: string;
  doctorNotes?: string;
  dischargeNotes?: string;
  dischargedAt?: string;
  dischargedBy?: string;
  createdAt: string;
  measurements: Measurement[];
  suppliesUsed: AttentionSupply[];
}

export interface Measurement {
  id: string;
  attentionId: string;
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  bloodGlucose?: number;
  glasgowScore?: number;
  observation?: string;
  measuredBy: { id: string; name: string };
  createdAt: string;
}

export interface Supply {
  id: string;
  name: string;
  category?: string;
  unit?: string;
  isActive: boolean;
}

export interface AttentionSupply {
  id: string;
  supplyId: string;
  supply: Supply;
  quantity: number;
  notes?: string;
}

export interface Emergency {
  id: string;
  patientId: string;
  patient: { id: string; fullName: string; triageColor?: TriageColor; status?: PatientStatus };
  level: EmergencyLevel;
  authorizedBy: { id: string; name: string };
  notes?: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedNotes?: string;
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  type: ContactType;
  name: string;
  phone: string;
  details?: string;
  isActive: boolean;
}

export interface Shift {
  id: string;
  eventId: string;
  date: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  members: ShiftMember[];
}

export interface ShiftMember {
  id: string;
  userId: string;
  user: { id: string; name: string; role: string; phone?: string };
  role: Role;
}

export interface WhatsAppTemplate {
  id: string;
  eventType: string;
  template: string;
  isActive: boolean;
}

export interface DashboardData {
  event: Event;
  activeCounts: { blue: number; yellow: number; red: number };
  queue: Patient[];
  activeAttentions: Patient[];
  activeEmergencies: Emergency[];
  activeShift: Shift | null;
  waitingTriage: number;
}
