"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'transaction' | 'asset' | 'liability' | 'goal'
  initialData?: any // If provided, we are in EDIT mode
  onSuccess: () => void
}

export function AddItemModal({ isOpen, onClose, type, initialData, onSuccess }: AddItemModalProps) {
  const [formData, setFormData] = useState({
    id: '',
    name: '', 
    amount: '',
    category: 'Food', 
    txnType: 'expense',
    date: new Date().toISOString().split('T')[0],
    target_year: ''
  })
  const [loading, setLoading] = useState(false)

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name || initialData.description || '',
        amount: initialData.amount || initialData.value || initialData.total_amount || initialData.target_amount || '',
        category: initialData.category || 'Food',
        txnType: initialData.type || 'expense',
        date: initialData.date || new Date().toISOString().split('T')[0],
        target_year: initialData.target_year || ''
      })
    } else {
      // Reset for Add mode
      setFormData({ id: '', name: '', amount: '', category: 'Food', txnType: 'expense', date: new Date().toISOString().split('T')[0], target_year: '' })
    }
  }, [initialData, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      const commonData = { user_id: user.id }
      let table = ''
      let payload = {}

      // Map form data to table structure
      if (type === 'transaction') {
        table = 'transactions'
        payload = { 
          amount: parseFloat(formData.amount), 
          category: formData.category, 
          type: formData.txnType, 
          date: formData.date, 
          description: formData.name 
        }
      } else if (type === 'asset') {
        table = 'assets'
        payload = { name: formData.name, value: parseFloat(formData.amount), type: 'investment' }
      } else if (type === 'liability') {
        table = 'liabilities'
        payload = { name: formData.name, total_amount: parseFloat(formData.amount), type: 'loan' }
      } else if (type === 'goal') {
        table = 'goals'
        payload = { name: formData.name, target_amount: parseFloat(formData.amount), target_year: formData.target_year }
      }

      if (initialData) {
        // UPDATE
        await supabase.from(table).update(payload).eq('id', initialData.id)
      } else {
        // INSERT
        await supabase.from(table).insert({ ...payload, ...commonData })
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error(error)
      alert('Operation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this?")) return
    setLoading(true)
    try {
      const table = type === 'transaction' ? 'transactions' : type === 'asset' ? 'assets' : type === 'liability' ? 'liabilities' : 'goals'
      await supabase.from(table).delete().eq('id', initialData.id)
      onSuccess()
      onClose()
    } catch (e) { alert('Delete failed') }
    setLoading(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md bg-card border border-border rounded-2xl p-6 relative shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-4 capitalize text-white">{initialData ? 'Edit' : 'Add'} {type}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount */}
              <div>
                <label className="text-xs text-zinc-400">Amount (₹)</label>
                <input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:border-primary" />
              </div>

              {/* Transaction Fields */}
              {type === 'transaction' && (
                <>
                  <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-xs text-zinc-400">Type</label>
                        <select value={formData.txnType} onChange={(e) => setFormData({...formData, txnType: e.target.value})}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white">
                          <option value="expense">Expense</option>
                          <option value="income">Income</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-zinc-400">Category</label>
                        <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400">Description</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400">Date</label>
                    <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white" />
                  </div>
                </>
              )}

              {/* Generic Name Field */}
              {type !== 'transaction' && (
                <div>
                  <label className="text-xs text-zinc-400">Name / Title</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:border-primary" />
                </div>
              )}

              {/* Goal Specifics */}
              {type === 'goal' && (
                 <div>
                   <label className="text-xs text-zinc-400">Target Year</label>
                   <input type="text" value={formData.target_year} onChange={(e) => setFormData({...formData, target_year: e.target.value})}
                     className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white" />
                 </div>
              )}

              <div className="flex gap-3 pt-2">
                {initialData && (
                  <button type="button" onClick={handleDelete} disabled={loading} className="px-4 py-3 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 border border-red-500/20">
                    <Trash2 size={20} />
                  </button>
                )}
                <button disabled={loading} className="flex-1 bg-primary text-black font-bold py-3 rounded-lg hover:opacity-90 transition">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}