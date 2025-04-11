"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const { user, isLoaded } = useUser();
    const [isPolling, setIsPolling] = useState(false);
    const router = useRouter();

    // Check if user has NOT completed onboarding, redirect to onboarding if needed
    useEffect(() => {
        if (isLoaded && user) {
            const checkOnboardingStatus = async () => {
                // Reload user to get latest metadata
                await user.reload();
                if (user.publicMetadata?.onboardingComplete !== true) {
                    console.log("User has not completed onboarding, redirecting to onboarding page");
                    router.push("/onboarding");
                }
            };

            checkOnboardingStatus();
        }
    }, [isLoaded, user, router]);

    // Poll user data to check for updates if metadata might be pending
    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        const checkUserMetadata = () => {
            if (user && !user.publicMetadata?.onboardingComplete) {
                setIsPolling(true);

                // Create polling interval to check for metadata updates
                intervalId = setInterval(() => {
                    console.log("Polling for metadata updates...");
                    try {
                        // Use void to handle the promise
                        void user
                            .reload()
                            .then(() => {
                                // If metadata is now updated, clear interval
                                if (user.publicMetadata?.onboardingComplete) {
                                    console.log("Metadata updated, stopping polling");
                                    if (intervalId) clearInterval(intervalId);
                                    setIsPolling(false);
                                }
                            })
                            .catch((error) => {
                                console.error("Error polling metadata:", error);
                            });
                    } catch (error) {
                        console.error("Error polling metadata:", error);
                    }
                }, 3000); // Poll every 3 seconds
            }
        };

        if (isLoaded) {
            checkUserMetadata();
        }

        // Cleanup function
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [user, isLoaded]);

    // Determine onboarding status
    const isOnboardingComplete = isLoaded && user?.publicMetadata?.onboardingComplete === true;

    const onboardingMethod = isLoaded
        ? typeof user?.publicMetadata?.onboardingType === "string"
            ? user.publicMetadata.onboardingType
            : "None"
        : "Loading...";

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            {isPolling && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6">
                    <p className="font-medium">Checking for account updates...</p>
                    <p className="text-sm mt-1">
                        We&apos;re syncing your account information. This may take a few moments.
                    </p>
                </div>
            )}

            {isOnboardingComplete && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                    Onboarding completed successfully! Welcome to Finverse.
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">User Information</h2>
                    <div className="space-y-2">
                        <p>
                            <span className="font-medium">Name:</span>{" "}
                            {isLoaded ? (user?.fullName ?? "Not provided") : "Loading..."}
                        </p>
                        <p>
                            <span className="font-medium">Email:</span>{" "}
                            {isLoaded ? (user?.primaryEmailAddress?.emailAddress ?? "Not provided") : "Loading..."}
                        </p>
                        <p>
                            <span className="font-medium">Onboarding Status:</span>{" "}
                            {isOnboardingComplete ? "Completed" : "Not Completed"}
                        </p>
                        <p>
                            <span className="font-medium">Onboarding Method:</span> {onboardingMethod}
                        </p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Account Summary</h2>
                    <div className="space-y-2">
                        <p>Welcome to your Finverse dashboard!</p>
                        <p>Your financial data will appear here once you add transactions.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
