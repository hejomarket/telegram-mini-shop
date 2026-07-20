import { createClient } from '@supabase/supabase-js';

import type { RuntimeMode } from '../orders/types';

export function getRuntimeMode(): RuntimeMode {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY ? 'supabase' : 'demo';
}

export function getSupabaseServerClient() {
  if (getRuntimeMode() === 'demo') return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
