import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo/mongodb";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get("clerkId");

    if (!clerkId) {
        return NextResponse.json({ error: "Clerk ID is required" }, { status: 400 });
    }

    try {
        const db = clientPromise.db("finverse");
        const collection = db.collection("users");

        const user = await collection.findOne({ clerkId });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Format balance to 2 decimal places
        const rawBalance = user?.plaidData?.accounts?.[0]?.balances?.available ?? null;
        const balance = rawBalance !== null ? Number(Number(rawBalance).toFixed(2)) : null;

        // Format transactions to 2 decimal places
        const transactions = (user?.transactions ?? []).map((tx) => {
            // Ensure amount is a number
            const amount = typeof tx.amount === "number" ? tx.amount : 0;
            return {
                ...tx,
                amount: Number(Number(amount).toFixed(2)),
            };
        });

        // Ensure all financials are formatted to 2 decimal places
        const financials = user?.financials ?? {
            totalIncome: 0,
            totalExpenses: 0,
            incomeTransactions: [],
            expenseTransactions: [],
            incomeByDate: {},
            expensesByDate: {},
            incomeByCategory: {},
            expensesByCategory: {},
        };

        // Create a formatted copy of financials
        const formattedFinancials = { ...financials };

        // Format the financial data
        if (formattedFinancials) {
            // Format total values
            const totalIncome =
                typeof formattedFinancials.totalIncome === "number" ? formattedFinancials.totalIncome : 0;
            const totalExpenses =
                typeof formattedFinancials.totalExpenses === "number" ? formattedFinancials.totalExpenses : 0;

            formattedFinancials.totalIncome = Number(Number(totalIncome).toFixed(2));
            formattedFinancials.totalExpenses = Number(Number(totalExpenses).toFixed(2));

            // Format transaction arrays
            if (Array.isArray(formattedFinancials.incomeTransactions)) {
                formattedFinancials.incomeTransactions = formattedFinancials.incomeTransactions.map((tx) => {
                    const amount = typeof tx.amount === "number" ? tx.amount : 0;
                    return {
                        ...tx,
                        amount: Number(Number(amount).toFixed(2)),
                    };
                });
            } else {
                formattedFinancials.incomeTransactions = [];
            }

            if (Array.isArray(formattedFinancials.expenseTransactions)) {
                formattedFinancials.expenseTransactions = formattedFinancials.expenseTransactions.map((tx) => {
                    const amount = typeof tx.amount === "number" ? tx.amount : 0;
                    return {
                        ...tx,
                        amount: Number(Number(amount).toFixed(2)),
                    };
                });
            } else {
                formattedFinancials.expenseTransactions = [];
            }

            // Format aggregations by date
            if (formattedFinancials.incomeByDate && typeof formattedFinancials.incomeByDate === "object") {
                Object.keys(formattedFinancials.incomeByDate).forEach((date) => {
                    const amount =
                        typeof formattedFinancials.incomeByDate[date] === "number"
                            ? formattedFinancials.incomeByDate[date]
                            : 0;
                    formattedFinancials.incomeByDate[date] = Number(Number(amount).toFixed(2));
                });
            } else {
                formattedFinancials.incomeByDate = {};
            }

            if (formattedFinancials.expensesByDate && typeof formattedFinancials.expensesByDate === "object") {
                Object.keys(formattedFinancials.expensesByDate).forEach((date) => {
                    const amount =
                        typeof formattedFinancials.expensesByDate[date] === "number"
                            ? formattedFinancials.expensesByDate[date]
                            : 0;
                    formattedFinancials.expensesByDate[date] = Number(Number(amount).toFixed(2));
                });
            } else {
                formattedFinancials.expensesByDate = {};
            }

            // Format aggregations by category
            if (formattedFinancials.incomeByCategory && typeof formattedFinancials.incomeByCategory === "object") {
                Object.keys(formattedFinancials.incomeByCategory).forEach((category) => {
                    const amount =
                        typeof formattedFinancials.incomeByCategory[category] === "number"
                            ? formattedFinancials.incomeByCategory[category]
                            : 0;
                    formattedFinancials.incomeByCategory[category] = Number(Number(amount).toFixed(2));
                });
            } else {
                formattedFinancials.incomeByCategory = {};
            }

            if (formattedFinancials.expensesByCategory && typeof formattedFinancials.expensesByCategory === "object") {
                Object.keys(formattedFinancials.expensesByCategory).forEach((category) => {
                    const amount =
                        typeof formattedFinancials.expensesByCategory[category] === "number"
                            ? formattedFinancials.expensesByCategory[category]
                            : 0;
                    formattedFinancials.expensesByCategory[category] = Number(Number(amount).toFixed(2));
                });
            } else {
                formattedFinancials.expensesByCategory = {};
            }
        }

        return NextResponse.json(
            {
                balance,
                transactions,
                financials: formattedFinancials,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("MongoDB fetch error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
