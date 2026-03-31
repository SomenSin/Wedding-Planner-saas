-- ============================================================
-- PATCH: Align DB schema with frontend module field names
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Logistics Tasks: add 'title' and 'category' columns
ALTER TABLE public.logistics_tasks 
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';

-- Backfill: copy existing task_name to title
UPDATE public.logistics_tasks SET title = task_name WHERE title IS NULL;

-- 2. Itinerary Items: add 'activity', 'time_text', 'event_date' columns
ALTER TABLE public.itinerary_items 
  ADD COLUMN IF NOT EXISTS activity TEXT,
  ADD COLUMN IF NOT EXISTS time_text TEXT,
  ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS event_date DATE;

-- Backfill
UPDATE public.itinerary_items SET activity = title WHERE activity IS NULL;
UPDATE public.itinerary_items SET event_date = start_time::DATE WHERE event_date IS NULL AND start_time IS NOT NULL;

-- 3. Vendors: add extra columns the VendorManager uses
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS total_cost DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deposit_paid DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS balance_due DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quote_requested BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS booked BOOLEAN DEFAULT false;

-- 4. Drink Entries (per user, per drink type)
CREATE TABLE IF NOT EXISTS public.drink_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  drink_type TEXT NOT NULL DEFAULT 'custom',
  name TEXT NOT NULL,
  unit TEXT DEFAULT 'Bottles',
  estimated INTEGER DEFAULT 0,
  acquired INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  is_manual BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Add missing columns if table already exists:
ALTER TABLE public.drink_entries ADD COLUMN IF NOT EXISTS drink_type TEXT DEFAULT 'custom';
ALTER TABLE public.drink_entries ADD COLUMN IF NOT EXISTS estimated INTEGER DEFAULT 0;
ALTER TABLE public.drink_entries ADD COLUMN IF NOT EXISTS is_manual BOOLEAN DEFAULT false;
-- Remove old manual_estimated column if it exists (cleanup):
ALTER TABLE public.drink_entries DROP COLUMN IF EXISTS manual_estimated;
ALTER TABLE public.drink_entries DISABLE ROW LEVEL SECURITY;

-- 5. Drink Settings (calculator inputs per user)
CREATE TABLE IF NOT EXISTS public.drink_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  guest_count INTEGER DEFAULT 0,
  duration INTEGER DEFAULT 4,
  crowd_type TEXT DEFAULT 'average',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.drink_settings DISABLE ROW LEVEL SECURITY;
-- 6. Checklist Categories & Items: add 'couple_id' for multi-tenancy
ALTER TABLE public.checklist_categories 
  ADD COLUMN IF NOT EXISTS couple_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.checklist_items 
  ADD COLUMN IF NOT EXISTS couple_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- Backfill: if there's only one user, assign to them, or leave NULL for now
-- (RLS is disabled anyway, but couple_id is needed for frontend filtering)

ALTER TABLE public.checklist_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items DISABLE ROW LEVEL SECURITY;
