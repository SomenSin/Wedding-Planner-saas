# Database Schema for VowVantage

-- Users table (Extends Supabase Auth)
-- role: 'super_admin' | 'couple'
CREATE TABLE public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'couple' CHECK (role IN ('super_admin', 'couple')),
  wedding_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Access Codes (For Guest View)
CREATE TABLE public.custom_access_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  code VARCHAR(6) UNIQUE NOT NULL,
  event_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guests table
CREATE TABLE public.guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined')),
  guest_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budget Items
CREATE TABLE public.budget_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  estimated_cost DECIMAL(12,2) DEFAULT 0,
  actual_cost DECIMAL(12,2) DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gifts / Registry
CREATE TABLE public.gifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  price DECIMAL(12,2),
  url TEXT,
  is_purchased BOOLEAN DEFAULT FALSE,
  purchased_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Feedback
CREATE TABLE public.user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  type TEXT DEFAULT 'bug' CHECK (type IN ('bug', 'feature', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (Simplified Example)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);

ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Couples can manage their guests" ON public.guests FOR ALL USING (auth.uid() = couple_id);
