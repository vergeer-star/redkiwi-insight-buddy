-- Create table for interview transcriptions
CREATE TABLE public.interview_transcriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  audio_url TEXT,
  transcription_text TEXT NOT NULL,
  segments JSONB,
  timestamps JSONB,
  confidence FLOAT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interview_transcriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Redkiwi employees can view transcriptions"
  ON public.interview_transcriptions
  FOR SELECT
  USING (is_redkiwi_employee(auth.uid()));

CREATE POLICY "System can insert transcriptions"
  ON public.interview_transcriptions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update transcriptions"
  ON public.interview_transcriptions
  FOR UPDATE
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_interview_transcriptions_updated_at
  BEFORE UPDATE ON public.interview_transcriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster lookups
CREATE INDEX idx_interview_transcriptions_interview_id 
  ON public.interview_transcriptions(interview_id);