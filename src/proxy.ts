import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Soft route hints only — real auth is JWT + HttpOnly refresh cookie validated by the API.
 * The sessionId cookie is a UX hint for redirects; AuthGate enforces real session state.
 */
const protectedPrefixes = ['/dashboard', '/settings'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasRefreshHint =
    !!request.cookies.get('refreshToken')?.value ||
    !!request.cookies.get('sessionId')?.value;

  const isProtected = protectedPrefixes.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  if (pathname === '/') {
    return NextResponse.redirect(new URL(hasRefreshHint ? '/dashboard' : '/login', request.url));
  }

  if (isProtected && !hasRefreshHint) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Never bounce auth pages on cookie hints: the HttpOnly refreshToken cookie cannot be
  // cleared client-side, so a stale hint would bounce /login -> /dashboard -> /login forever
  // (ERR_TOO_MANY_REDIRECTS) whenever the session is invalid or the API is temporarily down.
  // AuthContext/AuthGate own the real session check and redirect; the login page bounces
  // already-authenticated users to /dashboard via the client-side `isAuthenticated` effect.
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|api).*)'],
};
