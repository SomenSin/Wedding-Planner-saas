-- Run this in your Supabase SQL Editor to enable Admin Dashboard user blocking
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
