"use client"
import { motion } from "framer-motion"
import { TrendingUp, Coins } from "lucide-react"

export function AssetsInvestments({ assets }: { assets: any[] }) {
  const total = assets.reduce((sum, a) => sum + (a.value || 0), 0)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-card border border-border p-6">
      <div className="flex items-center gap-2 mb-6">
        <Coins size={20} className="text-primary" />
        <h3 className="text-lg font-semibold">Assets</h3>
      </div>
      <div className="space-y-4">
        {assets.map((asset, idx) => (
          <div key={idx} className="flex justify-between p-3 bg-muted/20 rounded-lg">
             <span className="text-sm">{asset.name}</span>
             <span className="font-mono font-bold text-accent">₹{asset.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
         <p className="text-xs text-zinc-500">Total Value</p>
         <p className="text-2xl font-mono font-bold">₹{total.toLocaleString()}</p>
      </div>
    </motion.div>
  )
}