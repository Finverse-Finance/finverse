import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo/mongodb";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const clerkId = searchParams.get("clerkId");

        if (!clerkId) {
            return NextResponse.json({ error: "Clerk ID is required" }, { status: 400 });
        }

        // Get DB connection
        const db = clientPromise.db("finverse");
        const collection = db.collection("users");

        // Fetch the user with formatted data
        const user = await collection.findOne({ clerkId });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if formatted data exists, if not run the formatter
        if (!user.formattedData) {
            // If there's no formatted data, we should generate it
            return NextResponse.json(
                {
                    error: "Formatted data not found",
                    message: "Please run the data formatter first",
                },
                { status: 404 }
            );
        }

        // Return the formatted data for dashboard use
        return NextResponse.json(
            {
                formattedData: user.formattedData,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error retrieving dashboard data:", error);
        return NextResponse.json(
            {
                error: "Failed to retrieve dashboard data",
                details: error.message,
            },
            { status: 500 }
        );
    }
}
