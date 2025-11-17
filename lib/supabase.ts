import { createClient } from '@supabase/supabase-js';
import fetch from 'cross-fetch';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '⚠️ Missing Supabase credentials!\n\n' +
    'Please update your .env.local file with:\n' +
    'NEXT_PUBLIC_SUPABASE_URL=your-project-url\n' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n\n' +
    'See NEW_PROJECT_SETUP.md for instructions.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: fetch,
  },
});

export const STORAGE_BUCKET = 'books';
export const COVERS_BUCKET = 'covers';
