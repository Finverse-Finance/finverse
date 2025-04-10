import { NextRequest, NextResponse } from "next/server";
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from "plaid";

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
    try {
        const { client_user_id } = await req.json();
        const response = await client.linkTokenCreate({
            user: { client_user_id },
            client_name: "Name your App",
            products: [Products.Auth, Products.Transactions],
            country_codes: [CountryCode.Us],
            language: "en",
        });
        return NextResponse.json({ link_token: response.data.link_token });
    } catch (error) {
        return NextResponse.json({ error: "Error generating link token" }, { status: 500 });
    }
}
