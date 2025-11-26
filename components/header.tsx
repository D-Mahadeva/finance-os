"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Bell, User, Settings, LogOut, Menu } from "lucide-react"
import { useState } from "react"

interface HeaderProps {
  onMenuClick: () => void;
  onSignOut: () => void;
  onSettingsClick: () => void;
  user: any;
  notifications: any[];
}

export function Header({ onMenuClick, onSignOut, onSettingsClick, user, notifications }: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-4 md:gap-6">
          {/* NOTIFICATIONS */}
          <div className="relative">
            <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Bell size={20} className={notifications.length > 0 ? "text-accent" : "text-muted-foreground"} />
              {notifications.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
            </button>
            
            <AnimatePresence>
              {showNotifs && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} 
                  className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-3 border-b border-border bg-muted/30"><h4 className="font-bold text-sm">Notifications</h4></div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-xs text-center text-zinc-500">No new alerts</p>
                    ) : (
                      notifications.map((n, i) => (
                        <div key={i} className="p-3 border-b border-border/50 hover:bg-muted/20">
                          <p className="text-sm font-medium text-white">{n.title}</p>
                          <p className="text-xs text-red-400">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* PROFILE */}
          <div className="relative">
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-black font-bold uppercase">
                {userName[0]}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground">{userName}</p>
                <p className="text-[10px] text-muted-foreground">Premium Member</p>
              </div>
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="p-4 border-b border-border bg-muted/10">
                    <p className="font-bold text-sm text-white">{userName}</p>
                    <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                  </div>
                  <button onClick={() => { onSettingsClick(); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 text-sm text-zinc-300 hover:text-white transition-colors">
                    <Settings size={16} /> Settings
                  </button>
                  <button onClick={onSignOut} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-sm text-red-400 hover:text-red-300 border-t border-border transition-colors">
                    <LogOut size={16} /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}