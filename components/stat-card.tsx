"use client"

import type React from "react"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  trend?: number
  currency?: boolean
  className?: string
}

export function StatCard({ icon, label, value, trend, currency, className = "" }: StatCardProps) {
  const isPositive = trend && trend > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-lg bg-card border border-border p-4 hover:border-accent transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 ${className}`}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-transparent to-accent/0 opacity-0 hover:opacity-20 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="text-muted-foreground">{icon}</div>
          {trend !== undefined && (
            <div
              className={`flex items-center gap-1 text-xs font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}
            >
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="font-mono text-lg font-bold text-foreground">
          {currency ? "₹" : ""}
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
      </div>
    </motion.div>
  )
}