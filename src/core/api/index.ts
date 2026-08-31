import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken, setSessionData, clearSession, getTenantId } from '@/core/auth/session';
import { assertEndpointAvailable, rememberUnavailableEndpoint } from './capabilities';
import dayjs from 'dayjs';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_API_URL');
}

// Date field names that should be parsed as dates
const DATE_FIELDS = [
  'createdAt', 'updatedAt', 'deletedAt',
  'lastFollowUp', 'nextFollowUpDate', 'convertedDate', 'performedAt', 'timestamp',
  'date', 'dueDate', 'startDate', 'endDate',
  'birthDate', 'joinDate', 'expiryDate'
];

// Recursively parse date strings in response data
function parseDates(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => parseDates(item));
  }

  if (typeof data === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (DATE_FIELDS.includes(key) && typeof value === 'string') {
        const parsed = dayjs(value);
        if (parsed.isValid()) {
          result[key] = parsed.toDate();
        } else {
          result[key] = value;
        }
      } else {
        result[key] = parseDates(value);
      }
    }
    return result;
  }

  return data;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ── Browser-wide refresh coordination ──────────────────────────────────────────
// Prevent two tabs from simultaneously performing refresh.
// Uses BroadcastChannel with localStorage fallback. Only one tab may initiate a refresh at a time.
let refreshInProgressInOtherTab = false;

const REFRESH_BC_CHANNEL = typeof window !== 'undefined' ? new BroadcastChannel('crm_refresh_channel') : null;

if (REFRESH_BC_CHANNEL) {
  REFRESH_BC_CHANNEL.onmessage = (event: MessageEvent) => {
    if (event.data?.type === 'refresh-in-progress') {
      refreshInProgressInOtherTab = true;
    }
    if (event.data?.type === 'refresh-done') {
      refreshInProgressInOtherTab = false;
    }
  };
}

// LocalStorage fallback for browsers without BroadcastChannel support
if (!REFRESH_BC_CHANNEL && typeof window !== 'undefined' && localStorage) {
  const REFRESH_LS_KEY = 'crm_refresh_in_progress';
  const checkLS = setInterval(() => {
    const lsInProgress = localStorage.getItem(REFRESH_LS_KEY) === 'true';
    if (!lsInProgress) {
      clearInterval(checkLS);
      // Set the lock immediately
      localStorage.setItem(REFRESH_LS_KEY, 'true');
      refreshInProgressInOtherTab = false;
    }
  }, 100);
  setTimeout(() => clearInterval(checkLS), 10000);
}

function broadcastRefreshStart() {
  REFRESH_BC_CHANNEL?.postMessage?.({ type: 'refresh-in-progress' }) ?? (typeof window !== 'undefined' && localStorage?.setItem('crm_refresh_in_progress', 'true'));
}
function broadcastRefreshDone() {
  REFRESH_BC_CHANNEL?.postMessage?.({ type: 'refresh-done' }) ?? (typeof window !== 'undefined' && localStorage?.removeItem('crm_refresh_in_progress'));
}

// ── Single-Flight Refresh ───────────────────────────────────────────────────
// Both the proactive timer and the 401 interceptor must share ONE refresh
// attempt. A stale refresh token cookie, a 502 from the proxy, or a network
// hiccup should never cause multiple parallel refreshes or an accidental logout.

type RefreshResult = { accessToken: string; sessionId?: string };
let refreshInFlight: Promise<RefreshResult> | null = null;

/** Core refresh — only this function should call the /auth/refresh endpoint. */
async function doRefresh(): Promise<RefreshResult> {
  // Check if another tab is already refreshing
  if (refreshInProgressInOtherTab) {
    // Wait for the other tab's refresh to complete
    return new Promise<RefreshResult>((resolve) => {
      const check = setInterval(() => {
        if (!refreshInProgressInOtherTab) {
          clearInterval(check);
          doRefresh().then(resolve).catch(resolve);
        }
      }, 100);
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(check);
        resolve({ accessToken: '' } as RefreshResult);
      }, 10000);
    });
  }

  const { data } = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true },
  );
  const responseData = data?.data ?? data;
  const accessToken = responseData.accessToken;
  if (!accessToken) throw new Error('No access token in refresh response');
  setAccessToken(accessToken);
  if (responseData.sessionId) {
    setSessionData(responseData.sessionId, getTenantId() || '');
  }
  return { accessToken, sessionId: responseData.sessionId };
}

/**
 * Public single-flight refresh entry point.
 * If a refresh is already in progress, subsequent callers receive the same
 * promise instead of triggering a second network call.
 * Also coordinates across tabs via BroadcastChannel.
 * Broadcasts refresh start/done to prevent concurrent refreshes across tabs.
 */
export async function silentRefresh(): Promise<string> {
  // Broadcast that this tab is starting a refresh
  broadcastRefreshStart();

  // Check if another tab already has an in-flight refresh promise
  if (refreshInFlight) {
    // Other tab is refreshing - wait for it to complete, then allow this one to proceed
    refreshInFlight.then(() => {
      broadcastRefreshDone();
    });
    return refreshInFlight.then(r => r.accessToken);
  }

  refreshInFlight = doRefresh().finally(() => {
    refreshInFlight = null;
    // Notify other tabs that refresh is done
    broadcastRefreshDone();
  });

  return refreshInFlight.then(r => r.accessToken);
}

