-- Drop the existing restrictive policy for anonymous inserts
DROP POLICY IF EXISTS "Anonymous users can insert interviews" ON public.interviews;

-- Create a new PERMISSIVE policy that allows anonymous users to insert interviews
CREATE POLICY "Anonymous users can insert interviews"
ON public.interviews
FOR INSERT
TO anon
WITH CHECK (true);

-- Also ensure the policy for updates works for anonymous users
DROP POLICY IF EXISTS "System can update interviews" ON public.interviews;

CREATE POLICY "System can update interviews"
ON public.interviews
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);