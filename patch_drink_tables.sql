-- 12. Drink Settings
CREATE TABLE IF NOT EXISTS public.drink_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  guest_count INTEGER DEFAULT 0,
  duration INTEGER DEFAULT 0,
  crowd_type TEXT DEFAULT 'average',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(couple_id)
);

-- 13. Drink Entries
CREATE TABLE IF NOT EXISTS public.drink_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  drink_type TEXT NOT NULL,
  name TEXT NOT NULL,
  unit TEXT,
  estimated INTEGER DEFAULT 0,
  acquired INTEGER DEFAULT 0,
  notes TEXT,
  is_manual BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DISABLE ROW LEVEL SECURITY TEMPORARILY
ALTER TABLE public.drink_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.drink_entries DISABLE ROW LEVEL SECURITY;
