/*
  # Update RLS policies for existing profiles table

  This migration:
  1. Sets up proper RLS policies for existing `profiles` table
  2. Disables RLS for all other tables as requested
  3. Updates foreign key references to point to `profiles` instead of `users` (if needed)
*/

-- Enable Row Level Security on profiles table (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow users to view their OWN profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read other users' public data" ON public.profiles;
DROP POLICY IF EXISTS "Public user profile discovery" ON public.profiles;

-- Create policies for profiles table
CREATE POLICY "Allow users to view their OWN profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can create their own profile"
  ON public.profiles
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create function to update updated_at timestamp for profiles (if not exists)
CREATE OR REPLACE FUNCTION public.handle_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles updated_at (if not exists)
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profiles_updated_at();

-- Create indexes for profiles table (if not exist)
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_location_idx ON public.profiles(location);
CREATE INDEX IF NOT EXISTS profiles_interests_idx ON public.profiles USING GIN(interests);

-- Disable RLS for tables that exist (with conditional checks)
DO $$
BEGIN
  -- Disable RLS on activities table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activities' AND table_schema = 'public') THEN
    ALTER TABLE public.activities DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$
BEGIN
  -- Disable RLS on activity_attendees table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_attendees' AND table_schema = 'public') THEN
    ALTER TABLE public.activity_attendees DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$
BEGIN
  -- Disable RLS on join_requests table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'join_requests' AND table_schema = 'public') THEN
    ALTER TABLE public.join_requests DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$
BEGIN
  -- Disable RLS on user_spotify_tracks table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_spotify_tracks' AND table_schema = 'public') THEN
    ALTER TABLE public.user_spotify_tracks DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$
BEGIN
  -- Disable RLS on user_spotify_artists table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_spotify_artists' AND table_schema = 'public') THEN
    ALTER TABLE public.user_spotify_artists DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$
BEGIN
  -- Disable RLS on user_music_analysis table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_music_analysis' AND table_schema = 'public') THEN
    ALTER TABLE public.user_music_analysis DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop all existing policies from tables that exist
DO $$
BEGIN
  -- Drop policies from activities table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activities' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Anyone can read activities" ON public.activities;
    DROP POLICY IF EXISTS "Users can create activities" ON public.activities;
    DROP POLICY IF EXISTS "Users can update own activities" ON public.activities;
    DROP POLICY IF EXISTS "Users can delete own activities" ON public.activities;
    DROP POLICY IF EXISTS "Public activity discovery" ON public.activities;
  END IF;
END $$;

DO $$
BEGIN
  -- Drop policies from activity_attendees table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_attendees' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Users can read attendees of activities they're part of" ON public.activity_attendees;
    DROP POLICY IF EXISTS "Users can join activities" ON public.activity_attendees;
    DROP POLICY IF EXISTS "Users can update their own attendance" ON public.activity_attendees;
    DROP POLICY IF EXISTS "Users can remove their own attendance" ON public.activity_attendees;
    DROP POLICY IF EXISTS "Activity creators can manage attendees" ON public.activity_attendees;
  END IF;
END $$;

DO $$
BEGIN
  -- Drop policies from join_requests table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'join_requests' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Users can read their own join requests" ON public.join_requests;
    DROP POLICY IF EXISTS "Activity creators can read requests for their activities" ON public.join_requests;
    DROP POLICY IF EXISTS "Users can create join requests" ON public.join_requests;
    DROP POLICY IF EXISTS "Users can update their own join requests" ON public.join_requests;
    DROP POLICY IF EXISTS "Activity creators can update requests for their activities" ON public.join_requests;
    DROP POLICY IF EXISTS "Users can delete their own join requests" ON public.join_requests;
  END IF;
END $$;

DO $$
BEGIN
  -- Drop policies from user_spotify_tracks table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_spotify_tracks' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Users can manage their own spotify tracks" ON public.user_spotify_tracks;
    DROP POLICY IF EXISTS "Users can read other users' spotify tracks for matching" ON public.user_spotify_tracks;
  END IF;
