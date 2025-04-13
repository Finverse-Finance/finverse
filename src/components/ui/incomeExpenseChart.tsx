"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

type ChartDataPoint = {
    date: string; // original full date
    Income: number;
    Expenses: number;
};

export function IncomeExpenseChart() {
    const [data, setData] = useState<ChartDataPoint[]>([]);
    const { user, isLoaded } = useUser();

    useEffect(() => {
        const fetchChartData = async () => {
            if (!user?.id) return;

            const res = await fetch(`/api/plaid/get-income-expenses-dates?clerkId=${user.id}`);
            const json = await res.json();

            if (Array.isArray(json)) {
                const formatted = json.map((entry) => ({
                    date: entry.date,
                    Income: entry.Income ?? 0,
                    Expenses: entry.Expenses ?? 0,
                }));
                setData(formatted);
            }
        };

        if (isLoaded) {
            fetchChartData();
        }
    }, [user, isLoaded]);

    // Format the X-axis label: show only one label per month
    const getTickFormatter = () => {
        let lastMonth = "";
        return (dateStr: string) => {
            const date = new Date(dateStr);
            const month = date.toLocaleString("en-US", { month: "long", year: "numeric" });
            if (month !== lastMonth) {
                lastMonth = month;
                return month;
            }
            return "";
        };
    };

    return (
        <motion.div
            className="bg-white p-6 rounded-lg shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <h2 className="text-lg font-bold text-gray-900 mb-4">Income vs Expenses</h2>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="date"
                        tickFormatter={(dateStr) => {
                            const date = new Date(dateStr);
                            return date.toLocaleString("en-US", { month: "short", year: "numeric" });
                        }}
                        ticks={Array.from(
                            new Map(
                                data.map((d) => {
                                    const date = new Date(d.date);
                                    const key = `${date.getFullYear()}-${date.getMonth()}`;
                                    return [key, d.date]; // Only keep the first date per month
                                })
                            ).values()
                        )}
                    />
                    <YAxis tickFormatter={(value) => `$${Math.abs(value).toLocaleString()}`} />
                    <Tooltip
                        labelFormatter={(label: string) => {
                            const date = new Date(label);
                            return date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            });
                        }}
                        formatter={(value: number) =>
                            `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                        }
                    />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Area type="monotone" dataKey="Income" stroke="#22c55e" fill="url(#incomeGradient)" />
                    <Area type="monotone" dataKey="Expenses" stroke="#ef4444" fill="url(#expenseGradient)" />
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    );
}
