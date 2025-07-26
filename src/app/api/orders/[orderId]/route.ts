// src/app/api/orders/[orderId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getSession } from '@/lib/session';
import clientPromise from '@/lib/mongodb';

const DB_NAME = 'norwooddb';
const ORDERS_COLLECTION = 'orders';

// ... (Your existing GET handler can remain, it's for customers viewing their own order)

// --- PUT handler for an admin to update an order's status ---
export async function PUT(
  request: NextRequest, 
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getSession();
    if (!session?.userId || session.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { orderId } = params;
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
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getSession();
    if (!session?.userId || session.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { orderId } = params;

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