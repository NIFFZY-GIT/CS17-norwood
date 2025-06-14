import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Db } from 'mongodb';
// In a real app, you would add authentication logic here
// import { getSession } from 'next-auth/react'; or other auth library

export async function GET() {
  // **SECURITY NOTE:** Protect this route!
  // const session = await getSession();
  // if (!session || !session.user.isAdmin) {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }

  try {
    const client = await clientPromise;
    const db: Db = client.db(process.env.DB_NAME);

    const applications = await db
      .collection('applications')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching applications.' },
      { status: 500 }
    );
  }
}