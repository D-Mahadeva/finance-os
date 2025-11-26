"use client"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"

export function NetWorthChart({ projections }: { projections: any[] }) {
  // Transform data for chart
  const data = projections.length > 0 ? projections.map(p => ({
    year: `Year ${p.year_number}`,
    value: p.investment_corpus
  })) : [] // Fallback if empty

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-lg bg-card border border-border p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Net Worth Projection</h3>
        <p className="text-sm text-muted-foreground">10-year wealth growth based on your plan</p>
      </div>
      <div className="h-[300px] w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="year" stroke="#a1a1a6" style={{ fontSize: 10 }} />
              <YAxis stroke="#a1a1a6" style={{ fontSize: 10 }} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px", color: "#fafafa" }} />
              <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500">No projection data loaded</div>
        )}
      </div>
    </motion.div>
  )
}