"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

const COLORS = ["#3b82f6", "#6366f1", "#06b6d4", "#f43f5e", "#f97316", "#10b981", "#8b5cf6", "#ec4899"];

type PieData = {
    name: string;
    value: number;
};

export function CategoryPieChart() {
    const [data, setData] = useState<PieData[]>([]);
    const { user, isLoaded } = useUser();

    useEffect(() => {
        const fetchPieData = async () => {
            if (!user?.id) return;

            const res = await fetch(`/api/plaid/get-expenses-by-category?clerkId=${user.id}`);
            const json = await res.json();

            if (Array.isArray(json)) {
                setData(json);
            }
        };

        if (isLoaded) {
            fetchPieData();
        }
    }, [user, isLoaded]);

    return (
        <motion.div
            className="bg-white p-6 rounded-lg shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <h2 className="text-lg font-bold text-gray-900 mb-4">Expenses by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value}`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </motion.div>
    );
}
