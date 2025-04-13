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
        <div className="flex flex-col h-[calc(100vh-64px)] items-center bg-gray-50 py-8">
            <div className="w-full max-w-3xl mx-auto px-4">
                <h1 className="text-2xl font-bold">Finance Assistant</h1>
                <p className="text-gray-500 mt-1 mb-6">
                    Ask questions about your financial data and get personalized answers!
                </p>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[calc(100vh-250px)]">
                    <Chat userId={user?.id} />
                </div>
            </div>
        </div>
    );
}
