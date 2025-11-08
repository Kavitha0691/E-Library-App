import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lgjzetyzbxuxzjcmrrij.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnanpldHl6Ynh1eHpqY21ycmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTI2MTcsImV4cCI6MjA3ODAyODYxN30.0SXVnaGi0kGeKmC4HObF3pv1HsK6CUFhyeN1q2oBtA0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const STORAGE_BUCKET = 'books';
export const COVERS_BUCKET = 'covers';
