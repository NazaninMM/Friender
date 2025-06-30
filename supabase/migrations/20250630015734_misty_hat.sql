/*
  # Fix join_requests updated_at field

  1. Schema Updates
    - Ensure updated_at column exists on join_requests table
    - Add trigger to automatically update updated_at field
    - Ensure proper indexing

  2. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

-- Ensure the updated_at column exists (safe to run multiple times)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'join_requests' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE join_requests ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Ensure we have a trigger function for updating updated_at
CREATE OR REPLACE FUNCTION handle_join_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists and recreate it
DROP TRIGGER IF EXISTS join_requests_updated_at ON join_requests;

CREATE TRIGGER join_requests_updated_at
  BEFORE UPDATE ON join_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_join_request_updated_at();

-- Add index for updated_at if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'join_requests' AND indexname = 'join_requests_updated_at_idx'
  ) THEN
    CREATE INDEX join_requests_updated_at_idx ON join_requests(updated_at);
  END IF;
END $$;