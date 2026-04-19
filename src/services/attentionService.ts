import api from './api';

export const attentionService = {
  startAttention: async (patientId: string) => {
    const { data } = await api.post(`/attentions/patients/${patientId}`);
    return data;
  },
  update: async (id: string, body: any) => {
    const { data } = await api.put(`/attentions/${id}`, body);
    return data;
  },
  addDoctorNotes: async (id: string, doctorNotes: string) => {
    const { data } = await api.patch(`/attentions/${id}/doctor-notes`, { doctorNotes });
    return data;
  },
  discharge: async (id: string, dischargeNotes: string) => {
    const { data } = await api.patch(`/attentions/${id}/discharge`, { dischargeNotes });
    return data;
  },
  addSupply: async (attentionId: string, body: { supplyId: string; quantity: number; notes?: string }) => {
    const { data } = await api.post(`/attentions/${attentionId}/supplies`, body);
    return data;
  },
  getMeasurements: async (attentionId: string) => {
    const { data } = await api.get(`/attentions/${attentionId}/measurements`);
    return data;
  },
  addMeasurement: async (attentionId: string, body: any) => {
    const { data } = await api.post(`/attentions/${attentionId}/measurements`, body);
    return data;
  },
  remove: async (id: string) => {
    const { data } = await api.delete(`/attentions/${id}`);
    return data;
  },
  removeMeasurement: async (attentionId: string, measurementId: string) => {
    const { data } = await api.delete(`/attentions/${attentionId}/measurements/${measurementId}`);
    return data;
  },
  updateMeasurement: async (attentionId: string, measurementId: string, body: any) => {
    const { data } = await api.put(`/attentions/${attentionId}/measurements/${measurementId}`, body);
    return data;
  },
};
