// file: app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
// ... import your providers like GoogleProvider, etc.

// 👇 MAKE SURE 'export' IS HERE
export const authOptions: NextAuthOptions = {
  // ... your providers, callbacks, etc.
  providers: [
    // ...
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
  // ...
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };