import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration
 * Usa el Service Role Key para tener acceso completo a la base de datos
 */
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be defined in environment');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);

export default supabase;