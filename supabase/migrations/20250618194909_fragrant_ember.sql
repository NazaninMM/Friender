/*
  # Create activities table

  1. New Tables
    - `activities`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text, not null)
      - `location` (text, not null)
      - `date` (date, not null)
      - `time` (time, not null)
      - `max_attendees` (integer, not null, > 0)
      - `current_attendees` (integer, default 0)
      - `category` (text, not null)
      - `tags` (text array, default empty array)
      - `created_by` (uuid, references users.id)
      - `created_at` (timestamp with timezone, default now)
      - `updated_at` (timestamp with timezone, default now)

  2. Security
    - Enable RLS on `activities` table
    - Add policies for authenticated users to read all activities
    - Add policies for users to manage their own activities

  3. Constraints
    - Ensure max_attendees is positive
    - Ensure current_attendees doesn't exceed max_attendees
*/

-- Create activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  max_attendees integer NOT NULL CHECK (max_attendees > 0),
  current_attendees integer DEFAULT 0 CHECK (current_attendees >= 0),
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  created_by uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT valid_attendee_count CHECK (current_attendees <= max_attendees)
);

-- Enable Row Level Security
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read activities"
  ON public.activities
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create activities"
  ON public.activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own activities"
  ON public.activities
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own activities"
  ON public.activities
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create trigger for updated_at
CREATE TRIGGER activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS activities_created_by_idx ON public.activities(created_by);
CREATE INDEX IF NOT EXISTS activities_date_idx ON public.activities(date);
CREATE INDEX IF NOT EXISTS activities_location_idx ON public.activities(location);
CREATE INDEX IF NOT EXISTS activities_category_idx ON public.activities(category);
CREATE INDEX IF NOT EXISTS activities_tags_idx ON public.activities USING GIN(tags);