"use client"

import { motion } from "framer-motion"
import { Shield } from "lucide-react"

export function InsuranceVault() {
  const policies = [
    {
      name: "Vehicle Insurance",
      provider: "HDFC ERGO",
      validTill: "Nov 2025",
      status: "Active",
      statusColor: "text-green-400",
    },
    {
      name: "Health Insurance",
      provider: "Parents",
      sumInsured: "₹5L",
      status: "Active",
      statusColor: "text-green-400",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-card border border-border p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <Shield size={20} className="text-secondary" />
        <h3 className="text-lg font-semibold text-foreground">Insurance Vault</h3>
      </div>

      <div className="space-y-3">
        {policies.map((policy, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-secondary/50 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-foreground">{policy.name}</p>
              <span className={`text-xs font-bold ${policy.statusColor}`}>{policy.status}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{policy.provider}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{policy.validTill || policy.sumInsured}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}