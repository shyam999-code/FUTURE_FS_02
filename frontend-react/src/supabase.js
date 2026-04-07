import { createClient } from '@supabase/supabase-js'

// Try to use environment variables first, but if they fail (like on Vercel sometimes),
// gracefully fall back to the direct strings. Supabase 'Anon' keys are safe to be public.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pxshbdhttcakccnjbcqy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_3PiIRwMGZ_83V3DNGK0svw_dqopDZgu';

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn("Using fallback literal Supabase URL because Vercel Environment Variables are missing.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
