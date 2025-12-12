// components/account-balance-card.tsx
"use client"

import { motion } from "framer-motion"
import { Wallet, TrendingUp, TrendingDown, Zap } from "lucide-react"

interface AccountBalanceCardProps {
  balance: number
  totalIncome: number
  totalExpenses: number
  lastUpdated?: string
}

export function AccountBalanceCard({ 
  balance, 
  totalIncome, 
  totalExpenses,
  lastUpdated 
}: AccountBalanceCardProps) {
  const isPositive = balance >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-card to-accent/5 border border-primary/30 p-6 shadow-lg"
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-50" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Wallet size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">
                Account Balance
              </p>
              <p className="text-xs text-muted-foreground">
                {lastUpdated ? `Updated ${lastUpdated}` : 'Real-time'}
              </p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse">
            <Zap size={20} className="text-black" />
          </div>
        </div>

        {/* Balance */}
        <div className="mb-6">
          <p className="font-mono text-4xl font-bold text-foreground mb-1">
            ₹{Math.abs(balance).toLocaleString()}
          </p>
          {!isPositive && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <TrendingDown size={12} /> Negative Balance
            </p>
          )}
        </div>

        {/* Income & Expenses */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-green-400" />
              <p className="text-xs text-green-400 font-medium">Income</p>
            </div>
            <p className="font-mono text-lg font-bold text-green-400">
              ₹{totalIncome.toLocaleString()}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown size={14} className="text-red-400" />
              <p className="text-xs text-red-400 font-medium">Expenses</p>
            </div>
            <p className="font-mono text-lg font-bold text-red-400">
              ₹{totalExpenses.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: totalIncome > 0 
                  ? `${Math.min((totalExpenses / totalIncome) * 100, 100)}%` 
                  : '0%' 
              }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {totalIncome > 0 
              ? `${((totalExpenses / totalIncome) * 100).toFixed(1)}% of income spent`
              : 'No income recorded'}
          </p>
        </div>
      </div>
    </motion.div>
  )
}