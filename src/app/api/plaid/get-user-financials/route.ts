import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo/mongodb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clerkId = searchParams.get("clerkId");

  if (!clerkId) {
    return NextResponse.json({ error: "Clerk ID is required" }, { status: 400 });
  }

  try {
    const mongoClient = await clientPromise;
    const db = mongoClient.db("finverse");
    const collection = db.collection("users");

    const user = await collection.findOne({ clerkId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const balance = user?.plaidData?.accounts?.[0]?.balances?.available ?? null;
    const transactions = user?.transactions ?? [];

    return NextResponse.json({ balance, transactions }, { status: 200 });
  } catch (error) {
    console.error("MongoDB fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
