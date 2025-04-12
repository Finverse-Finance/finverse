// app/components/ui/RecentTransactions.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const mockTransactions = [
    { date: "Apr 10", amount: "-$22.99", category: "Dining", type: "Expense" },
    { date: "Apr 9", amount: "+$1,200.00", category: "Salary", type: "Income" },
    { date: "Apr 8", amount: "-$60.00", category: "Groceries", type: "Expense" },
    { date: "Apr 7", amount: "-$15.99", category: "Streaming", type: "Expense" },
    { date: "Apr 6", amount: "-$30.00", category: "Transport", type: "Expense" },
];

export function RecentTransactions() {
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
                    {mockTransactions.map((tx, index) => (
                        <tr key={index} className="border-b last:border-none hover:bg-gray-50 transition">
                            <td className="py-2">{tx.date}</td>
                            <td className="py-2">{tx.amount}</td>
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
