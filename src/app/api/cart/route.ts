// app/api/cart/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getSession } from '@/lib/session';
import clientPromise from '@/lib/mongodb'; // <-- IMPORT THE UTILITY

const DB_NAME = 'norwooddb';
const CART_COLLECTION = 'cart';

// --- GET /api/cart ---
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      // User not logged in, return an empty cart. This is fine.
      return NextResponse.json([]);
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    const cartItems = await db.collection(CART_COLLECTION).find({ 
      userId: new ObjectId(session.userId) 
    }).toArray();
    
    // Serialize ObjectIds to strings for the client
    const serializedItems = cartItems.map(item => ({
      ...item,
      _id: item._id.toString(),
      productId: item.productId.toString(),
      userId: item.userId.toString()
    }));
    
    return NextResponse.json(serializedItems);
  } catch (error) {
    console.error('[CART_GET_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

// --- POST /api/cart ---
// Note: This function wasn't in your original file but is good practice for adding new items.
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity, name, price, image } = await request.json();
    
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    const existingItem = await db.collection(CART_COLLECTION).findOne({ 
      userId: new ObjectId(session.userId),
      productId: new ObjectId(productId) 
    });
    
    if (existingItem) {
      await db.collection(CART_COLLECTION).updateOne(
        { _id: existingItem._id },
        { $inc: { quantity: quantity }, $set: { updatedAt: new Date() } }
      );
    } else {
      await db.collection(CART_COLLECTION).insertOne({
        userId: new ObjectId(session.userId),
        productId: new ObjectId(productId),
        quantity,
        name,
        price,
        image,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return NextResponse.json({ success: true, message: 'Cart updated' });
  } catch (error) {
    console.error('[CART_POST_ERROR]', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}


// --- PUT /api/cart?id=<itemId> ---
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { quantity } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Missing item ID' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    const result = await db.collection(CART_COLLECTION).updateOne(
      { 
        _id: new ObjectId(id),
        userId: new ObjectId(session.userId) // Security check
      },
      { $set: { quantity: quantity, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Item not found or you do not have permission to edit it' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Item updated' });
  } catch (error) {
    console.error('[CART_PUT_ERROR]', error);
    return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 });
  }
}

// --- DELETE /api/cart?id=<itemId> ---
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
        return NextResponse.json({ error: 'Missing item ID' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    const result = await db.collection(CART_COLLECTION).deleteOne({ 
      _id: new ObjectId(id),
      userId: new ObjectId(session.userId) // Security check
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Item not found or you do not have permission to delete it' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Item removed' });
  } catch (error) {
    console.error('[CART_DELETE_ERROR]', error);
    return NextResponse.json({ error: 'Failed to remove cart item' }, { status: 500 });
  }
}