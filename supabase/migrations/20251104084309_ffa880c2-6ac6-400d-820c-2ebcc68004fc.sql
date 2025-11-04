-- Create interviews table to store interview session data
CREATE TABLE public.interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  avatar_name TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  language TEXT,
  status TEXT NOT NULL DEFAULT 'started',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert interviews (public access)
CREATE POLICY "Anyone can insert interviews" 
ON public.interviews 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow anyone to update their own interview session
CREATE POLICY "Anyone can update interviews" 
ON public.interviews 
FOR UPDATE 
USING (true);

-- Create policy to allow anyone to view interviews
CREATE POLICY "Anyone can view interviews" 
ON public.interviews 
FOR SELECT 
USING (true);

-- Create index for better query performance
CREATE INDEX idx_interviews_session_id ON public.interviews(session_id);
CREATE INDEX idx_interviews_started_at ON public.interviews(started_at DESC);