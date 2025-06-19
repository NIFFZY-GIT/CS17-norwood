// src/lib/session.ts
'use server';

import 'server-only';

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET_KEY;
if (!secretKey) {
  throw new Error('JWT_SECRET_KEY is not set in environment variables.');
}
const key = new TextEncoder().encode(secretKey);

// ✅ Add 'role' to the payload
interface AppJWTPayload extends JWTPayload {
  userId: string;
  username: string;
  role: string; // <-- ADDED
}

// ✅ Add 'role' to the session data
export interface SessionData {
  userId: string;
  username:string;
  role: string; // <-- ADDED
  expires?: Date;
}

// ✅ Update 'encrypt' to accept 'role'
export async function encrypt(payload: { userId: string; username: string; role: string }): Promise<string> {
  return new SignJWT(payload as AppJWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(key);
}

// ✅ Update 'decrypt' to extract 'role'
// In src/lib/session.ts

export async function decrypt(sessionToken?: string): Promise<SessionData | null> {
  if (!sessionToken) return null;
  try {
    const { payload } = await jwtVerify<AppJWTPayload>(sessionToken, key, {
      algorithms: ['HS256'],
    });

    if (!payload.userId || !payload.username || !payload.role) {
      console.error('JWT payload is missing required custom fields.');
      return null;
    }

    return {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
      expires: payload.exp ? new Date(payload.exp * 1000) : undefined,
    };
  } catch (error) {
    // ✅ USE the 'error' variable for logging
    console.error('Failed to decrypt session token:', error);
    return null;
  }
}

// ✅ Update 'createSessionCookie' to accept 'role'
export async function createSessionCookie(userId: string, username: string, role: string) {
  const cookieExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const sessionToken = await encrypt({ userId, username, role }); // <-- Pass role here

  const cookieStore = await cookies();
  cookieStore.set('session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: cookieExpiresAt,
    sameSite: 'lax',
    path: '/',
  });
  console.log(`Session cookie created for user: ${username} with role: ${role}`);
}
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies(); // Correctly awaiting cookies()
  const sessionCookieValue = cookieStore.get('session')?.value;

  if (!sessionCookieValue) {
    return null;
  }
  return decrypt(sessionCookieValue);
}

/**
 * Deletes the session cookie.
 * Intended for use in Server Actions or Route Handlers.
 */
export async function deleteSessionCookie() {
  const cookieStore = await cookies(); // Correctly awaiting cookies()
  cookieStore.set('session', '', { // Set to empty with past expiration
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    sameSite: 'lax',
    path: '/',
  });
  console.log('Session cookie deleted.');
}