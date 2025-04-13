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
            return NextResponse.json({ transactions: [] });
        }

        // Format each transaction for the data table
        const formattedTransactions = user.transactions.map((t: any) => {
            return {
                id: t.transaction_id,
                type: t.amount < 0 ? "Expense" : "Income",
                category: Array.isArray(t.category) && t.category.length > 0 ? t.category[0] : "Uncategorized",
                date: t.date, // Keep original date string from MongoDB
                amount: Math.abs(t.amount).toFixed(2),
                name: t.name || t.merchant_name || "Unknown",
                notes: t.notes || "",
                source: t.source || "manual",
                pending: t.pending || false,
                // Keep the original data for reference
                original: t,
            };
        });

        // Sort by date (newest first)
        formattedTransactions.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json({
            transactions: formattedTransactions,
            count: formattedTransactions.length,
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json({ error: "Failed to fetch transactions", details: error.message }, { status: 500 });
    }
}
