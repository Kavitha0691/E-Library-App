import { createClient } from '@supabase/supabase-js';
import fetch from 'cross-fetch';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: fetch,
  },
});

export const STORAGE_BUCKET = 'books';
export const COVERS_BUCKET = 'covers';
