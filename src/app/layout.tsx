import "@/styles/globals.css";

import { type Metadata } from "next";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Geist } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export const metadata: Metadata = {
    metadataBase: new URL("https://finverse.fi"),
    title: {
        template: "%s | Finverse",
        default: "Finverse - Personal Finance Management",
    },
    description:
        "Finverse is a comprehensive personal finance web application designed to help students manage their finances by tracking account balances, income, and expenses.",
    keywords: ["personal finance", "budget", "expense tracker", "finance management", "student finances"],
    authors: [{ name: "Finverse Team" }],
    creator: "Finverse",
    publisher: "Finverse",
    icons: {
        icon: "/favicon.ico",
        apple: "/logo_transparent.png",
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://finverse.vercel.app",
        siteName: "Finverse",
        title: "Finverse - Personal Finance Management",
        description:
            "Track your accounts, manage transactions, and get AI-powered insights to take control of your financial future.",
        images: [
            {
                url: "/logo_transparent.png",
                width: 1200,
                height: 630,
                alt: "Finverse Logo",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Finverse - Personal Finance Management",
        description:
            "Track your accounts, manage transactions, and get AI-powered insights to take control of your financial future.",
        images: ["/logo_transparent.png"],
        creator: "@finverse",
    },
};

const geist = Geist({
    subsets: ["latin"],
    variable: "--font-geist-sans",
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <ClerkProvider>
            <NuqsAdapter>
                <html lang="en">
                    <body className={geist.className}>
                        <main className="p-6">{children}</main>
                    </body>
                </html>
            </NuqsAdapter>
        </ClerkProvider>
    );
}
