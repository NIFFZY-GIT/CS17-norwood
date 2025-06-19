import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { cookies } from 'next/headers';

export async function GET() {
  console.log("\n--- /api/session endpoint hit ---");

  try {
    // 1. Manually check if the cookie exists
    // ✅ Awaited here to get the actual cookie store object
    const cookieStore = await cookies(); 
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      console.log("Status: No 'session' cookie found.");
      return NextResponse.json({ message: 'Not authenticated: No cookie' }, { status: 401 });
    }
    console.log("Status: Found 'session' cookie.");
    
    // 2. Try to get the session using your library function
    // getSession() also uses await internally, so this is correct
    const session = await getSession();

    if (!session) {
      console.log("Status: Cookie found, but getSession() returned null. This likely means the token is invalid or expired.");
      return NextResponse.json({ message: 'Not authenticated: Invalid session' }, { status: 401 });
    }

    // 3. Success!
    console.log("Status: Session successfully validated.");
    console.log("Session Data:", session);
    return NextResponse.json(session, { status: 200 });

  } catch (error) {
    console.error('CRITICAL ERROR in /api/session:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}