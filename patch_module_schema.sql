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
