import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import clientPromise from '@/lib/mongodb';
import { Item, User } from '@/lib/types';
import { ObjectId } from 'mongodb';

const RECOMMENDATION_COUNT = 5;

// Define a type for the User document as it exists in the DB (with ObjectId)
interface UserFromDB extends Omit<User, '_id'> {
    _id: ObjectId;
}

export async function GET() {
  const session = await getSession();

  if (!session || !session.userId) {
    return NextResponse.json({ recommendations: [] });
  }

  try {
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB_NAME;
    if (!dbName) throw new Error("MONGODB_DB_NAME is not set.");
    const db = client.db(dbName);

    // Use the DB-specific type for the collection
    const usersCollection = db.collection<UserFromDB>('users');

    // --- THE FIX IS HERE: No more 'as any' ---
    // This query is now fully type-safe.
    const user = await usersCollection.findOne({
      _id: new ObjectId(session.userId),
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const allItems = await db.collection<Item>('items').find({ inStock: true }).toArray();
    const userPreference = user.preferences?.category;

    let sortedItems: Item[];

    if (userPreference) {
      sortedItems = allItems.sort((a, b) => {
        const aMatches = a.category === userPreference;
        const bMatches = b.category === userPreference;
        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
        return 0;
      });
    } else {
      sortedItems = allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const finalRecommendations = sortedItems.slice(0, RECOMMENDATION_COUNT);
    return NextResponse.json({ recommendations: finalRecommendations });

  } catch (error) {
    console.error("RECOMMENDATION_API_ERROR:", error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}