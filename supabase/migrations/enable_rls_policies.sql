-- Multi-tenancy Row Level Security (RLS) Policies
-- This ensures that couples can only see and modify their own wedding planning data.

-- 1. HELPERS & GLOBAL POLICIES
-- Add user_id to checklist_categories if missing (was in patch_multi_tenancy.sql but re-asserting here)
ALTER TABLE public.checklist_categories ADD COLUMN IF NOT EXISTS couple_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- 2. GUESTS
DROP POLICY IF EXISTS "Couples can manage their own guests" ON public.guests;
CREATE POLICY "Couples can manage their own guests" 
ON public.guests FOR ALL 
TO authenticated 
USING (couple_id = auth.uid()) 
WITH CHECK (couple_id = auth.uid());

-- 3. BUDGET ITEMS
DROP POLICY IF EXISTS "Couples can manage their own budget" ON public.budget_items;
CREATE POLICY "Couples can manage their own budget" 
ON public.budget_items FOR ALL 
TO authenticated 
USING (couple_id = auth.uid()) 
WITH CHECK (couple_id = auth.uid());

-- 4. REGISTRY ITEMS
DROP POLICY IF EXISTS "Couples can manage their own registry" ON public.registry_items;
CREATE POLICY "Couples can manage their own registry" 
ON public.registry_items FOR ALL 
TO authenticated 
USING (couple_id = auth.uid()) 
WITH CHECK (couple_id = auth.uid());

-- 5. LOGISTICS TASKS
DROP POLICY IF EXISTS "Couples can manage their own tasks" ON public.logistics_tasks;
CREATE POLICY "Couples can manage their own tasks" 
ON public.logistics_tasks FOR ALL 
TO authenticated 
USING (couple_id = auth.uid()) 
WITH CHECK (couple_id = auth.uid());

-- 6. ITINERARY ITEMS
DROP POLICY IF EXISTS "Couples can manage their own itinerary" ON public.itinerary_items;
CREATE POLICY "Couples can manage their own itinerary" 
ON public.itinerary_items FOR ALL 
TO authenticated 
USING (couple_id = auth.uid()) 
WITH CHECK (couple_id = auth.uid());

-- 7. VENDORS
DROP POLICY IF EXISTS "Couples can manage their own vendors" ON public.vendors;
CREATE POLICY "Couples can manage their own vendors" 
ON public.vendors FOR ALL 
TO authenticated 
USING (couple_id = auth.uid()) 
WITH CHECK (couple_id = auth.uid());

-- 8. CHECKLIST CATEGORIES
DROP POLICY IF EXISTS "Couples can manage their own checklist categories" ON public.checklist_categories;
CREATE POLICY "Couples can manage their own checklist categories" 
ON public.checklist_categories FOR ALL 
TO authenticated 
USING (couple_id = auth.uid()) 
WITH CHECK (couple_id = auth.uid());

-- 9. CHECKLIST ITEMS (Via JOIN)
-- For items, we join to the category to check ownership
DROP POLICY IF EXISTS "Couples can manage their own checklist items" ON public.checklist_items;
CREATE POLICY "Couples can manage their own checklist items" 
ON public.checklist_items FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.checklist_categories 
    WHERE public.checklist_categories.id = public.checklist_items.category_id 
    AND public.checklist_categories.couple_id = auth.uid()
  )
);

-- 10. DRINK SETTINGS
DROP POLICY IF EXISTS "Couples can manage their own drink settings" ON public.drink_settings;
CREATE POLICY "Couples can manage their own drink settings" 
ON public.drink_settings FOR ALL 
TO authenticated 
USING (couple_id = auth.uid()) 
WITH CHECK (couple_id = auth.uid());

-- 11. DRINK ENTRIES
DROP POLICY IF EXISTS "Couples can manage their own drink entries" ON public.drink_entries;
CREATE POLICY "Couples can manage their own drink entries" 
ON public.drink_entries FOR ALL 
TO authenticated 
USING (couple_id = auth.uid()) 
WITH CHECK (couple_id = auth.uid());

-- 12. USER FEEDBACK
DROP POLICY IF EXISTS "Users can only see their own feedback" ON public.user_feedback;
CREATE POLICY "Users can only see their own feedback" 
ON public.user_feedback FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can submit feedback" ON public.user_feedback;
CREATE POLICY "Users can submit feedback" 
ON public.user_feedback FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- 13. USERS TABLE
DROP POLICY IF EXISTS "Users can see their own profile" ON public.users;
CREATE POLICY "Users can see their own profile" 
ON public.users FOR SELECT 
TO authenticated 
USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" 
ON public.users FOR UPDATE 
TO authenticated 
USING (id = auth.uid());

-- 14. ADMIN POLICIES
-- Admins can see all feedback
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.user_feedback;
CREATE POLICY "Admins can view all feedback" 
ON public.user_feedback FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);
