'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { silentRefresh } from '@/core/api';
import { setAccessToken, setSessionData, clearSession, getAccessToken } from '@/core/auth/session';
import { ROUTES } from '@/core/routes';
import { authService, AuthUser, LoginInput, RegisterInput, VerifyOtpInput, ForgotPasswordInput, ResetPasswordInput } from './authService';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<{ success: boolean; error?: string }>;
  register: (input: RegisterInput) => Promise<{ success: boolean; email?: string; error?: string; otp?: string }>;
  verifyOtp: (input: VerifyOtpInput) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (input: ForgotPasswordInput) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (input: ResetPasswordInput) => Promise<{ success: boolean; error?: string }>;
  resendOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function extractErrorMessage(err: any, fallback: string): string {
  const raw = err?.response?.data?.message;
  if (Array.isArray(raw)) return raw.join(', ');
  if (typeof raw === 'string' && raw) return raw;
  if (typeof err?.message === 'string') return err.message;
  return fallback;
}

const PROACTIVE_REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes — keeps session alive and token fresh

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopProactiveRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  const startProactiveRefresh = useCallback(() => {
    stopProactiveRefresh();
    refreshIntervalRef.current = setInterval(async () => {
      try {
        await silentRefresh();
      } catch {
        // Silent refresh failed — interceptor handles if token actually expires
      }
    }, PROACTIVE_REFRESH_INTERVAL_MS);
  }, [stopProactiveRefresh]);

  useEffect(() => {
    const hydrate = async () => {
      const currentPath =
        typeof window !== 'undefined' ? window.location.pathname : '';
      const isAuthPage =
        currentPath === ROUTES.login ||
        currentPath === ROUTES.register ||
        currentPath === ROUTES.forgotPassword ||
        currentPath === ROUTES.resetPassword;

      if (isAuthPage && !getAccessToken()) {
        setIsLoading(false);
        return;
      }

      try {
        const hasToken = await authService.bootstrapSession();
        if (!hasToken) {
          clearSession();
          return;
        }

        const res: any = await authService.getProfile();
        const userData = res?.data ?? res;
        setUser(userData);
        startProactiveRefresh();
      } catch {
        clearSession();
        setUser(null);
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          router.push(ROUTES.login);
        }
      } finally {
        setIsLoading(false);
      }
    };

    hydrate();
  }, [router, startProactiveRefresh]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => stopProactiveRefresh();
  }, [stopProactiveRefresh]);

  const login = useCallback(async (input: LoginInput) => {
    try {
      const res: any = await authService.login(input);
      const data = res?.data ?? res;
      setAccessToken(data.accessToken);
      setSessionData(data.sessionId, data.user?.organizationId || '');
      setUser(data.user);
      startProactiveRefresh();
      router.push(ROUTES.dashboard);
      router.refresh();
      return { success: true };
    } catch (err: any) {
      const msg = extractErrorMessage(err, 'Login failed');
      return { success: false, error: msg };
    }
  }, [router, startProactiveRefresh]);

  const register = useCallback(async (input: RegisterInput) => {
    try {
      const res: any = await authService.register(input);
      const data = res?.data ?? res;
      return { success: true, email: data.email, otp: data.otp };
    } catch (err: any) {
      const msg = extractErrorMessage(err, 'Registration failed');
      return { success: false, error: msg };
    }
  }, []);

  const verifyOtp = useCallback(async (input: VerifyOtpInput) => {
    try {
      const res: any = await authService.verifyOtp(input);
      const data = res?.data ?? res;
      setAccessToken(data.accessToken);
      setSessionData(data.sessionId, data.user?.organizationId || '');
      setUser(data.user);
      startProactiveRefresh();
      router.push(ROUTES.dashboard);
      router.refresh();
      return { success: true };
    } catch (err: any) {
      const msg = extractErrorMessage(err, 'Verification failed');
      return { success: false, error: msg };
    }
  }, [router, startProactiveRefresh]);

  const forgotPassword = useCallback(async (input: ForgotPasswordInput) => {
    try {
      await authService.forgotPassword(input);
      return { success: true };
    } catch (err: any) {
      const msg = extractErrorMessage(err, 'Failed to send OTP');
      return { success: false, error: msg };
    }
  }, []);

  const resetPassword = useCallback(async (input: ResetPasswordInput) => {
    try {
      await authService.resetPassword(input);
      return { success: true };
    } catch (err: any) {
      const msg = extractErrorMessage(err, 'Failed to reset password');
      return { success: false, error: msg };
    }
  }, []);

  const resendOtp = useCallback(async (email: string) => {
    try {
      await authService.resendOtp(email);
      return { success: true };
    } catch (err: any) {
      const msg = extractErrorMessage(err, 'Failed to resend OTP');
      return { success: false, error: msg };
    }
  }, []);

  const logout = useCallback(() => {
    stopProactiveRefresh();
    queryClient.clear();
    const sessionId = typeof window !== 'undefined'
      ? document.cookie.match(/(^| )sessionId=([^;]+)/)?.[2]
      : undefined;
    if (sessionId) {
      authService.logout(sessionId).catch(() => {});
    }
    clearSession();
    setUser(null);
    router.push(ROUTES.login);
    router.refresh();
  }, [router, stopProactiveRefresh, queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        verifyOtp,
        forgotPassword,
        resetPassword,
        resendOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
