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
                    "flex items-start gap-3 max-w-[85%] rounded-lg p-3",
                    isUser ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-800 shadow-sm"
                )}
            >
                <div
                    className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                        isUser ? "bg-orange-600" : "bg-gray-100"
                    )}
                >
                    {isUser ? (
                        <User className="w-4 h-4 text-white" />
                    ) : (
                        <BotMessageSquare className="w-4 h-4 text-gray-700" />
                    )}
                </div>

                <div className="flex-1">
                    <div className="font-semibold text-xs mb-1">{isUser ? "You" : "Assistant"}</div>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                </div>
            </div>
        </div>
    );
}
