import api from './api';

export const reportService = {
  dashboard: async () => { const { data } = await api.get('/reports/dashboard'); return data; },
  shiftReport: async (shiftId: string) => { const { data } = await api.get(`/reports/shift/${shiftId}`); return data; },
  eventReport: async (eventId: string) => { const { data } = await api.get(`/reports/event/${eventId}`); return data; },
  patientReport: async (patientId: string) => { const { data } = await api.get(`/reports/patient/${patientId}`); return data; },
  suppliesReport: async (eventId: string) => { const { data } = await api.get(`/reports/supplies/${eventId}`); return data; },
  teamReport: async (eventId: string) => { const { data } = await api.get(`/reports/team/${eventId}`); return data; },
};
