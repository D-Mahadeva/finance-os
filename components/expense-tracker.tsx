"use client"
import { motion } from "framer-motion"
import { Tag } from "lucide-react"

// Accept props
export function ExpenseTracker({ transactions }: { transactions: any[] }) {
  // Filter only expenses
  const expenses = transactions.filter(t => t.type === 'expense')
  const total = expenses.reduce((sum, t) => sum + (t.amount || 0), 0)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-card border border-border p-6">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold">Expenses</h3>
        <span className="font-mono font-bold text-red-400">₹{total.toLocaleString()}</span>
      </div>
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {expenses.length === 0 ? <p className="text-zinc-500 text-sm">No expenses yet.</p> : null}
        {expenses.map((item, idx) => (
          <div key={idx} className="flex justify-between p-2 hover:bg-muted/50 rounded">
            <div className="flex items-center gap-2">
               <Tag size={14} className="text-zinc-500" />
               <div>
                 <p className="text-sm">{item.description || item.category}</p>
                 <p className="text-xs text-zinc-500">{item.category}</p>
               </div>
            </div>
            <span className="font-mono text-sm">₹{item.amount}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}