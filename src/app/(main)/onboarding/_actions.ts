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
    }>;
}

/**
 * Completes the onboarding process by:
 * 1. Creating a user record in MongoDB
 * 2. Setting onboardingComplete metadata in Clerk
 * 3. Redirecting to the dashboard
 */
export async function completeOnboarding(formData: FormData) {
    console.log("SERVER ACTION: Starting onboarding process");
    try {
        const { userId } = await auth();
        console.log("SERVER ACTION: User ID from auth:", userId);

        if (!userId) {
            console.log("SERVER ACTION: No logged in user");
            return { success: false, error: "No logged in user" };
        }

        const clerk = await clerkClient();
        const onboardingType = formData.get("onboardingType") as string;
        console.log("SERVER ACTION: Onboarding type:", onboardingType);

        // Update user's public metadata via Clerk
        console.log("SERVER ACTION: Updating Clerk metadata");
        try {
            const updateResult = await clerk.users.updateUser(userId, {
                publicMetadata: {
                    onboardingComplete: true,
                    onboardingType: onboardingType,
                    onboardingTimestamp: Date.now(),
                },
            });
            console.log(
                "SERVER ACTION: Clerk metadata updated successfully:",
                updateResult.publicMetadata?.onboardingComplete,
                updateResult.publicMetadata?.onboardingType
            );
        } catch (clerkError) {
            console.error("SERVER ACTION: Error updating Clerk metadata:", clerkError);
            throw clerkError;
        }

        // Also save to MongoDB
        console.log("SERVER ACTION: Updating MongoDB");
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
                console.log("SERVER ACTION: Initializing empty transactions array for manual user");

                // Initialize with empty transactions array
                Object.assign(userData, { transactions: [] });
            } else {
                // For Plaid users, initialize with empty array
                Object.assign(userData, { transactions: [] });
            }

            const updateResult = await db
                .collection("users")
                .updateOne({ clerkId: userId }, { $set: userData }, { upsert: true });

            console.log(
                "SERVER ACTION: MongoDB updated successfully:",
                updateResult.acknowledged,
                updateResult.modifiedCount || updateResult.upsertedCount
            );
        } catch (mongoError) {
            console.error("SERVER ACTION: Error updating MongoDB:", mongoError);
            // Continue even if MongoDB fails - we can rely on Clerk metadata
        }

        // Force session synchronization to update claims
        console.log("SERVER ACTION: Attempting to force session sync");
        try {
            // Get the active session ID
            const session = await auth();
            const sessionId = session.sessionId;

            if (!sessionId) {
                console.warn("SERVER ACTION: No active session ID found, skipping sync");
            } else {
                console.log("SERVER ACTION: Syncing session with ID:", sessionId);
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
                console.log(`SERVER ACTION: Session sync attempt ${syncStatus} with status ${syncResponse.status}`);

                if (!syncResponse.ok) {
                    console.warn("SERVER ACTION: Session sync response:", await syncResponse.text());
                }
            }
        } catch (error) {
            console.error("SERVER ACTION: Error syncing session:", error);
            // Continue execution even if session sync fails
        }

        // Revalidate relevant paths
        console.log("SERVER ACTION: Revalidating paths");
        revalidatePath("/dashboard");
        revalidatePath("/onboarding");

        console.log("SERVER ACTION: Onboarding completed successfully");
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
    console.log("SERVER ACTION: Starting Plaid data update");
    try {
        const { userId } = await auth();
        console.log("SERVER ACTION: User ID from auth:", userId);

        if (!userId) {
            console.log("SERVER ACTION: No logged in user");
            return { success: false, error: "No logged in user" };
        }

        // Save Plaid data and transactions to MongoDB user document
        console.log("SERVER ACTION: Saving Plaid data to MongoDB");
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
                console.log(`SERVER ACTION: Processing ${plaidData.transactions.length} transactions`);

                // Map transactions to include additional metadata
                const formattedTransactions = plaidData.transactions.map((tx) => ({
                    ...tx,
                    importedAt: new Date(),
                    source: "plaid",
                }));

                // Add transactions to the update data
                updateData.transactions = formattedTransactions;

                console.log(`SERVER ACTION: Adding ${formattedTransactions.length} transactions to user document`);
            } else {
                console.log("SERVER ACTION: No transactions to save");
                // Initialize with empty array if no transactions
                updateData.transactions = [];
            }

            // Update the user document with all data
            const updateResult = await db
                .collection("users")
                .updateOne({ clerkId: userId }, { $set: updateData }, { upsert: true });

            console.log(
                "SERVER ACTION: MongoDB updated successfully:",
                updateResult.acknowledged,
                "Modified:",
                updateResult.modifiedCount,
                "Upserted:",
                updateResult.upsertedCount
            );
        } catch (mongoError) {
            console.error("SERVER ACTION: Error saving Plaid data to user document:", mongoError);
            throw mongoError;
        }

        console.log("SERVER ACTION: Plaid data update completed successfully");
        return { success: true };
    } catch (error) {
        console.error("SERVER ACTION: Error saving Plaid data:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unknown error occurred",
        };
    }
}
