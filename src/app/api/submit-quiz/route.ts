// app/api/submit-quiz/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb'; // <-- IMPORTANT: Import ObjectId

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, answers } = body;

    // Basic validation
    if (!userId || !answers || typeof answers !== 'object' || Object.keys(answers).length === 0) {
      return NextResponse.json({ message: 'User ID and answers are required.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('norwooddb');

    // Find the user by their ID and update their document
    // We must convert the string userId back to a MongoDB ObjectId
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          quizResponses: answers,
          updatedAt: new Date() 
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Quiz submitted successfully' }, { status: 200 });

  } catch (error) {
    console.error('QUIZ_SUBMISSION_ERROR:', error);
    // Handle potential ObjectId casting errors
    if (error instanceof Error && error.message.includes('Argument passed in must be a string')) {
       return NextResponse.json({ message: 'Invalid User ID format.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}