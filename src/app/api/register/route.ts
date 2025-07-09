import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { QuizPrefs } from '@/lib/types'; // Import the type

export async function POST(req: Request) {
  try {
    // The request body can now contain preferences
    const body = await req.json();
    const { email, password, preferences } = body as { email: string, password: string, preferences?: QuizPrefs };

    // --- Validation ---
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('norwooddb');
    const users = db.collection('users');

    const existingUser = await users.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 409 });
    }

    // --- User Creation ---
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user',
      createdAt: new Date(),
      // Add preferences if they exist, otherwise default to an empty object
      preferences: preferences || {},
    };

    await users.insertOne(newUser);

    // Return a simple success message. No need to return the ID anymore.
    return NextResponse.json({
      message: 'User registered successfully',
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('REGISTRATION_ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: `An internal server error occurred: ${errorMessage}` }, { status: 500 });
  }
}