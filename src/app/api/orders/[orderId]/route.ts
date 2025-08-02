// src/app/api/orders/[orderId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getSession } from '@/lib/session';
import clientPromise from '@/lib/mongodb';

const DB_NAME = 'norwooddb';
const ORDERS_COLLECTION = 'orders';

// GET handler for fetching a specific order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    // Validate orderId format
    if (!ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const order = await db.collection(ORDERS_COLLECTION).findOne({
      _id: new ObjectId(orderId)
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('[ORDER_GET_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// --- PUT handler for an admin to update an order's status ---
export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId || session.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { orderId } = await params;
    const { status } = await request.json();
    
    // Validate status to prevent arbitrary data injection
    const validStatuses = ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
        return NextResponse.json({ message: 'Invalid status value' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    const result = await db.collection(ORDERS_COLLECTION).updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { status: status } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Order status updated' });
  } catch (error) {
    console.error('[ADMIN_ORDER_PUT_ERROR]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// --- DELETE handler for an admin to delete an order ---
export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId || session.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { orderId } = await params;

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const result = await db.collection(ORDERS_COLLECTION).deleteOne({ 
      _id: new ObjectId(orderId) 
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    console.error('[ADMIN_ORDER_DELETE_ERROR]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}