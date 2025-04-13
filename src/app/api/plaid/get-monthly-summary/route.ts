import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo/mongodb";

const getMonthYearKey = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${date.getMonth()}`; // e.g., "2025-3"
};

const getMonthLabel = (monthIndex: number) => new Date(0, monthIndex).toLocaleString("en-US", { month: "short" });

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

        const incomeByDate = user?.financials?.incomeByDate ?? {};
        const expensesByDate = user?.financials?.expensesByDate ?? {};

        const monthlyIncome: Record<string, number> = {};
        const monthlyExpenses: Record<string, number> = {};

        // Aggregate income
        Object.entries(incomeByDate).forEach(([date, amount]) => {
            const key = getMonthYearKey(date);
            const numericAmount = typeof amount === "number" ? amount : Number(amount) || 0;
            monthlyIncome[key] = (monthlyIncome[key] ?? 0) + numericAmount;
        });

        // Aggregate expenses
        Object.entries(expensesByDate).forEach(([date, amount]) => {
            const key = getMonthYearKey(date);
            const numericAmount = typeof amount === "number" ? amount : Number(amount) || 0;
            monthlyExpenses[key] = (monthlyExpenses[key] ?? 0) + Math.abs(numericAmount);
        });

        // Merge unique month keys
        const allMonthKeys = Array.from(new Set([...Object.keys(monthlyIncome), ...Object.keys(monthlyExpenses)]));

        const result = allMonthKeys
            .map((key) => {
                const [year, month] = key.split("-");
                return {
                    month: `${getMonthLabel(Number(month))} ${year}`,
                    Income: monthlyIncome[key] ?? 0,
                    Expenses: monthlyExpenses[key] ?? 0,
                };
            })
            .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error generating monthly summary:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
