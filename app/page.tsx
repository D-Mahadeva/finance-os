// app/page.tsx - COMPLETE FINAL VERSION (Parts 1-4)
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, Target, Shield, CreditCard, Calendar, 
  Wallet, TrendingUp, TrendingDown, PiggyBank, Building2, Receipt
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { differenceInDays, parseISO } from "date-fns"

// Components
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { StatCard } from "@/components/stat-card"
import { AccountBalanceCard } from "@/components/account-balance-card"
import { MonthlyCashFlowCard } from "@/components/monthly-cashflow-card"
import { ExpenseTracker } from "@/components/expense-tracker"
import { AssetsInvestments } from "@/components/assets-investments"
import { AddItemModal } from "@/components/add-item-modal"
import { AllocationModal } from "@/components/allocation-modal"
import { NetWorthChart } from "@/components/net-worth-chart"
import { SettingsView } from "@/components/settings-view"
import { BudgetView } from "@/components/budget-view"
import { LiabilitiesView } from "@/components/liabilities-view"
import { BillCalendar } from "@/components/bill-calendar"
import { RecurringBillModal, CreditCardModal, InsuranceModal } from "@/components/liability-modals"
import { EnhancedReportsView } from "@/components/enhanced-reports-view"
import { DailyExpenseTracker } from "@/components/daily-expense-tracker"

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authChecking, setAuthChecking] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  // Data States
  const [accountBalance, setAccountBalance] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [dailyExpenses, setDailyExpenses] = useState<any[]>([])
  const [assets, setAssets] = useState<any[]>([])
  const [liabilities, setLiabilities] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [insurance, setInsurance] = useState<any[]>([])
  const [projections, setProjections] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [monthlyAllocations, setMonthlyAllocations] = useState<any[]>([])
  const [budgetCategories, setBudgetCategories] = useState<any[]>([])
  const [creditCards, setCreditCards] = useState<any[]>([])
  const [recurringBills, setRecurringBills] = useState<any[]>([])
  
  // UI States
  const [currentView, setCurrentView] = useState("dashboard")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false)
  const [isBillModalOpen, setIsBillModalOpen] = useState(false)
  const [isCreditCardModalOpen, setIsCreditCardModalOpen] = useState(false)
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'transaction' | 'asset' | 'liability' | 'goal'>('transaction')
  const [editingItem, setEditingItem] = useState<any>(null)

  // --- AUTH CHECK ---
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth error:', error)
          router.push('/login')
          return
        }

        if (!session) {
          console.log('No session found, redirecting to login')
          router.push('/login')
          return
        }

        console.log('✅ User authenticated:', session.user.email)
        setUser(session.user)
        setAuthChecking(false)
        
        // Now fetch data after auth is confirmed
        await fetchData(session.user.id)
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initializeUserData = async (userId: string) => {
    try {
      console.log('Initializing user data for:', userId)
      
      // Check account balance
      const { data: balanceData, error: balanceError } = await supabase
        .from('account_balance')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (balanceError && balanceError.code === 'PGRST116') {
        console.log('Creating account_balance...')
        await supabase.from('account_balance').insert({
          user_id: userId,
          current_balance: 0,
          total_income: 0,
          total_expenses: 0
        })
      }

      // Check categories
      const { data: categories } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('user_id', userId)
      
      if (!categories || categories.length === 0) {
        console.log('Seeding default categories...')
        await supabase.rpc('seed_default_categories', { p_user_id: userId })
      }

      // Check allocations
      const { data: allocations } = await supabase
        .from('monthly_allocations')
        .select('*')
        .eq('user_id', userId)
      
      if (!allocations || allocations.length === 0) {
        console.log('Seeding default allocations...')
        await supabase.rpc('seed_default_allocations', { p_user_id: userId })
      }

      console.log('✅ User data initialized')
    } catch (error) {
      console.error('Error initializing user data:', error)
    }
  }

  const fetchData = async (userId: string) => {
    try {
      setLoading(true)
      console.log('Fetching data for user:', userId)

      await initializeUserData(userId)

      const [
        balance, txns, dailyExp, asst, liab, goal, insur, proj, 
        alloc, cats, cards, bills
      ] = await Promise.all([
        supabase.from('account_balance').select('*').eq('user_id', userId).single(),
        supabase.from('transactions').select('*').order('date', { ascending: false }).limit(100),
        supabase.from('daily_expenses').select('*').order('date', { ascending: false }).limit(100),
        supabase.from('assets').select('*'),
        supabase.from('liabilities').select('*'),
        supabase.from('goals').select('*').order('target_year', { ascending: true }),
        supabase.from('insurance').select('*'),
        supabase.from('projections').select('*').order('year', { ascending: true }),
        supabase.from('monthly_allocations').select('*').eq('status', 'active'),
        supabase.from('budget_categories').select('*'),
        supabase.from('credit_cards').select('*'),
        supabase.from('recurring_bills').select('*').eq('status', 'active').order('next_due_date')
      ])

      console.log('Data fetched:', {
        balance: balance.data,
        transactions: txns.data?.length,
        dailyExpenses: dailyExp.data?.length,
        categories: cats.data?.length,
        allocations: alloc.data?.length,
        creditCards: cards.data?.length,
        bills: bills.data?.length
      })

      if (balance.data) setAccountBalance(balance.data)
      if (txns.data) setTransactions(txns.data)
      if (dailyExp.data) setDailyExpenses(dailyExp.data)
      if (asst.data) setAssets(asst.data)
      if (liab.data) {
        setLiabilities(liab.data)
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
      if (alloc.data) setMonthlyAllocations(alloc.data)
      if (cats.data) setBudgetCategories(cats.data)
      if (cards.data) setCreditCards(cards.data)
      if (bills.data) setRecurringBills(bills.data)
      
      setLoading(false)
      console.log('✅ All data loaded')
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) setIsSidebarOpen(false)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // --- CALCULATIONS ---
  const income = accountBalance?.total_income || 0
  const expenses = accountBalance?.total_expenses || 0
  const currentBalance = accountBalance?.current_balance || 0
  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0)
  const totalDebt = liabilities.reduce((sum, l) => sum + (l.outstanding_amount || l.total_amount), 0)
  const netWorth = totalAssets - totalDebt
  
  const fixedObligations = monthlyAllocations
    .filter(a => a.category === 'loan_repayment' || a.category === 'insurance')
    .reduce((sum, a) => sum + a.amount, 0)

  // --- UI HANDLERS ---
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

  const navigateToView = (view: string) => {
    setCurrentView(view)
  }

  const refreshData = () => {
    if (user) {
      fetchData(user.id)
    }
  }

  if (authChecking) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-lg font-semibold">Loading Finance.OS...</p>
        </div>
      </div>
    )
  }

  // --- RENDER CONTENT ---
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-sm text-muted-foreground">Loading your financial data...</p>
          </div>
        </div>
      )
    }

    switch (currentView) {
      case "budget":
        return (
          <BudgetView
            accountBalance={accountBalance}
            transactions={transactions}
            categories={budgetCategories}
            allocations={monthlyAllocations}
            onRefresh={refreshData}
          />
        )
      
      case "liabilities":
        return (
          <LiabilitiesView
            liabilities={liabilities}
            creditCards={creditCards}
            insurance={insurance}
            onRefresh={refreshData}
          />
        )
      
      case "assets":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Assets & Investments</h2>
              <p className="text-sm text-muted-foreground">Track your wealth and investments</p>
            </div>
            <AssetsInvestments assets={assets} />
            {goals.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">Financial Goals</h3>
                <div className="space-y-3">
                  {goals.map((g, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded border border-border/50">
                      <div>
                        <p className="font-bold text-sm">{g.name}</p>
                        <p className="text-xs text-muted-foreground">{g.target_year}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm text-accent">₹{g.target_amount.toLocaleString()}</p>
                        <p className="text-xs text-green-400">{g.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      
      case "reports":
        return (
          <div className="space-y-6">
            <EnhancedReportsView
              transactions={transactions}
              dailyExpenses={dailyExpenses}
              budgetCategories={budgetCategories}
            />
            <DailyExpenseTracker
              expenses={dailyExpenses}
              categories={budgetCategories}
              onRefresh={refreshData}
            />
          </div>
        )
      
      case "settings": 
        return <SettingsView user={user} />
      
      case "dashboard":
      default:
        return (
          <div className="space-y-6 pb-20">
            {/* ACCOUNT BALANCE */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="cursor-pointer"
              onClick={() => navigateToView('budget')}
            >
              <AccountBalanceCard
                balance={currentBalance}
                totalIncome={income}
                totalExpenses={expenses}
                lastUpdated="just now"
              />
            </motion.div>

            {/* TOP STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div whileHover={{ scale: 1.02 }} onClick={() => navigateToView('budget')} className="cursor-pointer">
                <StatCard label="Monthly Income" value={income} currency icon={<TrendingUp className="text-green-400" />} trend={12} />
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} onClick={() => navigateToView('budget')} className="cursor-pointer">
                <StatCard label="Monthly Expenses" value={expenses} currency icon={<TrendingDown className="text-red-400" />} />
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} onClick={() => navigateToView('liabilities')} className="cursor-pointer">
                <StatCard label="Total Debt" value={totalDebt} currency trend={-5} icon={<Receipt className="text-red-400" />} />
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} onClick={() => navigateToView('assets')} className="cursor-pointer">
                <StatCard label="Net Worth" value={netWorth} currency trend={10} icon={<PiggyBank className="text-primary" />} />
              </motion.div>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <NetWorthChart projections={projections} />
                
                {recurringBills.length > 0 && (
                  <BillCalendar bills={recurringBills} onRefresh={refreshData} />
                )}
              </div>

              {/* RIGHT SIDEBAR */}
              <div className="space-y-6">
                <MonthlyCashFlowCard
                  income={income}
                  fixedObligations={fixedObligations}
                  expenses={expenses}
                  allocations={monthlyAllocations}
                  onRefresh={refreshData}
                />

                {insurance.length > 0 && (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigateToView('liabilities')}
                    className="bg-card border border-border rounded-lg p-6 cursor-pointer"
                  >
                    <div className="flex justify-between mb-4">
                      <h3 className="font-bold flex gap-2">
                        <Shield size={20} className="text-green-400"/> 
                        Insurance
                      </h3>
                      <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">
                        {insurance.filter(i => i.status === 'active').length} Active
                      </span>
                    </div>
                    {insurance.slice(0, 3).map((ins, i) => (
                      <div key={i} className="mb-3 p-3 bg-muted/10 rounded">
                        <p className="text-sm font-bold">{ins.policy_name}</p>
                        <div className="flex justify-between text-xs text-zinc-500 mt-1">
                          <span>{ins.provider}</span>
                          <span>Exp: {ins.expiry_date}</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {creditCards.length > 0 && (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigateToView('liabilities')}
                    className="bg-card border border-border rounded-lg p-6 cursor-pointer"
                  >
                    <h3 className="font-bold mb-4 flex gap-2">
                      <CreditCard size={20} className="text-blue-400"/> 
                      Credit Cards
                    </h3>
                    {creditCards.slice(0, 2).map((card, i) => (
                      <div key={i} className="flex justify-between items-center mb-3 p-2 border-b border-border/30">
                        <span className="text-sm">{card.card_name}</span>
                        <span className="text-xs font-mono bg-blue-900/20 text-blue-400 px-2 py-1 rounded">
                          ₹{card.outstanding_balance?.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
            
            {/* BOTTOM SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExpenseTracker transactions={transactions} />
              {assets.length > 0 && <AssetsInvestments assets={assets} />}
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
            <motion.div 
              key={currentView} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* FLOATING ACTION BUTTONS */}
      {currentView === 'dashboard' && (
        <motion.button
          whileHover={{ scale: 1.1 }} 
          whileTap={{ scale: 0.9 }}
          onClick={() => openAddModal('transaction')}
          className="fixed bottom-8 right-8 bg-primary text-black p-4 rounded-full shadow-2xl z-50 flex items-center gap-2 font-bold hover:shadow-primary/50"
        >
          <Plus size={24} /> Add Transaction
        </motion.button>
      )}

      {currentView === 'budget' && (
        <motion.button
          whileHover={{ scale: 1.1 }} 
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsAllocationModalOpen(true)}
          className="fixed bottom-8 right-8 bg-primary text-black p-4 rounded-full shadow-2xl z-50 flex items-center gap-2 font-bold hover:shadow-primary/50"
        >
          <Plus size={24} /> Add Allocation
        </motion.button>
      )}

      {currentView === 'liabilities' && (
        <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
          <motion.button
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsBillModalOpen(true)}
            className="bg-accent text-black px-4 py-2 rounded-full shadow-xl font-semibold"
          >
            + Bill
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreditCardModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-xl font-semibold"
          >
            + Card
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsInsuranceModalOpen(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-full shadow-xl font-semibold"
          >
            + Insurance
          </motion.button>
        </div>
      )}

      {/* MODALS */}
      <AddItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        type={modalType} 
        initialData={editingItem}
        onSuccess={refreshData} 
      />

      <AllocationModal
        isOpen={isAllocationModalOpen}
        onClose={() => setIsAllocationModalOpen(false)}
        initialData={null}
        onSuccess={refreshData}
      />

      <RecurringBillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        initialData={null}
        onSuccess={refreshData}
      />

      <CreditCardModal
        isOpen={isCreditCardModalOpen}
        onClose={() => setIsCreditCardModalOpen(false)}
        initialData={null}
        onSuccess={refreshData}
      />

      <InsuranceModal
        isOpen={isInsuranceModalOpen}
        onClose={() => setIsInsuranceModalOpen(false)}
        initialData={null}
        onSuccess={refreshData}
      />
    </div>
  )
}