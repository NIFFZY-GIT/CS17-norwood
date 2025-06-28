// src/app/api/preferences/route.ts

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, preferences } = body;

    // --- Validation ---
    if (!email || !preferences) {
      return NextResponse.json({ message: 'Email and preferences are required.' }, { status: 400 });
    }

    // CRUCIAL: Verify that `preferences` is a non-null object and not an array.
    if (typeof preferences !== 'object' || preferences === null || Array.isArray(preferences)) {
      return NextResponse.json({ message: 'Preferences must be a valid object.' }, { status: 400 });
    }

    // --- Database Update ---
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "norwooddb");
    const users = db.collection('users');

    const result = await users.updateOne(
      { email: email.toLowerCase() }, // Find user by email
      { $set: { preferences: preferences } } // Set the preferences field to the object we received
    );

    // Use `matchedCount` to see if the user was found, which is more reliable than `modifiedCount`.
    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "User not found or an error occurred." }, { status: 404 });
    }

    return NextResponse.json({ message: 'Preferences saved successfully.' }, { status: 200 });

  } catch (error) {
    console.error("Error in /api/preferences:", error);
    // Avoid leaking detailed error info to the client
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}