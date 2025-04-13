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

        // Find the user and their reports
        const user = await collection.findOne({ clerkId: userId });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Return reports or empty array if none found
        const reports = user.reports || [];

        // Sort reports by generation date (newest first)
        const sortedReports = [...reports].sort((a, b) => {
            const dateA = new Date(a.generatedAt);
            const dateB = new Date(b.generatedAt);
            return dateB.getTime() - dateA.getTime();
        });

        return NextResponse.json({
            reports: sortedReports,
        });
    } catch (error: any) {
        console.error("Error fetching report history:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch report history",
                details: error.message,
            },
            {
                status: 500,
            }
        );
    }
}
