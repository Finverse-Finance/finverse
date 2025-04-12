import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo/mongodb";

interface Transaction {
    amount: number;
    date: string;
    category: string | string[];
    transaction_id: string;
    name: string;
    merchant_name: string;
    [key: string]: any; // Allow for other fields
}

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

        // Create financials structure to update both objects
        const financials = {
            totalIncome: 0,
            totalExpenses: 0,
            incomeTransactions: [] as Transaction[],
            expenseTransactions: [] as Transaction[],
            incomeByDate: {} as Record<string, number>,
            expensesByDate: {} as Record<string, number>,
            incomeByCategory: {} as Record<string, number>,
            expensesByCategory: {} as Record<string, number>,
        };

        // Process transactions
        transactions.forEach((tx: Transaction) => {
            // Ensure we have a valid date and amount
            const txDate = tx.date ? new Date(tx.date) : new Date();
            const amount = typeof tx.amount === "number" ? Number(Number(tx.amount).toFixed(2)) : 0;
            const category = Array.isArray(tx.category) ? tx.category[0] : tx.category || "Uncategorized";

            // Format YYYY-MM-DD for daily data
            const dateKey = txDate.toISOString().split("T")[0];

            // Format YYYY-MM for monthly data
            const monthKey = dateKey.substring(0, 7);

            // Is this an income or expense?
            const isIncome = amount < 0; // In Plaid, negative amounts are income (deposits)

            // Update formattedData structure
            // Update daily data
            if (!formattedData.allTimeData.byDate[dateKey]) {
                formattedData.allTimeData.byDate[dateKey] = { income: 0, expenses: 0 };
            }

            if (isIncome) {
                // Update income in formattedData
                formattedData.allTimeData.byDate[dateKey].income += Math.abs(amount);

                // Update monthly income in formattedData
                if (!formattedData.monthlyData.income[monthKey]) {
                    formattedData.monthlyData.income[monthKey] = 0;
                }
                formattedData.monthlyData.income[monthKey] += Math.abs(amount);

                // Update financials data for income
                financials.totalIncome += Math.abs(amount);
                financials.incomeTransactions.push(tx);

                // Update income by date in financials
                if (!financials.incomeByDate[dateKey]) {
                    financials.incomeByDate[dateKey] = 0;
                }
                financials.incomeByDate[dateKey] += Math.abs(amount);

                // Update income by category in financials
                if (!financials.incomeByCategory[category]) {
                    financials.incomeByCategory[category] = 0;
                }
                financials.incomeByCategory[category] += Math.abs(amount);
            } else {
                // Update expenses in formattedData
                formattedData.allTimeData.byDate[dateKey].expenses += amount;

                // Update category data for expenses in formattedData
                if (!formattedData.categoryData.expenses[category]) {
                    formattedData.categoryData.expenses[category] = 0;
                }
                formattedData.categoryData.expenses[category] += amount;

                // Update monthly expenses in formattedData
                if (!formattedData.monthlyData.expenses[monthKey]) {
                    formattedData.monthlyData.expenses[monthKey] = 0;
                }
                formattedData.monthlyData.expenses[monthKey] += amount;

                // Update financials data for expenses
                financials.totalExpenses += amount;
                financials.expenseTransactions.push(tx);

                // Update expenses by date in financials
                if (!financials.expensesByDate[dateKey]) {
                    financials.expensesByDate[dateKey] = 0;
                }
                financials.expensesByDate[dateKey] += amount;

                // Update expenses by category in financials
                if (!financials.expensesByCategory[category]) {
                    financials.expensesByCategory[category] = 0;
                }
                financials.expensesByCategory[category] += amount;
            }
        });

        // Format all numeric values to 2 decimal places in formattedData
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

        // Format all numeric values to 2 decimal places in financials
        financials.totalIncome = Number(Number(financials.totalIncome).toFixed(2));
        financials.totalExpenses = Number(Number(financials.totalExpenses).toFixed(2));

        Object.keys(financials.incomeByDate).forEach((date) => {
            financials.incomeByDate[date] = Number(Number(financials.incomeByDate[date]).toFixed(2));
        });

        Object.keys(financials.expensesByDate).forEach((date) => {
            financials.expensesByDate[date] = Number(Number(financials.expensesByDate[date]).toFixed(2));
        });

        Object.keys(financials.incomeByCategory).forEach((category) => {
            financials.incomeByCategory[category] = Number(Number(financials.incomeByCategory[category]).toFixed(2));
        });

        Object.keys(financials.expensesByCategory).forEach((category) => {
            financials.expensesByCategory[category] = Number(
                Number(financials.expensesByCategory[category]).toFixed(2)
            );
        });

        // Update the user document with both formatted data and financials
        await collection.updateOne({ clerkId }, { $set: { formattedData, financials } });

        return NextResponse.json(
            {
                success: true,
                message: "User financial data formatted successfully",
                formattedData,
                financials,
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
