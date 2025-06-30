// app/api/cart/route.ts
import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { getSession } from '@/lib/session';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { productId, quantity, name, price, image } = await request.json();
    
    await client.connect();
    const db = client.db('norwooddb');
    const cartCollection = db.collection('cart');
    
    // Check if item already exists in cart for this user
    const existingItem = await cartCollection.findOne({ 
      userId: new ObjectId(session.userId),
      productId: new ObjectId(productId) 
    });
    
    if (existingItem) {
      // Update quantity if item exists
      await cartCollection.updateOne(
        { 
          userId: new ObjectId(session.userId),
          productId: new ObjectId(productId) 
        },
        { $inc: { quantity } }
      );
    } else {
      // Add new item to cart
      await cartCollection.insertOne({
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
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cart API error:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function GET() {
  try {
    const session = await getSession();
    
    // If no session, return empty array (not an error)
    if (!session?.userId) {
      return NextResponse.json([], { status: 200 });
    }

    await client.connect();
    const db = client.db('norwooddb');
    const cartCollection = db.collection('cart');
    
    const cartItems = await cartCollection.find({ 
      userId: new ObjectId(session.userId) 
    }).toArray();
    
    const serializedItems = cartItems.map(item => ({
      ...item,
      _id: item._id.toString(),
      productId: item.productId.toString(),
      userId: item.userId.toString()
    }));
    
    return NextResponse.json(serializedItems);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { quantity } = await request.json();
    
    if (!id) throw new Error('Missing item ID');
    
    await client.connect();
    const db = client.db('norwooddb');
    const cartCollection = db.collection('cart');
    
    const result = await cartCollection.updateOne(
      { 
        _id: new ObjectId(id),
        userId: new ObjectId(session.userId) 
      },
      { $set: { quantity: quantity, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      throw new Error('Item not found in cart');
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update cart item' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) throw new Error('Missing item ID');
    
    await client.connect();
    const db = client.db('norwooddb');
    const cartCollection = db.collection('cart');
    
    const result = await cartCollection.deleteOne({ 
      _id: new ObjectId(id),
      userId: new ObjectId(session.userId) 
    });
    
    if (result.deletedCount === 0) {
      throw new Error('Item not found in cart');
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove cart item' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}