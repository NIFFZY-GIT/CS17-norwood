// src/app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  console.log('[API /api/auth/session] Minimal GET handler hit!');
  return NextResponse.json({ message: "Session API endpoint is working!" });
}