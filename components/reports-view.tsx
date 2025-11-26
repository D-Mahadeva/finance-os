"use client"

import { useState, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { subDays, format, isSameWeek, isSameMonth, isSameYear, parseISO } from "date-fns"

export function ReportsView({ transactions }: { transactions: any[] }) {
  const [filter, setFilter] = useState<'week' | 'month' | 'year'>('month')

  // Process Data based on Filter
  const chartData = useMemo(() => {
    const now = new Date()
    const expenses = transactions.filter(t => t.type === 'expense')
    
    if (filter === 'week') {
      // Last 7 Days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(now, 6 - i)
        return { date: d, label: format(d, 'EEE') } // Mon, Tue...
      })
      return last7Days.map(day => {
        const amount = expenses
          .filter(t => format(parseISO(t.date), 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd'))
          .reduce((sum, t) => sum + t.amount, 0)
        return { name: day.label, value: amount }
      })
    }

    if (filter === 'month') {
      // Group by Category for the current month
      const thisMonthTxns = expenses.filter(t => isSameMonth(parseISO(t.date), now))
      // Group logic... simplified for chart: show daily spend for the month
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
      return days.map(day => {
         const amount = thisMonthTxns
           .filter(t => new Date(t.date).getDate() === day)
           .reduce((sum, t) => sum + t.amount, 0)
         return { name: `${day}`, value: amount }
      })
    }

    if (filter === 'year') {
      const thisYearTxns = expenses.filter(t => isSameYear(parseISO(t.date), now))
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      return months.map((month, idx) => {
        const amount = thisYearTxns
          .filter(t => new Date(t.date).getMonth() === idx)
          .reduce((sum, t) => sum + t.amount, 0)
        return { name: month, value: amount }
      })
    }
    return []
  }, [filter, transactions])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reports & Analytics</h2>
        <div className="bg-muted/30 p-1 rounded-lg flex gap-1">
          {['week', 'month', 'year'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-1 rounded-md text-sm font-medium capitalize transition-all ${filter === f ? 'bg-primary text-black shadow' : 'text-zinc-400 hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[400px] w-full bg-card border border-border rounded-lg p-6">
        <h3 className="mb-6 text-zinc-400 text-sm">Expense Trend ({filter})</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
            <Tooltip 
              cursor={{ fill: '#27272a', opacity: 0.4 }}
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
            />
            <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={filter === 'month' ? 10 : 40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}