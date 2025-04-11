"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PiggyBank, Database, Shield, ArrowLeft } from "lucide-react";
import { completeOnboarding } from "./_actions";
import { usePlaidLink } from "react-plaid-link";
import { updateUserWithPlaidData } from "./_actions";
import { useRouter } from "next/navigation";

// Component to wait for metadata and redirect
function OnboardingWaitForRedirect() {
    const { isLoaded, user } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isLoaded || !user) return;

        const checkMetadata = async () => {
            try {
                // Reload user to get latest metadata
                await user.reload();
                if (user.publicMetadata?.onboardingComplete === true) {
                    console.log("Redirecting to dashboard after onboarding completion");
                    router.push("/dashboard");
                } else {
                    // If metadata not updated yet, poll again
                    setTimeout(checkMetadata, 1000);
                }
            } catch (error) {
                console.error("Error checking metadata:", error);
                // Try again after delay
                setTimeout(checkMetadata, 1000);
            }
        };

        checkMetadata();
    }, [isLoaded, user, router]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg shadow-lg max-w-sm w-full">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <div className="text-center">
                        <h3 className="text-lg font-semibold mb-1">Setting up your account...</h3>
                        <p className="text-sm text-muted-foreground">
                            We&apos;re finalizing your setup. You&apos;ll be redirected to the dashboard shortly.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Onboarding() {
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showPlaid, setShowPlaid] = useState(false);
    const [linkToken, setLinkToken] = useState<string | null>(null);
    const [waitingForRedirect, setWaitingForRedirect] = useState(false);
    const { user, isLoaded } = useUser();
    const router = useRouter();

    // Check if user has already completed onboarding on component load
    useEffect(() => {
        if (isLoaded && user) {
            const checkOnboardingStatus = async () => {
                // Reload user to get latest metadata
                await user.reload();
                if (user.publicMetadata?.onboardingComplete === true) {
                    console.log("User already completed onboarding, redirecting to dashboard");
                    router.push("/dashboard");
                }
            };

            checkOnboardingStatus();
        }
    }, [isLoaded, user, router]);

    // Handle manual setup
    const handleManualSetup = async () => {
        try {
            setLoading("manual");
            setError(null);
            console.log("Starting manual onboarding flow");

            const formData = new FormData();
            formData.append("onboardingType", "manual");

            // Complete onboarding with manual setup
            const result = await completeOnboarding(formData);
            console.log("Manual onboarding result:", result);

            if (result.success) {
                // Switch to waiting mode to poll for metadata
                setWaitingForRedirect(true);
            } else {
                setError(result.error ?? "An unknown error occurred");
                setLoading(null);
            }
        } catch (error) {
            console.error("Manual setup error:", error);
            setError("An error occurred during setup. Please try again.");
            setLoading(null);
        }
    };

    // Handle Plaid button click - Show Plaid component
    const handlePlaidClick = () => {
        setShowPlaid(true);
        setLoading("plaid-init");
        console.log("Initializing Plaid flow");
        void createLinkToken();
    };

    // Create Plaid link token
    const createLinkToken = async () => {
        try {
            setLoading("plaid-init");
            const response = await fetch("/api/plaid/create-link-token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    client_user_id: user?.id ?? "user-id",
                }),
                cache: "no-store",
            });

            const data = await response.json();
            if (data.error) {
                setError(data.error);
                setLoading(null);
                return;
            }

            setLinkToken(data.link_token);
            setLoading(null);
        } catch (error) {
            console.error("Error generating link token:", error);
            setError("Failed to initialize Plaid connection");
            setLoading(null);
        }
    };

    // Plaid link success handler
    const onPlaidSuccess = async (public_token: string) => {
        try {
            setLoading("plaid-exchange");

            // First update onboarding status
            const formData = new FormData();
            formData.append("onboardingType", "plaid");
            await completeOnboarding(formData);

            // Exchange public token for access token
            const exchangeResponse = await fetch("/api/plaid/exchange-token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    public_token,
                }),
                cache: "no-store",
            });

            const exchangeData = await exchangeResponse.json();
            if (exchangeData.error) {
                setError(exchangeData.error);
                setLoading(null);
                return;
            }

            const access_token = exchangeData.access_token;

            // Fetch account data using the access token
            setLoading("plaid-accounts");
            const accountsResponse = await fetch("/api/plaid/get-accounts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    access_token,
                }),
                cache: "no-store",
            });

            const data = await accountsResponse.json();
            if (data.error) {
                setError(data.error);
                setLoading(null);
                return;
            }

            // Save plaid data to MongoDB and update onboarding status
            setLoading("plaid-save");
            const result = await updateUserWithPlaidData({
                accessToken: access_token,
                accounts: data.accounts,
                institution: data.institution,
                item: data.item,
                transactions: data.transactions,
            });

            if (result.error) {
                setError(result.error);
                setLoading(null);
                return;
            }

            if (data.transactions && data.transactions.length > 0) {
                setLoading("plaid-transactions");
                console.log(`Processing ${data.transactions.length} transactions...`);
            }

            // Short delay to allow transactions to be processed
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Switch to waiting mode to poll for metadata
            setWaitingForRedirect(true);
        } catch (error) {
            console.error("Error processing Plaid connection:", error);
            setError("Failed to connect your account. Please try again.");
            setLoading(null);
        }
    };

    // Initialize Plaid Link
    const config = {
        token: linkToken ?? "",
        onSuccess: onPlaidSuccess,
    };
    const { open, ready } = usePlaidLink(config);

    // Handle back button from Plaid view
    const handleBackFromPlaid = () => {
        setShowPlaid(false);
        setLinkToken(null);
        setError(null);
    };

    // Main content for choosing onboarding method
    const renderOnboardingOptions = () => (
        <div className="container max-w-4xl mx-auto px-4 py-8">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold tracking-tight">Welcome to Finverse</h1>
                <p className="text-muted-foreground mt-2">Let&apos;s get you started managing your finances</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 max-w-lg mx-auto">
                    {error}
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="transition-all hover:shadow-md border-t-4 border-t-[#e67e22]">
                    <CardHeader>
                        <PiggyBank className="h-8 w-8 mb-2 text-[#e67e22]" />
                        <CardTitle>Connect Your Bank</CardTitle>
                        <CardDescription>Automatically import transactions from your bank accounts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">
                            Using Plaid&apos;s secure connection, we can automatically import your transactions and keep
                            your balances up to date. Your credentials are never stored on our servers.
                        </p>
                        <div className="flex items-center mt-3 p-2 bg-orange-50 border border-orange-100 rounded-md">
                            <Shield className="h-4 w-4 text-[#e67e22] mr-2 flex-shrink-0" />
                            <p className="text-xs text-orange-800">
                                Plaid uses bank-level encryption to securely connect your accounts
                            </p>
                        </div>
                        <ul className="list-disc list-inside text-sm mt-3 space-y-1 text-muted-foreground">
                            <li>Auto-import transactions</li>
                            <li>Real-time balance updates</li>
                            <li>Secure bank-level encryption</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full bg-[#e67e22] hover:bg-[#d35400]"
                            onClick={handlePlaidClick}
                            disabled={loading !== null}
                        >
                            Connect Bank Account
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="transition-all hover:shadow-md">
                    <CardHeader>
                        <Database className="h-8 w-8 mb-2 text-primary" />
                        <CardTitle>Manual Setup</CardTitle>
                        <CardDescription>Manually add and manage your transactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">
                            Prefer to enter transactions yourself? Set up your account without connecting to your bank.
                            You can always connect your bank later.
                        </p>
                        <ul className="list-disc list-inside text-sm mt-3 space-y-1 text-muted-foreground">
                            <li>Full control over your data</li>
                            <li>No bank credentials required</li>
                            <li>Add transactions as you go</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full"
                            variant="outline"
                            onClick={handleManualSetup}
                            disabled={loading !== null}
                        >
                            Set Up Manually
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );

    // Plaid Link component
    const renderPlaidLink = () => (
        <div className="container mx-auto px-4 py-8">
            <Button onClick={handleBackFromPlaid} variant="ghost" className="mb-6" disabled={loading !== null}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Options
            </Button>

            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Connect Your Bank Account</CardTitle>
                    <CardDescription>Securely connect your accounts to automate transaction imports</CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-6 gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <div className="text-center">
                                <p>
                                    {loading === "plaid-init" && "Initializing Plaid connection..."}
                                    {loading === "plaid-exchange" && "Exchanging tokens..."}
                                    {loading === "plaid-accounts" && "Fetching account details..."}
                                    {loading === "plaid-save" && "Saving account information..."}
                                    {loading === "plaid-transactions" && "Processing transactions..."}
                                </p>
                            </div>
                        </div>
                    ) : linkToken ? (
                        <Button
                            onClick={() => open()}
                            disabled={!ready || loading !== null}
                            className="w-full bg-[#e67e22] hover:bg-[#d35400]"
                        >
                            Connect Your Bank
                        </Button>
                    ) : (
                        <div className="text-center py-4 text-muted-foreground">Initializing connection...</div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col items-start text-xs text-muted-foreground">
                    <p>Your data is secured with bank-level encryption.</p>
                    <p className="mt-1">Powered by Plaid</p>
                </CardFooter>
            </Card>
        </div>
    );

    // Main render
    if (waitingForRedirect) {
        return <OnboardingWaitForRedirect />;
    }

    if (loading === "manual") {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-background p-6 rounded-lg shadow-lg max-w-sm w-full">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <div className="text-center">
                            <h3 className="text-lg font-semibold mb-1">Setting up your account...</h3>
                            <p className="text-sm text-muted-foreground">
                                We&apos;re creating your account. You&apos;ll be redirected shortly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return showPlaid ? renderPlaidLink() : renderOnboardingOptions();
}
