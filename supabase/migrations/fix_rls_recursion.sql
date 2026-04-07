-- Safest way to handle Admin RLS without infinite recursion using JWT metadata

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- aggressively drop ALL existing policies on users to clear any recursive loops
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

-- 1. All users can view their OWN profile
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 2. Admins can view ALL profiles (Checks the JWT token directly, NO database query, NO recursion)
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' 
    OR auth.jwt() ->> 'email' IN ('somendrasing019@gmail.com', 'somendrasingh019@gmail.com')
  );

-- 3. Admins can update profiles
CREATE POLICY "Admins can update users"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' 
    OR auth.jwt() ->> 'email' IN ('somendrasing019@gmail.com', 'somendrasingh019@gmail.com')
  );

-- 4. Admins can delete profiles
CREATE POLICY "Admins can delete users"
  ON public.users
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' 
    OR auth.jwt() ->> 'email' IN ('somendrasing019@gmail.com', 'somendrasingh019@gmail.com')
  );
