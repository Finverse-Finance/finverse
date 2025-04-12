// app/components/ui/CategoryPieChart.tsx
"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

const data = [
  { name: "Groceries", value: 320 },
  { name: "Transportation", value: 140 },
  { name: "Subscriptions", value: 75 },
  { name: "Dining", value: 210 },
];

const COLORS = ["#3b82f6", "#6366f1", "#06b6d4", "#f43f5e"];

export function CategoryPieChart() {
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
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `$${value}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
