"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Clock } from "lucide-react"

interface BillReminderProps {
  title: string
  amount: number
  dueDate: string
  icon?: React.ReactNode
}

export function BillReminder({ title, amount, dueDate, icon }: BillReminderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50 hover:border-accent/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        {icon ? <div className="text-accent">{icon}</div> : <Clock size={16} className="text-muted-foreground" />}
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{dueDate}</p>
        </div>
      </div>
      <p className="font-mono font-bold text-foreground">₹{amount.toLocaleString()}</p>
    </motion.div>
  )
}