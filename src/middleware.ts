// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt, type SessionData } from '@/lib/session';

// Define your routes clearly
const ADMIN_ONLY_ROUTES = ['/dashboard'];
const PUBLIC_ONLY_ROUTES = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');

  // 1. Decrypt the session token to get user data
  let session: SessionData | null = null;
  if (sessionCookie?.value) {
    try {
      session = await decrypt(sessionCookie.value);
    } catch (error) {
      console.error("Middleware: Failed to decrypt token, treating as logged out.", error);
    }
  }

  // 2. Determine user's authentication and authorization status
  const isAuthenticated = !!session?.userId;
  const userRole = session?.role;

  // 3. Check if the user is trying to access an admin-only route
  const isAccessingAdminRoute = ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route));

  if (isAccessingAdminRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect_to', pathname);
      console.log(`[Middleware] Unauthenticated access to ADMIN route ${pathname}. Redirecting to login.`);
      return NextResponse.redirect(loginUrl);
    }

    // ✅ THE FIX IS HERE.
    // We add a check for `session` before using it.
    if (session && userRole !== 'admin') {
      console.log(`[Middleware] Non-admin user ('${session.username}') attempted to access ${pathname}. Redirecting to home.`);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 4. Handle public-only routes (like /login)
  if (isAuthenticated && PUBLIC_ONLY_ROUTES.includes(pathname)) {
    const redirectUrl = userRole === 'admin' ? '/dashboard' : '/';
    console.log(`[Middleware] Authenticated user accessing ${pathname}. Redirecting to ${redirectUrl}.`);
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // 5. If the session cookie was invalid and decryption failed, clear it.
  if (sessionCookie && !session) {
    const response = NextResponse.next();
    console.log("[Middleware] Clearing invalid session cookie.");
    response.cookies.set('session', '', { maxAge: -1, path: '/' });
    return response;
  }

  return NextResponse.next();
}

// Config remains the same
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};