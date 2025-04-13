"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Message as AIMessage } from "ai";
import { User, BotMessageSquare } from "lucide-react";

interface MessageProps {
    message: AIMessage;
    isLoading?: boolean;
}

export function Message({ message, isLoading }: MessageProps) {
    const isUser = message.role === "user";

    return (
        <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
            <div
                className={cn(
                    "flex items-start gap-4 max-w-[90%] rounded-lg p-4",
                    isUser ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-800 shadow-sm"
                )}
            >
                <div
                    className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                        isUser ? "bg-orange-600" : "bg-gray-100"
                    )}
                >
                    {isUser ? (
                        <User className="w-5 h-5 text-white" />
                    ) : (
                        <BotMessageSquare className="w-5 h-5 text-gray-700" />
                    )}
                </div>

                <div className="flex-1">
                    <div className="font-semibold text-sm mb-1">{isUser ? "You" : "Assistant"}</div>
                    <div className="whitespace-pre-wrap text-base leading-relaxed">{message.content}</div>
                </div>
            </div>
        </div>
    );
}
