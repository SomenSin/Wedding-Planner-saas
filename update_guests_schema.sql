-- Run this script in the Supabase SQL Editor to add the missing columns to your guests table.

-- 1. Add missing UI fields to guests table
ALTER TABLE public.guests 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS save_the_date_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS invite_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'accepted', 'declined')),
ADD COLUMN IF NOT EXISTS party_size INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS table_number TEXT,
ADD COLUMN IF NOT EXISTS menu_choice TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT;

-- 2. Optional: migrate existing names assuming they were logged inside first_name
UPDATE public.guests
SET name = first_name || ' ' || last_name
WHERE name IS NULL;
