// src/app/api/logout/route.ts
import { NextResponse } from 'next/server';
import { deleteSessionCookie } from '@/lib/session';

export async function POST(request: Request) {
  try {
    await deleteSessionCookie();
    // Redirect to the login page after logout
    // Construct the full URL for redirection to avoid issues with relative paths in some contexts
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl.toString(), { status: 302 }); // 302 Found for redirect
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred during logout.' },
      { status: 500 }
    );
  }
}