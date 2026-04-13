import api from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  // Step 1: email + password → sends OTP
  loginPassword: async (email: string, password: string): Promise<{ message: string; expiresInMinutes: number; email: string }> => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  // Step 2: verify OTP → returns JWT
  verifyOtp: async (email: string, code: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/verify-otp', { email, code });
    return data;
  },

  resendOtp: async (email: string): Promise<{ message: string; expiresInMinutes: number }> => {
    const { data } = await api.post('/auth/resend-otp', { email });
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
