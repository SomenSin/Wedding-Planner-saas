-- Run this sequence in your Supabase SQL Editor to allow larger custom access codes
-- by expanding the length limit from 6 characters to 50 characters:

ALTER TABLE public.access_codes 
ALTER COLUMN code TYPE VARCHAR(50);
