/*
  # Fix join_requests updated_at column issue

  1. Database Schema Fix
    - Ensure the `updated_at` column exists in the `join_requests` table
    - Create or update the trigger function for handling updated_at timestamps
    - Apply the trigger to the join_requests table

  2. Changes
    - Add `updated_at` column if it doesn't exist
    - Create/update the `handle_updated_at` function
    - Ensure the trigger is properly configured
*/

-- Ensure the updated_at column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'join_requests' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.join_requests ADD COLUMN updated_at timestamp with time zone DEFAULT now() NOT NULL;
  END IF;
END $$;

-- Create or replace the handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the existing trigger if it exists and recreate it
DROP TRIGGER IF EXISTS join_requests_updated_at ON public.join_requests;

CREATE TRIGGER join_requests_updated_at
    BEFORE UPDATE ON public.join_requests
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Update existing records to have the current timestamp if updated_at is null
UPDATE public.join_requests 
SET updated_at = created_at 
WHERE updated_at IS NULL;