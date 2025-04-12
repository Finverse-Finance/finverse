"use client";

import { useEffect, useState, useCallback } from "react";
import { DataTable } from "./components/data-table";
import { Transaction } from "./types";
import { useAuth } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Transactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isLoaded, userId } = useAuth();

    const fetchTransactions = useCallback(async () => {
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
    }, [isLoaded, userId]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Transactions</h1>
                <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Add Transaction
                </Button>
            </div>

            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-500 rounded-md">{error}</div>
            ) : (
                <DataTable data={transactions} refreshData={fetchTransactions} />
            )}
        </div>
    );
}
