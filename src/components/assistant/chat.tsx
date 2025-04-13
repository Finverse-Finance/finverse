"use client";

import { Message as AIMessage } from "ai";
import { useChat } from "ai/react";
import { useEffect, useState } from "react";
import { useScrollToBottom } from "./use-scroll-to-bottom";
import { Message } from "./message";

interface ChatProps {
    initialMessages?: Array<AIMessage>;
    userId?: string;
}

export function Chat({ initialMessages = [], userId }: ChatProps) {
    const { messages, input, handleInputChange, handleSubmit, isLoading, error, append } = useChat({
        api: "/api/assistant/chat",
        initialMessages: [],
        body: {
            id: userId,
        },
        onError: (err) => {
            console.error("Chat error:", err);
        },
    });

    const [messagesContainer, messagesEndRef] = useScrollToBottom<HTMLDivElement>();

    // Fetch user data when component mounts
    const [userData, setUserData] = useState<any>(null);
    const [isLoadingUserData, setIsLoadingUserData] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoadingUserData(true);
                const response = await fetch("/api/userdata");
                if (!response.ok) {
                    throw new Error("Failed to fetch user data");
                }
                const data = await response.json();
                setUserData(data.user);
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setIsLoadingUserData(false);
            }
        };

        fetchUserData();
    }, []);

    // Show welcome message if no messages
    useEffect(() => {
        if (messages.length === 0 && !isLoadingUserData && userData) {
            // Add welcome message once user data is loaded
            append({
                id: "welcome-message",
                role: "assistant",
                content: `Hello! I'm your Finverse assistant. I can help you understand your finances better. Ask me anything about your transactions, account balances, or financial reports. I can also help with navigating the app.`,
            });
        }
    }, [userData, isLoadingUserData, messages.length, append]);

    return (
        <div className="flex flex-col h-full">
            <div ref={messagesContainer} className="flex-1 overflow-y-auto p-5 space-y-5">
                {isLoadingUserData ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 text-lg">Loading your financial data...</p>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <Message key={message.id} message={message} />
                        ))}
                        <div ref={messagesEndRef} className="h-1 w-full" />
                    </>
                )}
            </div>

            {error && (
                <div className="mx-5 mb-3 bg-red-50 text-red-800 px-4 py-3 rounded-md text-base">
                    Error: {error.message || "Something went wrong"}
                </div>
            )}

            <div className="border-t p-5">
                <form onSubmit={handleSubmit} className="flex rounded-lg border overflow-hidden shadow-sm">
                    <input
                        className="flex-1 px-5 py-3 focus:outline-none text-gray-700 text-base"
                        value={input}
                        placeholder={
                            isLoadingUserData ? "Loading your data..." : "Ask a question about your finances..."
                        }
                        onChange={handleInputChange}
                        disabled={isLoading || isLoadingUserData}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input || isLoadingUserData}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base"
                    >
                        {isLoading ? "..." : "Send"}
                    </button>
                </form>
            </div>
        </div>
    );
}
