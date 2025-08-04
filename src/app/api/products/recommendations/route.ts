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
  console.log('RECOMMENDATIONS API: Starting recommendation fetch');
  const session = await getSession();
  console.log('RECOMMENDATIONS API: Session status:', !!session, session?.userId);

  try {
    console.log('RECOMMENDATIONS API: Connecting to database');
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB_NAME;
    if (!dbName) throw new Error("MONGODB_DB_NAME is not set.");
    const db = client.db(dbName);

    // Optimize: Get items and user data in parallel
    const [allItems, user] = await Promise.all([
      db.collection<Item>('items').find({ inStock: true }).limit(20).toArray(), // Limit items for better performance
      session?.userId 
        ? db.collection<UserFromDB>('users').findOne({ _id: new ObjectId(session.userId) })
        : null
    ]);

    console.log('RECOMMENDATIONS API: Found', allItems.length, 'items in stock');
    
    if (!allItems.length) {
      console.log('RECOMMENDATIONS API: No items found, returning empty array');
      return NextResponse.json({ recommendations: [] });
    }

    let finalRecommendations: Item[];
    const userPreference = user?.preferences?.category;
    console.log('RECOMMENDATIONS API: User preference category:', userPreference);

    if (userPreference && session?.userId) {
      console.log('RECOMMENDATIONS API: Sorting by user preference:', userPreference);
      // Prefer items matching user category, then others
      const matchingItems = allItems.filter(item => item.category === userPreference);
      const otherItems = allItems.filter(item => item.category !== userPreference);
      finalRecommendations = [...matchingItems, ...otherItems].slice(0, RECOMMENDATION_COUNT);
    } else {
      console.log('RECOMMENDATIONS API: No user preference, using most recent items');
      // Default: most recently created items
      finalRecommendations = allItems
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, RECOMMENDATION_COUNT);
    }

    console.log('RECOMMENDATIONS API: Returning', finalRecommendations.length, 'recommendations');
    console.log('RECOMMENDATIONS API: Recommendation names:', finalRecommendations.map(item => item.name));
    return NextResponse.json({ recommendations: finalRecommendations });

  } catch (error) {
    console.error("RECOMMENDATION_API_ERROR:", error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}