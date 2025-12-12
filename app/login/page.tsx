// app/login/page.tsx - COMPLETE LOGIN SYSTEM
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, Lock, User, Eye, EyeOff, Loader2, TrendingUp } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { recalculateUserProjections } from "@/lib/projection-calculator"

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  })
  const [error, setError] = useState('')

  // Check if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/')
      }
    }
    checkUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // LOGIN
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })

        if (error) throw error

        if (data.user) {
          router.push('/')
        }
      } else {
        // SIGNUP
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName
            }
          }
        })

        if (error) throw error

        if (data.user) {
          // Initialize user data
          await initializeNewUser(data.user.id)
          
          // Check if email confirmation is required
          if (data.session) {
            // Email confirmation disabled - user is logged in immediately
            console.log('✅ User created and logged in')
            router.push('/')
          } else {
            // Email confirmation required
            alert('✅ Account created! Please check your email to verify your account before logging in.')
            setIsLogin(true) // Switch to login tab
          }
        }
      }
    } catch (error: any) {
      setError(error.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  // Initialize new user data
  const initializeNewUser = async (userId: string) => {
    try {
      // 1. Create account balance
      await supabase.from('account_balance').insert({
        user_id: userId,
        current_balance: 0,
        total_income: 0,
        total_expenses: 0
      })

      // 2. Seed default expense categories
      await supabase.rpc('seed_default_categories', { p_user_id: userId })

      // 3. Create initial projections
      await recalculateUserProjections(userId)

      console.log('User data initialized successfully')
    } catch (error) {
      console.error('Error initializing user data:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex items-center justify-center p-4">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4"
          >
            <TrendingUp size={32} className="text-black" />
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-2">
            Finance.OS
          </h1>
          <p className="text-zinc-400">Your Personal Finance Operating System</p>
        </div>

        {/* Login/Signup Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-2xl p-8 shadow-2xl backdrop-blur-sm"
        >
          {/* Toggle Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-muted/30 rounded-lg">
            <button
              onClick={() => { setIsLogin(true); setError('') }}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                isLogin 
                  ? 'bg-primary text-black shadow-lg' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setError('') }}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                !isLogin 
                  ? 'bg-primary text-black shadow-lg' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Signup only) */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <label className="text-xs text-zinc-400 uppercase font-bold">Full Name</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-10 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-primary outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label className="text-xs text-zinc-400 uppercase font-bold">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-primary outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-zinc-400 uppercase font-bold">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-10 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-primary outline-none transition-colors"
                  placeholder="••••••••"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-zinc-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-xs text-zinc-500 mt-1">Minimum 6 characters</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {isLogin ? 'Logging in...' : 'Creating account...'}
                </>
              ) : (
                isLogin ? 'Login' : 'Create Account'
              )}
            </button>
          </form>

          {/* Forgot Password */}
          {isLogin && (
            <div className="mt-4 text-center">
              <button className="text-xs text-zinc-400 hover:text-primary transition-colors">
                Forgot password?
              </button>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-500 mt-6">
          By continuing, you agree to Finance.OS Terms & Privacy Policy
        </p>
      </motion.div>
    </div>
  )
}