import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongo/mongodb";
import { auth } from "@clerk/nextjs/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

// Parse date range from string to start/end dates
function getDateRange(timeRange: string): { startDate: Date; endDate: Date } {
    const now = new Date();
    const endDate = new Date(now);
    let startDate = new Date(now);

    switch (timeRange.toLowerCase()) {
        case "daily":
            // Today
            startDate.setHours(0, 0, 0, 0);
            break;
        case "weekly":
            // Last 7 days
            startDate.setDate(now.getDate() - 7);
            break;
        case "monthly":
            // Last 30 days
            startDate.setDate(now.getDate() - 30);
            break;
        case "all time":
            // Just set a very old date
            startDate = new Date(0);
            break;
        default:
            // Default to daily
            startDate.setHours(0, 0, 0, 0);
    }

    return { startDate, endDate };
}

export async function POST(req: NextRequest) {
    try {
        // Get user ID from Clerk
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        // Parse request body
        const { timeRange = "daily", categories = [] } = await req.json();

        // Connect to MongoDB
        const db = clientPromise.db("finverse");
        const collection = db.collection("users");

        // Find the user and their transactions
        const user = await collection.findOne({ clerkId: userId });

        if (!user || !Array.isArray(user.transactions)) {
            return NextResponse.json({ error: "No transactions found" }, { status: 404 });
        }

        // Get date range
        const { startDate, endDate } = getDateRange(timeRange);

        // Filter transactions based on date range and categories
        let filteredTransactions = user.transactions.filter((t: any) => {
            const transactionDate = new Date(t.date);
            return transactionDate >= startDate && transactionDate <= endDate;
        });

        // Apply category filter if categories are provided
        if (categories.length > 0) {
            filteredTransactions = filteredTransactions.filter((t: any) => {
                // Handle both array and string categories
                if (Array.isArray(t.category)) {
                    return t.category.some((cat: string) => categories.includes(cat));
                } else if (typeof t.category === "string") {
                    return categories.includes(t.category);
                }
                return false;
            });
        }

        // Check if there are any transactions after filtering
        if (filteredTransactions.length === 0) {
            // No transactions for the selected time range and/or categories
            return NextResponse.json(
                {
                    error: "No transactions found",
                    message: `No transactions found for the selected ${timeRange} time range${categories.length > 0 ? ` and categories: ${categories.join(", ")}` : ""}. Please select a different time range or categories.`,
                },
                { status: 404 }
            );
        }

        // Get accounts information
        const accounts = user.plaidData?.accounts || [];

        // Format data for Gemini
        const formattedTransactions = filteredTransactions.map((t: any) => ({
            date: t.date,
            amount: t.amount,
            category: Array.isArray(t.category) ? t.category[0] : t.category || "Uncategorized",
            notes: t.notes || "",
            isManual: t.source === "manual",
        }));

        const formattedAccounts = accounts.map((a: any) => ({
            name: a.name || "Unknown Account",
            type: a.type || "Unknown Type",
            current_balance: a.balances?.current || 0,
        }));

        // Identify actual categories present in the filtered transactions
        const availableCategories = new Set<string>();
        formattedTransactions.forEach((t) => {
            if (t.category) availableCategories.add(t.category);
        });

        // Create category filter description for the prompt
        let categoryDescription = "";
        if (categories.length > 0) {
            // If user selected specific categories
            const presentSelectedCategories = categories.filter((cat) => availableCategories.has(cat));
            if (presentSelectedCategories.length > 0) {
                categoryDescription = `You should focus specifically on these categories that the user selected and have transaction data: ${presentSelectedCategories.join(", ")}.`;
            } else {
                categoryDescription =
                    "Although the user selected specific categories, we are providing a general overview as there are transactions in other categories.";
            }
        } else {
            // If no specific categories were selected, mention the categories that are present
            categoryDescription = `The user has not filtered by any specific categories. Transactions are present in these categories: ${Array.from(availableCategories).join(", ")}.`;
        }

        // Generate the Gemini prompt with specific request for markdown format
        const geminiPrompt = `
        You are a personal finance assistant generating a detailed, error-free, and customized Financial Summary for a user.

        Your goal is to provide an insightful summary that analyzes the user's spending, income, and overall financial behavior based on the selected time range: ${timeRange}.
        
        ${categoryDescription}
        
        Include the following elements:

        1. **Overall Overview:**
           - Total spent vs. total income
           - Net difference (savings or overspending)
           - Notable spending patterns and any outlier transactions
           - A detailed analysis that varies depending on whether the report covers a day, week, month, or all time.

        2. **Time Range Analysis:**
           - For ${timeRange} reports, include trends or comparisons with previous periods when relevant.
        
        3. **Category Reports:**
           - Break down spending by each category and then highlight the top 1-2 spending categories.
           - Offer insights if there is an unusual pattern or if the user consistently overspends in certain categories.
        
        4. **Custom Insights:**
           - Analyze the data with error free logic to provide all necessary info for understanding financial behavior.
           - Tailor the analysis specifically to the user and be unique and friendly.

        IMPORTANT INSTRUCTIONS:
        1. The transactions and accounts data are provided below. DO NOT ask for data - it's already included in this prompt.
        2. DO NOT output templates or placeholders saying you're ready to analyze. Actually analyze the data provided.
        3. If the data is limited, work with what you have. Don't apologize for limitations, just provide the best analysis possible.
        4. Format your response using proper Markdown syntax with headers (# for main title, ## for sections, etc.), 
           bullet points, emphasis, and other formatting as needed to make the report well-structured and easy to read.

        Here is the data to analyze:
        - \`transactions\`: ${JSON.stringify(formattedTransactions)}
        - \`accounts\`: ${JSON.stringify(formattedAccounts)}
        
        Now, based on the provided input and customization settings, generate the Financial Summary in Markdown format.
        `;

        // Call Gemini via Vercel AI SDK
        const { text } = await generateText({
            model: google("gemini-2.0-flash"),
            prompt: geminiPrompt,
        });

        // Prepare report data to save
        const reportData = {
            report: text,
            timeRange,
            categories,
            generatedAt: new Date(),
            transactions: formattedTransactions.length,
        };

        // Save to MongoDB using $push to append to the reports array
        try {
            await collection.updateOne({ clerkId: userId }, { $push: { reports: reportData } } as any, {
                upsert: true,
            });
        } catch (error) {
            console.error("Error saving report:", error);
            // Continue even if saving fails - we'll still return the report to the user
        }

        return NextResponse.json({
            report: text,
            data: {
                transactions: formattedTransactions,
                accounts: formattedAccounts,
                timeRange,
                categories,
            },
        });
    } catch (error: any) {
        console.error("Error generating daily report:", error);
        return NextResponse.json(
            {
                error: "Failed to generate daily report",
                details: error.message,
            },
            {
                status: 500,
            }
        );
    }
}
