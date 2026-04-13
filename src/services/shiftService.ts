import api from './api';

export const shiftService = {
  list: async () => { const { data } = await api.get('/shifts'); return data; },
  create: async (body: any) => { const { data } = await api.post('/shifts', body); return data; },
  update: async (id: string, body: any) => { const { data } = await api.put(`/shifts/${id}`, body); return data; },
  activate: async (id: string) => { const { data } = await api.patch(`/shifts/${id}/activate`); return data; },
  addMember: async (shiftId: string, body: { userId: string; role: string }) => { const { data } = await api.post(`/shifts/${shiftId}/members`, body); return data; },
  removeMember: async (shiftId: string, memberId: string) => { const { data } = await api.delete(`/shifts/${shiftId}/members/${memberId}`); return data; },
  getActive: async () => { const { data } = await api.get('/shifts/active'); return data; },
};
