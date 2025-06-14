// src/lib/session.ts
'use server'; // Indicates this module is for server-side use, primarily Server Actions

import 'server-only'; // Ensures this code only runs on the server, not in client bundles

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET_KEY;
if (!secretKey) {
  throw new Error('JWT_SECRET_KEY is not set in environment variables. Please add it to your .env file.');
}
const key = new TextEncoder().encode(secretKey);

// Define the structure of your JWT payload extending jose's JWTPayload
interface AppJWTPayload extends JWTPayload {
  userId: string;
  username: string;
  // Add any other custom claims you need
}

// Define the structure of the session data you'll work with in your app
export interface SessionData {
  userId: string;
  username: string;
  expires?: Date; // Expiration date of the session/token
}

/**
 * Encrypts a payload into a JWT string.
 */
export async function encrypt(payload: { userId: string; username: string }): Promise<string> {
  return new SignJWT(payload as AppJWTPayload) // Cast to your custom payload type
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h') // Session duration (e.g., 1 hour)
    .sign(key);
}

/**
 * Decrypts a session token string into session data.
 * Returns null if the token is invalid, expired, or not present.
 */
export async function decrypt(sessionToken?: string): Promise<SessionData | null> {
  if (!sessionToken) {
    return null;
  }
  try {
    // Provide AppJWTPayload as the generic type argument to jwtVerify
    const { payload } = await jwtVerify<AppJWTPayload>(sessionToken, key, {
      algorithms: ['HS256'],
    });

    // Check if essential custom claims are present
    if (!payload.userId || !payload.username) {
      console.error('JWT payload is missing required custom fields (userId, username).');
      return null;
    }

    return {
      userId: payload.userId,
      username: payload.username,
      expires: payload.exp ? new Date(payload.exp * 1000) : undefined,
    };
  } catch (error) {
    // Log specific errors for debugging
    if (error instanceof Error) {
      if (error.name === 'JWTExpired' || error.message.includes('expired')) {
        console.log('Session token expired.');
      } else {
        console.error('Failed to verify or decrypt session token:', error.name, error.message);
      }
    } else {
      console.error('An unknown error occurred during token decryption:', error);
    }
    return null; // Return null on any decryption/verification failure
  }
}

/**
 * Creates a session cookie containing the encrypted JWT.
 * Intended for use in Server Actions or Route Handlers.
 */
export async function createSessionCookie(userId: string, username: string) {
  const cookieExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
  const sessionToken = await encrypt({ userId, username });

  const cookieStore = await cookies(); // Correctly awaiting cookies()
  cookieStore.set('session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: cookieExpiresAt,
    sameSite: 'lax', // Or 'strict' if appropriate
    path: '/',
  });
  console.log('Session cookie created.');
}

/**
 * Retrieves the current session data from the session cookie.
 * Intended for use in Server Actions, Route Handlers, or RSCs.
 */
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