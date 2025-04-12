import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo/mongodb";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
    try {
        // Get user ID from Clerk
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        // Parse the transaction data from the request
        const {
            amount,
            date,
            name,
            category,
            isIncome = false, // Add a flag to indicate if this is income
            notes = "",
        } = await req.json();

        // Validate required fields
        if (!amount || !date || !name) {
            return NextResponse.json(
                { error: "Missing required fields: amount, date, and name are required" },
                { status: 400 }
            );
        }

        // Format transaction amount (income is stored as negative amount in our system)
        let formattedAmount = Number(Number(amount).toFixed(2));
        if (isIncome) {
            formattedAmount = -Math.abs(formattedAmount); // Make negative for income
        } else {
            formattedAmount = Math.abs(formattedAmount); // Make positive for expense
        }

        // Create transaction object
        const transaction = {
            transaction_id: `manual-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            amount: formattedAmount,
            date: date,
            name: name,
            category: Array.isArray(category) ? category : category ? [category] : ["Uncategorized"],
            merchant_name: name,
            pending: false,
            source: "manual",
            notes: notes,
            importedAt: new Date(),
        };

        // Connect to MongoDB
        const db = clientPromise.db("finverse");
        const collection = db.collection("users");

        // Add the transaction to the user's transactions array
        const updateResult = await collection.updateOne(
            { clerkId: userId },
            { $push: { transactions: transaction } as any }
        );

        if (!updateResult.acknowledged) {
            return NextResponse.json({ error: "Failed to add transaction" }, { status: 500 });
        }

        // Format data for dashboard after adding the transaction
        try {
            // Call the formatter API
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
                console.warn("Warning: Unable to format data for dashboard:", formatData.error);
                // Non-critical, continue
            }
        } catch (formatError) {
            console.warn("Warning: Error formatting data for dashboard:", formatError);
            // Non-critical, continue
        }

        return NextResponse.json({
            success: true,
            message: "Transaction added successfully",
            transaction,
        });
    } catch (error) {
        console.error("Error adding transaction:", error);
        return NextResponse.json(
            {
                error: "Failed to add transaction",
                details: error.message,
            },
            { status: 500 }
        );
    }
}
