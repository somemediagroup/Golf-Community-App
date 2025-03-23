import { createClient } from '@supabase/supabase-js';

// Supabase configuration
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://sffoejocoxvqihkhpqhq.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZm9lam9jb3h2cWloa2hwcWhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NjY3MTcsImV4cCI6MjA1ODI0MjcxN30.okD9uVitRiLZ-6l7vbk5AZBTWi-sj66C0stCKNy3-L0';

// Create a single supabase client for interacting with your database
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase; 