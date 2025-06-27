/*
  # Add updated_at column to activity_attendees table

  1. Changes
    - Add `updated_at` column to `activity_attendees` table
    - Set default value to `now()`
    - Set existing records to use `joined_at` as initial value

  2. Security
    - No RLS changes needed as this is just adding a timestamp column
*/

-- Add updated_at column to activity_attendees table
ALTER TABLE public.activity_attendees 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Update existing records to have updated_at set to joined_at
UPDATE public.activity_attendees 
SET updated_at = joined_at 
WHERE updated_at IS NULL;