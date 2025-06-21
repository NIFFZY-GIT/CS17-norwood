// src/app/api/items/route.ts
import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import { Item } from '@/lib/types';
import { ObjectId } from 'mongodb';

// FIX 1: Define a type that matches the MongoDB document structure.
// This is the key to removing 'any'.
interface ItemFromDB extends Omit<Item, '_id'> {
  _id: ObjectId;
}

// --- GET: Reads REAL data with proper typing ---
export async function GET() {
  if (!process.env.MONGODB_DB_NAME) {
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    // FIX 2: Strongly type the collection.
    const itemsCollection = db.collection<ItemFromDB>('items');

    const dbItems = await itemsCollection.find({}).sort({ createdAt: -1 }).toArray();

    // FIX 3: TypeScript now knows 'dbItem' is of type 'ItemFromDB', so 'any' is no longer needed.
    const items: Item[] = dbItems.map((dbItem) => ({
      ...dbItem,
      _id: dbItem._id.toString(),
      price: dbItem.price ?? 0,
      currency: dbItem.currency ?? 'USD',
      inStock: dbItem.inStock ?? false,
      originalPrice: dbItem.originalPrice || undefined,
    }));

    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error('GET /api/items: Failed to fetch items from DB:', error);
    return NextResponse.json({ message: 'Server error while fetching items' }, { status: 500 });
  }
}

// --- POST: Creates a new item with strong typing ---
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  if (!process.env.MONGODB_DB_NAME) {
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  try {
    const body: Omit<Item, '_id' | 'userId' | 'createdAt'> = await request.json();
    const { name, description, itemCode, imageBase64, price, currency, inStock, originalPrice } = body;

    if (!name || !description || !itemCode || !imageBase64 || price === undefined || !currency || inStock === undefined) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    
    // ... (rest of your validation logic is good)

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const itemsCollection = db.collection('items');
    
    const newItemData = {
      name, description, itemCode, imageBase64, price, currency, inStock,
      originalPrice: originalPrice !== undefined ? originalPrice : undefined,
      userId: session.userId,
      createdAt: new Date(),
    };

    const result = await itemsCollection.insertOne(newItemData);

    const insertedItem: Item = {
      _id: result.insertedId.toString(),
      ...newItemData,
    };

    return NextResponse.json(insertedItem, { status: 201 });
  } catch (error) {
    console.error('POST /api/items: Failed to create item:', error);
    return NextResponse.json({ message: 'An unknown server error occurred' }, { status: 500 });
  }
}