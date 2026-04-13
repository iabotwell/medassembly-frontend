import api from './api';

export const emergencyService = {
  activate: async (patientId: string, body: { level: string; notes?: string }) => {
    const { data } = await api.post(`/emergencies/patients/${patientId}`, body);
    return data;
  },
  resolve: async (id: string, resolvedNotes?: string) => {
    const { data } = await api.patch(`/emergencies/${id}/resolve`, { resolvedNotes });
    return data;
  },
  listActive: async () => {
    const { data } = await api.get('/emergencies');
    return data;
  },
};
