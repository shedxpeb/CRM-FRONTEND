import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Soft route hints only — real auth is JWT + HttpOnly refresh cookie validated by the API.
 * The sessionId cookie is a UX hint for redirects; AuthGate enforces real session state.
 */
const protectedPrefixes = ['/dashboard', '/settings'];
const publicAuthRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

function isSafeRedirect(path: string | null): path is string {
  return !!path && path.startsWith('/') && !path.startsWith('//') && !path.includes('\\');
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasRefreshHint =
    !!request.cookies.get('refreshToken')?.value ||
    !!request.cookies.get('sessionId')?.value;

  const isProtected = protectedPrefixes.some((r) => pathname === r || pathname.startsWith(`${r}/`));
  const isPublicAuth = publicAuthRoutes.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  if (pathname === '/') {
    return NextResponse.redirect(new URL(hasRefreshHint ? '/dashboard' : '/login', request.url));
  }

  if (isProtected && !hasRefreshHint) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Do not bounce auth pages solely on sessionId — AuthContext clears stale markers via silentRefresh
  if (isPublicAuth && hasRefreshHint && pathname === '/login') {
    const redirect = request.nextUrl.searchParams.get('redirect');
    const target = isSafeRedirect(redirect) ? redirect : '/dashboard';
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|api).*)'],
};
