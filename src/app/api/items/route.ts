// src/app/api/items/route.ts
import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import { Item } from '@/lib/types';
import { ObjectId } from 'mongodb';

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
    const itemsCollection = db.collection<ItemFromDB>('items');

    const dbItems = await itemsCollection.find({}).sort({ createdAt: -1 }).toArray();

    const items: Item[] = dbItems.map((dbItem) => ({
      ...dbItem,
      _id: dbItem._id.toString(),
      price: dbItem.price ?? 0,
      currency: dbItem.currency ?? 'LKR', // Defaulting to LKR as per your modal
      inStock: dbItem.inStock ?? false,
      originalPrice: dbItem.originalPrice || undefined,
      // FIX: Add 'category' with a default value for backward compatibility.
      // This prevents errors if you have old items in your DB without a category.
      category: dbItem.category || 'Uncategorized',
    }));

    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error('GET /api/items: Failed to fetch items from DB:', error);
    return NextResponse.json({ message: 'Server error while fetching items' }, { status: 500 });
  }
}

// --- POST: Creates a new item, now including the 'category' field ---
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  if (!process.env.MONGODB_DB_NAME) {
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  try {
    // FIX: Destructure 'category' from the request body.
    const body: Partial<Omit<Item, '_id' | 'userId' | 'createdAt'>> = await request.json();
    const { name, description, itemCode, imageBase64, price, currency, inStock, originalPrice, category } = body;

    // FIX: Add 'category' to the validation to make it a required field.
    if (!name || !description || !imageBase64 || price === undefined || !currency || inStock === undefined || !category) {
      return NextResponse.json({ message: 'Missing required fields. Name, description, image, price, currency, stock status, and category are all required.' }, { status: 400 });
    }
    
    if (originalPrice && price >= originalPrice) {
        return NextResponse.json({ message: 'Original price must be greater than the current price.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const itemsCollection = db.collection('items');
    
    const newItemData = {
      name, description, itemCode, imageBase64, price, currency, inStock,
      originalPrice: originalPrice || undefined,
      // FIX: Add 'category' to the object being inserted into the database.
      category,
      tags: [], // Add missing tags property
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