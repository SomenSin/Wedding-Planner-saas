-- 1. Add the is_blocked column if it doesn't already exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_blocked') THEN
        ALTER TABLE public.users ADD COLUMN is_blocked BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 2. Force Supabase API to reload its schema cache to immediately recognize the new column
NOTIFY pgrst, 'reload schema';
