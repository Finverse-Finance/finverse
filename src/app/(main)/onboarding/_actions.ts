"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import client from "@/lib/mongo/mongodb";
import { revalidatePath } from "next/cache";

// Define interface for Plaid data
interface PlaidData {
    accessToken?: string;
    accounts?: Array<{
        id: string;
        name: string;
        mask: string;
        type: string;
        subtype: string;
        balances?: {
            available: number;
            current: number;
            limit?: number;
        };
    }>;
    institution?: {
        id: string;
        name: string;
    };
    item?: {
        id: string;
        institution_id: string;
    };
    transactions?: Array<{
        account_id: string;
        amount: number;
        date: string;
        name: string;
        pending: boolean;
        category?: string[];
        location?: {
            address?: string;
            city?: string;
            country?: string;
            postal_code?: string;
            region?: string;
        };
        personal_finance_category?: {
            primary: string;
            detailed: string;
        };
    }>;
    financials?: {
        incomeTransactions?: Array<any>;
        expenseTransactions?: Array<any>;
        totalIncome?: number;
        totalExpenses?: number;
        incomeByDate?: Record<string, number>;
        expensesByDate?: Record<string, number>;
        incomeByCategory?: Record<string, number>;
        expensesByCategory?: Record<string, number>;
    };
}

/**
 * Completes the onboarding process by:
 * 1. Creating a user record in MongoDB
 * 2. Setting onboardingComplete metadata in Clerk
 * 3. Redirecting to the dashboard
 */
export async function completeOnboarding(formData: FormData) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return { success: false, error: "No logged in user" };
        }

        const clerk = await clerkClient();
        const onboardingType = formData.get("onboardingType") as string;

        // Update user's public metadata via Clerk
        try {
            const updateResult = await clerk.users.updateUser(userId, {
                publicMetadata: {
                    onboardingComplete: true,
                    onboardingType: onboardingType,
                    onboardingTimestamp: Date.now(),
                },
            });
        } catch (clerkError) {
            console.error("SERVER ACTION: Error updating Clerk metadata:", clerkError);
            throw clerkError;
        }

        // Also save to MongoDB
        try {
            const db = client.db("finverse");

            const userData = {
                clerkId: userId,
                onboardingComplete: true,
                onboardingType: onboardingType,
                onboardingTimestamp: new Date(),
            };

            // For manual users, initialize with an empty transactions array
            if (onboardingType === "manual") {
                // Initialize with empty transactions array
                Object.assign(userData, { transactions: [] });
            } else {
                // For Plaid users, initialize with empty array
                Object.assign(userData, { transactions: [] });
            }

            const updateResult = await db
                .collection("users")
                .updateOne({ clerkId: userId }, { $set: userData }, { upsert: true });
        } catch (mongoError) {
            console.error("SERVER ACTION: Error updating MongoDB:", mongoError);
            // Continue even if MongoDB fails - we can rely on Clerk metadata
        }

        // Force session synchronization to update claims
        try {
            // Get the active session ID
            const session = await auth();
            const sessionId = session.sessionId;

            if (!sessionId) {
                console.warn("SERVER ACTION: No active session ID found, skipping sync");
            } else {
                const syncResponse = await fetch(`https://api.clerk.com/v1/sessions/${sessionId}/touch`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        // Include any specific parameters if needed
                    }),
                });

                const syncStatus = syncResponse.ok ? "succeeded" : "failed";

                if (!syncResponse.ok) {
                    console.warn("SERVER ACTION: Session sync response:", await syncResponse.text());
                }
            }
        } catch (error) {
            console.error("SERVER ACTION: Error syncing session:", error);
            // Continue execution even if session sync fails
        }

        // Revalidate relevant paths
        revalidatePath("/dashboard");
        revalidatePath("/onboarding");

        return { success: true, message: "Onboarding completed successfully" };
    } catch (error) {
        console.error("SERVER ACTION: Error completing onboarding:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unknown error occurred",
        };
    }
}

/**
 * Updates user with Plaid account data after successful connection
 */
export async function updateUserWithPlaidData(plaidData: PlaidData) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return { success: false, error: "No logged in user" };
        }

        // Save Plaid data and transactions to MongoDB user document
        try {
            const db = client.db("finverse");

            const updateData: any = {
                plaidData: {
                    accessToken: plaidData.accessToken,
                    accounts: plaidData.accounts,
                    institution: plaidData.institution,
                    item: plaidData.item,
                    lastUpdated: new Date(),
                },
            };

            // Check for transactions
            if (plaidData.transactions && plaidData.transactions.length > 0) {
                // Map transactions to include additional metadata
                const formattedTransactions = plaidData.transactions.map((tx) => ({
                    ...tx,
                    importedAt: new Date(),
                    source: "plaid",
                }));

                // Add transactions to the update data
                updateData.transactions = formattedTransactions;
            } else {
                // Initialize with empty array if no transactions
                updateData.transactions = [];
            }

            // Add financial analytics if available
            if (plaidData.financials) {
                updateData.financials = {
                    ...plaidData.financials,
                    lastUpdated: new Date(),
                };
            }

            // Update the user document with all data
            const updateResult = await db
                .collection("users")
                .updateOne({ clerkId: userId }, { $set: updateData }, { upsert: true });
        } catch (mongoError) {
            console.error("SERVER ACTION: Error saving Plaid data to user document:", mongoError);
            throw mongoError;
        }

        return { success: true };
    } catch (error) {
        console.error("SERVER ACTION: Error saving Plaid data:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unknown error occurred",
        };
    }
}
