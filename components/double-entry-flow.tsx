"use client"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export function DoubleEntryFlow({ income, expenses, assets }: { income: number, expenses: number, assets: number }) {
  const surplus = income - expenses
  // Simple visual calculation
  const flows = [
    { label: "Income", amount: income, color: "from-green-500 to-emerald-500" },
    { label: "Fixed Obs", amount: -17000, color: "from-red-500 to-rose-500" }, // Hardcoded logic from prompt for visual
    { label: "Expenses", amount: -expenses, color: "from-orange-500 to-yellow-500" },
    { label: "Surplus", amount: surplus, color: "from-cyan-500 to-blue-500" },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-card border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">Monthly Cash Flow</h3>
      <div className="space-y-4">
        {flows.map((flow, idx) => (
          <div key={idx}>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{flow.label}</span>
                  <span className={`font-mono font-bold ${flow.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                    {flow.amount > 0 ? "+" : ""}₹{Math.abs(flow.amount).toLocaleString()}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1 }}
                    className={`h-full bg-gradient-to-r ${flow.color}`}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}