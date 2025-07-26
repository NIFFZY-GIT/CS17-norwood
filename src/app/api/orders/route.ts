// src/app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import clientPromise from '@/lib/mongodb';
// 'ObjectId' is no longer needed here, so it has been removed.
import { ObjectId } from 'mongodb'; 

const DB_NAME = 'norwooddb';
const ORDERS_COLLECTION = 'orders';
const USERS_COLLECTION = 'users';

// FIX: Define a type for the order item to avoid using 'any'
interface OrderItemFromDB {
  productId: ObjectId; // It will be an ObjectId from the DB
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId || session.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const orders = await db.collection(ORDERS_COLLECTION).aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: USERS_COLLECTION,
          localField: 'userId',
          foreignField: '_id',
          as: 'customerInfo'
        }
      },
      {
        $unwind: {
          path: '$customerInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          totalAmount: 1,
          status: 1,
          createdAt: 1,
          shippingDetails: 1,
          items: 1,
          customer: {
            email: '$customerInfo.email',
            username: '$customerInfo.username',
            id: '$customerInfo._id'
          }
        }
      }
    ]).toArray();

    const serializedOrders = orders.map(order => ({
      ...order,
      _id: order._id.toString(),
      customer: {
        ...order.customer,
        id: order.customer.id?.toString()
      },
      // FIX: Use the specific OrderItemFromDB type here
      items: order.items.map((item: OrderItemFromDB) => ({
        ...item,
        productId: item.productId.toString()
      }))
    }));
    
    return NextResponse.json(serializedOrders);

  } catch (error) {
    console.error('[ADMIN_ORDERS_GET_ERROR]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}