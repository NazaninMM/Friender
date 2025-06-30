-- First, ensure the updated_at column exists and has the correct type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'join_requests' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE join_requests ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS join_requests_updated_at ON join_requests;

-- Create a new updated_at trigger function specifically for join_requests
CREATE OR REPLACE FUNCTION handle_join_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on join_requests table using the new function
CREATE TRIGGER join_requests_updated_at
  BEFORE UPDATE ON join_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_join_request_updated_at();

-- Fix the join_request_service.ts file to handle the error properly
-- This is a comment only - the actual fix will be in the TypeScript file