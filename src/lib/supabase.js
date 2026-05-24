import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// If credentials are empty, we might use mock data in our services
export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

// 브라우저 개발자 도구(F12) 콘솔에서 Supabase 활성화 여부를 즉시 확인할 수 있도록 로그 추가
console.log('%c[Supabase Connection Info]', 'color: #3b82f6; font-weight: bold; font-size: 11px;');
console.log(' - URL:', supabaseUrl ? 'Configured ✅' : 'Missing ❌');
console.log(' - Key:', supabaseAnonKey ? 'Configured ✅' : 'Missing ❌');
console.log(' - Status:', hasSupabaseConfig ? '🟢 Supabase DB Mode (REAL-TIME ACTIVE)' : '🟡 Mock Data Mode (FALLBACK)');

// Supabase 클라이언트 초기화 (설정값이 있을 때만 유효한 객체 반환)
export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

