// src/app/api/login/route.ts
import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { createSessionCookie } from '@/lib/session'; // Assuming you have this helper

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Missing email or password' },
        { status: 400 }
      );
    }
    
    // Server config checks are good practice
    if (!process.env.JWT_SECRET_KEY || !process.env.MONGODB_DB_NAME) {
      console.error('FATAL: Server configuration error. Check .env variables.');
      return NextResponse.json(
        { message: 'Server configuration error.' },
        { status: 500 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // ✅ THE CRITICAL FIX IS HERE
    // We ensure the code checks for the 'password' field, not 'passwordHash'.
    if (!user.password || typeof user.password !== 'string') {
        console.error(`Login error: User with email "${email}" has no 'password' field or it's invalid.`);
        return NextResponse.json(
            { message: 'Account configuration issue. Please contact support.' },
            { status: 500 }
        );
    }

    // ✅ AND THE SECOND PART OF THE FIX IS HERE
    // We compare the incoming password with the 'password' field from the database.
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // If login is successful, create the session
    const userId = user._id.toString();
    const sessionDisplayName = user.email; // Use email as display name
    await createSessionCookie(userId, sessionDisplayName);

    console.log(`Login successful for user: ${sessionDisplayName}, ID: ${userId}`);
    return NextResponse.json(
      { message: 'Login successful', user: { id: userId, name: sessionDisplayName } },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Login API error:', error);
    if (error instanceof Error) {
        return NextResponse.json(
            { message: `An internal server error occurred: ${error.message}` },
            { status: 500 }
          );
    }
    return NextResponse.json(
      { message: 'An internal server error occurred during login.' },
      { status: 500 }
    );
  }
}