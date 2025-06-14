import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ message: 'Missing username or password' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('norwooddb'); // change this to your DB name
    const users = db.collection('users');

    const existingUser = await users.findOne({ username });

    if (existingUser) {
      return NextResponse.json({ message: 'Username already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await users.insertOne({
      username,
      password: hashedPassword,
      createdAt: new Date()
    });

    return NextResponse.json({ message: 'User registered successfully', userId: result.insertedId });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
