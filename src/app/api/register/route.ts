// src/app/api/register/route.ts
import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    // CHANGE #1: Only get username and password
    const { username, password } = await req.json();

    // CHANGE #2: Update the validation
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Missing username or password' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const usersCollection = db.collection('users');

    // CHANGE #3: Only check for existing username
    const existingUser = await usersCollection.findOne({ username });

    if (existingUser) {
      return NextResponse.json(
        { message: 'This username is already taken.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // CHANGE #4: Don't save an email field
    const result = await usersCollection.insertOne({
      username,
      passwordHash,
      createdAt: new Date(),
    });

    console.log(`New user created with ID: ${result.insertedId}`);
    return NextResponse.json(
      { message: 'User created successfully', userId: result.insertedId },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}