// src/app/api/items/[itemId]/image/route.ts
import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;

    if (!ObjectId.isValid(itemId)) {
      return NextResponse.json({ message: 'Invalid item ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const itemsCollection = db.collection('items');

    const item = await itemsCollection.findOne(
      { _id: new ObjectId(itemId) },
      { projection: { imageBase64: 1 } }
    );

    if (!item || !item.imageBase64) {
      return NextResponse.json({ message: 'Image not found' }, { status: 404 });
    }

    // Create response with caching headers
    const response = NextResponse.json({ imageBase64: item.imageBase64 });
    
    // Create ETag based on item content to invalidate cache when image changes
    const imageHash = Buffer.from(item.imageBase64.slice(-50)).toString('base64'); // Use last 50 chars as simple hash
    const etag = `"${itemId}-${imageHash}"`;
    
    // Check if client has current version
    const clientETag = request.headers.get('if-none-match');
    if (clientETag === etag) {
      return new NextResponse(null, { status: 304 }); // Not Modified
    }
    
    // Add cache headers - shorter cache time and proper etag
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300'); // 5 minute cache instead of 1 hour
    response.headers.set('ETag', etag);
    
    return response;
  } catch (error) {
    console.error('GET /api/items/[itemId]/image: Error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
