// components/enhanced-reports-view.tsx
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  TrendingUp, TrendingDown, Calendar, Download, 
  Filter, DollarSign, PieChart, BarChart3, Activity
} from "lucide-react"
import { 
  BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from "recharts"
import { supabase } from "@/lib/supabase"
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"

const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#ef4444', '#3b82f6']

interface EnhancedReportsViewProps {
  transactions: any[]
  dailyExpenses: any[]
  budgetCategories: any[]
}

export function EnhancedReportsView({ transactions, dailyExpenses, budgetCategories }: EnhancedReportsViewProps) {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month')
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadAnalytics()
  }, [timeframe, transactions, dailyExpenses])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Calculate date ranges
      const now = new Date()
      let startDate, endDate

      if (timeframe === 'week') {
        startDate = subDays(now, 7)
        endDate = now
      } else if (timeframe === 'month') {
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
      } else {
        startDate = startOfYear(now)
        endDate = endOfYear(now)
      }

      // Call database functions
      const [summary, dayOfWeek, trends, budgetVsActual] = await Promise.all([
        supabase.rpc('get_expense_summary', {
          p_user_id: user.id,
          p_start_date: format(startDate, 'yyyy-MM-dd'),
          p_end_date: format(endDate, 'yyyy-MM-dd')
        }),
        supabase.rpc('get_spending_by_day_of_week', {
          p_user_id: user.id,
          p_days: timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 365
        }),
        supabase.rpc('get_spending_trends', {
          p_user_id: user.id,
          p_months: 6
        }),
        supabase.rpc('get_budget_vs_actual', {
          p_user_id: user.id,
          p_month: format(now, 'yyyy-MM-dd')
        })
      ])

      setAnalytics({
        summary: summary.data?.[0] || {},
        dayOfWeek: dayOfWeek.data || [],
        trends: trends.data || [],
        budgetVsActual: budgetVsActual.data || []
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Process data for charts
  const categoryData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any, t) => {
      const existing = acc.find((item: any) => item.name === t.category)
      if (existing) {
        existing.value += t.amount
      } else {
        acc.push({ name: t.category, value: t.amount })
      }
      return acc
    }, [])
    .sort((a: any, b: any) => b.value - a.value)

  const dailySpendData = Array.from({ length: timeframe === 'week' ? 7 : 30 }, (_, i) => {
    const date = subDays(new Date(), timeframe === 'week' ? 6 - i : 29 - i)
    const dateStr = format(date, 'yyyy-MM-dd')
    
    const dayExpenses = transactions
      .filter(t => t.type === 'expense' && t.date === dateStr)
      .reduce((sum, t) => sum + t.amount, 0)
    
    const dailyExp = dailyExpenses
      .filter(de => de.date === dateStr)
      .reduce((sum, de) => sum + de.amount, 0)
    
    return {
      date: format(date, timeframe === 'week' ? 'EEE' : 'MMM dd'),
      amount: dayExpenses + dailyExp
    }
  })

  const handleExport = async (type: 'csv' | 'pdf') => {
    if (type === 'csv') {
      exportToCSV()
    } else {
      exportToPDF()
    }
  }

  const exportToCSV = () => {
    const csvData = transactions.map(t => ({
      Date: t.date,
      Type: t.type,
      Category: t.category,
      Description: t.description,
      Amount: t.amount
    }))

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }

  const exportToPDF = () => {
    window.print()
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reports & Analytics</h2>
          <p className="text-sm text-muted-foreground">Detailed insights into your spending patterns</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors"
          >
            <Download size={16} /> Print
          </button>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2 bg-muted/30 p-1 rounded-lg w-fit">
        {['week', 'month', 'year'].map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf as any)}
            className={`px-6 py-2 rounded-md text-sm font-medium capitalize transition-all ${
              timeframe === tf 
                ? 'bg-primary text-black shadow-lg' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      {analytics?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Income"
            value={analytics.summary.total_income || 0}
            icon={<TrendingUp className="text-green-400" />}
            trend={12}
          />
          <SummaryCard
            title="Total Expenses"
            value={analytics.summary.total_expenses || 0}
            icon={<TrendingDown className="text-red-400" />}
          />
          <SummaryCard
            title="Total Savings"
            value={analytics.summary.total_savings || 0}
            icon={<DollarSign className="text-primary" />}
            trend={analytics.summary.savings_rate || 0}
          />
          <SummaryCard
            title="Transactions"
            value={analytics.summary.transaction_count || 0}
            icon={<Activity className="text-accent" />}
            currency={false}
          />
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Spending Trend */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-primary" />
            Daily Spending Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailySpendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" stroke="#71717a" style={{ fontSize: 11 }} />
              <YAxis stroke="#71717a" style={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#18181b", 
                  border: "1px solid #27272a", 
                  borderRadius: "8px" 
                }}
                formatter={(value: any) => `₹${value.toLocaleString()}`}
              />
              <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart size={20} className="text-accent" />
            Expense by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ₹${value.toLocaleString()}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Spending Trends (6 months) */}
      {analytics?.trends && analytics.trends.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            6-Month Spending Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.trends}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="month_year" stroke="#71717a" style={{ fontSize: 11 }} />
              <YAxis stroke="#71717a" style={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                formatter={(value: any) => `₹${value.toLocaleString()}`}
              />
              <Legend />
              <Area type="monotone" dataKey="total_income" stroke="#10b981" fill="url(#colorIncome)" name="Income" />
              <Area type="monotone" dataKey="total_expenses" stroke="#ef4444" fill="url(#colorExpense)" name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Budget vs Actual */}
      {analytics?.budgetVsActual && analytics.budgetVsActual.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Budget vs Actual</h3>
          <div className="space-y-3">
            {analytics.budgetVsActual.map((item: any, idx: number) => (
              <BudgetComparisonRow key={idx} data={item} />
            ))}
          </div>
        </div>
      )}

      {/* Day of Week Analysis */}
      {analytics?.dayOfWeek && analytics.dayOfWeek.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Spending by Day of Week</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.dayOfWeek}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="day_name" stroke="#71717a" style={{ fontSize: 11 }} />
              <YAxis stroke="#71717a" style={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                formatter={(value: any) => `₹${value.toLocaleString()}`}
              />
              <Bar dataKey="total_amount" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

// Summary Card Component
function SummaryCard({ title, value, icon, trend, currency = true }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-card to-card/50 border border-border rounded-lg p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground uppercase font-semibold">{title}</p>
        {icon}
      </div>
      <p className="text-2xl font-bold font-mono">
        {currency ? '₹' : ''}{typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {trend !== undefined && (
        <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
          <TrendingUp size={12} /> {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
        </p>
      )}
    </motion.div>
  )
}

// Budget Comparison Row Component
function BudgetComparisonRow({ data }: { data: any }) {
  const getStatusColor = (status: string) => {
    if (status === 'over_budget') return 'bg-red-500'
    if (status === 'warning') return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="p-4 bg-muted/20 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold">{data.category}</span>
        <span className={`text-xs px-2 py-1 rounded ${
          data.status === 'over_budget' ? 'bg-red-500/20 text-red-400' :
          data.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-green-500/20 text-green-400'
        }`}>
          {data.percentage_used?.toFixed(0)}% used
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm mb-2">
        <div>
          <p className="text-xs text-muted-foreground">Budget</p>
          <p className="font-mono font-semibold">₹{data.budget?.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Actual</p>
          <p className="font-mono font-semibold">₹{data.actual?.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p className={`font-mono font-semibold ${data.difference >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ₹{Math.abs(data.difference)?.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getStatusColor(data.status)} transition-all`}
          style={{ width: `${Math.min(data.percentage_used || 0, 100)}%` }}
        />
      </div>
    </div>
  )
}