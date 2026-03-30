-- Add multi-tenancy reference for checklists to isolate them per-user
-- Note: Make sure to execute this in your Supabase SQL Editor

ALTER TABLE public.checklist_categories 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
