import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
    try {
        // Get user ID from Clerk
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        // Call our formatter endpoint
        const formatResponse = await fetch(new URL("/api/format-user-transactions", req.url).toString(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                clerkId: userId,
            }),
        });

        const formatData = await formatResponse.json();
        if (formatData.error) {
            return NextResponse.json(
                {
                    error: "Failed to refresh dashboard data",
                    details: formatData.error,
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Dashboard data refreshed successfully",
            timestamp: new Date(),
        });
    } catch (error) {
        console.error("Error refreshing dashboard data:", error);
        return NextResponse.json(
            {
                error: "Failed to refresh dashboard data",
                details: error.message,
            },
            { status: 500 }
        );
    }
}
