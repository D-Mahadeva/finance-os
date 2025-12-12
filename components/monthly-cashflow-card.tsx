// components/monthly-cashflow-card.tsx
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  TrendingUp, TrendingDown, PiggyBank, Plus, 
  Edit2, Trash2, ChevronRight, Building2 
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Allocation {
  id: string
  name: string
  amount: number
  category: string
  icon?: string
  color?: string
}

interface MonthlyCashFlowCardProps {
  income: number
  fixedObligations: number
  expenses: number
  allocations: Allocation[]
  onRefresh: () => void
}

export function MonthlyCashFlowCard({
  income,
  fixedObligations,
  expenses,
  allocations,
  onRefresh
}: MonthlyCashFlowCardProps) {
  const [showAllocations, setShowAllocations] = useState(false)
  const [editingAllocation, setEditingAllocation] = useState<Allocation | null>(null)

  const totalAllocations = allocations.reduce((sum, a) => sum + a.amount, 0)
  const surplus = income - fixedObligations - expenses - totalAllocations

  const getIconComponent = (iconName?: string) => {
    const icons: any = {
      TrendingUp: TrendingUp,
      PiggyBank: PiggyBank,
      Building2: Building2,
    }
    const Icon = icons[iconName || 'PiggyBank'] || PiggyBank
    return <Icon size={16} />
  }

  const getCategoryColor = (category: string) => {
    const colors: any = {
      sip: '#10b981',
      emergency_fund: '#06b6d4',
      insurance: '#ef4444',
      loan_repayment: '#f59e0b',
      savings: '#8b5cf6',
      other: '#71717a'
    }
    return colors[category] || '#71717a'
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this allocation?')) return
    
    try {
      await supabase.from('monthly_allocations').delete().eq('id', id)
      onRefresh()
    } catch (error) {
      alert('Failed to delete allocation')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-card border border-border p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Monthly Cash Flow</h3>
        <button
          onClick={() => setShowAllocations(!showAllocations)}
          className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full hover:bg-primary/30 transition-colors"
        >
          {showAllocations ? 'Hide' : 'Show'} Allocations
        </button>
      </div>

      {/* Flow Items */}
      <div className="space-y-3">
        {/* Income */}
        <FlowItem
          icon={<TrendingUp size={16} className="text-green-400" />}
          label="Income"
          amount={income}
          color="from-green-500 to-emerald-500"
          positive
        />

        {/* Fixed Obligations */}
        <FlowItem
          icon={<Building2 size={16} className="text-red-400" />}
          label="Fixed Obligations"
          amount={fixedObligations}
          color="from-red-500 to-rose-500"
          positive={false}
        />

        {/* Expenses */}
        <FlowItem
          icon={<TrendingDown size={16} className="text-orange-400" />}
          label="Expenses"
          amount={expenses}
          color="from-orange-500 to-yellow-500"
          positive={false}
        />

        {/* Allocations Summary */}
        {allocations.length > 0 && (
          <FlowItem
            icon={<PiggyBank size={16} className="text-blue-400" />}
            label="Allocations"
            amount={totalAllocations}
            color="from-blue-500 to-cyan-500"
            positive={false}
            onClick={() => setShowAllocations(!showAllocations)}
          />
        )}

        {/* Surplus */}
        <div className="pt-3 border-t border-border">
          <FlowItem
            icon={<PiggyBank size={16} className="text-primary" />}
            label="Surplus"
            amount={surplus}
            color="from-primary to-accent"
            positive={surplus > 0}
          />
        </div>
      </div>

      {/* Allocations Breakdown */}
      <AnimatePresence>
        {showAllocations && allocations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-border space-y-3"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-foreground">Allocation Details</h4>
              <button className="text-xs text-primary hover:underline">
                + Add New
              </button>
            </div>

            {allocations.map((allocation) => (
              <motion.div
                key={allocation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${allocation.color || getCategoryColor(allocation.category)}20` }}
                  >
                    <span style={{ color: allocation.color || getCategoryColor(allocation.category) }}>
                      {getIconComponent(allocation.icon)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{allocation.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {allocation.category.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-foreground">
                    ₹{allocation.amount.toLocaleString()}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingAllocation(allocation)}
                      className="p-1 hover:bg-primary/20 rounded"
                    >
                      <Edit2 size={14} className="text-primary" />
                    </button>
                    <button
                      onClick={() => handleDelete(allocation.id)}
                      className="p-1 hover:bg-red-500/20 rounded"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Helper Component
function FlowItem({ 
  icon, 
  label, 
  amount, 
  color, 
  positive,
  onClick 
}: { 
  icon: React.ReactNode
  label: string
  amount: number
  color: string
  positive: boolean
  onClick?: () => void
}) {
  return (
    <div 
      className={`${onClick ? 'cursor-pointer hover:bg-muted/30' : ''} rounded-lg transition-colors`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <span className={`font-mono font-bold ${positive ? 'text-green-400' : 'text-red-400'}`}>
          {positive ? '+' : '-'}₹{Math.abs(amount).toLocaleString()}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full bg-gradient-to-r ${color}`}
        />
      </div>
    </div>
  )
}