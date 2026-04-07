-- Safely deletes any "zombie" user credential from auth.users 
-- that does not have a corresponding row in public.users.
-- This cleans up accounts that were deleted from the dashboard BEFORE you added the trigger.

DELETE FROM auth.users 
WHERE id NOT IN (SELECT id FROM public.users);
