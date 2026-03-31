-- ==========================================
-- 🛠️ RENAME MODULE: LOGISTICS -> ITINERARY
-- ==========================================
-- This script updates the labels for the logistics module in the dashboard_modules table.

-- 1. Rename 'logistics' to 'Itinerary'
UPDATE public.dashboard_modules
SET label = 'Itinerary'
WHERE name = 'logistics';

-- verify the change
SELECT * FROM public.dashboard_modules WHERE name = 'logistics';
