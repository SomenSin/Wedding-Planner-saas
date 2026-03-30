-- Complete Supabase Schema for VowVantage
-- Run this ENTIRE file in the Supabase SQL Editor to set up all your tables.

-- 1. Users table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'couple' CHECK (role IN ('super_admin', 'couple')),
  wedding_name TEXT,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Access Codes
CREATE TABLE IF NOT EXISTS public.access_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  linked_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  code VARCHAR(50) UNIQUE NOT NULL,
  event_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Guests table
CREATE TABLE IF NOT EXISTS public.guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  save_the_date_sent BOOLEAN DEFAULT FALSE,
  invite_sent BOOLEAN DEFAULT FALSE,
  rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'accepted', 'declined')),
  party_size INTEGER DEFAULT 1,
  table_number TEXT,
  menu_choice TEXT DEFAULT 'none',
  dietary_restrictions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Budget Items
CREATE TABLE IF NOT EXISTS public.budget_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  estimated_cost DECIMAL(12,2) DEFAULT 0,
  actual_cost DECIMAL(12,2) DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Registry Items
CREATE TABLE IF NOT EXISTS public.registry_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  price DECIMAL(12,2),
  url TEXT,
  is_purchased BOOLEAN DEFAULT FALSE,
  purchased_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Logistics Tasks
CREATE TABLE IF NOT EXISTS public.logistics_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Itinerary Items
CREATE TABLE IF NOT EXISTS public.itinerary_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Vendors
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  status TEXT DEFAULT 'hired',
  cost DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Checklists
CREATE TABLE IF NOT EXISTS public.checklist_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.checklist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.checklist_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Dashboard Modules
CREATE TABLE IF NOT EXISTS public.dashboard_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  "order" INTEGER DEFAULT 0
);

-- 11. User Feedback
CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'new',
  type TEXT DEFAULT 'bug' CHECK (type IN ('bug', 'feature', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- DISABLE ROW LEVEL SECURITY TEMPORARILY
-- To prevent access block issues during setup
-- ==========================================
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.registry_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback DISABLE ROW LEVEL SECURITY;
