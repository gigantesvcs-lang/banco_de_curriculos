import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ivpfwurxoqrzexxjpxph.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2cGZ3dXJ4b3FyemV4eGpweHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNDkwODksImV4cCI6MjA5MzgyNTA4OX0.kBBRDW96blEd0etOaxCH5nzC0tQifsuKHvRUm8FUZ0w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
