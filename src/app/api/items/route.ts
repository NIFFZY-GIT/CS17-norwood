import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import { Item } from '@/lib/types';
import { ObjectId } from 'mongodb';

interface ItemFromDB extends Omit<Item, '_id' | 'createdAt'> {
  _id: ObjectId;
  createdAt: Date;
}

// GET public items - no login required
export async function GET() {
  console.log("GET /api/items: Public access");

  if (!process.env.MONGODB_DB_NAME) {
    console.error('GET /api/items: MONGODB_DB_NAME is not set');
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const itemsCollection = db.collection<ItemFromDB>('items');

    // Fetch all items without filtering by userId (public view)
    const dbItems = await itemsCollection.find({}).sort({ createdAt: -1 }).toArray();

    const items: Item[] = dbItems.map(dbItem => ({
      ...dbItem,
      _id: dbItem._id.toString(),
    }));

    console.log(`GET /api/items: Found ${items.length} items for public view.`);
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error('GET /api/items: Failed to fetch items from DB:', error);
    return NextResponse.json({ message: 'Server error while fetching items' }, { status: 500 });
  }
}

interface ItemForDbInsertion extends Omit<Item, '_id' | 'userId' | 'createdAt'> {
  userId: string;
  createdAt: Date;
}

// POST a new item - admin only
export async function POST(request: NextRequest) {
  console.log("POST /api/items: Handler started");
  const session = await getSession();
  if (!session?.userId) {
    console.log("POST /api/items: Unauthorized access attempt");
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  console.log(`POST /api/items: Authorized for userId: ${session.userId}`);

  if (!process.env.MONGODB_DB_NAME) {
    console.error('POST /api/items: MONGODB_DB_NAME is not set');
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { name, description, itemCode, imageBase64 } = body;
    console.log("POST /api/items: Received body:", { name, description, itemCode, imageBase64: imageBase64 ? 'Present' : 'Missing' });

    if (!name || !description || !itemCode || !imageBase64) {
      console.log("POST /api/items: Missing required fields.");
      return NextResponse.json({ message: 'Missing required fields (name, description, itemCode, imageBase64)' }, { status: 400 });
    }

    if (typeof imageBase64 !== 'string' || !imageBase64.startsWith('data:image')) {
      console.log("POST /api/items: Invalid image data format.");
      return NextResponse.json({ message: 'Invalid image data format.' }, { status: 400 });
    }

    console.log("POST /api/items: Connecting to DB...");
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const itemsCollection = db.collection('items');

    // Check for existing itemCode for this user
    console.log(`POST /api/items: Checking for existing itemCode '${itemCode}' for userId: ${session.userId}`);
    const existingItem = await itemsCollection.findOne({
      itemCode: itemCode,
      userId: session.userId
    });

    if (existingItem) {
      console.log(`POST /api/items: Item with code '${itemCode}' already exists for this user.`);
      return NextResponse.json({ message: `An item with code '${itemCode}' already exists.` }, { status: 409 }); // Conflict
    }

    const newItemData: ItemForDbInsertion = {
      name,
      description,
      itemCode,
      imageBase64,
      userId: session.userId,
      createdAt: new Date(),
    };

    console.log("POST /api/items: Attempting to insert item:", newItemData.name);
    const result = await itemsCollection.insertOne(newItemData);
    console.log("POST /api/items: Item inserted with ID:", result.insertedId.toString());

    const insertedItem: Item = {
      _id: result.insertedId.toString(),
      name: newItemData.name,
      description: newItemData.description,
      itemCode: newItemData.itemCode,
      imageBase64: newItemData.imageBase64,
      userId: newItemData.userId,
      createdAt: newItemData.createdAt,
    };

    return NextResponse.json(insertedItem, { status: 201 });
  } catch (error) {
    console.error('POST /api/items: Failed to create item:', error);
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const dbError = error as { code?: number; message?: string };
      if (dbError.code === 10334 || (dbError.message && dbError.message.toLowerCase().includes('document too large'))) {
        return NextResponse.json({ message: 'Image is too large to store. Max ~1MB with Base64 encoding overhead. Consider a dedicated file storage service.' }, { status: 413 });
      }
    } else if (error instanceof Error) {
      return NextResponse.json({ message: `Server error: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unknown server error occurred while creating item' }, { status: 500 });
  }
}
