import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Db } from 'mongodb';

// This is the PUBLIC endpoint for fetching job listings.
export async function GET() {
  try {
    const client = await clientPromise;
    const db: Db = client.db(process.env.DB_NAME);

    // Find all vacancies in the collection that are marked as active.
    // This prevents inactive or draft jobs from showing on the public site.
    const vacancies = await db
      .collection('vacancies')
      .find({ isActive: true }) 
      .sort({ createdAt: -1 }) // Show the newest jobs first
      .toArray();

    return NextResponse.json(vacancies);
  } catch (error) {
    console.error('Failed to fetch public vacancies:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching vacancies.' },
      { status: 500 }
    );
  }
}