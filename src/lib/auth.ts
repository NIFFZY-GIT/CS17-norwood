import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from "bcryptjs";
import { findUser } from "./users"; // Assuming findUser is in './users.ts'

// We no longer need the standalone authenticateUser function, 
// as its logic will move inside the CredentialsProvider.

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      // Define the fields for your login form
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      
      // This 'authorize' function replaces your 'authenticateUser' function
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null; // Missing credentials
        }

        // 1. Use your existing function to find the user
        const user = await findUser(credentials.username);

        if (!user) {
          return null; // User not found
        }

        // 2. Use your existing bcrypt logic to check the password
        const isMatch = await bcrypt.compare(credentials.password, user.password || '');

        if (isMatch) {
          // SUCCESS: Return the user object with proper id field for NextAuth
          return {
            id: user._id,
            username: user.username || user.email,
            email: user.email,
            role: user.isAdmin ? 'admin' : 'user'
          }; 
        } else {
          // FAILURE: Passwords do not match
          return null;
        }
      }
    })
  ],

  // We need to configure how the session is managed
  session: {
    strategy: 'jwt',
  },

  // IMPORTANT: We need these callbacks to make sure the user.id is available in the session object
  callbacks: {
    // This callback is called whenever a JWT is created (e.g., at sign in).
    async jwt({ token, user }) {
      // The 'user' object is only available on the first call after a successful login.
      // It contains the user data from your database.
      if (user) {
        token.id = user.id; // Add the user's database ID to the token.
      }
      return token;
    },

    // This callback is called whenever a session is checked (e.g., by getServerSession).
    async session({ session, token }) {
      // We are taking the ID from the token (which we added in the jwt callback)
      // and adding it to the final session object.
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  // Optional: Define your login page route
  pages: {
    signIn: '/login', // Change '/login' to your actual sign-in page route
  },

  secret: process.env.NEXTAUTH_SECRET, // Make sure this is set in your .env.local
};
