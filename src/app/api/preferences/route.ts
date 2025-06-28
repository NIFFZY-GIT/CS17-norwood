// /src/app/api/preferences/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const { email, preferences } = await req.json();

    if (!email || !preferences) {
      return NextResponse.json({ message: 'Email and preferences are required.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "norwooddb");
    const users = db.collection('users');

    const result = await users.updateOne(
      { email: email.toLowerCase() },
      { $set: { preferences } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ message: 'Preferences saved.' }, { status: 200 });
  } catch (error) {
    console.error("Error saving preferences:", error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}