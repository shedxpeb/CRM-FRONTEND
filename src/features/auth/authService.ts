import api, { silentRefresh } from '@/core/api';
import { getAccessToken, getSessionId } from '@/core/auth/session';

export interface RegisterInput {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
  companyName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface VerifyOtpInput {
  email: string;
  otp: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  organizationType: string;
  organizationId?: string;
  organizationName?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  sessionId: string;
  expiresIn: number;
  user: AuthUser;
}

export const authService = {
  register: (data: RegisterInput) =>
    api.post<{ message: string; email: string }>('/auth/register', data),

  verifyOtp: (data: VerifyOtpInput) =>
    api.post<AuthResponse & { message: string }>('/auth/verify-otp', data),

  login: (data: LoginInput) =>
    api.post<AuthResponse>('/auth/login', data),

  logout: (sessionId: string) =>
    api.post<{ message: string }>('/auth/logout', { sessionId }),

  forgotPassword: (data: ForgotPasswordInput) =>
    api.post<{ message: string; email?: string }>('/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordInput) =>
    api.post<{ message: string }>('/auth/reset-password', data),

  resendOtp: (email: string) =>
    api.post<{ message: string }>('/auth/resend-otp', { email }),

  getProfile: () =>
    api.get<AuthUser>('/auth/me'),

  bootstrapSession: async (): Promise<boolean> => {
    if (getAccessToken()) {
      return true;
    }
    if (!getSessionId()) {
      return false;
    }
    try {
      await silentRefresh();
      return true;
    } catch {
      // refresh cookie missing or expired
    }
    return false;
  },
};
