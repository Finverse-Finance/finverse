import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo/mongodb";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(req: NextRequest) {
    try {
        // Get user ID from Clerk
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        // Get transaction ID from URL params
        const { searchParams } = new URL(req.url);
        const transactionId = searchParams.get("id");

        if (!transactionId) {
            return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
        }

        // Connect to MongoDB
        const db = clientPromise.db("finverse");
        const collection = db.collection("users");

        // Get the user and transaction details
        const user = await collection.findOne({ clerkId: userId });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Find the transaction to be deleted to get its amount
        const transactionToDelete = user.transactions.find((t: any) => t.transaction_id === transactionId);
        if (!transactionToDelete) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        // Get current balance and subtract the transaction amount (since we're removing this transaction)
        let currentBalance = user.financials?.currentBalance || 0;
        currentBalance -= transactionToDelete.amount; // Subtract the amount (negative for expenses, positive for income)
        currentBalance = Number(Number(currentBalance).toFixed(2)); // Format to 2 decimal places

        // Remove the transaction from the user's transactions array
        console.log(`Attempting to delete transaction with ID: ${transactionId}`);

        const updateResult = await collection.updateOne(
            {
                clerkId: userId,
                "transactions.transaction_id": transactionId,
            },
            {
                $pull: {
                    transactions: {
                        transaction_id: transactionId,
                    },
                } as any,
                $set: {
                    "financials.currentBalance": currentBalance,
                } as any,
            }
        );

        console.log(
            `Delete operation result: Modified count: ${updateResult.modifiedCount}, Matched count: ${updateResult.matchedCount}`
        );

        if (!updateResult.acknowledged) {
            return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
        }

        if (updateResult.modifiedCount === 0) {
            return NextResponse.json({ error: "Transaction not found or already deleted" }, { status: 404 });
        }

        // Format data for dashboard after deleting the transaction
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
            message: "Transaction deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting transaction:", error);
        return NextResponse.json(
            {
                error: "Failed to delete transaction",
                details: error.message,
            },
            { status: 500 }
        );
    }
}
