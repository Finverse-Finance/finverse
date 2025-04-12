// app/components/ui/MonthlyBarCharts.tsx
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

const expenseData = [
  { month: "Jan", Expenses: 1250 },
  { month: "Feb", Expenses: 1100 },
  { month: "Mar", Expenses: 1325 },
  { month: "Apr", Expenses: 950 },
];

const incomeData = [
  { month: "Jan", Income: 1800 },
  { month: "Feb", Income: 1750 },
  { month: "Mar", Income: 1600 },
  { month: "Apr", Income: 1900 },
];

export function MonthlyBarCharts() {
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
          <BarChart data={expenseData}>
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
          <BarChart data={incomeData}>
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
