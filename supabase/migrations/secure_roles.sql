-- Secure Role Management
-- This ensures roles are assigned by the database, not by the frontend.

-- 1. Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Default role is always 'couple'
  NEW.role := 'couple';
  
  -- Upgrade to 'super_admin' only for specific verified emails
  IF NEW.email IN (
    'somendrasingh019@gmail.com'
  ) THEN
    NEW.role := 'super_admin';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS on_user_signup_set_role ON public.users;
CREATE TRIGGER on_user_signup_set_role
  BEFORE INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- 3. Audit existing roles (Security Reset)
-- Demote everyone except known admins
UPDATE public.users 
SET role = 'couple' 
WHERE email NOT IN (
  'somendrasingh019@gmail.com'
);

-- 4. Ensure admins stay admins
UPDATE public.users 
SET role = 'super_admin' 
WHERE email IN (
  'somendrasingh019@gmail.com'
);
