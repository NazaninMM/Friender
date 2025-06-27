/*
  # Fix activity_attendees updated_at field issue

  1. Changes
    - Ensure updated_at column exists with proper default
    - Fix the trigger function to handle both INSERT and UPDATE operations
    - Update the trigger to work correctly with INSERT operations

  2. Security
    - Maintains existing RLS policies
    - No changes to security model
*/

-- Ensure the updated_at column exists with proper default
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'activity_attendees' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE activity_attendees ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Update the column to have proper default if it exists but doesn't have default
ALTER TABLE activity_attendees ALTER COLUMN updated_at SET DEFAULT now();

-- Ensure the updated_at column is not null for existing records
UPDATE activity_attendees SET updated_at = joined_at WHERE updated_at IS NULL;

-- Make sure the column is not nullable
ALTER TABLE activity_attendees ALTER COLUMN updated_at SET NOT NULL;

-- Create or replace the handle_updated_at function to work with both INSERT and UPDATE
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  -- For INSERT operations, set updated_at to now() if not already set
  IF TG_OP = 'INSERT' THEN
    IF NEW.updated_at IS NULL THEN
      NEW.updated_at = now();
    END IF;
    RETURN NEW;
  END IF;
  
  -- For UPDATE operations, always update the timestamp
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at = now();
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger to handle both INSERT and UPDATE
DROP TRIGGER IF EXISTS activity_attendees_updated_at ON activity_attendees;

CREATE TRIGGER activity_attendees_updated_at
  BEFORE INSERT OR UPDATE ON activity_attendees
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();