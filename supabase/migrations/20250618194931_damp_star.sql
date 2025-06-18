/*
  # Create join requests table

  1. New Tables
    - `join_requests`
      - `id` (uuid, primary key)
      - `activity_id` (uuid, references activities.id)
      - `requester_id` (uuid, references users.id)
      - `message` (text, not null)
      - `status` (text, default 'pending')
      - `created_at` (timestamp with timezone, default now)
      - `updated_at` (timestamp with timezone, default now)

  2. Security
    - Enable RLS on `join_requests` table
    - Add policies for users to manage their own requests
    - Add policies for activity creators to manage requests for their activities

  3. Constraints
    - Unique constraint on activity_id + requester_id combination
    - Valid status values
*/

-- Create join_requests table
CREATE TABLE IF NOT EXISTS public.join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
  requester_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(activity_id, requester_id)
);

-- Enable Row Level Security
ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own join requests"
  ON public.join_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = requester_id);

CREATE POLICY "Activity creators can read requests for their activities"
  ON public.join_requests
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT created_by FROM public.activities WHERE id = activity_id
    )
  );

CREATE POLICY "Users can create join requests"
  ON public.join_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their own join requests"
  ON public.join_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = requester_id)
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Activity creators can update requests for their activities"
  ON public.join_requests
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT created_by FROM public.activities WHERE id = activity_id
    )
  );

CREATE POLICY "Users can delete their own join requests"
  ON public.join_requests
  FOR DELETE
  TO authenticated
  USING (auth.uid() = requester_id);

-- Create trigger for updated_at
CREATE TRIGGER join_requests_updated_at
  BEFORE UPDATE ON public.join_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS join_requests_activity_id_idx ON public.join_requests(activity_id);
CREATE INDEX IF NOT EXISTS join_requests_requester_id_idx ON public.join_requests(requester_id);
CREATE INDEX IF NOT EXISTS join_requests_status_idx ON public.join_requests(status);