import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import { Item } from '@/lib/types';
import { ObjectId } from 'mongodb';

// Define the interface for the route context params
interface RouteParams {
  params: Promise<{ itemId: string }>;
}

interface ItemFromDB extends Omit<Item, '_id'> {
  _id: ObjectId;
}

// --- GET: Retrieves a single item ---
export async function GET(
  request: NextRequest,
  { params }: RouteParams // Use the explicit RouteParams interface
) {
  const { itemId } = await params;

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
  request: NextRequest,
  { params }: RouteParams // Use the explicit RouteParams interface
) {
  const startTime = Date.now();
  console.log(`PUT /api/items/[itemId]: Starting update request`);
  
  const { itemId } = await params;
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  if (!ObjectId.isValid(itemId)) return NextResponse.json({ message: 'Invalid item ID' }, { status: 400 });

  try {
    const body: Partial<Omit<Item, '_id'>> = await request.json();
    console.log(`PUT /api/items/${itemId}: Received update data:`, Object.keys(body));
    
    if (Object.keys(body).length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME!);
    const itemsCollection = db.collection<ItemFromDB>('items');

    // Only validate price logic if relevant fields are being updated
    if (body.price !== undefined || body.originalPrice !== undefined) {
      console.log(`PUT /api/items/${itemId}: Price validation needed - checking existing item`);
      const existingItem = await itemsCollection.findOne({ _id: new ObjectId(itemId) });
      if (!existingItem) {
        console.log(`PUT /api/items/${itemId}: Item not found`);
        return NextResponse.json({ message: 'Item not found' }, { status: 404 });
      }

      const priceForValidation = body.price ?? existingItem.price;
      const originalPriceForValidation = body.originalPrice ?? existingItem.originalPrice;

      if (originalPriceForValidation !== undefined && priceForValidation >= originalPriceForValidation) {
        console.log(`PUT /api/items/${itemId}: Price validation failed - price: ${priceForValidation}, originalPrice: ${originalPriceForValidation}`);
        return NextResponse.json({ message: 'Original price must be greater than the current price.' }, { status: 400 });
      }
    }

    console.log(`PUT /api/items/${itemId}: Updating item in database`);
    const updateResult = await itemsCollection.findOneAndUpdate(
      { _id: new ObjectId(itemId) },
      { $set: body },
      { returnDocument: 'after' }
    );

    if (!updateResult) {
      console.log(`PUT /api/items/${itemId}: Item not found during update`);
      return NextResponse.json({ message: 'Item not found during update' }, { status: 404 });
    }

    const { _id, ...restOfUpdatedDoc } = updateResult;
    const responseItem: Item = {
      ...restOfUpdatedDoc,
      _id: _id.toString(),
      originalPrice: restOfUpdatedDoc.originalPrice ?? undefined,
      category: restOfUpdatedDoc.category ?? 'Uncategorized',
    };

    const duration = Date.now() - startTime;
    console.log(`PUT /api/items/${itemId}: Successfully updated item in ${duration}ms`);
    return NextResponse.json(responseItem, { status: 200 });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`PUT /api/items/${itemId}: Error after ${duration}ms:`, error);
    return NextResponse.json({ message: 'An unknown server error occurred' }, { status: 500 });
  }
}

// --- DELETE: Removes an item ---
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams // Use the explicit RouteParams interface
) {
  const { itemId } = await params;
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