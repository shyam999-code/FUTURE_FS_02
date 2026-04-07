import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.error("🚨 CRITICAL: Missing VITE_SUPABASE_URL environment variable. Did you add it to Vercel?");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
