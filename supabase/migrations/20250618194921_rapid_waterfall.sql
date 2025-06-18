/*
  # Create activity attendees table

  1. New Tables
    - `activity_attendees`
      - `id` (uuid, primary key)
      - `activity_id` (uuid, references activities.id)
      - `user_id` (uuid, references users.id)
      - `status` (text, default 'joined')
      - `joined_at` (timestamp with timezone, default now)

  2. Security
    - Enable RLS on `activity_attendees` table
    - Add policies for users to manage their own attendance
    - Add policies for activity creators to see attendees

  3. Constraints
    - Unique constraint on activity_id + user_id combination
    - Valid status values
*/

-- Create activity_attendees table
CREATE TABLE IF NOT EXISTS public.activity_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'joined' CHECK (status IN ('joined', 'left', 'pending')),
  joined_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(activity_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.activity_attendees ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read attendees of activities they're part of"
  ON public.activity_attendees
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT created_by FROM public.activities WHERE id = activity_id
    )
  );

CREATE POLICY "Users can join activities"
  ON public.activity_attendees
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attendance"
  ON public.activity_attendees
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own attendance"
  ON public.activity_attendees
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Activity creators can manage attendees"
  ON public.activity_attendees
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT created_by FROM public.activities WHERE id = activity_id
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS activity_attendees_activity_id_idx ON public.activity_attendees(activity_id);
CREATE INDEX IF NOT EXISTS activity_attendees_user_id_idx ON public.activity_attendees(user_id);
CREATE INDEX IF NOT EXISTS activity_attendees_status_idx ON public.activity_attendees(status);