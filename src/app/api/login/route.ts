// src/app/api/login/route.ts
import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { createSessionCookie } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Missing username or password' },
        { status: 400 }
      );
    }

    if (!process.env.JWT_SECRET_KEY) {
      console.error('FATAL: JWT_SECRET_KEY is not set in environment variables.');
      return NextResponse.json(
        { message: 'Server configuration error. JWT_SECRET_KEY missing.' },
        { status: 500 }
      );
    }
    if (!process.env.MONGODB_DB_NAME) {
      console.error('FATAL: MONGODB_DB_NAME is not set in environment variables.');
      return NextResponse.json(
        { message: 'Server configuration error. MONGODB_DB_NAME missing.' },
        { status: 500 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ username });
    if (!user) {
      console.log(`Login attempt failed: User "${username}" not found.`);
      return NextResponse.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    if (!user.passwordHash || typeof user.passwordHash !== 'string') {
        console.error(`Login error: User "${username}" has no passwordHash or it's invalid.`);
        return NextResponse.json(
            { message: 'Account configuration issue. Please contact support.' },
            { status: 500 }
        );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      console.log(`Login attempt failed: Password mismatch for user "${username}".`);
      return NextResponse.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const userId = user._id.toString();
    await createSessionCookie(userId, user.username);

    console.log(`Login successful for user: ${user.username}, ID: ${userId}`);
    return NextResponse.json(
      { message: 'Login successful', user: { id: userId, username: user.username } },
      { status: 200 }
    );

  } catch (error: unknown) { // MODIFIED HERE: Changed 'any' to 'unknown'
    console.error('Login API error:', error);

    // Check for specific error types if needed
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
        return NextResponse.json(
            { message: 'Invalid request format. Please provide username and password in JSON.' },
            { status: 400 }
        );
    }
    // For other errors, you can check if (error instanceof Error) to access error.message
    if (error instanceof Error) {
        return NextResponse.json(
            { message: `An internal server error occurred: ${error.message}` }, // Optionally include error.message
            { status: 500 }
          );
    }
    // Fallback for non-Error objects
    return NextResponse.json(
      { message: 'An internal server error occurred during login.' },
      { status: 500 }
    );
  }
}