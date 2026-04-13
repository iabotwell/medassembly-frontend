import api from './api';

export const triageService = {
  getQuestions: async (includeInactive = false) => {
    const { data } = await api.get('/triage/questions', { params: includeInactive ? { all: 'true' } : {} });
    return data;
  },
  deleteQuestion: async (id: string) => {
    const { data } = await api.delete(`/triage/questions/${id}`);
    return data;
  },
  performTriage: async (patientId: string, body: any) => {
    const { data } = await api.post(`/triage/patients/${patientId}`, body);
    return data;
  },
  updateTriage: async (patientId: string, body: any) => {
    const { data } = await api.put(`/triage/patients/${patientId}`, body);
    return data;
  },
  createQuestion: async (body: any) => {
    const { data } = await api.post('/triage/questions', body);
    return data;
  },
  updateQuestion: async (id: string, body: any) => {
    const { data } = await api.put(`/triage/questions/${id}`, body);
    return data;
  },
  toggleQuestion: async (id: string) => {
    const { data } = await api.patch(`/triage/questions/${id}/toggle`);
    return data;
  },
};
