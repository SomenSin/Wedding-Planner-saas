-- Function to automatically delete the base authentication credential when a profile is deleted
CREATE OR REPLACE FUNCTION public.delete_user_from_auth()
RETURNS trigger AS $$
BEGIN
  -- We use SECURITY DEFINER so this function executes with superuser privileges.
  -- Only attempt to delete if the row still exists in auth.users to prevent loops
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = OLD.id) THEN
     DELETE FROM auth.users WHERE id = OLD.id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on the public.users table
DROP TRIGGER IF EXISTS on_public_user_deleted ON public.users;
CREATE TRIGGER on_public_user_deleted
  AFTER DELETE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.delete_user_from_auth();
