// src/lib/auth-config.ts
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    // Add your providers here
  ],
  callbacks: {
    session({ session, user }) {
      // Make sure user.id is available in the session object
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  // Add other NextAuth configuration here
};
