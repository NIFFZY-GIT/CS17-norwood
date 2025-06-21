// src/app/api/items/[itemId]/route.ts
// Handles operations on a single, specific item:
// - PUT:      Update an existing item (requires authentication).
// - DELETE:   Delete an item (requires authentication).

import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import { Item } from '@/lib/types';
import { ObjectId } from 'mongodb';


// --- PUT: Updates an existing item with any provided fields ---
export async function PUT(request: NextRequest, { params }: { params: { itemId: string } }) {
  const { itemId } = params;
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!ObjectId.isValid(itemId)) {
    return NextResponse.json({ message: 'Invalid item ID' }, { status: 400 });
  }
  
  try {
    const body = await request.json();
    const updateFields: Partial<Omit<Item, '_id' | 'userId' | 'createdAt'>> = {};

    // Dynamically build the update object based on fields provided in the request
    if (body.name !== undefined) updateFields.name = body.name;
    if (body.description !== undefined) updateFields.description = body.description;
    if (body.itemCode !== undefined) updateFields.itemCode = body.itemCode;
    if (body.imageBase64 !== undefined) updateFields.imageBase64 = body.imageBase64;
    if (body.price !== undefined) updateFields.price = body.price;
    if (body.currency !== undefined) updateFields.currency = body.currency;
    if (body.inStock !== undefined) updateFields.inStock = body.inStock;
    if (body.originalPrice !== undefined) updateFields.originalPrice = body.originalPrice;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME!);
    
    // Using $set is efficient as it only modifies the provided fields
    const updatedDoc = await db.collection('items').findOneAndUpdate(
      { _id: new ObjectId(itemId) },
      { $set: updateFields },
      { returnDocument: 'after' } // Return the document *after* the update
    );

    if (!updatedDoc) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }
    
    const respItem: Item = {
      ...updatedDoc,
      _id: updatedDoc._id.toString(),
    } as unknown as Item; // Cast because findOneAndUpdate returns a generic Document

    return NextResponse.json(respItem, { status: 200 });

  } catch (error) {
    console.error(`PUT /api/items/${itemId}:`, error);
    return NextResponse.json({ message: 'An unknown server error occurred' }, { status: 500 });
  }
}

// --- DELETE: Removes an item from the database ---
export async function DELETE(
  request: NextRequest, // request param is conventional even if not used
  { params }: { params: { itemId: string } }
) {
  const { itemId } = params;
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!ObjectId.isValid(itemId)) {
    return NextResponse.json({ message: 'Invalid item ID format' }, { status: 400 });
  }
  
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME!);
    
    const result = await db.collection('items').deleteOne({
      _id: new ObjectId(itemId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error(`DELETE /api/items/${itemId}: Server error:`, error);
    return NextResponse.json({ message: 'An unknown server error occurred' }, { status: 500 });
  }
}