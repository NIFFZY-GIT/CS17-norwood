// app/api/register/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    console.log('Register API called at:', new Date().toISOString());

    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log('Request body:', body);
    } catch (error) {
      console.error('Body parsing error:', error);
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const { username, email, password } = body;

    // Validate input
    if (!username || !email || !password) {
      console.log('Missing fields:', { username, email, password });
      return NextResponse.json(
        { message: 'Missing username, email, or password' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const client = await clientPromise.catch((error) => {
      throw new Error(`MongoDB connection failed: ${error.message}`);
    });
    console.log('Connected to MongoDB');

    const db = client.db('norwooddb');
    const users = db.collection('users');

    // Check for existing user
    console.log('Checking for existing user...');
    const existingUser = await users.findOne({
      $or: [{ username }, { email }],
    });
    console.log('Existing user check complete:', existingUser);

    if (existingUser) {
      console.log('User already exists:', { username, email });
      return NextResponse.json(
        { message: 'Username or email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Insert user
    console.log('Inserting user...');
    const result = await users.insertOne({
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });
    console.log('User inserted with ID:', result.insertedId);

    return NextResponse.json({
      message: 'User registered successfully',
      userId: result.insertedId,
    });
  } catch (error: any) {
    console.error('Registration error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      { message: `Server error: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}