import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo/mongodb";

export async function POST(req: NextRequest) {
    try {
        const { clerkId } = await req.json();

        if (!clerkId) {
            return NextResponse.json({ error: "Clerk ID is required" }, { status: 400 });
        }

        // Get DB connection
        const db = clientPromise.db("finverse");
        const collection = db.collection("users");

        // Fetch the user
        const user = await collection.findOne({ clerkId });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get all transactions from the user object
        const transactions = user.transactions || [];

        // Create formatted data structure
        const formattedData = {
            allTimeData: { byDate: {} },
            categoryData: { expenses: {} },
            monthlyData: {
                income: {},
                expenses: {},
            },
        };

        // Process transactions
        transactions.forEach((tx) => {
            // Ensure we have a valid date and amount
            const txDate = tx.date ? new Date(tx.date) : new Date();
            const amount = typeof tx.amount === "number" ? Number(Number(tx.amount).toFixed(2)) : 0;
            const category = tx.category || "Uncategorized";

            // Format YYYY-MM-DD for daily data
            const dateKey = txDate.toISOString().split("T")[0];

            // Format YYYY-MM for monthly data
            const monthKey = dateKey.substring(0, 7);

            // Is this an income or expense?
            const isIncome = amount < 0; // In Plaid, negative amounts are income (deposits)

            // Update daily data
            if (!formattedData.allTimeData.byDate[dateKey]) {
                formattedData.allTimeData.byDate[dateKey] = { income: 0, expenses: 0 };
            }

            if (isIncome) {
                // Update income
                formattedData.allTimeData.byDate[dateKey].income += Math.abs(amount);

                // Update monthly income
                if (!formattedData.monthlyData.income[monthKey]) {
                    formattedData.monthlyData.income[monthKey] = 0;
                }
                formattedData.monthlyData.income[monthKey] += Math.abs(amount);
            } else {
                // Update expenses
                formattedData.allTimeData.byDate[dateKey].expenses += amount;

                // Update category data for expenses
                if (!formattedData.categoryData.expenses[category]) {
                    formattedData.categoryData.expenses[category] = 0;
                }
                formattedData.categoryData.expenses[category] += amount;

                // Update monthly expenses
                if (!formattedData.monthlyData.expenses[monthKey]) {
                    formattedData.monthlyData.expenses[monthKey] = 0;
                }
                formattedData.monthlyData.expenses[monthKey] += amount;
            }
        });

        // Format all numeric values to 2 decimal places
        Object.keys(formattedData.allTimeData.byDate).forEach((date) => {
            formattedData.allTimeData.byDate[date].income = Number(
                Number(formattedData.allTimeData.byDate[date].income).toFixed(2)
            );
            formattedData.allTimeData.byDate[date].expenses = Number(
                Number(formattedData.allTimeData.byDate[date].expenses).toFixed(2)
            );
        });

        Object.keys(formattedData.categoryData.expenses).forEach((category) => {
            formattedData.categoryData.expenses[category] = Number(
                Number(formattedData.categoryData.expenses[category]).toFixed(2)
            );
        });

        Object.keys(formattedData.monthlyData.income).forEach((month) => {
            formattedData.monthlyData.income[month] = Number(
                Number(formattedData.monthlyData.income[month]).toFixed(2)
            );
        });

        Object.keys(formattedData.monthlyData.expenses).forEach((month) => {
            formattedData.monthlyData.expenses[month] = Number(
                Number(formattedData.monthlyData.expenses[month]).toFixed(2)
            );
        });

        // Update the user document with formatted data
        await collection.updateOne({ clerkId }, { $set: { formattedData } });

        return NextResponse.json(
            {
                success: true,
                message: "User financial data formatted successfully",
                formattedData,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error formatting user data:", error);
        return NextResponse.json(
            {
                error: "Failed to format user data",
                details: error.message,
            },
            { status: 500 }
        );
    }
}
