// src/app/api/user/update-prefs/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { QuizPrefs } from '@/lib/types'; // Import the type

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, prefs } = body as { userId: string, prefs: QuizPrefs };

    if (!userId || !prefs) {
      return NextResponse.json({ message: 'User ID and preferences are required' }, { status: 400 });
    }

    // Validate if the userId is a valid MongoDB ObjectId
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ message: 'Invalid User ID format' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('norwooddb');
    const users = db.collection('users');

    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { preferences: prefs } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Preferences updated successfully' }, { status: 200 });

  } catch (error: unknown) {
    console.error('UPDATE_PREFS_ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: `An internal server error occurred: ${errorMessage}` }, { status: 500 });
  }
}