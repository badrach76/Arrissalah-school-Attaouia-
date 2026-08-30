import { createClient } from '@supabase/supabase-js'

// قراءة المفاتيح بأمان من إعدادات البيئة في Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
