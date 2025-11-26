import { createClient } from '@supabase/supabase-js'

// REPLACE THESE WITH YOUR KEYS FROM SUPABASE DASHBOARD
const supabaseUrl = 'https://mhpreesnuvauvlagqwse.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ocHJlZXNudXZhdXZsYWdxd3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTMyMzEsImV4cCI6MjA3OTcyOTIzMX0.U6jx0dPhaMQKAtc_kOwTYT98SeIDdgSEoJOZDnzhVbc'

export const supabase = createClient(supabaseUrl, supabaseKey)