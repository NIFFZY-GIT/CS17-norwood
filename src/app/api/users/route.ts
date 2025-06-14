// src/app/api/users/route.ts
import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getSession } from '@/lib/session';
import { User } from '@/lib/types';
import { ObjectId, Collection, Filter, InsertOneResult } from 'mongodb'; // Import InsertOneResult
import bcrypt from 'bcryptjs';

// Interface for data from DB (includes passwordHash, but this will be projected out for GET)
interface UserDocument {
    _id: ObjectId;
    username: string;
    email?: string;
    passwordHash: string;
    createdAt: Date;
    isAdmin?: boolean;
}

// Interface for the document to be inserted (MongoDB will add _id)
// This is essentially what you pass to insertOne.
type DocumentToInsert = Omit<UserDocument, '_id'>;


// GET all users - NO ADMIN CHECK
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
        const usersCollection: Collection<UserDocument> = db.collection<UserDocument>('users');

        const dbUsers = await usersCollection.find({}, {
            projection: { passwordHash: 0 }
        }).sort({ createdAt: -1 }).toArray();

        const users: User[] = dbUsers.map(dbUser => ({
            _id: dbUser._id.toString(),
            username: dbUser.username,
            email: dbUser.email,
            createdAt: dbUser.createdAt,
            isAdmin: dbUser.isAdmin,
        }));

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 });
    }
}

interface CreateUserPayload {
    username: string;
    email?: string;
    password?: string;
    isAdmin?: boolean;
}

// POST /api/users (Create User) - NO ADMIN CHECK
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
        const { username, email, password, isAdmin: makeAdmin } = body;

        if (!username || !password) {
            return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME);
        const usersCollection: Collection<UserDocument> = db.collection<UserDocument>('users');

        const existingUserQuery: Filter<UserDocument> = { username };
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

        const newUserToInsert: DocumentToInsert = {
            username,
            passwordHash,
            createdAt: new Date(),
            isAdmin: makeAdmin === true,
        };
        if (email) {
            newUserToInsert.email = email;
        }

        // The MongoDB driver's `insertOne` method is typed to accept a document
        // that does not yet have an _id when the collection schema TSchema includes _id.
        // The 'DocumentToInsert' type (Omit<UserDocument, '_id'>) should be directly compatible.
        // If strictness still causes issues, an 'as any' can be a last resort, but usually not needed.
        const result: InsertOneResult<UserDocument> = await usersCollection.insertOne(newUserToInsert as UserDocument);
        // The cast `as UserDocument` here might seem counter-intuitive because newUserToInsert lacks `_id`.
        // However, insertOne's parameter is often typed as `OptionalUnlessRequiredId<TSchema>`,
        // and `Omit<TSchema, '_id'>` is compatible with that.
        // The error you got with OptionalId was because OptionalId<UserDocument> makes _id: ObjectId | undefined,
        // which is not directly what insertOne might expect if its internal type for the document itself is TSchema.

        // A more direct approach that often works if the driver's types are well-aligned:
        // const result = await usersCollection.insertOne(newUserToInsert);
        // If the above still fails, the `as UserDocument` cast on `newUserToInsert` is telling TS
        // "trust me, the driver will handle the missing _id for insertion".

        const createdUser: User = {
            _id: result.insertedId.toString(), // result.insertedId will be an ObjectId
            username: newUserToInsert.username,
            email: newUserToInsert.email,
            createdAt: newUserToInsert.createdAt,
            isAdmin: newUserToInsert.isAdmin,
        };

        return NextResponse.json(createdUser, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating user:', error);
        if (error && typeof error === 'object' && 'code' in error && (error as { code: number }).code === 11000) {
             return NextResponse.json({ message: 'Username or email already exists (duplicate key).' }, { status: 409 });
        }
        if (error instanceof Error) {
            return NextResponse.json({ message: `Failed to create user: ${error.message}` }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unknown error occurred while creating user' }, { status: 500 });
    }
}