import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongo/mongodb";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
    try {
        // Get user ID from Clerk
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        // Connect to MongoDB
        const db = clientPromise.db("finverse");
        const collection = db.collection("users");

        // Find the user and their data
        const user = await collection.findOne({ clerkId: userId });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Return full user data for context
        return NextResponse.json({
            user: {
                ...user,
                _id: user._id.toString(), // Convert ObjectId to string
            },
        });
    } catch (error: any) {
        console.error("Error fetching user data:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch user data",
                details: error.message,
            },
            {
                status: 500,
            }
        );
    }
}
