-- Fix security issue: Drop overly permissive UPDATE policies on interviews table
-- Updates will only be allowed through edge functions using service role key

-- Drop the permissive UPDATE policy that allows anyone to update interviews
DROP POLICY IF EXISTS "Anyone can update interviews" ON public.interviews;
DROP POLICY IF EXISTS "System can update interviews" ON public.interviews;

-- Drop the permissive UPDATE policy on interview_messages
DROP POLICY IF EXISTS "System can update messages" ON public.interview_messages;

-- Drop the permissive UPDATE policy on interview_transcriptions
DROP POLICY IF EXISTS "System can update transcriptions" ON public.interview_transcriptions;

-- No new UPDATE policies - all updates must go through edge functions with service role key