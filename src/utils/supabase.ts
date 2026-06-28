import { createClient } from '@supabase/supabase-js';

// @ts-ignore
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
// @ts-ignore
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'dummy_key';

export const supabase = createClient(supabaseUrl, supabaseKey);
