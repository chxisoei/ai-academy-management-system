import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// If credentials are empty, we might use mock data in our services
export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

// Supabase 클라이언트 초기화 (설정값이 있을 때만 유효한 객체 반환)
export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

