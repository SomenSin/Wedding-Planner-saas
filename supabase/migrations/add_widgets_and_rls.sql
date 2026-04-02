-- 1. Add widgets column to dashboard_modules
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dashboard_modules' AND column_name='widgets') THEN
        ALTER TABLE public.dashboard_modules ADD COLUMN widgets JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- 2. Define RLS Policies for dashboard_modules

-- Ensure RLS is enabled
ALTER TABLE public.dashboard_modules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid duplicates
DROP POLICY IF EXISTS "Public modules are viewable by all authenticated users" ON public.dashboard_modules;
DROP POLICY IF EXISTS "Admins can manage all modules" ON public.dashboard_modules;

-- Policy: Authenticated users can view modules (needed for dashboard rendering)
CREATE POLICY "Public modules are viewable by all authenticated users"
  ON public.dashboard_modules
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: super_admins can perform all actions (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage all modules"
  ON public.dashboard_modules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE public.users.id = auth.uid()
      AND public.users.role = 'super_admin'
    )
  );