END $$;

DO $$
BEGIN
  -- Drop policies from user_spotify_artists table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_spotify_artists' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Users can manage their own spotify artists" ON public.user_spotify_artists;
    DROP POLICY IF EXISTS "Users can read other users' spotify artists for matching" ON public.user_spotify_artists;
  END IF;
END $$;

DO $$
BEGIN
  -- Drop policies from user_music_analysis table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_music_analysis' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Users can manage their own music analysis" ON public.user_music_analysis;
    DROP POLICY IF EXISTS "Users can read other users' music analysis for matching" ON public.user_music_analysis;
  END IF;
END $$;

-- Drop policies from users table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can read other users' public data" ON public.users;
    DROP POLICY IF EXISTS "Public user profile discovery" ON public.users;
  END IF;
END $$;

-- Check if foreign key references need to be updated
-- This section will only run if the tables reference users instead of profiles

-- Check if activities table references users table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'activities_created_by_fkey' 
    AND table_name = 'activities'
    AND constraint_type = 'FOREIGN KEY'
  ) THEN
    -- Update activities table to reference profiles
    ALTER TABLE public.activities 
    DROP CONSTRAINT IF EXISTS activities_created_by_fkey;

    ALTER TABLE public.activities 
    ADD CONSTRAINT activities_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Check if activity_attendees table references users table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'activity_attendees_user_id_fkey' 
    AND table_name = 'activity_attendees'
    AND constraint_type = 'FOREIGN KEY'
  ) THEN
    -- Update activity_attendees table to reference profiles
    ALTER TABLE public.activity_attendees 
    DROP CONSTRAINT IF EXISTS activity_attendees_user_id_fkey;

    ALTER TABLE public.activity_attendees 
    ADD CONSTRAINT activity_attendees_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Check if join_requests table references users table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'join_requests_requester_id_fkey' 
    AND table_name = 'join_requests'
    AND constraint_type = 'FOREIGN KEY'
  ) THEN
    -- Update join_requests table to reference profiles
    ALTER TABLE public.join_requests 
    DROP CONSTRAINT IF EXISTS join_requests_requester_id_fkey;

    ALTER TABLE public.join_requests 
    ADD CONSTRAINT join_requests_requester_id_fkey 
    FOREIGN KEY (requester_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Check if Spotify tables reference users table (only if they exist)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_spotify_tracks_user_id_fkey' 
    AND table_name = 'user_spotify_tracks'
    AND constraint_type = 'FOREIGN KEY'
  ) THEN
    -- Update user_spotify_tracks table to reference profiles
    ALTER TABLE public.user_spotify_tracks 
    DROP CONSTRAINT IF EXISTS user_spotify_tracks_user_id_fkey;

    ALTER TABLE public.user_spotify_tracks 
    ADD CONSTRAINT user_spotify_tracks_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_spotify_artists_user_id_fkey' 
    AND table_name = 'user_spotify_artists'
    AND constraint_type = 'FOREIGN KEY'
  ) THEN
    -- Update user_spotify_artists table to reference profiles
    ALTER TABLE public.user_spotify_artists 
    DROP CONSTRAINT IF EXISTS user_spotify_artists_user_id_fkey;

    ALTER TABLE public.user_spotify_artists 
    ADD CONSTRAINT user_spotify_artists_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_music_analysis_user_id_fkey' 
    AND table_name = 'user_music_analysis'
    AND constraint_type = 'FOREIGN KEY'
  ) THEN
    -- Update user_music_analysis table to reference profiles
    ALTER TABLE public.user_music_analysis 
    DROP CONSTRAINT IF EXISTS user_music_analysis_user_id_fkey;

    ALTER TABLE public.user_music_analysis 
    ADD CONSTRAINT user_music_analysis_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$; 