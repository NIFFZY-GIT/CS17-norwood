// src/app/api/items/[itemId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import { Item } from '@/lib/types';
import { ObjectId } from 'mongodb'; 

// This helper type correctly represents the document in MongoDB.
interface ItemFromDB extends Omit<Item, '_id'> {
  _id: ObjectId;
}

// This is the function that your details page calls
export async function GET(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  const { itemId } = params;

  if (!ObjectId.isValid(itemId)) {
    return NextResponse.json({ message: 'Invalid item ID format' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME!);
    
    // Find the single item in the database
    const item = await db.collection('items').findOne({ _id: new ObjectId(itemId) });

    // If no item is found, return a 404
    if (!item) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }

    // Convert the database document to the API 'Item' type
    const responseItem: Item = {
      ...item,
      _id: item._id.toString(),
      originalPrice: item.originalPrice || undefined,
      category: item.category || 'Uncategorized',
    } as unknown as Item;

    return NextResponse.json(responseItem, { status: 200 });

  } catch (error) {
    console.error(`GET /api/items/${itemId}: Failed to fetch item:`, error);
    return NextResponse.json({ message: 'Server error while fetching item' }, { status: 500 });
  }
}


// --- PUT: Updates an existing item ---
export async function PUT(request: NextRequest, { params }: { params: { itemId: string } }) {
  const { itemId } = params;
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  if (!ObjectId.isValid(itemId)) return NextResponse.json({ message: 'Invalid item ID' }, { status: 400 });

  try {
    const body: Partial<Omit<Item, '_id'>> = await request.json();
    if (Object.keys(body).length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME!);
    const itemsCollection = db.collection<ItemFromDB>('items');

    const existingItem = await itemsCollection.findOne({ _id: new ObjectId(itemId) });
    if (!existingItem) {
        return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }

    const finalPrice = body.price !== undefined ? body.price : existingItem.price;
    const finalOriginalPrice = body.originalPrice !== undefined ? body.originalPrice : existingItem.originalPrice;

    if (finalOriginalPrice !== undefined && finalPrice >= finalOriginalPrice) {
        return NextResponse.json({ message: 'Original price must be greater than the current price.' }, { status: 400 });
    }
    
    const updateResult = await itemsCollection.findOneAndUpdate(
      { _id: new ObjectId(itemId) },
      { $set: body },
      { returnDocument: 'after' }
    );
    
    const updatedDoc = updateResult;

    if (!updatedDoc) {
      return NextResponse.json({ message: 'Item not found during update' }, { status: 404 });
    }
    
    const respItem: Item = {
      ...updatedDoc,
      _id: updatedDoc._id.toString(),
      originalPrice: updatedDoc.originalPrice || undefined,
      category: updatedDoc.category || 'Uncategorized',
    };

    return NextResponse.json(respItem, { status: 200 });
  } catch (error) {
    console.error(`PUT /api/items/${itemId}:`, error);
    return NextResponse.json({ message: 'An unknown server error occurred' }, { status: 500 });
  }
}

// --- DELETE: Removes an item ---
export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId:string } }
) {
  const { itemId } = params;
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  if (!ObjectId.isValid(itemId)) return NextResponse.json({ message: 'Invalid item ID format' }, { status: 400 });
  
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME!);
    const itemsCollection = db.collection<ItemFromDB>('items');
    
    const result = await itemsCollection.deleteOne({
      _id: new ObjectId(itemId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/items/${itemId}: Server error:`, error);
    return NextResponse.json({ message: 'An unknown server error occurred' }, { status: 500 });
  }
}