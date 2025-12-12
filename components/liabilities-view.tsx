// components/liabilities-view.tsx
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Plus, CreditCard, Building2, TrendingDown, AlertCircle,
  Edit2, Trash2, DollarSign, Calendar, Percent, Shield
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface LiabilitiesViewProps {
  liabilities: any[]
  creditCards: any[]
  insurance: any[]
  onRefresh: () => void
}

export function LiabilitiesView({ liabilities, creditCards, insurance, onRefresh }: LiabilitiesViewProps) {
  const [isAddingLiability, setIsAddingLiability] = useState(false)
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [isAddingInsurance, setIsAddingInsurance] = useState(false)

  const totalDebt = liabilities.reduce((sum, l) => sum + (l.outstanding_amount || l.total_amount), 0)
  const totalCreditUsed = creditCards.reduce((sum, c) => sum + c.outstanding_balance, 0)
  const totalCreditLimit = creditCards.reduce((sum, c) => sum + c.credit_limit, 0)
  const creditUtilization = totalCreditLimit > 0 ? (totalCreditUsed / totalCreditLimit) * 100 : 0

  // Separate loans and credit cards
  const loans = liabilities.filter(l => l.type === 'loan' || l.type === 'emi')
  const otherDebts = liabilities.filter(l => l.type !== 'loan' && l.type !== 'emi')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Liabilities & Debts</h2>
          <p className="text-sm text-muted-foreground">Manage your loans, credit cards, and insurance</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <Building2 size={20} className="text-red-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Debt</p>
              <p className="text-2xl font-bold font-mono text-red-400">₹{totalDebt.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <CreditCard size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Credit Used</p>
              <p className="text-2xl font-bold font-mono text-blue-400">₹{totalCreditUsed.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Percent size={20} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Credit Utilization</p>
              <p className="text-2xl font-bold font-mono text-yellow-400">{creditUtilization.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loans Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Building2 size={20} className="text-orange-400" />
            Loans & EMIs
          </h3>
          <button
            onClick={() => setIsAddingLiability(true)}
            className="text-sm bg-primary/20 text-primary px-3 py-2 rounded-lg hover:bg-primary/30"
          >
            <Plus size={16} className="inline mr-1" /> Add Loan
          </button>
        </div>

        {loans.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 size={48} className="mx-auto mb-4 opacity-30" />
            <p>No active loans</p>
          </div>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} onRefresh={onRefresh} />
            ))}
          </div>
        )}
      </div>

      {/* Credit Cards Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CreditCard size={20} className="text-blue-400" />
            Credit Cards
          </h3>
          <button
            onClick={() => setIsAddingCard(true)}
            className="text-sm bg-primary/20 text-primary px-3 py-2 rounded-lg hover:bg-primary/30"
          >
            <Plus size={16} className="inline mr-1" /> Add Card
          </button>
        </div>

        {creditCards.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CreditCard size={48} className="mx-auto mb-4 opacity-30" />
            <p>No credit cards added</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {creditCards.map((card) => (
              <CreditCardComponent key={card.id} card={card} onRefresh={onRefresh} />
            ))}
          </div>
        )}
      </div>

      {/* Insurance Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Shield size={20} className="text-green-400" />
            Insurance Policies
          </h3>
          <button
            onClick={() => setIsAddingInsurance(true)}
            className="text-sm bg-primary/20 text-primary px-3 py-2 rounded-lg hover:bg-primary/30"
          >
            <Plus size={16} className="inline mr-1" /> Add Policy
          </button>
        </div>

        {insurance.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Shield size={48} className="mx-auto mb-4 opacity-30" />
            <p>No insurance policies</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insurance.map((policy) => (
              <InsuranceCard key={policy.id} policy={policy} onRefresh={onRefresh} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Loan Card Component
function LoanCard({ loan, onRefresh }: { loan: any; onRefresh: () => void }) {
  const progress = loan.total_amount > 0 
    ? ((loan.paid_amount || 0) / loan.total_amount) * 100 
    : 0

  const handleDelete = async () => {
    if (confirm(`Delete ${loan.name}?`)) {
      await supabase.from('liabilities').delete().eq('id', loan.id)
      onRefresh()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg border border-border bg-gradient-to-br from-orange-500/5 to-transparent hover:border-orange-500/30 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-foreground">{loan.name}</h4>
          <p className="text-xs text-muted-foreground">{loan.type?.replace('_', ' ').toUpperCase()}</p>
        </div>
        <div className="flex gap-1">
          <button className="p-1 hover:bg-muted/50 rounded">
            <Edit2 size={14} className="text-primary" />
          </button>
          <button onClick={handleDelete} className="p-1 hover:bg-red-500/20 rounded">
            <Trash2 size={14} className="text-red-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-xs text-muted-foreground">Outstanding</p>
          <p className="text-lg font-bold font-mono text-red-400">
            ₹{(loan.outstanding_amount || loan.total_amount).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Monthly EMI</p>
          <p className="text-lg font-bold font-mono text-foreground">
            ₹{loan.monthly_payment?.toLocaleString() || '0'}
          </p>
        </div>
      </div>

      {loan.interest_rate && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Percent size={12} />
          <span>{loan.interest_rate}% Interest Rate</span>
        </div>
      )}

      {loan.due_date && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Calendar size={12} />
          <span>Due: {loan.due_date}</span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Repayment Progress</span>
          <span className="text-foreground font-semibold">{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
          />
        </div>
      </div>
    </motion.div>
  )
}

// Credit Card Component
function CreditCardComponent({ card, onRefresh }: { card: any; onRefresh: () => void }) {
  const utilization = card.credit_limit > 0 
    ? (card.outstanding_balance / card.credit_limit) * 100 
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-xl"
    >
      {/* Card Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-xs opacity-70">{card.bank_name}</p>
            <p className="font-semibold text-lg">{card.card_name}</p>
          </div>
          <CreditCard size={32} className="opacity-70" />
        </div>

        <div className="mb-6">
          <p className="text-xs opacity-70 mb-1">Available Credit</p>
          <p className="text-2xl font-bold font-mono">
            ₹{card.available_credit?.toLocaleString() || '0'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs opacity-70">Credit Limit</p>
            <p className="font-mono font-semibold">₹{card.credit_limit.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs opacity-70">Outstanding</p>
            <p className="font-mono font-semibold text-yellow-300">
              ₹{card.outstanding_balance.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Utilization Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="opacity-70">Utilization</span>
            <span className="font-semibold">{utilization.toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div 
              className={`h-full ${utilization > 70 ? 'bg-red-400' : utilization > 50 ? 'bg-yellow-400' : 'bg-green-400'}`}
              style={{ width: `${utilization}%` }}
            />
          </div>
        </div>

        {card.due_date && (
          <div className="mt-4 text-xs opacity-70">
            Due Date: Every {card.due_date}th of month
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Insurance Card Component
function InsuranceCard({ policy, onRefresh }: { policy: any; onRefresh: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg border border-border bg-gradient-to-br from-green-500/5 to-transparent hover:border-green-500/30 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield size={20} className="text-green-400" />
          <div>
            <h4 className="font-semibold text-sm">{policy.policy_name}</h4>
            <p className="text-xs text-muted-foreground">{policy.provider}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${
          policy.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {policy.status}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Premium</span>
          <span className="font-mono font-semibold">₹{policy.premium_amount?.toLocaleString()}</span>
        </div>
        {policy.coverage_amount && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Coverage</span>
            <span className="font-mono font-semibold text-green-400">
              ₹{policy.coverage_amount?.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {policy.expiry_date && (
        <div className="text-xs text-muted-foreground">
          Expires: {policy.expiry_date}
        </div>
      )}
    </motion.div>
  )
}