"use client";

import { useEffect, useState } from "react";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { Transaction } from "./types";
import { useAuth } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";

export default function Transactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isLoaded, userId } = useAuth();

    useEffect(() => {
        async function fetchTransactions() {
            try {
                if (!isLoaded || !userId) return;

                setLoading(true);
                const response = await fetch("/api/transactions/get-transactions");

                if (!response.ok) {
                    throw new Error("Failed to fetch transactions");
                }

                const data = await response.json();
                setTransactions(data.transactions || []);
            } catch (err) {
                console.error("Error fetching transactions:", err);
                setError("Failed to load transactions. Please try again later.");
            } finally {
                setLoading(false);
            }
        }

        fetchTransactions();
    }, [isLoaded, userId]);

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Transactions</h1>
                {/* Add Transaction button will go here in the next step */}
            </div>

            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-500 rounded-md">{error}</div>
            ) : (
                <DataTable columns={columns} data={transactions} />
            )}
        </div>
    );
}
