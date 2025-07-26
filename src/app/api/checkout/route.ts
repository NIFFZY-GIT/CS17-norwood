// src/app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getSession } from '@/lib/session';
import clientPromise from '@/lib/mongodb';

const DB_NAME = 'norwooddb';
const PRODUCTS_COLLECTION = 'items'; // Use your actual products collection name
const ORDERS_COLLECTION = 'orders';
const CART_COLLECTION = 'cart';

interface CartItem {
  _id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const { shippingDetails, cartItems: clientCartItems } = await request.json();

    if (!shippingDetails || !clientCartItems || clientCartItems.length === 0) {
      return NextResponse.json({ error: 'Missing required checkout data.' }, { status: 400 });
    }

    // --- CRITICAL: Server-side validation ---
    // Never trust prices or item details sent from the client.
    // Fetch the real product data from your database to calculate the total.
    const productIds = clientCartItems.map((item: CartItem) => new ObjectId(item.productId));
    
    const productsFromDb = await db.collection(PRODUCTS_COLLECTION).find({
      _id: { $in: productIds }
    }).toArray();

    let serverCalculatedTotal = 0;
    const orderItems = [];

    for (const clientItem of clientCartItems) {
      const product = productsFromDb.find(p => p._id.toString() === clientItem.productId);

      if (!product) {
        throw new Error(`Product with ID ${clientItem.productId} not found.`);
      }

      // Use the database price, not the client-sent price
      serverCalculatedTotal += product.price * clientItem.quantity;
      
      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price, // Use server price!
        quantity: clientItem.quantity,
        image: product.image,
      });
    }

    // --- Create the Order in the Database ---
    const newOrder = {
      userId: new ObjectId(session.userId),
      totalAmount: serverCalculatedTotal,
      status: 'PENDING', // Or 'PAID' if integrating payment
      shippingDetails: {
        fullName: shippingDetails.fullName,
        email: shippingDetails.email,
        phone: shippingDetails.phone,
        address: shippingDetails.address,
        city: shippingDetails.city,
        postalCode: shippingDetails.postalCode,
        country: shippingDetails.country,
      },
      items: orderItems,
      createdAt: new Date(),
    };
    
    const result = await db.collection(ORDERS_COLLECTION).insertOne(newOrder);

    // --- Clear the user's cart after successful order creation ---
    await db.collection(CART_COLLECTION).deleteMany({
      userId: new ObjectId(session.userId)
    });

    return NextResponse.json({ 
      message: 'Order placed successfully', 
      orderId: result.insertedId.toString() 
    });

  } catch (error) {
    console.error('[CHECKOUT_POST_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}