import { NextRequest, NextResponse } from "next/server";
import { Configuration, PlaidApi, PlaidEnvironments, CountryCode } from "plaid";

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

        let institutionData = null;

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

        // Combine all data
        const data = {
            accounts: accountsResponse.data.accounts,
            item: itemResponse.data.item,
            institution: institutionData,
            balances: balanceResponse.data,
        };

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching Plaid data:", error);
        return NextResponse.json({ error: "Error fetching account data" }, { status: 500 });
    }
}

export const dynamic = "force-dynamic";
