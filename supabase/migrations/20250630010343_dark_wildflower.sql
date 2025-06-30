/*
  # Fix join_requests updated_at trigger issue

  1. Changes
    - Add updated_at column to join_requests table if it doesn't exist
    - Create or replace the handle_updated_at function
    - Create or replace the trigger for join_requests table
    - Update existing records to have proper updated_at values
*/

-- Add updated_at column to public.join_requests table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'join_requests' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.join_requests ADD COLUMN updated_at timestamp with time zone DEFAULT now() NOT NULL;
    END IF;
EXCEPTION
    WHEN duplicate_column THEN 
        RAISE NOTICE 'column updated_at already exists in public.join_requests.';
END $$;

-- Create or replace the function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger for public.join_requests table
DROP TRIGGER IF EXISTS join_requests_updated_at ON public.join_requests;
CREATE TRIGGER join_requests_updated_at
BEFORE UPDATE ON public.join_requests
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Update existing records to have proper updated_at values
UPDATE public.join_requests 
SET updated_at = created_at 
WHERE updated_at IS NULL OR updated_at < created_at;