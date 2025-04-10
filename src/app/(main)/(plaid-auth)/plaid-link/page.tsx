"use client";
import { useState, useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";

const PlaidLinkComponent = () => {
    const [linkToken, setLinkToken] = useState<string | null>(null);
    const [accountData, setAccountData] = useState(null);

    useEffect(() => {
        const createLinkToken = async () => {
            try {
                const response = await fetch("/api/plaid/create-link-token", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        client_user_id: "your-unique-user-id", // Replace with actual user ID
                    }),
                    // Don't cache this request since we need a fresh token each time
                    cache: "no-store",
                });

                const data = await response.json();
                setLinkToken(data.link_token);
            } catch (error) {
                console.error("Error generating link token:", error);
            }
        };
        createLinkToken();
    }, []);

    const onSuccess = async (public_token: string) => {
        try {
            // Exchange public token for access token
            const exchangeResponse = await fetch("/api/plaid/exchange-token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    public_token,
                }),
                // Ensure we don't cache this sensitive token exchange
                cache: "no-store",
            });

            const exchangeData = await exchangeResponse.json();
            const access_token = exchangeData.access_token;
            console.log("Access Token:", access_token);

            // Fetch account data using the access token
            const accountsResponse = await fetch("/api/plaid/get-accounts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    access_token,
                }),
                // Don't cache account data since we want fresh info
                cache: "no-store",
            });

            const data = await accountsResponse.json();
            setAccountData(data);

            // Log all the account data
            console.log("Plaid Account Data:", data);
            console.log("Accounts:", data.accounts);
            console.log("Institution:", data.institution);
            console.log("Item Details:", data.item);
            console.log("Balance Data:", data.balances);
        } catch (error) {
            console.error("Error processing Plaid connection:", error);
        }
    };

    const { open, ready } = usePlaidLink({
        token: linkToken!,
        onSuccess,
    });

    return (
        <div>
            {linkToken && (
                <button
                    onClick={() => open()}
                    disabled={!ready}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Connect Bank
                </button>
            )}
            {accountData && (
                <div className="mt-4">
                    <h2 className="text-xl font-bold">Connected Account</h2>
                    <pre className="bg-gray-100 p-4 mt-2 rounded overflow-auto max-h-96">
                        {JSON.stringify(accountData, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default PlaidLinkComponent;
