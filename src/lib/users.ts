// src/lib/users.ts
import clientPromise from '@/lib/mongodb';
import { User } from '@/lib/types';

/**
 * Find a user by username from MongoDB
 * @param username - The username to search for
 * @returns Promise<User | null> - The user object or null if not found
 */
export async function findUser(username: string): Promise<User | null> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection<User>('users');
    
    const user = await usersCollection.findOne({ 
      $or: [
        { username: username },
        { email: username } // Allow login with email as well
      ]
    });
    
    return user;
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
}

/**
 * Find a user by ID from MongoDB
 * @param userId - The user ID to search for
 * @returns Promise<User | null> - The user object or null if not found
 */
export async function findUserById(userId: string): Promise<User | null> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection<User>('users');
    
    const user = await usersCollection.findOne({ _id: userId });
    
    return user;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return null;
  }
}