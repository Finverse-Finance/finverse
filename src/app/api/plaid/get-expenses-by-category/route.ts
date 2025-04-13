import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo/mongodb";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get("clerkId");

    if (!clerkId) {
        return NextResponse.json({ error: "Clerk ID is required" }, { status: 400 });
    }

    try {
        const db = clientPromise.db("finverse");
        const collection = db.collection("users");

        const user = await collection.findOne({ clerkId });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const expensesByCategory = user?.financials?.expensesByCategory ?? null;

        const formattedData = Object.entries(expensesByCategory).map(([category, value]) => ({
            name: category
                .replace(/_/g, " ")
                .toLowerCase()
                .replace(/\b\w/g, (l) => l.toUpperCase()), // Prettify name
            value: Math.abs(Number(value)),
        }));

        return NextResponse.json(formattedData);
    } catch (error) {
        console.error("Error fetching category data:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
