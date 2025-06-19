// src/app/api/session/route.ts

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log("\n--- /api/session [GET] ROUTE CALLED ---");
  
  try {
    // getSession() will call decrypt(), which has its own detailed logging
    const session = await getSession();

    if (!session) {
      console.log("[/api/session] No valid session found. Returning 401 Not Authenticated.");
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    console.log("[/api/session] Session found. Returning user data:", session);
    return NextResponse.json(session, { status: 200 });

  } catch (error) {
    console.error('[/api/session] CRITICAL ERROR:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}