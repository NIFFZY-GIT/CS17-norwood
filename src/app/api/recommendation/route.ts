import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

// Cache for co-occurrence matrix (cache for 5 minutes)
let cachedCoOccurrence: { [key: string]: { [key: string]: number } } | null = null;
let cacheExpiry = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getCartCoOccurrences() {
  // Check cache first
  const now = Date.now();
  if (cachedCoOccurrence && now < cacheExpiry) {
    console.log('Using cached co-occurrence matrix');
    return cachedCoOccurrence;
  }

  try {
    console.log('Computing fresh co-occurrence matrix');
    await client.connect();
    const db = client.db('norwooddb'); 
    const carts = await db.collection('carts').find({}).toArray();

    if (!carts.length) {
      console.log('No cart entries found');
      const emptyMatrix = {};
      // Cache empty result too
      cachedCoOccurrence = emptyMatrix;
      cacheExpiry = now + CACHE_DURATION;
      return emptyMatrix;
    }

    // Group carts by user to find products purchased together
    const userCarts: { [userId: string]: string[] } = {};
    for (const cart of carts) {
      const userId = cart.userId?.toString();
      const productId = cart.productId?.toString();
      if (!userId || !productId) {
        console.warn('Skipping invalid cart entry:', cart);
        continue;
      }
      if (!userCarts[userId]) {
        userCarts[userId] = [];
      }
      userCarts[userId].push(productId);
    }

    // Build co-occurrence matrix
    const coOccurrence: { [key: string]: { [key: string]: number } } = {};
    for (const userId in userCarts) {
      const products = userCarts[userId];
      for (let i = 0; i < products.length; i++) {
        const productA = products[i];
        if (!coOccurrence[productA]) {
          coOccurrence[productA] = {};
        }
        for (let j = 0; j < products.length; j++) {
          if (i !== j) {
            const productB = products[j];
            coOccurrence[productA][productB] = (coOccurrence[productA][productB] || 0) + 1;
          }
        }
      }
    }
    console.log('Co-occurrence matrix:', JSON.stringify(coOccurrence, null, 2));
    
    // Cache the result
    cachedCoOccurrence = coOccurrence;
    cacheExpiry = now + CACHE_DURATION;
    
    return coOccurrence;
  } catch (error) {
    console.error('Error in getCartCoOccurrences:', error);
    throw new Error(`Failed to compute co-occurrences: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    await client.close();
  }
}

export async function GET(request: Request) {
  try {
    console.log('Handling GET request for /api/recommendations');
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    console.log('Requested productId:', productId);

    const coOccurrence = await getCartCoOccurrences();
    let recommendations: string[] = [];

    if (productId && coOccurrence && productId in coOccurrence) {
      const productCoOccurrences = (coOccurrence as { [key: string]: { [key: string]: number } })[productId];
      recommendations = Object.keys(productCoOccurrences)
        .sort((a, b) => productCoOccurrences[b] - productCoOccurrences[a])
        .slice(0, 4);
      console.log('[2025-07-10 09:39 AM +0530] Recommendations for', productId, ':', recommendations);
    } else {
      console.log('[2025-07-10 09:39 AM +0530] No co-occurrences found for productId:', productId);
    }

    await client.connect();
    const db = client.db('norwooddb'); 
    let items;
    if (recommendations.length) {
      const validIds = recommendations
        .map(id => {
          try {
            return new ObjectId(id);
          } catch {
            console.warn('Invalid ObjectId:', id);
            return null;
          }
        })
        .filter(id => id !== null);
      items = await db.collection('items')
        .find({ _id: { $in: validIds }, inStock: true, imageBase64: { $exists: true, $ne: '' }, name: { $exists: true, $ne: '' } })
        .toArray();
    } else {
      console.log('Falling back to popular in-stock items');
      items = await db.collection('items')
        .find({ inStock: true, imageBase64: { $exists: true, $ne: '' }, name: { $exists: true, $ne: '' } })
        .limit(4)
        .toArray();
    }

    if (!items.length) {
      console.log('No valid items found for recommendations or fallback');
      return NextResponse.json([]);
    }

    // Validate items
    const validItems = items.filter(item => item.name && item.imageBase64 && item.imageBase64 !== '');
    console.log('Returning items:', validItems.map(item => ({ name: item.name, id: item._id })));
    return NextResponse.json(validItems);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch recommendations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}