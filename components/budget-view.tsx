// components/budget-view.tsx
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Plus, Wallet, TrendingUp, TrendingDown, 
  Edit2, Trash2, AlertCircle, CheckCircle,
  Utensils, Car, User, Tv, ShoppingBag, Heart,
  BookOpen, Receipt, MoreHorizontal
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { AccountBalanceCard } from "./account-balance-card"
import { MonthlyCashFlowCard } from "./monthly-cashflow-card"

const ICON_MAP: any = {
  Utensils, Car, User, Tv, ShoppingBag, Heart,
  BookOpen, Receipt, MoreHorizontal
}

interface BudgetViewProps {
  accountBalance: any
  transactions: any[]
  categories: any[]
  allocations: any[]
  onRefresh: () => void
}

export function BudgetView({ 
  accountBalance, 
  transactions, 
  categories,
  allocations,
  onRefresh 
}: BudgetViewProps) {
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [isAddingTransaction, setIsAddingTransaction] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)

  const income = accountBalance?.total_income || 0
  const expenses = accountBalance?.total_expenses || 0
  const balance = accountBalance?.current_balance || 0

  // Calculate category spending from transactions this month
  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  const monthlyTransactions = transactions.filter(t => {
    const txDate = new Date(t.date)
    return txDate.getMonth() === thisMonth && txDate.getFullYear() === thisYear
  })

  const categorySpending = categories.map(cat => {
    const spent = monthlyTransactions
      .filter(t => t.category === cat.name && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const budget = cat.monthly_budget || 0
    const percentage = budget > 0 ? (spent / budget) * 100 : 0
    const status = percentage >= 100 ? 'exceeded' : percentage >= cat.alert_threshold ? 'warning' : 'good'

    return { ...cat, spent, percentage, status }
  })

  // Fixed obligations from allocations
  const fixedObligations = allocations
    .filter(a => a.category === 'loan_repayment' || a.category === 'insurance')
    .reduce((sum, a) => sum + a.amount, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Budget & Expenses</h2>
          <p className="text-sm text-muted-foreground">Track your spending and manage your budget</p>
        </div>
        <button
          onClick={() => setIsAddingTransaction(true)}
          className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
        >
          <Plus size={20} /> Add Transaction
        </button>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AccountBalanceCard
          balance={balance}
          totalIncome={income}
          totalExpenses={expenses}
          lastUpdated="2 mins ago"
        />
        
        <MonthlyCashFlowCard
          income={income}
          fixedObligations={fixedObligations}
          expenses={expenses}
          allocations={allocations}
          onRefresh={onRefresh}
        />
      </div>

      {/* Budget Categories */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Budget Categories</h3>
            <p className="text-sm text-muted-foreground">Manage your spending limits by category</p>
          </div>
          <button
            onClick={() => setIsAddingCategory(true)}
            className="flex items-center gap-2 text-sm bg-primary/20 text-primary px-3 py-2 rounded-lg hover:bg-primary/30 transition-colors"
          >
            <Plus size={16} /> Add Category
          </button>
        </div>

        <div className="space-y-4">
          {categorySpending.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wallet size={48} className="mx-auto mb-4 opacity-30" />
              <p>No budget categories yet</p>
              <p className="text-sm">Add categories to track your spending</p>
            </div>
          ) : (
            categorySpending.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={() => setEditingCategory(category)}
                onDelete={async () => {
                  if (confirm(`Delete category "${category.name}"?`)) {
                    await supabase.from('budget_categories').delete().eq('id', category.id)
                    onRefresh()
                  }
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h3>
        <div className="space-y-2">
          {monthlyTransactions.slice(0, 10).map((txn, idx) => (
            <motion.div
              key={txn.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                {txn.type === 'income' ? (
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <TrendingUp size={18} className="text-green-400" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <TrendingDown size={18} className="text-red-400" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {txn.description || txn.category}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {txn.category} • {new Date(txn.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={`font-mono font-bold ${txn.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toLocaleString()}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Category Card Component
function CategoryCard({ category, onEdit, onDelete }: any) {
  const Icon = ICON_MAP[category.icon] || Wallet
  const statusColors: Record<'good' | 'warning' | 'exceeded', string> = {
    good: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    exceeded: 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border transition-all hover:shadow-lg ${statusColors[category.status as keyof typeof statusColors]}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <Icon size={20} style={{ color: category.color }} />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{category.name}</h4>
            <p className="text-xs text-muted-foreground">
              ₹{category.spent.toLocaleString()} / ₹{category.monthly_budget?.toLocaleString() || '0'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {category.status === 'good' && <CheckCircle size={16} className="text-green-400" />}
          {category.status === 'warning' && <AlertCircle size={16} className="text-yellow-400" />}
          {category.status === 'exceeded' && <AlertCircle size={16} className="text-red-400" />}
          
          <button onClick={onEdit} className="p-1 hover:bg-muted/50 rounded">
            <Edit2 size={14} />
          </button>
          {!category.is_default && (
            <button onClick={onDelete} className="p-1 hover:bg-red-500/20 rounded">
              <Trash2 size={14} className="text-red-400" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">
            {category.percentage.toFixed(0)}% used
          </span>
          <span className={category.status === 'exceeded' ? 'text-red-400 font-semibold' : 'text-muted-foreground'}>
            ₹{(category.monthly_budget - category.spent).toLocaleString()} left
          </span>
        </div>
        <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(category.percentage, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full ${
              category.status === 'good' ? 'bg-green-500' :
              category.status === 'warning' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
          />
        </div>
      </div>
    </motion.div>
  )
}