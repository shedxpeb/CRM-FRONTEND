const SESSION_ID_KEY = 'sessionId';
const TENANT_ID_KEY = 'tenantId';

let inMemoryAccessToken: string | null = null;
let inMemorySessionId: string | null = null;
let inMemoryTenantId: string | null = null;

export function setAccessToken(token: string): void {
  inMemoryAccessToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function clearAccessToken(): void {
  inMemoryAccessToken = null;
}

export function setSessionData(sessionId: string, tenantId: string): void {
  inMemorySessionId = sessionId;
  inMemoryTenantId = tenantId;

  // Session ID is OK in cookies for middleware/server reads — no PII
  if (typeof window !== 'undefined') {
    document.cookie = `${SESSION_ID_KEY}=${sessionId}; path=/; SameSite=Lax; max-age=${30 * 24 * 60 * 60}`;
  }
}

export function getSessionId(): string | null {
  if (inMemorySessionId) return inMemorySessionId;
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${SESSION_ID_KEY}=([^;]+)`));
  return match ? match[2] : null;
}

export function getTenantId(): string | null {
  return inMemoryTenantId;
}

export function clearSession(): void {
  inMemoryAccessToken = null;
  inMemorySessionId = null;
  inMemoryTenantId = null;

  if (typeof window !== 'undefined') {
    document.cookie = `${SESSION_ID_KEY}=; path=/; SameSite=Lax; max-age=0`;
    document.cookie = `${TENANT_ID_KEY}=; path=/; SameSite=Lax; max-age=0`;
  }
}

export function hasSession(): boolean {
  return !!(inMemoryAccessToken || getSessionId());
}
