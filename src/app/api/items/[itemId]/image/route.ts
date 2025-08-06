// src/app/api/items/[itemId]/image/route.ts
import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;

    if (!ObjectId.isValid(itemId)) {
      return NextResponse.json({ message: 'Invalid item ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const itemsCollection = db.collection('items');

    const item = await itemsCollection.findOne(
      { _id: new ObjectId(itemId) },
      { projection: { imageBase64: 1 } }
    );

    if (!item || !item.imageBase64) {
      return NextResponse.json({ message: 'Image not found' }, { status: 404 });
    }

    // Create response with caching headers
    const response = NextResponse.json({ imageBase64: item.imageBase64 });
    
    // Add cache headers for better performance
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600'); // 1 hour cache
    response.headers.set('ETag', `"${itemId}"`);
    
    return response;
  } catch (error) {
    console.error('GET /api/items/[itemId]/image: Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
