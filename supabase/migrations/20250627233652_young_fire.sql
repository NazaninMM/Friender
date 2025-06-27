/*
  # Fix activity_attendees updated_at field error

  1. Changes
    - Ensure updated_at column exists on activity_attendees table
    - Add proper updated_at trigger for activity_attendees
    - Remove any conflicting triggers

  2. Security
    - Maintain existing RLS policies
*/

-- Ensure the updated_at column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'activity_attendees' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE activity_attendees ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Drop any existing problematic triggers
DROP TRIGGER IF EXISTS activity_attendees_updated_at ON activity_attendees;

-- Create the proper updated_at trigger
CREATE TRIGGER activity_attendees_updated_at
  BEFORE UPDATE ON activity_attendees
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();