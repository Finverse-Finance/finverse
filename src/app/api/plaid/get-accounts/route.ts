import { NextRequest, NextResponse } from "next/server";
import { Configuration, PlaidApi, PlaidEnvironments, CountryCode, Institution } from "plaid";

const plaidConfig = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments],
    baseOptions: {
        headers: {
            "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID || "",
            "PLAID-SECRET": process.env.PLAID_SECRET || "",
        },
    },
});

const client = new PlaidApi(plaidConfig);

export async function POST(req: NextRequest) {
    const { access_token } = await req.json();

    if (!access_token) {
        return NextResponse.json({ error: "Access token is required" }, { status: 400 });
    }

    try {
        // Get accounts
        const accountsResponse = await client.accountsGet({ access_token });

        // Get item details
        const itemResponse = await client.itemGet({ access_token });

        let institutionData: Institution | null = null;

        // Get institution details if institution_id exists
        if (itemResponse.data.item.institution_id) {
            const institutionResponse = await client.institutionsGetById({
                institution_id: itemResponse.data.item.institution_id,
                country_codes: [CountryCode.Us],
            });
            institutionData = institutionResponse.data.institution;
        }

        // Get balance data
        const balanceResponse = await client.accountsBalanceGet({ access_token });

        // Get transaction data for the last 180 days
        const now = new Date();
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - 180); // 180 days ago

        const startDateStr = startDate.toISOString().split("T")[0];
        const endDateStr = now.toISOString().split("T")[0];

        // Fetch all transactions using pagination
        let allTransactions: any[] = [];

        console.log(`Fetching transactions from ${startDateStr} to ${endDateStr}`);

        // First, use transactionsGet to fetch initial transactions
        const initialRequest = {
            access_token,
            start_date: startDateStr,
            end_date: endDateStr,
            options: {
                count: 100,
                include_personal_finance_category: true,
            },
        };

        let transactionsResponse = await client.transactionsGet(initialRequest);
        allTransactions = [...transactionsResponse.data.transactions];

        console.log(
            `Fetched ${allTransactions.length} of ${transactionsResponse.data.total_transactions} transactions`
        );

        // Continue fetching if there are more transactions
        while (transactionsResponse.data.transactions.length < transactionsResponse.data.total_transactions) {
            const paginatedRequest = {
                ...initialRequest,
                options: {
                    ...initialRequest.options,
                    offset: allTransactions.length,
                },
            };

            transactionsResponse = await client.transactionsGet(paginatedRequest);
            allTransactions = [...allTransactions, ...transactionsResponse.data.transactions];

            console.log(
                `Fetched ${allTransactions.length} of ${transactionsResponse.data.total_transactions} transactions`
            );

            // Safety check to prevent infinite loops
            if (transactionsResponse.data.transactions.length === 0) {
                break;
            }
        }

        // Also fetch any pending transactions using transactionsSync
        const pendingTransactionsResponse = await client.transactionsSync({
            access_token,
            options: {
                include_personal_finance_category: true,
            },
        });

        // Add pending transactions to our list
        if (pendingTransactionsResponse.data.added.length > 0) {
            console.log(`Found ${pendingTransactionsResponse.data.added.length} pending transactions`);
            allTransactions = [...allTransactions, ...pendingTransactionsResponse.data.added];
        }

        console.log(`Total transactions: ${allTransactions.length}`);

        // Format transactions for storage in MongoDB
        // Select only the needed fields to avoid circular references and excessive data
        const formattedTransactions = allTransactions.map((transaction) => ({
            transaction_id: transaction.transaction_id,
            account_id: transaction.account_id,
            amount: transaction.amount,
            date: transaction.date,
            name: transaction.name,
            merchant_name: transaction.merchant_name || null,
            pending: transaction.pending,
            category: transaction.category || [],
            category_id: transaction.category_id || null,
            payment_channel: transaction.payment_channel || null,
            personal_finance_category: transaction.personal_finance_category
                ? {
                      primary: transaction.personal_finance_category.primary,
                      detailed: transaction.personal_finance_category.detailed,
                  }
                : null,
            location: transaction.location
                ? {
                      address: transaction.location.address || null,
                      city: transaction.location.city || null,
                      country: transaction.location.country || null,
                      postal_code: transaction.location.postal_code || null,
                      region: transaction.location.region || null,
                      lat: transaction.location.lat || null,
                      lon: transaction.location.lon || null,
                  }
                : null,
        }));

        // Combine all data
        const data = {
            accounts: accountsResponse.data.accounts,
            item: itemResponse.data.item,
            institution: institutionData,
            balances: balanceResponse.data,
            transactions: formattedTransactions,
        };

        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error("Error fetching Plaid data:", error);
        return NextResponse.json({ error: "Error fetching account data" }, { status: 500 });
    }
}

export const dynamic = "force-dynamic";
