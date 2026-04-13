import api from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  // Login directo con email + password
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  // Alternativa: solicitar OTP por correo
  requestOtp: async (email: string): Promise<{ message: string; expiresInMinutes: number }> => {
    const { data } = await api.post('/auth/request-otp', { email });
    return data;
  },

  // Verificar OTP → retorna JWT
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
