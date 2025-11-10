-- Create table for storing interview messages/conversations
CREATE TABLE public.interview_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.interview_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for viewing interview messages
CREATE POLICY "Anyone can view interview messages" 
ON public.interview_messages 
FOR SELECT 
USING (true);

-- Create policy for inserting interview messages
CREATE POLICY "Anyone can insert interview messages" 
ON public.interview_messages 
FOR INSERT 
WITH CHECK (true);

-- Create policy for updating interview messages
CREATE POLICY "Anyone can update interview messages" 
ON public.interview_messages 
FOR UPDATE 
USING (true);

-- Create index for better query performance
CREATE INDEX idx_interview_messages_interview_id ON public.interview_messages(interview_id);
CREATE INDEX idx_interview_messages_timestamp ON public.interview_messages(timestamp);

-- Add comment for documentation
COMMENT ON TABLE public.interview_messages IS 'Stores all messages exchanged during AI interviews';