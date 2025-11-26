"use client"

import { motion } from "framer-motion"
import { TrendingDown } from "lucide-react"

export function DebtAvalanche() {
  const goldLoan = {
    principal: 350000,
    interest: 0.12,
    monthlyInterest: 3500,
    monthlyPayment: 10215,
  }

  const educationLoan = {
    principal: 300000,
    interest: 0.08,
    status: "Moratorium Active",
  }

  const progressPercent = (goldLoan.monthlyPayment / goldLoan.principal) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-card border border-border p-6 md:col-span-2"
    >
      <div className="flex items-center gap-2 mb-6">
        <TrendingDown className="text-red-500" />
        <h3 className="text-lg font-semibold text-foreground">Debt Management</h3>
      </div>

      <div className="space-y-6">
        {/* Gold Loan */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-foreground">Gold Loan</p>
              <p className="text-xs text-muted-foreground">12% Annual Interest</p>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold text-yellow-400">₹{goldLoan.principal.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Principal</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-2 text-xs">
                <span className="text-muted-foreground">Payoff Progress</span>
                <span className="font-mono text-foreground">{progressPercent.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-2 rounded bg-black/30">
                <p className="text-xs text-muted-foreground">Monthly Interest</p>
                <p className="font-mono font-bold text-red-400">₹{goldLoan.monthlyInterest.toLocaleString()}</p>
              </div>
              <div className="p-2 rounded bg-black/30">
                <p className="text-xs text-muted-foreground">Monthly Payment</p>
                <p className="font-mono font-bold text-green-400">₹{goldLoan.monthlyPayment.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Education Loan */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Education Loan</p>
              <p className="text-xs text-muted-foreground">Principal: ₹{educationLoan.principal.toLocaleString()}</p>
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
              {educationLoan.status}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}