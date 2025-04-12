// app/components/ui/IncomeExpenseChart.tsx
"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

const mockData = [
  { date: "Apr 1", Income: 1200, Expenses: 850 },
  { date: "Apr 2", Income: 300, Expenses: 400 },
  { date: "Apr 3", Income: 500, Expenses: 200 },
  { date: "Apr 4", Income: 0, Expenses: 150 },
];

export function IncomeExpenseChart() {
  return (
    <motion.div
      className="bg-white p-6 rounded-lg shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-lg font-bold text-gray-900 mb-4">Income vs Expenses</h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={mockData}>
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
          <Area
            type="monotone"
            dataKey="Income"
            stroke="#22c55e"
            fill="url(#incomeGradient)"
          />
          <Area
            type="monotone"
            dataKey="Expenses"
            stroke="#ef4444"
            fill="url(#expenseGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
