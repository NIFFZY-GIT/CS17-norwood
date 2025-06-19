// app/api/register/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('norwooddb');
    const users = db.collection('users');

    const existingUser = await users.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json(
        { message: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      email: email.toLowerCase(),
      password: hashedPassword,
        role: 'user',
      createdAt: new Date(),
    };

    const result = await users.insertOne(newUser);

    return NextResponse.json({
      message: 'User registered successfully',
      userId: result.insertedId,
    }, { status: 201 });

  } catch (error: unknown) { // MODIFIED: Changed 'any' to 'unknown'
    
    // MODIFIED: Added a type check to safely handle the error
    if (error instanceof Error) {
      console.error('REGISTRATION_ERROR:', error.message);
      return NextResponse.json(
        { message: `An internal server error occurred: ${error.message}` },
        { status: 500 }
      );
    } else {
      console.error('REGISTRATION_ERROR: An unknown error occurred', error);
      return NextResponse.json(
        { message: 'An unexpected internal server error occurred.' },
        { status: 500 }
      );
    }
  }
}