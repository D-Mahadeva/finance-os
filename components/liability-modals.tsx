// components/liability-modals.tsx
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Save, Calendar, DollarSign, CreditCard, Shield, Building2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

// ===== RECURRING BILL MODAL =====
export function RecurringBillModal({ isOpen, onClose, initialData, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'utility',
    frequency: 'monthly',
    day_of_month: '1',
    reminder_days: '3',
    notes: ''
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        amount: initialData.amount?.toString() || '',
        category: initialData.category || 'utility',
        frequency: initialData.frequency || 'monthly',
        day_of_month: initialData.day_of_month?.toString() || '1',
        reminder_days: initialData.reminder_days?.toString() || '3',
        notes: initialData.notes || ''
      })
    } else {
      setFormData({
        name: '',
        amount: '',
        category: 'utility',
        frequency: 'monthly',
        day_of_month: '1',
        reminder_days: '3',
        notes: ''
      })
    }
  }, [initialData, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Calculate next due date
      const today = new Date()
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, parseInt(formData.day_of_month))

      const payload = {
        user_id: user.id,
        name: formData.name,
        amount: parseFloat(formData.amount),
        category: formData.category,
        frequency: formData.frequency,
        day_of_month: parseInt(formData.day_of_month),
        reminder_days: parseInt(formData.reminder_days),
        notes: formData.notes,
        start_date: today.toISOString().split('T')[0],
        next_due_date: nextMonth.toISOString().split('T')[0]
      }

      if (initialData) {
        await supabase.from('recurring_bills').update(payload).eq('id', initialData.id)
      } else {
        await supabase.from('recurring_bills').insert(payload)
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving bill:', error)
      alert('Failed to save bill')
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
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>

          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Calendar size={24} className="text-accent" />
            {initialData ? 'Edit Bill' : 'Add Recurring Bill'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase font-bold">Bill Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                placeholder="e.g., Electricity Bill"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase font-bold">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                  placeholder="2000"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase font-bold">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                >
                  <option value="utility">Utility</option>
                  <option value="subscription">Subscription</option>
                  <option value="insurance">Insurance</option>
                  <option value="loan_emi">Loan EMI</option>
                  <option value="rent">Rent</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase font-bold">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase font-bold">Due Day</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.day_of_month}
                  onChange={(e) => setFormData({ ...formData, day_of_month: e.target.value })}
                  className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase font-bold">
                Remind Me (Days Before)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={formData.reminder_days}
                onChange={(e) => setFormData({ ...formData, reminder_days: e.target.value })}
                className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase font-bold">Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white resize-none"
                rows={3}
                placeholder="Additional details..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-black font-bold py-3 rounded-lg hover:opacity-90 transition-all"
            >
              <Save size={20} />
              {loading ? 'Saving...' : initialData ? 'Update Bill' : 'Add Bill'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// ===== CREDIT CARD MODAL =====
export function CreditCardModal({ isOpen, onClose, initialData, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    card_name: '',
    bank_name: '',
    credit_limit: '',
    outstanding_balance: '',
    due_date: '',
    interest_rate: '',
    annual_fee: ''
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        card_name: initialData.card_name || '',
        bank_name: initialData.bank_name || '',
        credit_limit: initialData.credit_limit?.toString() || '',
        outstanding_balance: initialData.outstanding_balance?.toString() || '',
        due_date: initialData.due_date?.toString() || '',
        interest_rate: initialData.interest_rate?.toString() || '',
        annual_fee: initialData.annual_fee?.toString() || '0'
      })
    } else {
      setFormData({
        card_name: '',
        bank_name: '',
        credit_limit: '',
        outstanding_balance: '0',
        due_date: '',
        interest_rate: '',
        annual_fee: '0'
      })
    }
  }, [initialData, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const payload = {
        user_id: user.id,
        card_name: formData.card_name,
        bank_name: formData.bank_name,
        credit_limit: parseFloat(formData.credit_limit),
        outstanding_balance: parseFloat(formData.outstanding_balance),
        due_date: parseInt(formData.due_date),
        interest_rate: parseFloat(formData.interest_rate || '0'),
        annual_fee: parseFloat(formData.annual_fee || '0')
      }

      if (initialData) {
        await supabase.from('credit_cards').update(payload).eq('id', initialData.id)
      } else {
        await supabase.from('credit_cards').insert(payload)
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving credit card:', error)
      alert('Failed to save credit card')
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
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>

          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CreditCard size={24} className="text-blue-400" />
            {initialData ? 'Edit Credit Card' : 'Add Credit Card'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase font-bold">Card Name</label>
              <input
                type="text"
                required
                value={formData.card_name}
                onChange={(e) => setFormData({ ...formData, card_name: e.target.value })}
                className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                placeholder="e.g., HDFC Regalia"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase font-bold">Bank Name</label>
              <input
                type="text"
                required
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                placeholder="e.g., HDFC Bank"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase font-bold">Credit Limit (₹)</label>
                <input
                  type="number"
                  required
                  value={formData.credit_limit}
                  onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                  className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                  placeholder="100000"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase font-bold">Outstanding (₹)</label>
                <input
                  type="number"
                  value={formData.outstanding_balance}
                  onChange={(e) => setFormData({ ...formData, outstanding_balance: e.target.value })}
                  className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                  placeholder="25000"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase font-bold">Due Day</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                  placeholder="5"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase font-bold">Interest %</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.interest_rate}
                  onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                  className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                  placeholder="3.5"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase font-bold">Annual Fee</label>
                <input
                  type="number"
                  value={formData.annual_fee}
                  onChange={(e) => setFormData({ ...formData, annual_fee: e.target.value })}
                  className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                  placeholder="5000"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-black font-bold py-3 rounded-lg hover:opacity-90"
            >
              <Save size={20} />
              {loading ? 'Saving...' : initialData ? 'Update Card' : 'Add Card'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// ===== INSURANCE MODAL =====
export function InsuranceModal({ isOpen, onClose, initialData, onSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    policy_name: '',
    provider: '',
    policy_type: 'health',
    premium_amount: '',
    coverage_amount: '',
    premium_frequency: 'yearly',
    start_date: '',
    expiry_date: ''
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        policy_name: initialData.policy_name || '',
        provider: initialData.provider || '',
        policy_type: initialData.policy_type || 'health',
        premium_amount: initialData.premium_amount?.toString() || '',
        coverage_amount: initialData.coverage_amount?.toString() || '',
        premium_frequency: initialData.premium_frequency || 'yearly',
        start_date: initialData.start_date || '',
        expiry_date: initialData.expiry_date || ''
      })
    } else {
      setFormData({
        policy_name: '',
        provider: '',
        policy_type: 'health',
        premium_amount: '',
        coverage_amount: '',
        premium_frequency: 'yearly',
        start_date: '',
        expiry_date: ''
      })
    }
  }, [initialData, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const payload = {
        user_id: user.id,
        policy_name: formData.policy_name,
        provider: formData.provider,
        policy_type: formData.policy_type,
        premium_amount: parseFloat(formData.premium_amount),
        coverage_amount: parseFloat(formData.coverage_amount || '0'),
        premium_frequency: formData.premium_frequency,
        start_date: formData.start_date,
        expiry_date: formData.expiry_date
      }

      if (initialData) {
        await supabase.from('insurance').update(payload).eq('id', initialData.id)
      } else {
        await supabase.from('insurance').insert(payload)
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving insurance:', error)
      alert('Failed to save insurance')
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
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>

          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Shield size={24} className="text-green-400" />
            {initialData ? 'Edit Insurance' : 'Add Insurance Policy'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase font-bold">Policy Name</label>
              <input
                type="text"
                required
                value={formData.policy_name}
                onChange={(e) => setFormData({ ...formData, policy_name: e.target.value })}
                className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                placeholder="e.g., Health Insurance"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase font-bold">Provider</label>
                <input
                  type="text"
                  required
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                  placeholder="e.g., HDFC ERGO"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase font-bold">Policy Type</label>
                <select
                  value={formData.policy_type}
                  onChange={(e) => setFormData({ ...formData, policy_type: e.target.value })}
                  className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                >
                  <option value="health">Health</option>
                  <option value="life">Life</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="property">Property</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase font-bold">Premium (₹)</label>
                <input
                  type="number"
                  required
                  value={formData.premium_amount}
                  onChange={(e) => setFormData({ ...formData, premium_amount: e.target.value })}
                  className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                  placeholder="5000"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase font-bold">Coverage (₹)</label>
                <input
                  type="number"
                  value={formData.coverage_amount}
                  onChange={(e) => setFormData({ ...formData, coverage_amount: e.target.value })}
                  className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                  placeholder="500000"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase font-bold">Premium Frequency</label>
              <select
                value={formData.premium_frequency}
                onChange={(e) => setFormData({ ...formData, premium_frequency: e.target.value })}
                className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase font-bold">Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase font-bold">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="w-full mt-1 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-black font-bold py-3 rounded-lg hover:opacity-90"
            >
              <Save size={20} />
              {loading ? 'Saving...' : initialData ? 'Update Policy' : 'Add Policy'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}