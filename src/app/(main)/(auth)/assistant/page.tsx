"use client";

import { Chat } from "@/components/assistant/chat";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function Assistant() {
    const { user, isLoaded } = useUser();

    // Redirect to login if not authenticated
    if (isLoaded && !user) {
        redirect("/sign-in");
    }

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] items-center bg-gray-50 py-6">
            <div className="w-full max-w-4xl mx-auto px-6">
                <h1 className="text-3xl font-bold">Finance Assistant</h1>
                <p className="text-gray-500 mt-2 mb-6 text-lg">
                    Ask questions about your financial data and get personalized answers!
                </p>

                <div className="bg-white rounded-lg shadow-md overflow-hidden h-[calc(100vh-220px)]">
                    <Chat userId={user?.id} />
                </div>
            </div>
        </div>
    );
}
