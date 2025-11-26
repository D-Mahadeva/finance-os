"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Calendar } from "lucide-react"
import { useState } from "react"

const billDates = [
  { date: 12, bill: "Gold Loan Interest", amount: 3500, color: "text-yellow-400" },
  { date: 15, bill: "Gym Membership", amount: 1000, color: "text-blue-400" },
  { date: 20, bill: "Rent Due", amount: 2500, color: "text-red-400" },
  { date: 25, bill: "Parents Support", amount: 10000, color: "text-purple-400" },
]

const days = Array.from({ length: 30 }, (_, i) => i + 1)

export function CalendarView() {
  const [hoveredDate, setHoveredDate] = useState<number | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-card border border-border p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <Calendar size={20} className="text-accent" />
        <h3 className="text-lg font-semibold text-foreground">Bill Due Dates</h3>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-6">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
            {day}
          </div>
        ))}

        {days.map((day) => {
          const bill = billDates.find((b) => b.date === day)
          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: day * 0.02 }}
              onMouseEnter={() => bill && setHoveredDate(day)}
              onMouseLeave={() => setHoveredDate(null)}
              className={`aspect-square flex items-center justify-center rounded-lg text-sm font-semibold cursor-pointer transition-all relative ${
                bill
                  ? "bg-accent/20 border border-accent/50 hover:border-accent hover:shadow-lg hover:shadow-accent/20"
                  : "bg-muted/30 border border-border hover:border-accent/30"
              }`}
            >
              {bill ? (
                <div className="text-center">
                  <div className="text-foreground font-bold">{day}</div>
                  <div className={`text-xs ${bill.color}`}>•</div>
                </div>
              ) : (
                <span className="text-muted-foreground">{day}</span>
              )}

              <AnimatePresence>
                {hoveredDate === day && bill && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: -40 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-muted border border-border rounded-lg p-2 whitespace-nowrap text-xs text-foreground shadow-lg z-50"
                  >
                    <p className="font-semibold">{bill.bill}</p>
                    <p className="text-muted-foreground">₹{bill.amount.toLocaleString()}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-semibold mb-3">Upcoming Bills:</p>
        {billDates.map((bill, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
            className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${bill.color}`} />
              <div>
                <p className="text-sm font-medium text-foreground">{bill.bill}</p>
                <p className="text-xs text-muted-foreground">On {bill.date}th</p>
              </div>
            </div>
            <span className="font-mono font-bold text-foreground">₹{bill.amount.toLocaleString()}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}