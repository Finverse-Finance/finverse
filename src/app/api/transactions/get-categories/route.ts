import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo/mongodb";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
    try {
        // Get user ID from Clerk
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        // Connect to MongoDB
        const db = clientPromise.db("finverse");
        const collection = db.collection("users");

        // Find the user and their transactions
        const user = await collection.findOne({ clerkId: userId });

        if (!user || !Array.isArray(user.transactions)) {
            return NextResponse.json({ categories: [] });
        }

        // Extract all categories from transactions
        const categorySets = new Set<string>();

        user.transactions.forEach((transaction: any) => {
            if (Array.isArray(transaction.category)) {
                transaction.category.forEach((cat: string) => categorySets.add(cat));
            } else if (typeof transaction.category === "string") {
                categorySets.add(transaction.category);
            }
        });

        // Convert Set to array and sort alphabetically
        const categories = Array.from(categorySets).sort();

        return NextResponse.json({
            categories,
            count: categories.length,
        });
    } catch (error: any) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch categories",
                details: error.message,
            },
            {
                status: 500,
            }
        );
    }
}
