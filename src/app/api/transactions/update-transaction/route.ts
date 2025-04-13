import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo/mongodb";
import { auth } from "@clerk/nextjs/server";

export async function PUT(req: NextRequest) {
    try {
        // Get user ID from Clerk
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        // Parse the transaction data from the request
        const { id, amount, date, name, category, type, notes = "" } = await req.json();

        // Validate required fields
        if (!id || !amount || !date || !name || !type) {
            return NextResponse.json(
                { error: "Missing required fields: id, amount, date, name, and type are required" },
                { status: 400 }
            );
        }

        // Format transaction amount (income is negative, expense is positive in our system)
        let formattedAmount = Number(Number(amount).toFixed(2));
        if (type === "Income") {
            formattedAmount = Math.abs(formattedAmount); // Make positive for income
        } else {
            formattedAmount = -Math.abs(formattedAmount); // Make negative for expense
        }

        // Connect to MongoDB
        const db = clientPromise.db("finverse");
        const collection = db.collection("users");

        // Find the user document first
        const user = await collection.findOne({ clerkId: userId });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Find the transaction in the user's transactions array
        const transactionIndex = user.transactions.findIndex((t: any) => t.transaction_id === id);

        if (transactionIndex === -1) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        // Create updated transaction object (preserve fields not included in the update)
        const existingTransaction = user.transactions[transactionIndex];
        const oldAmount = existingTransaction.amount;
        const updatedTransaction = {
            ...existingTransaction,
            amount: formattedAmount,
            date: date,
            name: name,
            category: Array.isArray(category) ? category : category ? [category] : ["Uncategorized"],
            merchant_name: name, // Update merchant name to match the new name
            notes: notes,
        };

        // Calculate the difference in amount to update the balance
        const amountDifference = formattedAmount - oldAmount;

        // Get current balance and update it
        let currentBalance = user.financials?.currentBalance || 0;
        currentBalance += amountDifference;
        currentBalance = Number(Number(currentBalance).toFixed(2)); // Format to 2 decimal places

        // Update the transaction in the array
        const updateResult = await collection.updateOne(
            { clerkId: userId, "transactions.transaction_id": id },
            {
                $set: {
                    "transactions.$": updatedTransaction,
                    "financials.currentBalance": currentBalance,
                } as any,
            }
        );

        if (!updateResult.acknowledged) {
            return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
        }

        if (updateResult.modifiedCount === 0) {
            return NextResponse.json({ error: "Transaction not found or no changes made" }, { status: 404 });
        }

        // Format data for dashboard after updating the transaction
        try {
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
            message: "Transaction updated successfully",
            transaction: updatedTransaction,
        });
    } catch (error) {
        console.error("Error updating transaction:", error);
        return NextResponse.json(
            {
                error: "Failed to update transaction",
                details: error.message,
            },
            { status: 500 }
        );
    }
}
