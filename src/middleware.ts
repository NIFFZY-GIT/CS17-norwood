// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt, type SessionData } from '@/lib/session';

const PROTECTED_ROUTES = ['/dashboard'];
const PUBLIC_ONLY_ROUTES = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookieValue = request.cookies.get('session')?.value;

  let session: SessionData | null = null;

  if (sessionCookieValue) {
    // Potential point of failure if decrypt throws an unhandled error
    session = await decrypt(sessionCookieValue);
  }

  const isAuthenticated = !!session?.userId;
  const isAccessingProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  if (isAccessingProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect_to', pathname);
    console.log(`[Middleware] Unauthenticated access to ${pathname}. Redirecting to login.`);
    const response = NextResponse.redirect(loginUrl);
    if (sessionCookieValue && !session) { // If cookie existed but decryption failed
        response.cookies.set('session', '', { maxAge: -1, path: '/' });
    }
    return response;
  }

  if (isAuthenticated && PUBLIC_ONLY_ROUTES.includes(pathname)) {
    console.log(`[Middleware] Authenticated user accessing ${pathname}. Redirecting to dashboard.`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};