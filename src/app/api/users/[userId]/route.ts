// src/app/api/users/[userId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import { ObjectId } from 'mongodb';

// PUT endpoint to update user role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const session = await getSession();
  if (!session?.userId || session.role !== 'admin') {
    return NextResponse.json(
      { message: 'Unauthorized: Admin access required.' },
      { status: 403 }
    );
  }

  if (!ObjectId.isValid(userId)) {
    return NextResponse.json(
      { message: 'Invalid user ID format' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { role } = body;

    if (!role || !['admin', 'user'].includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role. Must be "admin" or "user".' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME!);
    const usersCollection = db.collection('users');

    // Update the user's role and set isAdmin for backward compatibility
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          role: role,
          isAdmin: role === 'admin' // Set isAdmin for backward compatibility
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Fetch the updated user to return
    const updatedUser = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { passwordHash: 0 } }
    );

    return NextResponse.json({
      message: 'User role updated successfully',
      user: {
        ...updatedUser,
        _id: updatedUser?._id.toString()
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    const msg = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { message: `Server error: ${msg}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json(
      { message: 'Unauthorized: You must be logged in.' },
      { status: 401 }
    );
  }

  if (!ObjectId.isValid(userId)) {
    return NextResponse.json(
      { message: 'Invalid user ID format' },
      { status: 400 }
    );
  }

  if (!process.env.MONGODB_DB_NAME) {
    return NextResponse.json(
      { message: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const usersCollection = db.collection('users');

    const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error deleting user:', error);
    const msg =
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred';
    return NextResponse.json(
      { message: `Server error: ${msg}` },
      { status: 500 }
    );
  }
}
