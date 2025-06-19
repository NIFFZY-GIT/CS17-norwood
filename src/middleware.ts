// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt, type SessionData } from '@/lib/session';

const ADMIN_ONLY_ROUTES = ['/dashboard'];
const PUBLIC_ONLY_ROUTES = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  console.log(`\n--- MIDDLEWARE RUNNING FOR: ${request.nextUrl.pathname} ---`);
  
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');

  if (sessionCookie) {
    console.log("[Middleware] Found 'session' cookie in the request headers.");
  } else {
    console.log("[Middleware] Did NOT find 'session' cookie in the request headers.");
  }
  
  let session: SessionData | null = null;
  if (sessionCookie?.value) {
    session = await decrypt(sessionCookie.value); // decrypt() will log its own details
    if(session) {
        console.log("[Middleware] Decryption successful. User is authenticated.");
    } else {
        console.log("[Middleware] Decryption failed. User is NOT authenticated.");
    }
  }

  const isAuthenticated = !!session?.userId;
  const userRole = session?.role;
  
  const isAccessingAdminRoute = ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route));

  if (isAccessingAdminRoute) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect_to', pathname);
      console.log(`[Middleware] RULE: Unauthenticated access to ADMIN route. Redirecting to login.`);
      return NextResponse.redirect(loginUrl);
    }

    if (session && userRole !== 'admin') {
      console.log(`[Middleware] RULE: Non-admin user ('${session.username}') on ADMIN route. Redirecting to home.`);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (isAuthenticated && PUBLIC_ONLY_ROUTES.includes(pathname)) {
    const redirectUrl = userRole === 'admin' ? '/dashboard' : '/';
    console.log(`[Middleware] RULE: Authenticated user on public route. Redirecting to ${redirectUrl}.`);
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }
  
  if (sessionCookie && !session) {
    const response = NextResponse.next();
    console.log("[Middleware] RULE: Invalid/expired cookie found. Clearing it.");
    response.cookies.set('session', '', { maxAge: -1, path: '/' });
    return response;
  }

  console.log("[Middleware] No specific rules matched. Allowing request to proceed.");
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};