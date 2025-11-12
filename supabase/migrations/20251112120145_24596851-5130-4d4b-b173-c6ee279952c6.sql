-- Drop all existing policies on interviews table
DROP POLICY IF EXISTS "Anonymous users can insert interviews" ON public.interviews;
DROP POLICY IF EXISTS "System can update interviews" ON public.interviews;
DROP POLICY IF EXISTS "Redkiwi employees can view interviews" ON public.interviews;

-- Create new PERMISSIVE policies (explicitly)
CREATE POLICY "Anonymous users can insert interviews"
ON public.interviews
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can update interviews"
ON public.interviews
AS PERMISSIVE
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Redkiwi employees can view interviews"
ON public.interviews
AS PERMISSIVE
FOR SELECT
USING (is_redkiwi_employee(auth.uid()));