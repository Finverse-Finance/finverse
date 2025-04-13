"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

type Transaction = {
    date: string;
    amount: string;
    category: string;
    type: string;
};

export function RecentTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const { user, isLoaded } = useUser();

    useEffect(() => {
        const fetchRecentTransactions = async () => {
            if (!user?.id) return;
            const res = await fetch(`/api/plaid/get-recent-transactions?clerkId=${user.id}`);
            const json = await res.json();

            if (Array.isArray(json)) {
                setTransactions(json);
            }
        };

        if (isLoaded) {
            fetchRecentTransactions();
        }
    }, [user, isLoaded]);

    return (
        <motion.div
            className="bg-white p-6 rounded-lg shadow-md mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h2>
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left border-b">
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Amount</th>
                        <th className="pb-2">Category</th>
                        <th className="pb-2">Type</th>
                    </tr>
                </thead>
                <tbody>
            {transactions.map((tx, index) => (
                <tr key={index} className="border-b last:border-none hover:bg-gray-50 transition">
                <td className="py-2">{tx.date}</td>
                <td
                    className={`py-2 font-medium ${
                    tx.type === "Income" ? "text-green-600" : "text-red-600"
                    }`}
                >
                    {tx.amount}
                </td>
                <td className="py-2">{tx.category}</td>
                <td className="py-2">{tx.type}</td>
                </tr>
            ))}
            </tbody>
            </table>
            <div className="text-right mt-4">
                <Link href="/transactions" className="text-blue-600 hover:underline text-sm font-medium">
                    View All →
                </Link>
            </div>
        </motion.div>
    );
}
