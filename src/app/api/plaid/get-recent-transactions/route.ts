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

        if (!user || !Array.isArray(user.transactions)) {
            return NextResponse.json({ error: "No transactions found" }, { status: 404 });
        }

        const sorted = user.transactions
            .filter((t) => t.date && t.amount != null)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);

        const formatted = sorted.map((t) => {
            const type = t.personal_finance_category?.primary || "UNKNOWN";
            const category = Array.isArray(t.category) && t.category.length > 0 ? t.category[0] : "Uncategorized";
            const formattedDate = new Date(t.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
            const amount = `${type === "INCOME" ? "+" : "-"}$${Number(t.amount).toFixed(2)}`;

            return {
                date: formattedDate,
                amount,
                category,
                type: type === "INCOME" ? "Income" : "Expense",
            };
        });

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Error fetching recent transactions:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
