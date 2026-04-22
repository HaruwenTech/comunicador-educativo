import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dkikcmyxzcukpuchvrgj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRraWtjbXl4emN1a3B1Y2h2cmdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4ODc3MDUsImV4cCI6MjA5MjQ2MzcwNX0.T5YRj3twg1CDBz1zH6szf8l_YTgtrcm6NvD9aEwSHyY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
