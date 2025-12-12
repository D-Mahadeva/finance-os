// components/allocation-modal.tsx
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Save, TrendingUp, Shield, Building2, PiggyBank, Wallet } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface AllocationModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: any
  onSuccess: () => void
}

const CATEGORIES = [
  { value: 'sip', label: 'SIP Investment', icon: TrendingUp, color: '#10b981' },
  { value: 'emergency_fund', label: 'Emergency Fund', icon: Shield, color: '#06b6d4' },
  { value: 'insurance', label: 'Insurance', icon: Shield, color: '#ef4444' },
  { value: 'loan_repayment', label: 'Loan Repayment', icon: Building2, color: '#f59e0b' },
  { value: 'savings', label: 'Savings', icon: PiggyBank, color: '#8b5cf6' },
  { value: 'other', label: 'Other', icon: Wallet, color: '#71717a' }
]

export function AllocationModal({ isOpen, onClose, initialData, onSuccess }: AllocationModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'sip',
    description: '',
    auto_deduct: true
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        amount: initialData.amount?.toString() || '',
        category: initialData.category || 'sip',
        description: initialData.description || '',
        auto_deduct: initialData.auto_deduct ?? true
      })
    } else {
      setFormData({
        name: '',
        amount: '',
        category: 'sip',
        description: '',
        auto_deduct: true
      })
    }
  }, [initialData, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const selectedCategory = CATEGORIES.find(c => c.value === formData.category)
      const payload = {
        user_id: user.id,
        name: formData.name,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        auto_deduct: formData.auto_deduct,
        icon: selectedCategory?.icon.name,
        color: selectedCategory?.color
      }

      if (initialData) {
        await supabase.from('monthly_allocations').update(payload).eq('id', initialData.id)
      } else {
        await supabase.from('monthly_allocations').insert(payload)
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving allocation:', error)
      alert('Failed to save allocation')
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
          className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 relative shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl font-bold mb-6 text-foreground">
            {initialData ? 'Edit Allocation' : 'Add Monthly Allocation'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs text-muted-foreground uppercase font-bold">
                Allocation Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-primary outline-none"
                placeholder="e.g., Monthly SIP"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs text-muted-foreground uppercase font-bold">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.value })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.category === cat.value
                          ? 'border-primary bg-primary/10'
                          : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={18} style={{ color: cat.color }} />
                        <span className="text-sm font-medium">{cat.label}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="text-xs text-muted-foreground uppercase font-bold">
                Monthly Amount (₹)
              </label>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-primary outline-none"
                placeholder="5000"
                min="0"
                step="100"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs text-muted-foreground uppercase font-bold">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-primary outline-none resize-none"
                rows={3}
                placeholder="Additional details..."
              />
            </div>

            {/* Auto Deduct */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="auto_deduct"
                checked={formData.auto_deduct}
                onChange={(e) => setFormData({ ...formData, auto_deduct: e.target.checked })}
                className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-primary focus:ring-primary"
              />
              <label htmlFor="auto_deduct" className="text-sm text-foreground cursor-pointer">
                Automatically deduct from income
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-black font-bold py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
            >
              <Save size={20} />
              {loading ? 'Saving...' : initialData ? 'Update Allocation' : 'Add Allocation'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}