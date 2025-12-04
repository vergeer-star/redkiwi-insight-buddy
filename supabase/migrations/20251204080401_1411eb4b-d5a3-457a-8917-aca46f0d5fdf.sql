-- Add deleted_at column for soft delete functionality
ALTER TABLE public.interviews 
ADD COLUMN deleted_at timestamp with time zone DEFAULT NULL;

-- Add index for better query performance
CREATE INDEX idx_interviews_deleted_at ON public.interviews(deleted_at);