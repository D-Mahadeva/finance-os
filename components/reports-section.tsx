"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const weeklyData = [
  { day: "Mon", expenses: 1200, income: 10000 },
  { day: "Tue", expenses: 950, income: 0 },
  { day: "Wed", expenses: 1100, income: 0 },
  { day: "Thu", expenses: 800, income: 0 },
  { day: "Fri", expenses: 1350, income: 0 },
  { day: "Sat", expenses: 2100, income: 0 },
  { day: "Sun", expenses: 1070, income: 30000 },
]

const monthlyData = [
  { name: "Fixed Obligations", value: 17000 },
  { name: "Food", value: 6570 },
  { name: "Travel", value: 1400 },
  { name: "Personal Care", value: 600 },
]

const COLORS = ["#06b6d4", "#10b981", "#8b5cf6", "#f59e0b"]

export function ReportsSection() {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "yearly">("monthly")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-card border border-border p-6 md:col-span-2"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Reports & Analytics</h3>
        <div className="flex gap-2">
          {(["weekly", "monthly", "yearly"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                timeframe === period
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {period === "weekly" ? "Week" : period === "monthly" ? "Month" : "Year"}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {timeframe === "weekly" ? (
          <motion.div
            key="weekly"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="day" stroke="#a1a1a6" style={{ fontSize: 12 }} />
                <YAxis stroke="#a1a1a6" style={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "8px",
                    color: "#fafafa",
                  }}
                  formatter={(value) => `₹${(value as number).toLocaleString()}`}
                />
                <Legend />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        ) : (
          <motion.div
            key="monthly"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid md:grid-cols-2 gap-8"
          >
            <div>
              <p className="text-sm text-muted-foreground mb-4">Expense Distribution</p>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={monthlyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ₹${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {monthlyData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  {/* <Legend dataKey="name" /> */}
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">Category Breakdown</p>
              {monthlyData.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-3 rounded-lg bg-muted/50 border border-border/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-sm text-foreground">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-accent">₹{item.value.toLocaleString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}