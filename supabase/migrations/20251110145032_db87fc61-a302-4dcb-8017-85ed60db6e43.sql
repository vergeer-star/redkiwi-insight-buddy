-- Add analysis fields to interviews table
ALTER TABLE public.interviews
ADD COLUMN sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
ADD COLUMN themes TEXT[], -- Array of themes detected
ADD COLUMN summary TEXT, -- AI-generated summary
ADD COLUMN analyzed_at TIMESTAMP WITH TIME ZONE; -- When analysis was performed

-- Create index for better query performance on sentiment
CREATE INDEX idx_interviews_sentiment ON public.interviews(sentiment);
CREATE INDEX idx_interviews_analyzed_at ON public.interviews(analyzed_at);

-- Add comment for documentation
COMMENT ON COLUMN public.interviews.sentiment IS 'Overall sentiment of the interview: positive, neutral, or negative';
COMMENT ON COLUMN public.interviews.themes IS 'Array of themes detected in the interview (e.g., innovatie, design, toegankelijkheid)';
COMMENT ON COLUMN public.interviews.summary IS 'AI-generated summary of the interview';
COMMENT ON COLUMN public.interviews.analyzed_at IS 'Timestamp when the interview was analyzed';