// ─── Token-Expiry-Based Proactive Refresh ────────────────────────────────────
// Instead of a fixed interval, schedule the next refresh at 80% of the access
// token lifetime. This guarantees the token is refreshed *before* expiry, not
// at arbitrary intervals that might race with actual usage.

let proactiveTimer: ReturnType<typeof setTimeout> | null = null;
const REFRESH_SAFETY_MARGIN_MS = 30_000; // refresh 30s before expiry as minimum

function scheduleProactiveRefresh(expiresInSeconds?: number) {
  if (proactiveTimer) clearTimeout(proactiveTimer);

  const lifetimeMs = (expiresInSeconds || 30 * 60) * 1000; // default 30 min
  const refreshAtMs = Math.max(lifetimeMs * 0.8, lifetimeMs - 5 * 60 * 1000); // 80% or 5 min before end

  proactiveTimer = setTimeout(async () => {
    try {
      const token = await silentRefresh();
      // Parse the new JWT to schedule the next refresh correctly
      scheduleProactiveRefreshFromToken(token);
    } catch {
      // Silent refresh failed — the 401 interceptor will handle recovery
      // if the access token actually expires during normal use.
    }
  }, Math.max(refreshAtMs, REFRESH_SAFETY_MARGIN_MS));
}

function scheduleProactiveRefreshFromToken(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp) {
      const nowSec = Math.floor(Date.now() / 1000);
      const remaining = payload.exp - nowSec;
      if (remaining > 0) {
        scheduleProactiveRefresh(remaining);
        return;
      }
    }
  } catch {
    // If we can't decode the token, fall back to a 25-minute schedule
  }
  scheduleProactiveRefresh(25 * 60);
}

/** Start the proactive refresh cycle — call after login or session bootstrap. */
export function startTokenRefresh() {
  const token = getAccessToken();
  if (token) {
    scheduleProactiveRefreshFromToken(token);
  } else {
    scheduleProactiveRefresh(25 * 60); // 25 minutes if no token yet
  }
}

/** Stop the proactive refresh cycle — call on logout. */
export function stopTokenRefresh() {
  if (proactiveTimer) {
    clearTimeout(proactiveTimer);
    proactiveTimer = null;
  }
}

// ─── Request Interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    await assertEndpointAvailable(config);
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const tenantId = getTenantId();
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor — 401 Handling ─────────────────────────────────────

/** Queue of requests waiting for a single in-flight refresh. */
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processRefreshQueue(error: unknown, token: string | null = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token!);
  });
  refreshQueue = [];
}

apiClient.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = parseDates(response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 404 && originalRequest?.url) {
      rememberUnavailableEndpoint(originalRequest.url);
    }

    // Only handle 401 — every other status passes through to the caller
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Never retry refresh/auth endpoints — they 401 for valid business reasons
    const url = originalRequest.url || '';
    if (url.includes('/auth/')) {
      return Promise.reject(error);
    }

    // If a refresh is already in flight, queue this request
    if (refreshInFlight) {
      return new Promise<string>((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;

    try {
      const result = await (refreshInFlight || doRefresh());
      const newToken = result.accessToken;
      processRefreshQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      // Schedule the next proactive refresh from the new token
      scheduleProactiveRefreshFromToken(newToken);
      return apiClient(originalRequest);
    } catch (refreshError) {
      processRefreshQueue(refreshError, null);

      // Distinguish: was the refresh itself the failure, or was the retried request the failure?
      // If the error comes from /auth/refresh, the session is truly dead.
      // If it comes from a different URL, the refresh succeeded but the retried
      // request hit a server error — do NOT log the user out for a 500.
      const isRefreshEndpointFailure =
        axios.isAxiosError(refreshError) &&
        (refreshError.config?.url?.includes('/auth/refresh') || !refreshError.response);

      if (isRefreshEndpointFailure) {
        stopTokenRefresh();
        clearSession();
        if (typeof window !== 'undefined') {
          const authRoutes = new Set(['/login', '/register', '/forgot-password', '/reset-password']);
          const currentPath = window.location.pathname;
          if (!authRoutes.has(currentPath)) {
            const reason =
              refreshError && typeof refreshError === 'object' && 'response' in refreshError
                ? 'session_expired'
                : 'backend_unavailable';
            window.location.href = `/login?reason=${reason}`;
          }
        }
      }

      return Promise.reject(refreshError);
    }
  },
);

// ─── Typed API Methods ───────────────────────────────────────────────────────
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then(res => res.data),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then(res => res.data),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then(res => res.data),
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then(res => res.data),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then(res => res.data),
};

export interface ApiResponse<T> { data: T; message?: string; success: boolean; }
export interface PaginatedResponse<T> { data: T[]; pagination: { page: number; pageSize: number; total: number; totalPages: number; hasNext: boolean; hasPrevious: boolean; }; }
export interface ApiError { message: string; code: string; statusCode: number; details?: any; }

export default api;
