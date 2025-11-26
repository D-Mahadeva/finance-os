"use client"

import { motion, AnimatePresence, Variants} from "framer-motion"
import { 
  LayoutDashboard, TrendingUp, CreditCard, Briefcase, 
  BarChart3, Settings, LogOut, X, ChevronLeft 
} from "lucide-react"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: TrendingUp, label: "Assets", id: "assets" },
  { icon: CreditCard, label: "Liabilities", id: "liabilities" },
  { icon: Briefcase, label: "Budget", id: "budget" },
  { icon: BarChart3, label: "Reports", id: "reports" },
]

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobile: boolean;
  onSignOut: () => void;
}

export function Sidebar({ currentView, onNavigate, isOpen, setIsOpen, isMobile, onSignOut }: SidebarProps) {
  
  const sidebarVariants = {
    open: { x: 0, width: "16rem", transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: isMobile ? "-100%" : 0, width: "0rem", transition: { type: "spring", stiffness: 300, damping: 30 } }
  }as Variants

  const handleNavigation = (view: string) => {
    onNavigate(view)
    if (isMobile) setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.div
        variants={sidebarVariants}
        initial={false}
        animate={isOpen ? "open" : "closed"}
        className={`fixed left-0 top-0 h-screen bg-card border-r border-border z-40 overflow-hidden flex flex-col ${!isOpen && !isMobile ? 'border-none' : ''}`}
      >
        {/* Sidebar Header */}
        <div className="p-6 flex justify-between items-center min-w-[16rem]">
          <div>
            <h1 
              className="text-2xl font-bold bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent cursor-pointer" 
              onClick={() => handleNavigation('dashboard')}
            >
              Finance.OS
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Personal Finance Dashboard</p>
          </div>
          {/* Close Button */}
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors"
          >
            {isMobile ? <X size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2 flex-1 px-4 min-w-[16rem]">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "hover:bg-muted/50 text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                <Icon size={18} className={isActive ? "text-primary" : "group-hover:text-accent transition-colors"} />
                <span className={`text-sm font-medium ${isActive ? "font-bold" : ""}`}>{item.label}</span>
                {isActive && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
              </button>
            )
          })}

          {/* Settings Button (Now Functional) */}
          <button
            onClick={() => handleNavigation('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group mt-2 ${
              currentView === 'settings'
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            <Settings size={18} className={currentView === 'settings' ? "text-primary" : "group-hover:text-accent transition-colors"} />
            <span className={`text-sm font-medium ${currentView === 'settings' ? "font-bold" : ""}`}>Settings</span>
            {currentView === 'settings' && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
          </button>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border min-w-[16rem]">
        </div>
      </motion.div>
    </>
  )
}