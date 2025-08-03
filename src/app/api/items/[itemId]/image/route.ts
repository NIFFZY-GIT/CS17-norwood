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

    return NextResponse.json({ imageBase64: item.imageBase64 });
  } catch (error) {
    console.error('GET /api/items/[itemId]/image: Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
