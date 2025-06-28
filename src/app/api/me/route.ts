// src/app/api/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ message: "Not logged in" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME);
  const user = await db.collection("users").findOne({ _id: new ObjectId(session.userId) });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ preferences: user.preferences || null });
}