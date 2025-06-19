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

interface AppJWTPayload extends JWTPayload {
  userId: string;
  username: string;
  role: string;
}

export interface SessionData {
  userId: string;
  username:string;
  role: string;
  expires?: Date;
}

export async function encrypt(payload: { userId: string; username: string; role: string }): Promise<string> {
  return new SignJWT(payload as AppJWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(key);
}

export async function decrypt(sessionToken?: string): Promise<SessionData | null> {
  console.log("\n--- DECRYPT FUNCTION CALLED ---");

  if (!sessionToken) {
    console.log("[decrypt] No session token provided. Returning null.");
    return null;
  }
  
  try {
    console.log("[decrypt] Attempting to verify token...");
    const { payload } = await jwtVerify<AppJWTPayload>(sessionToken, key, {
      algorithms: ['HS256'],
    });
    console.log("[decrypt] TOKEN VERIFIED SUCCESSFULLY. Payload:", payload);
    
    if (!payload.userId || !payload.username || !payload.role) {
      console.error('[decrypt] JWT payload is missing required custom fields.');
      return null;
    }

    return {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
      expires: payload.exp ? new Date(payload.exp * 1000) : undefined,
    };
  } catch (error) {
    // ✅ THIS IS THE MOST IMPORTANT LOG. IF YOU SEE THIS, THIS IS YOUR PROBLEM.
    console.error('[decrypt] TOKEN VERIFICATION FAILED. Error details:', error);
    return null;
  }
}

export async function createSessionCookie(userId: string, username: string, role: string) {
  console.log(`[createSessionCookie] Preparing to create cookie for user: ${username}, role: ${role}`);
  const cookieExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const sessionToken = await encrypt({ userId, username, role });

  const cookieStore = await cookies();
  cookieStore.set('session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: cookieExpiresAt,
    sameSite: 'lax',
    path: '/',
  });
  console.log(`[createSessionCookie] Session cookie SET successfully.`);
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookieValue = cookieStore.get('session')?.value;

  if (!sessionCookieValue) {
    return null;
  }
  return decrypt(sessionCookieValue);
}

export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    sameSite: 'lax',
    path: '/',
  });
  console.log('[deleteSessionCookie] Session cookie deleted.');
}