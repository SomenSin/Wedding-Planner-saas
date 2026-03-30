import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Note: See /supabase_schema.sql for the database schema definition.
let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Supabase configuration is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.'
      );
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
};

// Export a proxy or a dummy object to maintain compatibility if needed, 
// but it's better to update callers to use getSupabase().
// For now, I'll keep the export but it might still fail if accessed immediately.
// Actually, the best practice in this environment is to use a getter.
export const supabase = (() => {
  try {
    return getSupabase();
  } catch (e) {
    // Return a proxy that throws on access to any property
    return new Proxy({} as SupabaseClient, {
      get: () => {
        throw e;
      }
    });
  }
})();
