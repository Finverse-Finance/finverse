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

    const incomeByDate = user?.financials?.incomeByDate ?? null;
    const expensesByDate = user?.financials?.expensesByDate ?? null;

    // Merge dates from both objects
    const allDates = new Set([...Object.keys(incomeByDate), ...Object.keys(expensesByDate)]);

    // Build chart-friendly format
    const mergedData = Array.from(allDates).map((date) => ({
      date,
      Income: incomeByDate[date] || 0,
      Expenses: expensesByDate[date] || 0,
    }));

    // Sort by date
    mergedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json(mergedData);
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 });
  }
}
