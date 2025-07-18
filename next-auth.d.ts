import 'next-auth';
import { DefaultSession } from "next-auth";

declare module 'next-auth' {
  interface Session {
    user?: {
      id: string; 
    } & DefaultSession['user'];
  }
  
  interface User {
    id: string;
  }
}

// Required when using JWT strategy
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}