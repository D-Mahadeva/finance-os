// components/net-worth-chart.tsx - UPDATED
"use client"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"
import { TrendingUp } from "lucide-react"

export function NetWorthChart({ projections }: { projections: any[] }) {
  // Transform data for chart with real years
  const currentYear = new Date().getFullYear()
  
  const data = projections.length > 0 
    ? projections.map(p => ({
        year: p.year ? p.year.toString() : `${currentYear + (p.year_number - 1)}`,
        value: p.net_worth || p.investment_corpus,
        assets: p.assets_value || 0,
        liabilities: p.liabilities_value || 0
      }))
    : Array.from({ length: 10 }, (_, i) => ({
        year: (currentYear + i).toString(),
        value: 0,
        assets: 0,
        liabilities: 0
      }))

  // Calculate growth rate
  const firstValue = data[0]?.value || 0
  const lastValue = data[data.length - 1]?.value || 0
  const growthRate = firstValue > 0 
    ? (((lastValue - firstValue) / firstValue) * 100).toFixed(1)
    : '0.0'

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="relative overflow-hidden rounded-lg bg-card border border-border p-6"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Net Worth Projection</h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">10-Year Growth</p>
            <p className="text-lg font-bold text-primary">+{growthRate}%</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Projected wealth growth based on your current financial plan
        </p>
      </div>

      <div className="h-[320px] w-full">
        {data.length > 0 && data.some(d => d.value > 0) ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={data} 
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#27272a" 
                vertical={false}
              />
              <XAxis 
                dataKey="year" 
                stroke="#a1a1a6" 
                style={{ fontSize: 11, fontWeight: 500 }} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#a1a1a6" 
                style={{ fontSize: 11 }} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => {
                  if (val >= 10000000) return `₹${(val/10000000).toFixed(1)}Cr`
                  if (val >= 100000) return `₹${(val/100000).toFixed(1)}L`
                  if (val >= 1000) return `₹${(val/1000).toFixed(0)}k`
                  return `₹${val}`
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#18181b", 
                  border: "1px solid #27272a", 
                  borderRadius: "8px", 
                  color: "#fafafa",
                  fontSize: "12px"
                }}
                formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Net Worth']}
                labelStyle={{ color: "#10b981", fontWeight: "bold" }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <TrendingUp size={48} className="mb-4 text-zinc-700" />
            <p className="text-sm">No projection data available</p>
            <p className="text-xs text-zinc-600 mt-1">Add assets and liabilities to see projections</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {data.length > 0 && data.some(d => d.value > 0) && (
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Starting Value</p>
            <p className="font-mono font-bold text-foreground">
              ₹{firstValue.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Projected (10Y)</p>
            <p className="font-mono font-bold text-primary">
              ₹{lastValue.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Growth</p>
            <p className="font-mono font-bold text-green-400">
              ₹{(lastValue - firstValue).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  )
}