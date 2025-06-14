// src/app/api/items/[itemId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getSession } from '@/lib/session'; // Your server-side session utility
import { Item } from '@/lib/types';
import { ObjectId } from 'mongodb';

// Interface for DB documents
interface ItemFromDB extends Omit<Item, '_id' | 'createdAt' | 'userId'> {
  _id: ObjectId;
  createdAt: Date;
  userId: string; // Keep userId to know who created it, even if not used for auth on update/delete
}

// PUT: Update an item (any authenticated user can update any item)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  const session = await getSession(); // from lib/session.ts
  if (!session?.userId) {
    // User must be authenticated to attempt an update operation
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!ObjectId.isValid(itemId)) {
    return NextResponse.json({ message: 'Invalid item ID format' }, { status: 400 });
  }
  if (!process.env.MONGODB_DB_NAME) {
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  try {
    const { name, description, itemCode, imageBase64 } = await request.json();
    const updateFields: Partial<Omit<Item, '_id' | 'userId' | 'createdAt'>> = {};

    // --- Field validation and preparation ---
    if (name !== undefined)        updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (itemCode !== undefined)    updateFields.itemCode = itemCode;

    if (imageBase64 !== undefined) {
      if (typeof imageBase64 === 'string' && imageBase64.startsWith('data:image')) {
        updateFields.imageBase64 = imageBase64;
      } else if (imageBase64 === null || imageBase64 === '') { // Allow clearing the image
        updateFields.imageBase64 = '';
      } else {
        return NextResponse.json(
          { message: 'Invalid image data format for update.' },
          { status: 400 }
        );
      }
    }
    // --- End of field validation ---

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const itemsCollection = db.collection<ItemFromDB>('items');

    // Remove owner check (userId: session.userId) for PUT.
    // Any authenticated user can update any item.
    const updatedDoc = await itemsCollection.findOneAndUpdate(
      { _id: new ObjectId(itemId) }, // Filter only by item ID
      { $set: updateFields },
      {
        returnDocument: 'after', // Ensure we get the post-update doc
      }
    );

    if (!updatedDoc) {
      // If no document was updated, it means an item with that ID was not found.
      return NextResponse.json(
        { message: 'Item not found' },
        { status: 404 }
      );
    }

    // Build the API response object
    const respItem: Item = {
      _id: updatedDoc._id.toString(),
      name: updatedDoc.name,
      description: updatedDoc.description,
      itemCode: updatedDoc.itemCode,
      imageBase64: updatedDoc.imageBase64,
      userId: updatedDoc.userId, // Still return original creator's userId
      createdAt: updatedDoc.createdAt,
    };

    return NextResponse.json(respItem, { status: 200 });
  } catch (error: unknown) {
    // Enhanced error handling for BSON size limit specifically
    type DatabaseError = { code?: number; message?: string };
    const dbError = error as DatabaseError;
    if (
      dbError.code === 10334 || // BSON document too large error code
      dbError.message?.toLowerCase().includes('document too large')
    ) {
      return NextResponse.json(
        { message: 'Image is too large to store in the database (max ~1MB). Consider reducing size or using dedicated file storage.' },
        { status: 413 } // Payload Too Large
      );
    }
    if (error instanceof Error) {
      console.error(`PUT /api/items/${itemId}: Server error:`, error);
      return NextResponse.json(
        { message: `Server error: ${error.message}` },
        { status: 500 }
      );
    }
    console.error(`PUT /api/items/${itemId}: Unknown server error:`, error);
    return NextResponse.json(
      { message: 'An unknown server error occurred while updating item' },
      { status: 500 }
    );
  }
}

// DELETE: Remove an item (any authenticated user can delete any item)
export async function DELETE(
  request: NextRequest, // request param is conventional even if not used
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  const session = await getSession(); // from lib/session.ts
  if (!session?.userId) {
    // User must be authenticated to attempt a delete operation
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!ObjectId.isValid(itemId)) {
    return NextResponse.json({ message: 'Invalid item ID format' }, { status: 400 });
  }
  if (!process.env.MONGODB_DB_NAME) {
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const itemsCollection = db.collection<ItemFromDB>('items'); // Use ItemFromDB for consistency

    // The condition `userId: session.userId` is removed here.
    // Now, any authenticated user can delete any item by its ID.
    const result = await itemsCollection.deleteOne({
      _id: new ObjectId(itemId),
    });

    if (result.deletedCount === 0) {
      // If no item was deleted, it means an item with that ID was not found.
      return NextResponse.json(
        { message: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`DELETE /api/items/${itemId}: Server error:`, error);
      return NextResponse.json(
        { message: `Server error: ${error.message}` },
        { status: 500 }
      );
    }
    console.error(`DELETE /api/items/${itemId}: Unknown server error:`, error);
    return NextResponse.json(
      { message: 'An unknown server error occurred while deleting item' },
      { status: 500 }
    );
  }
}