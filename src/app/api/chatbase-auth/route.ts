// file: src/app/api/chatbase-auth/route.ts

import { createHmac } from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Define a more specific type for your decoded token payload
interface DecodedToken {
  userId: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

export async function GET() {
  // 1. Get the JWT from the 'session' cookie
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No session cookie found.' }, { status: 401 });
  }

  // 2. Verify the JWT using YOUR secret key
  const jwtSecret = process.env.YOUR_JWT_SECRET;
  if (!jwtSecret) {
    console.error('CRITICAL: YOUR_JWT_SECRET is not set in environment variables.');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
  
  let decodedPayload: DecodedToken;
  try {
    decodedPayload = jwt.verify(token, jwtSecret) as DecodedToken;
  } catch { // This will catch expired or invalid tokens
    // This will catch expired or invalid tokens
    return NextResponse.json({ error: 'Unauthorized: Invalid session token.' }, { status: 401 });
  }
  
  // 3. Extract the userId from the decoded token
  const userId = decodedPayload.userId;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized: Token is missing userId.' }, { status: 401 });
  }

  // 4. Generate the Chatbase hash
  const chatbaseSecret = process.env.CHATBASE_SECRET_KEY;
  if (!chatbaseSecret) {
    console.error('CRITICAL: CHATBASE_SECRET_KEY is not set.');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
  const hash = createHmac('sha256', chatbaseSecret).update(userId).digest('hex');

  // 5. Send the public data to the client
  return NextResponse.json({
    userId,
    hash,
  });
}