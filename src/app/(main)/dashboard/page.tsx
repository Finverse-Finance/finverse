"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OverviewCards } from "@/components/ui/overviewCard";
import { IncomeExpenseChart } from "@/components/ui/incomeExpenseChart";
import { CategoryPieChart } from "@/components/ui/categoryPieChart";
import { MonthlyBarCharts } from "@/components/ui/monthlyBarChart";
import { RecentTransactions } from "@/components/ui/recentTransactions";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

export default function Dashboard() {
    const { user, isLoaded } = useUser();
    const [isPolling, setIsPolling] = useState(false);
    const [availableBalance, setAvailableBalance] = useState<number | null>(null);
    const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
    const [monthlyExpenses, setMonthlyExpenses] = useState<number>(0);
    const [spendingPercent, setSpendingPercent] = useState<number | null>(null);
    const router = useRouter();

    // Check if user has NOT completed onboarding, redirect to onboarding if needed
    useEffect(() => {
        if (isLoaded && user) {
            const checkOnboardingStatus = async () => {
                // Reload user to get latest metadata
                await user.reload();
                if (user.publicMetadata?.onboardingComplete !== true) {
                    router.push("/onboarding");
                }
            };

            checkOnboardingStatus();
        }
    }, [isLoaded, user, router]);

    useEffect(() => {
        const fetchMongoBalance = async () => {
            const clerkId = user?.id;
            if (!clerkId) return;

            try {
                const res = await fetch(`/api/plaid/get-user-financials?clerkId=${clerkId}`);
                const data = await res.json();

                if (data?.balance) {
                    setAvailableBalance(data.balance);
                }

                const summaryRes = await fetch(`/api/plaid/get-monthly-summary?clerkId=${clerkId}`);
                const summaryData = await summaryRes.json();
                if (Array.isArray(summaryData) && summaryData.length > 0) {
                    const latestMonth = summaryData[summaryData.length - 1];
                    setMonthlyIncome(latestMonth.Income ?? 0);
                    setMonthlyExpenses(latestMonth.Expenses ?? 0);

                    // Calculate spending % vs. previous average
                    const previousMonths = summaryData.slice(0, -1);
                    const avgExpense =
                        previousMonths.reduce((acc, curr) => acc + (curr.Expenses || 0), 0) /
                        Math.max(previousMonths.length, 1);
                    const percent =
                        latestMonth.Expenses && avgExpense ? (latestMonth.Expenses / avgExpense) * 100 : null;
                    setSpendingPercent(percent);
                }
            } catch (err) {
                console.error("Error fetching from MongoDB:", err);
            }
        };

        if (isLoaded && user) {
            fetchMongoBalance();
        }
    }, [isLoaded, user]);

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

            {/* Bento Grid Style Cards */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                {/* Left Card - Total + Summary */}
                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Total Balance</h2>
                        <p className="text-3xl mt-2 font-semibold text-gray-800">
                            {availableBalance !== null ? `$${availableBalance.toLocaleString()}` : "Loading..."}
                        </p>
                    </div>
                    <div className="mt-6 space-y-3">
                        <div className="flex items-center gap-2 text-green-600">
                            <ArrowUpIcon className="h-5 w-5" />
                            <span>This Month’s Income: ${monthlyIncome.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-red-600">
                            <ArrowDownIcon className="h-5 w-5" />
                            <span>This Month’s Expenses: ${monthlyExpenses.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Right Card - Spending vs Average */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Spending vs Monthly Average</h2>
                    <p className="text-4xl font-semibold text-yellow-500">
                        {spendingPercent !== null ? `${spendingPercent.toFixed(0)}%` : "Loading..."}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        {spendingPercent !== null
                            ? `You’ve spent ${(spendingPercent - 100).toFixed(0)}% more than your average monthly spending so far.`
                            : "Calculating spending comparison..."}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 my-6">
                <IncomeExpenseChart />
                <CategoryPieChart />
            </div>

            <MonthlyBarCharts />

            <RecentTransactions />

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
