// components/daily-expense-tracker.tsx
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, Search, Filter, Calendar, DollarSign, 
  Edit2, Trash2, Tag, MapPin, CreditCard
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { format, parseISO } from "date-fns"

interface DailyExpenseTrackerProps {
  expenses: any[]
  categories: any[]
  onRefresh: () => void
}

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'card', label: 'Card', icon: '💳' },
  { value: 'upi', label: 'UPI', icon: '📱' },
  { value: 'wallet', label: 'Wallet', icon: '👛' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' }
]

export function DailyExpenseTracker({ expenses, categories, onRefresh }: DailyExpenseTrackerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterPayment, setFilterPayment] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [isAddingExpense, setIsAddingExpense] = useState(false)

  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter(exp => {
      const matchesSearch = exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           exp.category?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === 'all' || exp.category === filterCategory
      const matchesPayment = filterPayment === 'all' || exp.payment_method === filterPayment
      return matchesSearch && matchesCategory && matchesPayment
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
      return b.amount - a.amount
    })

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Daily Expense Tracker</h3>
          <p className="text-sm text-muted-foreground">Track your everyday spending</p>
        </div>
        <button
          onClick={() => setIsAddingExpense(true)}
          className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:opacity-90"
        >
          <Plus size={18} /> Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:border-primary outline-none"
          />
        </div>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:border-primary outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>

        {/* Payment Method Filter */}
        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          className="px-4 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:border-primary outline-none"
        >
          <option value="all">All Payment Methods</option>
          {PAYMENT_METHODS.map(pm => (
            <option key={pm.value} value={pm.value}>{pm.icon} {pm.label}</option>
          ))}
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:border-primary outline-none"
        >
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
        </select>
      </div>

      {/* Total Display */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Filtered Expenses</p>
            <p className="text-2xl font-bold font-mono text-foreground">₹{totalExpenses.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Transactions</p>
            <p className="text-xl font-semibold">{filteredExpenses.length}</p>
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className="space-y-2">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <DollarSign size={48} className="mx-auto mb-4 opacity-30" />
            <p>No expenses found</p>
            <p className="text-sm">Try adjusting your filters or add a new expense</p>
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <ExpenseItem key={expense.id} expense={expense} onRefresh={onRefresh} />
          ))
        )}
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddingExpense}
        onClose={() => setIsAddingExpense(false)}
        categories={categories}
        onSuccess={onRefresh}
      />
    </div>
  )
}

// Expense Item Component
function ExpenseItem({ expense, onRefresh }: { expense: any; onRefresh: () => void }) {
  const [showActions, setShowActions] = useState(false)

  const paymentMethod = PAYMENT_METHODS.find(pm => pm.value === expense.payment_method)

  const handleDelete = async () => {
    if (confirm('Delete this expense?')) {
      await supabase.from('daily_expenses').delete().eq('id', expense.id)
      onRefresh()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onHoverStart={() => setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
      className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-all group"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <DollarSign size={20} className="text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-foreground">{expense.description || 'Expense'}</p>
            {expense.is_essential && (
              <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">Essential</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar size={12} /> {format(parseISO(expense.date), 'MMM dd, yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <Tag size={12} /> {expense.category}
            </span>
            {paymentMethod && (
              <span className="flex items-center gap-1">
                {paymentMethod.icon} {paymentMethod.label}
              </span>
            )}
            {expense.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {expense.location}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold font-mono text-foreground">₹{expense.amount.toLocaleString()}</p>
          {expense.time && (
            <p className="text-xs text-muted-foreground">{expense.time}</p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex gap-2 ml-4"
          >
            <button className="p-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors">
              <Edit2 size={16} className="text-primary" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
            >
              <Trash2 size={16} className="text-red-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Add Expense Modal Component
function AddExpenseModal({ isOpen, onClose, categories, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    category: categories[0]?.name || 'Food',
    description: '',
    payment_method: 'cash',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    location: '',
    is_essential: false,
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('daily_expenses').insert({
        user_id: user.id,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        payment_method: formData.payment_method,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        is_essential: formData.is_essential,
        notes: formData.notes
      })

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error adding expense:', error)
      alert('Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <Plus size={20} className="rotate-45" />
          </button>

          <h2 className="text-xl font-bold mb-6">Add Daily Expense</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase font-bold">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                  placeholder="150"
                  step="0.01"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase font-bold">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                >
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase font-bold">Description</label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                placeholder="e.g., Lunch at restaurant"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase font-bold">Payment Method</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {PAYMENT_METHODS.slice(0, 3).map((pm) => (
                  <button
                    key={pm.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, payment_method: pm.value })}
                    className={`p-3 rounded-lg border-2 transition-all text-sm ${
                      formData.payment_method === pm.value
                        ? 'border-primary bg-primary/10'
                        : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">{pm.icon}</div>
                    <div className="text-xs">{pm.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase font-bold">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase font-bold">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase font-bold">Location (Optional)</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                placeholder="e.g., Starbucks, Main Street"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_essential"
                checked={formData.is_essential}
                onChange={(e) => setFormData({ ...formData, is_essential: e.target.checked })}
                className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-primary"
              />
              <label htmlFor="is_essential" className="text-sm text-foreground">
                Mark as essential expense
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-black font-bold py-3 rounded-lg hover:opacity-90"
            >
              <Plus size={20} />
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}