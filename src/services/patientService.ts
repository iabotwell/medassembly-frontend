import api from './api';

export const patientService = {
  list: async (params?: Record<string, string>) => {
    const { data } = await api.get('/patients', { params });
    return data;
  },
  create: async (body: any) => {
    const { data } = await api.post('/patients', body);
    return data;
  },
  getDetail: async (id: string) => {
    const { data } = await api.get(`/patients/${id}`);
    return data;
  },
  updateStatus: async (id: string, status: string) => {
    const { data } = await api.patch(`/patients/${id}/status`, { status });
    return data;
  },
  getQueue: async () => {
    const { data } = await api.get('/patients/queue');
    return data;
  },
};
