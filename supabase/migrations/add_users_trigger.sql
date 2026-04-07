-- Function to automatically handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  assigned_role TEXT;
BEGIN
  -- Extract role from metadata, default to 'couple'
  assigned_role := COALESCE(new.raw_user_meta_data->>'role', 'couple');
  
  -- Map 'admin' from frontend metadata to 'super_admin' to match table schema constraints
  IF assigned_role = 'admin' THEN
     assigned_role := 'super_admin';
  END IF;

  -- Ensure Somendra's emails are always super_admin just in case
  IF new.email = 'somendrasing019@gmail.com' OR new.email = 'somendrasingh019@gmail.com' THEN
     assigned_role := 'super_admin';
  END IF;

  INSERT INTO public.users (id, email, role)
  VALUES (
    new.id, 
    new.email, 
    assigned_role
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to fire on every new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Backfill missing users from auth.users to public.users (run once to fix existing accounts)
INSERT INTO public.users (id, email, role)
SELECT 
  id, 
  email, 
  CASE 
    WHEN email IN ('somendrasing019@gmail.com', 'somendrasingh019@gmail.com') THEN 'super_admin'
    WHEN raw_user_meta_data->>'role' = 'admin' THEN 'super_admin'
    ELSE 'couple'
  END as role
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);
