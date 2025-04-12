"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

// Chart colors
const COLORS = ["#3b82f6", "#6366f1", "#06b6d4", "#f43f5e", "#f97316", "#10b981", "#8b5cf6", "#ec4899"];

interface Transaction {
    date: string;
    amount: number;
    category: string;
    notes?: string;
    isManual?: boolean;
}

interface ReportChartsProps {
    transactions: Transaction[] | null;
}

export function ReportCharts({ transactions }: ReportChartsProps) {
    // Calculate category spending data for pie chart
    const categoryData = useMemo(() => {
        if (!transactions || transactions.length === 0) {
            return [];
        }

        const categoryMap = new Map<string, number>();

        transactions.forEach((transaction) => {
            // Only include expenses (positive amounts)
            if (transaction.amount > 0) {
                const category = transaction.category || "Uncategorized";
                const currentAmount = categoryMap.get(category) ?? 0;
                categoryMap.set(category, currentAmount + transaction.amount);
            }
        });

        // Convert to array for the chart
        return Array.from(categoryMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value); // Sort by amount descending
    }, [transactions]);

    // Prepare income/expense data by day
    const dailyData = useMemo(() => {
        if (!transactions || transactions.length === 0) {
            return [];
        }

        const dailyMap = new Map<string, { date: string; Income: number; Expenses: number }>();

        transactions.forEach((transaction) => {
            const day = new Date(transaction.date).toISOString().split("T")[0]; // YYYY-MM-DD
            const current = dailyMap.get(day) ?? { date: day, Income: 0, Expenses: 0 };

            if (transaction.amount < 0) {
                // Income (negative amounts in our system)
                current.Income += Math.abs(transaction.amount);
            } else {
                // Expense (positive amounts)
                current.Expenses += transaction.amount;
            }

            dailyMap.set(day, current);
        });

        // Convert to array and sort by date
        return Array.from(dailyMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [transactions]);

    // Don't render if no transactions or if both datasets are empty
    if (!transactions || transactions.length === 0 || (categoryData.length === 0 && dailyData.length === 0)) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Category Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Spending by Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={true}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `$${Number(value).toFixed(2)}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Income vs Expenses */}
            <Card>
                <CardHeader>
                    <CardTitle>Income vs Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(value) => {
                                        const date = new Date(value);
                                        return date.toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        });
                                    }}
                                />
                                <YAxis tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    formatter={(value: number) => `$${Number(value).toFixed(2)}`}
                                    labelFormatter={(label) => {
                                        const date = new Date(label);
                                        return date.toLocaleDateString("en-US", {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                        });
                                    }}
                                />
                                <Bar dataKey="Income" fill="#10b981" name="Income" />
                                <Bar dataKey="Expenses" fill="#f43f5e" name="Expenses" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
