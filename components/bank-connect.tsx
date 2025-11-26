"use client"

import { motion } from "framer-motion"
import { Zap } from "lucide-react"

export function BankConnect() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-lg bg-card border border-border p-6"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Zap size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Connected Account</p>
            <p className="font-semibold text-foreground">HDFC Bank</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Available Balance</span>
            <span className="font-mono text-sm font-bold text-foreground">₹12,400</span>
          </div>
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              animate={{ scaleX: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="h-full bg-gradient-to-r from-primary via-accent to-primary origin-left"
            />
          </div>
          <p className="text-xs text-muted-foreground">Last sync 2 mins ago</p>
        </div>
      </div>
    </motion.div>
  )
}