import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { auth } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongo/mongodb";
import type { NextRequest } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: NextRequest) {
    try {
        // Get user ID from Clerk
        const { userId } = await auth();
        if (!userId) {
            throw new Error("Not authenticated");
        }

        // Parse the request body
        const { messages } = await req.json();

        // Connect to MongoDB - clientPromise is already a MongoClient instance
        const client = clientPromise;
        const db = client.db("finverse");
        const collection = db.collection("users");

        // Find the user and their data
        const user = await collection.findOne({ clerkId: userId });

        if (!user) {
            throw new Error("User not found");
        }

        // Extract relevant user data for context
        const userContext = {
            transactions: user.transactions ?? [],
            accounts: user.plaidData?.accounts ?? [],
            financials: user.financials ?? {},
            formattedData: user.formattedData ?? {},
            reports: user.reports ?? [],
        };

        // System prompt that includes user context
        const systemPrompt = `
You are a helpful financial assistant for Finverse, a personal finance management application.
You have access to the user's financial data and should use this context to provide personalized answers. TO HELP USERS NAVIGATE THE SITE: Finverse has a dashboard page with charts and graphs displaying the user's finances (finverse.fi/dashboard). Then, there is a transaction page where you can see all of your recent transactions that are linked to your bank account through the Plaid API (this is for your knowledge only) (finverse.fi/transactions). If the user wants to generate a report of their finances, tell them to go to the reports page, where they can pick a time period and spending categories to generate a report for (finverse.fi/reports). You are the assistant (finverse.fi/assistant). The user is also onboarded through /onboarding. Here is the home page text: Track Your Finances, Easily manage all your transactions in one place. Add, edit, and categorize expenses and income. Link your bank accounts through Plaid for automatic imports, or manually enter transactions—it's your choice.

USER DATA:
${JSON.stringify(userContext, null, 2)}

You have the following information about the user:
1. Their transaction history
2. Their account information and balances
3. Financial summaries and analytics
4. Any saved financial reports

When answering questions:
- Be concise and clear
- Provide specific information based on their data when possible
- If you don't have the data to answer a specific question, be honest about it
- When discussing money, use proper formatting and currency symbols
- Never make up information that isn't in the user's data

The user's data is provided to you as context, but don't mention that you "have their data" - just use it naturally in your responses.
`;

        // Save the initial user message to MongoDB chats collection
        const userMessage = messages.find((m: any) => m.role === "user");
        if (userMessage?.content) {
            const chatsCollection = db.collection("chats");
            await chatsCollection.insertOne({
                userId,
                question: userMessage.content,
                timestamp: new Date(),
                messages: [], // This will be updated with the final messages including the AI response
            });
        }

        // Call Gemini with context
        const result = streamText({
            model: google("gemini-2.0-flash"),
            system: systemPrompt,
            messages,
            maxSteps: 5,
            onFinish: async ({ response }) => {
                // Save completed conversation to MongoDB
                if (userMessage?.content) {
                    const chatsCollection = db.collection("chats");
                    await chatsCollection.updateOne(
                        {
                            userId,
                            question: userMessage.content,
                            timestamp: { $gte: new Date(Date.now() - 60000) }, // Within the last minute
                        },
                        {
                            $set: {
                                answer: response.messages[0].content,
                                messages: [...messages, ...response.messages],
                                completedAt: new Date(),
                            },
                        }
                    );
                }
            },
        });

        return result.toDataStreamResponse();
    } catch (error: any) {
        console.error("Error in chat API:", error);
        throw error;
    }
}
