"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Target, Shield, CreditCard, Calendar, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { format, differenceInDays, parseISO } from "date-fns"

// Components
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { StatCard } from "@/components/stat-card"
import { ExpenseTracker } from "@/components/expense-tracker"
import { AssetsInvestments } from "@/components/assets-investments"
import { AddItemModal } from "@/components/add-item-modal"
import { DoubleEntryFlow } from "@/components/double-entry-flow"
import { NetWorthChart } from "@/components/net-worth-chart"
import { SettingsView } from "@/components/settings-view"
import { ReportsView } from "@/components/reports-view"

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  // Data States
  const [transactions, setTransactions] = useState<any[]>([])
  const [assets, setAssets] = useState<any[]>([])
  const [liabilities, setLiabilities] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [insurance, setInsurance] = useState<any[]>([])
  const [projections, setProjections] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  
  // UI States
  const [currentView, setCurrentView] = useState("dashboard")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'transaction' | 'asset' | 'liability' | 'goal'>('transaction')
  const [editingItem, setEditingItem] = useState<any>(null)

  // --- 1. AUTH & DATA FETCHING ---
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    setUser(session.user)

    const [txns, asst, liab, goal, insur, proj] = await Promise.all([
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('assets').select('*'),
        supabase.from('liabilities').select('*'),
        supabase.from('goals').select('*').order('target_year', { ascending: true }),
        supabase.from('insurance').select('*'), // Fetch Insurance
        supabase.from('projections').select('*').order('year_number', { ascending: true })
    ])

    if (txns.data) setTransactions(txns.data)
    if (asst.data) setAssets(asst.data)
    if (liab.data) {
      setLiabilities(liab.data)
      // CALCULATE NOTIFICATIONS (Bills due in 7 days)
      const alerts = liab.data
        .filter(l => l.due_date && differenceInDays(parseISO(l.due_date), new Date()) <= 7 && differenceInDays(parseISO(l.due_date), new Date()) >= 0)
        .map(l => ({
          title: `Bill Due Soon: ${l.name}`,
          message: `Amount: ₹${l.total_amount} is due on ${l.due_date}`
        }))
      setNotifications(alerts)
    }
    if (goal.data) setGoals(goal.data)
    if (insur.data) setInsurance(insur.data)
    if (proj.data) setProjections(proj.data)
    
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) setIsSidebarOpen(false)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // --- 2. CALCULATIONS ---
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0)
  const totalDebt = liabilities.reduce((sum, l) => sum + l.total_amount, 0)
  const netWorth = totalAssets - totalDebt

  // --- 3. UI HANDLERS ---
  const openAddModal = (type: typeof modalType) => {
    setModalType(type)
    setEditingItem(null)
    setIsModalOpen(true)
  }
  const openEditModal = (item: any, type: typeof modalType) => {
    setModalType(type)
    setEditingItem(item)
    setIsModalOpen(true)
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-black text-white">Loading Finance.OS...</div>

  // --- 4. RENDER CONTENT ---
  const renderContent = () => {
    switch (currentView) {
      case "reports": return <ReportsView transactions={transactions} />
      case "settings": return <SettingsView user={user} />
      
      case "dashboard":
      default:
        return (
          <div className="space-y-8 pb-20">
            {/* TOP STATS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                  <StatCard label="Monthly Income" value={income} currency icon={null} />
                  <StatCard label="Monthly Expenses" value={expenses} currency icon={null} />
                  <StatCard label="Total Debt" value={totalDebt} currency trend={-5} icon={null} />
                  <StatCard label="Net Worth" value={netWorth} currency trend={10} icon={null} />
               </div>
            </div>

            {/* MAIN GRID: Charts, Assets, Goals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <NetWorthChart projections={projections} />
                    
                    {/* RESTORED: BILL CALENDAR / DUE DATES */}
                    <div className="bg-card border border-border rounded-lg p-6">
                       <h3 className="font-bold mb-4 flex items-center gap-2"><Calendar size={20} className="text-purple-400"/> Upcoming Bills</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {liabilities.filter(l => l.due_date).slice(0, 4).map((l, i) => (
                             <div key={i} className="flex justify-between items-center p-3 bg-muted/20 rounded border border-border/50">
                                <div>
                                   <p className="font-medium text-sm">{l.name}</p>
                                   <p className="text-xs text-zinc-500">Due: {l.due_date}</p>
                                </div>
                                <span className="font-mono font-bold text-red-400">₹{l.total_amount}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                </div>

                {/* RIGHT SIDEBAR: Flow, Insurance, Credit Cards */}
                <div className="space-y-6">
                   <DoubleEntryFlow income={income} expenses={expenses} assets={totalAssets} />
                   
                   {/* RESTORED: INSURANCE VAULT */}
                   <div className="bg-card border border-border rounded-lg p-6">
                      <div className="flex justify-between mb-4">
                         <h3 className="font-bold flex gap-2"><Shield size={20} className="text-green-400"/> Insurance</h3>
                         <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">Active</span>
                      </div>
                      {insurance.length > 0 ? insurance.map((ins, i) => (
                         <div key={i} className="mb-3 p-3 bg-muted/10 rounded">
                            <p className="text-sm font-bold">{ins.policy_name}</p>
                            <div className="flex justify-between text-xs text-zinc-500 mt-1">
                               <span>{ins.provider}</span>
                               <span>Exp: {ins.expiry_date}</span>
                            </div>
                         </div>
                      )) : <p className="text-xs text-zinc-500">No policies added.</p>}
                   </div>

                   {/* RESTORED: CREDIT CARDS */}
                   <div className="bg-card border border-border rounded-lg p-6">
                      <h3 className="font-bold mb-4 flex gap-2"><CreditCard size={20} className="text-blue-400"/> Credit Cards</h3>
                      {liabilities.filter(l => l.type === 'credit_card' || l.type === 'loan').slice(0, 3).map((l, i) => (
                         <div key={i} className="flex justify-between items-center mb-3 p-2 border-b border-border/30">
                            <span className="text-sm">{l.name}</span>
                            <span className="text-xs font-mono bg-red-900/20 text-red-400 px-2 py-1 rounded">₹{l.total_amount}</span>
                         </div>
                      ))}
                   </div>
                </div>
            </div>
            
            {/* BOTTOM SECTION: Expenses & Goals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="space-y-6">
                  <ExpenseTracker transactions={transactions} />
                  <AssetsInvestments assets={assets} />
               </div>
               <div className="bg-card border border-border rounded-lg p-6 h-fit">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-bold flex items-center gap-2"><Target size={20} className="text-accent"/> Goals</h3>
                     <button onClick={() => openAddModal('goal')} className="text-xs bg-zinc-800 px-2 py-1 rounded hover:text-white">Add Goal</button>
                  </div>
                  <div className="space-y-3">
                      {goals.map((g, i) => (
                          <div key={i} onClick={() => openEditModal(g, 'goal')} className="flex items-center justify-between p-3 bg-muted/20 rounded border border-border/50 cursor-pointer hover:border-accent">
                              <div>
                                  <p className="font-bold text-sm">{g.name}</p>
                                  <p className="text-xs text-muted-foreground">{g.target_year}</p>
                              </div>
                              <div className="text-right">
                                  <p className="font-mono text-sm text-accent">Target: ₹{g.target_amount.toLocaleString()}</p>
                                  <p className="text-xs text-green-400">{g.status}</p>
                              </div>
                          </div>
                      ))}
                  </div>
               </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        isMobile={isMobile} 
        onSignOut={handleSignOut}
      />

      <main className={`flex-1 overflow-y-auto h-screen transition-all duration-300 ${isSidebarOpen && !isMobile ? 'ml-64' : 'ml-0'}`}>
        <Header 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          onSignOut={handleSignOut}
          onSettingsClick={() => setCurrentView('settings')}
          user={user}
          notifications={notifications}
        />

        <div className="p-4 md:p-8 max-w-[1600px] mx-auto relative">
          <AnimatePresence mode="wait">
            <motion.div key={currentView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ADD DATA MODAL */}
      {currentView !== 'dashboard' && currentView !== 'reports' && currentView !== 'settings' && (
         <motion.button
           whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
           onClick={() => openAddModal(currentView === 'budget' ? 'transaction' : currentView === 'liabilities' ? 'liability' : 'asset')}
           className="fixed bottom-8 right-8 bg-primary text-black p-4 rounded-full shadow-lg z-50 flex items-center gap-2 font-bold"
         >
           <Plus size={24} /> Add Data
         </motion.button>
      )}

      <AddItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        type={modalType} 
        initialData={editingItem}
        onSuccess={fetchData} 
      />
    </div>
  )
}