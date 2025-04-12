"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

type MonthlyData = {
  month: string;
  Income: number;
  Expenses: number;
};

export function MonthlyBarCharts() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      const res = await fetch(`/api/plaid/get-monthly-summary?clerkId=${user.id}`);
      const json = await res.json();
      if (Array.isArray(json)) {
        setData(json);
      }
    };

    if (isLoaded) {
      fetchData();
    }
  }, [user, isLoaded]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <motion.div
        className="bg-white p-6 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-lg font-bold text-gray-900 mb-4">Monthly Expenses</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `$${value}`} />
            <Tooltip formatter={(value: number) => `$${value}`} />
            <CartesianGrid strokeDasharray="3 3" />
            <Bar dataKey="Expenses" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        className="bg-white p-6 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-lg font-bold text-gray-900 mb-4">Monthly Income</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `$${value}`} />
            <Tooltip formatter={(value: number) => `$${value}`} />
            <CartesianGrid strokeDasharray="3 3" />
            <Bar dataKey="Income" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
