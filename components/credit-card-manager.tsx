"use client"

import { motion } from "framer-motion"
import { CreditCard, ArrowRight } from "lucide-react"

export function CreditCardManager() {
  const cards = [
    { name: "HDFC Regalia", due: 12000, dueDate: "Dec 5" },
    { name: "SBI SimplyClick", due: 0, dueDate: "Dec 10" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-card border border-border p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <CreditCard size={20} className="text-accent" />
        <h3 className="text-lg font-semibold text-foreground">Credit Card Manager</h3>
      </div>

      <div className="space-y-3">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 rounded-lg bg-gradient-to-r from-accent/5 to-primary/5 border border-accent/20 hover:border-accent/50 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-foreground">{card.name}</p>
              {card.due > 0 && (
                <motion.button
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-1 px-3 py-1 rounded bg-accent/20 hover:bg-accent/30 text-accent text-xs font-bold transition-colors"
                >
                  Pay Bill <ArrowRight size={12} />
                </motion.button>
              )}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{card.dueDate}</span>
              <span className={`font-mono font-bold ${card.due > 0 ? "text-red-400" : "text-green-400"}`}>
                ₹{card.due.toLocaleString()}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}