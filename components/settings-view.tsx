"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { User, Phone, Lock, Save, Loader2 } from "lucide-react"

export function SettingsView({ user }: { user: any }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    phone: user?.phone || '',
    password: ''
  })

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const updates: any = {
        data: { full_name: formData.fullName }
      }
      if (formData.phone) updates.phone = formData.phone
      if (formData.password) updates.password = formData.password

      const { error } = await supabase.auth.updateUser(updates)
      if (error) throw error
      alert("Profile updated successfully!")
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Account Settings</h2>
      
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Profile Details</h3>
        <form onSubmit={handleUpdate} className="space-y-4">
          
          {/* Email (Read Only) */}
          <div>
            <label className="text-xs text-zinc-400 uppercase font-bold">Email Address</label>
            <div className="p-3 bg-muted/30 border border-border rounded-lg text-zinc-500 mt-1 cursor-not-allowed">
              {user?.email}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="text-xs text-zinc-400 uppercase font-bold">Full Name</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-3 text-zinc-500" size={18} />
              <input 
                type="text" 
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full pl-10 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-primary outline-none"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs text-zinc-400 uppercase font-bold">Phone Number</label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-3 text-zinc-500" size={18} />
              <input 
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+91 98765 43210"
                className="w-full pl-10 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-primary outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs text-zinc-400 uppercase font-bold">New Password (Optional)</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 text-zinc-500" size={18} />
              <input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Enter new password to change"
                className="w-full pl-10 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-primary outline-none"
              />
            </div>
          </div>

          <button disabled={loading} className="flex items-center justify-center gap-2 w-full bg-primary text-black font-bold py-3 rounded-lg hover:opacity-90 transition">
            {loading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}