-- Add excluded column to interviews table
ALTER TABLE public.interviews 
ADD COLUMN excluded boolean NOT NULL DEFAULT false;

-- Add index for better performance when filtering
CREATE INDEX idx_interviews_excluded ON public.interviews(excluded);