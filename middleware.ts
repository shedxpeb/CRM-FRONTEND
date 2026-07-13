import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = [
  '/dashboard', '/leads', '/customers', '/projects', '/inventory',
  '/finance', '/design', '/documents', '/automation', '/settings',
];

const publicRoutes = [
  '/login', '/register', '/forgot-password', '/reset-password',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionId = request.cookies.get('sessionId')?.value;

  const isProtected = protectedRoutes.some(r => pathname.startsWith(r));
  const isPublic = publicRoutes.some(r => pathname.startsWith(r));

  if (pathname === '/') {
    return NextResponse.redirect(new URL(sessionId ? '/dashboard' : '/login', request.url));
  }

  if (isProtected && !sessionId) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublic && sessionId && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|api).*)'],
};
