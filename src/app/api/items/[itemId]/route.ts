import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import { Item } from '@/lib/types';
import { ObjectId } from 'mongodb'; 

interface ItemFromDB extends Omit<Item, '_id'> {
  _id: ObjectId;
}

// --- GET: Retrieves a single item ---
export async function GET(
  request: Request,
  // FIX: The second argument is destructured directly. This resolves the TypeScript
  // error and is a common pattern for accessing route parameters.
  { params }: { params: { itemId: string } } 
) {
  // FIX: We can now get itemId directly from the destructured params
  const { itemId } = params;

  if (!ObjectId.isValid(itemId)) {
    return NextResponse.json({ message: 'Invalid item ID format' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME!);
    
    const item = await db.collection<ItemFromDB>('items').findOne({ _id: new ObjectId(itemId) });

    if (!item) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }

    const { _id, ...restOfItem } = item;
    const responseItem: Item = {
      ...restOfItem,
      _id: _id.toString(),
      originalPrice: restOfItem.originalPrice ?? undefined,
      category: restOfItem.category ?? 'Uncategorized',
    };

    return NextResponse.json(responseItem, { status: 200 });

  } catch (error) {
    console.error(`GET /api/items/${itemId}: Failed to fetch item:`, error);
    return NextResponse.json({ message: 'Server error while fetching item' }, { status: 500 });
  }
}

// --- PUT: Updates an existing item ---
export async function PUT(
  request: Request, 
  // FIX: Applied the same destructuring pattern here for consistency.
  { params }: { params: { itemId: string } }
) {
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

    const priceForValidation = body.price ?? existingItem.price;
    const originalPriceForValidation = body.originalPrice ?? existingItem.originalPrice;

    if (originalPriceForValidation !== undefined && priceForValidation >= originalPriceForValidation) {
        return NextResponse.json({ message: 'Original price must be greater than the current price.' }, { status: 400 });
    }
    
    const updateResult = await itemsCollection.findOneAndUpdate(
      { _id: new ObjectId(itemId) },
      { $set: body },
      { returnDocument: 'after' }
    );
    
    if (!updateResult) {
      return NextResponse.json({ message: 'Item not found during update' }, { status: 404 });
    }
    
    const { _id, ...restOfUpdatedDoc } = updateResult;
    const responseItem: Item = {
      ...restOfUpdatedDoc,
      _id: _id.toString(),
      originalPrice: restOfUpdatedDoc.originalPrice ?? undefined,
      category: restOfUpdatedDoc.category ?? 'Uncategorized',
    };

    return NextResponse.json(responseItem, { status: 200 });
  } catch (error) {
    console.error(`PUT /api/items/${itemId}:`, error);
    return NextResponse.json({ message: 'An unknown server error occurred' }, { status: 500 });
  }
}

// --- DELETE: Removes an item ---
export async function DELETE(
  request: Request,
  // FIX: Applied the same destructuring pattern here for consistency.
  { params }: { params: { itemId: string } }
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