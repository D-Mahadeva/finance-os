// components/bill-calendar.tsx
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Calendar, Plus, Check, X, Edit2, Trash2,
  AlertCircle, Clock, DollarSign
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns"

interface BillCalendarProps {
  bills: any[]
  onRefresh: () => void
}

export function BillCalendar({ bills, onRefresh }: BillCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [isAddingBill, setIsAddingBill] = useState(false)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Group bills by date
  const billsByDate = bills.reduce((acc: any, bill) => {
    if (bill.next_due_date) {
      const dateKey = format(parseISO(bill.next_due_date), 'yyyy-MM-dd')
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(bill)
    }
    return acc
  }, {})

  const handlePayBill = async (billId: string, amount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Call the database function to pay bill
      const { data, error } = await supabase.rpc('pay_recurring_bill', {
        p_bill_id: billId,
        p_user_id: user.id,
        p_amount: amount
      })

      if (error) throw error

      alert('✅ Bill paid successfully!')
      onRefresh()
    } catch (error) {
      console.error('Error paying bill:', error)
      alert('Failed to pay bill')
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar size={24} className="text-accent" />
          <div>
            <h3 className="text-lg font-semibold">Bill Calendar</h3>
            <p className="text-xs text-muted-foreground">
              {format(currentDate, 'MMMM yyyy')}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsAddingBill(true)}
          className="text-sm bg-primary/20 text-primary px-3 py-2 rounded-lg hover:bg-primary/30"
        >
          <Plus size={16} className="inline mr-1" /> Add Bill
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
            {day}
          </div>
        ))}

        {daysInMonth.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const dayBills = billsByDate[dateKey] || []
          const isToday = isSameDay(day, new Date())
          const isSelected = selectedDay && isSameDay(day, selectedDay)

          return (
            <motion.button
              key={dateKey}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDay(day)}
              className={`
                aspect-square relative rounded-lg p-2 text-sm transition-all
                ${isToday ? 'bg-primary/20 border-2 border-primary font-bold' : 'bg-muted/30 border border-border'}
                ${isSelected ? 'ring-2 ring-accent' : ''}
                ${dayBills.length > 0 ? 'hover:border-red-500/50' : 'hover:border-accent/50'}
              `}
            >
              <div className="text-foreground">{format(day, 'd')}</div>
              {dayBills.length > 0 && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {dayBills.slice(0, 3).map((_bill: any, i: number) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-red-500" />
                  ))}
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Selected Day Bills */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border pt-4"
          >
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Clock size={16} />
              Bills on {format(selectedDay, 'MMM dd, yyyy')}
            </h4>

            {billsByDate[format(selectedDay, 'yyyy-MM-dd')]?.length > 0 ? (
              <div className="space-y-2">
                {billsByDate[format(selectedDay, 'yyyy-MM-dd')].map((bill: any) => (
                  <BillItem
                    key={bill.id}
                    bill={bill}
                    onPay={() => handlePayBill(bill.id, bill.amount)}
                    onRefresh={onRefresh}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No bills due on this date
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upcoming Bills List */}
      <div className="mt-6 border-t border-border pt-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <AlertCircle size={16} className="text-yellow-400" />
          Upcoming Bills (Next 7 Days)
        </h4>
        <div className="space-y-2">
          {bills
            .filter(b => {
              const dueDate = parseISO(b.next_due_date)
              const today = new Date()
              const diff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
              return diff >= 0 && diff <= 7
            })
            .slice(0, 5)
            .map((bill) => (
              <BillItem
                key={bill.id}
                bill={bill}
                onPay={() => handlePayBill(bill.id, bill.amount)}
                onRefresh={onRefresh}
              />
            ))}
        </div>
      </div>
    </div>
  )
}

// Bill Item Component
function BillItem({ bill, onPay, onRefresh }: { bill: any; onPay: () => void; onRefresh: () => void }) {
  const [showActions, setShowActions] = useState(false)
  const dueDate = parseISO(bill.next_due_date)
  const today = new Date()
  const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const isOverdue = daysUntil < 0
  const isDueSoon = daysUntil >= 0 && daysUntil <= 3

  const handleDelete = async () => {
    if (confirm(`Delete ${bill.name}?`)) {
      await supabase.from('recurring_bills').delete().eq('id', bill.id)
      onRefresh()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onHoverStart={() => setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
      className={`
        flex items-center justify-between p-3 rounded-lg border transition-all
        ${isOverdue ? 'bg-red-500/10 border-red-500/30' : 
          isDueSoon ? 'bg-yellow-500/10 border-yellow-500/30' : 
          'bg-muted/20 border-border/50'}
      `}
    >
      <div className="flex items-center gap-3 flex-1">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isOverdue ? 'bg-red-500/20' : isDueSoon ? 'bg-yellow-500/20' : 'bg-primary/20'
        }`}>
          <DollarSign size={18} className={
            isOverdue ? 'text-red-400' : isDueSoon ? 'text-yellow-400' : 'text-primary'
          } />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{bill.name}</p>
          <p className="text-xs text-muted-foreground">
            {format(dueDate, 'MMM dd')} • {bill.category}
            {isOverdue && <span className="text-red-400 ml-2">OVERDUE</span>}
            {isDueSoon && <span className="text-yellow-400 ml-2">DUE SOON</span>}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono font-bold text-foreground">₹{bill.amount.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{bill.frequency}</p>
        </div>
      </div>

      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex gap-2 ml-3"
          >
            <button
              onClick={onPay}
              className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors"
              title="Mark as Paid"
            >
              <Check size={16} className="text-green-400" />
            </button>
            <button
              className="p-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 size={16} className="text-primary" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 size={16} className="text-red-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}