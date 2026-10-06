import { apiClient } from '@/lib/api/client';
import { LoginInput, LoginResponse, OtpVerifyInput, SignUpInput } from '../schemas/auth.schema.types';

export const authApi = {
  login: async (data: LoginInput):Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },
  signup: async (data: SignUpInput) => {
    const response = await apiClient.post('/auth/signup', data);
    return response.data;
  },
  verifyOtp: async (data: OtpVerifyInput) => {
    const response = await apiClient.post('/auth/verify-otp', data);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
};
