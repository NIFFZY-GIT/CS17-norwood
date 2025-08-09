// src/app/api/users/route.ts
import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import { User } from '@/lib/types';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

// Interface for database document - handles both old and new schema
interface UserDocument {
    _id: ObjectId;
    username: string;
    email?: string;
    passwordHash: string;
    createdAt: Date;
    role?: 'admin' | 'user'; // New role field
    isAdmin?: boolean; // Legacy field for backward compatibility
}

// This represents the data we will insert into the database (without _id).
type DocumentToInsert = Omit<UserDocument, '_id'>;

// GET all users
export async function GET() {
    const session = await getSession();
    if (!session?.userId) {
        return NextResponse.json({ message: 'Unauthorized: You must be logged in.' }, { status: 401 });
    }

    if (!process.env.MONGODB_DB_NAME) {
        console.error('GET /api/users: MONGODB_DB_NAME is not set');
        return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    }

    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME);
        const usersCollection = db.collection<UserDocument>('users');

        const dbUsers = await usersCollection.find({}, {
            projection: { passwordHash: 0 }
        }).sort({ createdAt: -1 }).toArray();

        // FIX 2: Map the database document to the User type, handling both new and legacy fields
        const users: User[] = dbUsers.map(dbUser => ({
            _id: dbUser._id.toString(),
            username: dbUser.username,
            email: dbUser.email || '',
            // Convert from old isAdmin field or use new role field
            role: dbUser.role || (dbUser.isAdmin ? 'admin' : 'user'),
            isAdmin: dbUser.isAdmin || (dbUser.role === 'admin'),
            createdAt: dbUser.createdAt,
        }));

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 });
    }
}

// The request payload can still use 'isAdmin' for convenience, but we'll handle the logic internally.
interface CreateUserPayload {
    username: string;
    email?: string;
    password?: string;
    isAdmin?: boolean; // The client can send this boolean
}

// POST /api/users (Create User)
export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session?.userId) {
        return NextResponse.json({ message: 'Unauthorized: You must be logged in.' }, { status: 401 });
    }

    if (!process.env.MONGODB_DB_NAME) {
        return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    }

    try {
        const body = await request.json() as CreateUserPayload;
        const { username, email, password, isAdmin } = body;

        if (!username || !password) {
            return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME);
        const usersCollection = db.collection('users');

        // Check for existing user by username or email
        const existingUserQuery = { username } as Record<string, unknown>;
        if (email) {
            existingUserQuery.$or = [{ username }, { email }];
        }
        const existingUser = await usersCollection.findOne(existingUserQuery);

        if (existingUser) {
            let message = 'Username already exists.';
            if (email && existingUser.email === email) {
                message = 'Email already exists.';
            }
            return NextResponse.json({ message }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // Create user document with both role and isAdmin for compatibility
        const newUserToInsert: DocumentToInsert = {
            username,
            passwordHash,
            createdAt: new Date(),
            role: isAdmin === true ? 'admin' : 'user',
            isAdmin: isAdmin === true,
        };
        if (email) {
            newUserToInsert.email = email;
        }

        const result = await usersCollection.insertOne(newUserToInsert);

        // FIX 4: Construct the response object to match the 'User' type, including 'username' and 'role'.
        const createdUser: User = {
            _id: result.insertedId.toString(),
            username: newUserToInsert.username,
            email: newUserToInsert.email || '',
            role: newUserToInsert.role, // Use the new role property
            createdAt: newUserToInsert.createdAt,
        };

        return NextResponse.json(createdUser, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating user:', error);
        if (error && typeof error === 'object' && 'code' in error && (error as { code: number }).code === 11000) {
             return NextResponse.json({ message: 'Username or email already exists.' }, { status: 409 });
        }
        if (error instanceof Error) {
            return NextResponse.json({ message: `Failed to create user: ${error.message}` }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unknown error occurred while creating user' }, { status: 500 });
    }
}