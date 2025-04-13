import { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        default: "Finverse - Personal Finance Management",
        template: "%s | Finverse",
    },
    description:
        "Track your accounts, manage transactions, and get AI-powered insights to take control of your financial future.",
    openGraph: {
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
};
