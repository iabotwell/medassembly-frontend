import api from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  requestOtp: async (email: string): Promise<{ message: string; expiresInMinutes: number }> => {
    const { data } = await api.post('/auth/request-otp', { email });
    return data;
  },

  verifyOtp: async (email: string, code: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/verify-otp', { email, code });
    return data;
  },

  firebaseLogin: async (idToken: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/firebase', { idToken });
    return data;
  },

  getProfile: async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },
};
