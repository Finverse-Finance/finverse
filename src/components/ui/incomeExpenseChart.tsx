// app/components/ui/IncomeExpenseChart.tsx
"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

type ChartDataPoint = {
    date: string;
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
            date: new Date(entry.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
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
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => `$${value}`} />
            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            <CartesianGrid strokeDasharray="3 3" />
            <Area type="monotone" dataKey="Income" stroke="#22c55e" fill="url(#incomeGradient)" />
            <Area type="monotone" dataKey="Expenses" stroke="#ef4444" fill="url(#expenseGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    );
  }