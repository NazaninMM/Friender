-- Fix authentication schema by consolidating profiles and users tables
-- This migration ensures we have a single, properly structured profiles table

-- First, let's check what tables exist and their structure
DO $$
BEGIN
    -- If users table exists and profiles doesn't, rename users to profiles
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        ALTER TABLE public.users RENAME TO profiles;
        RAISE NOTICE 'Renamed users table to profiles';
    END IF;
END $$;

-- Ensure profiles table has all necessary columns
DO $$
BEGIN
    -- Add missing columns to profiles table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'name') THEN
        ALTER TABLE public.profiles ADD COLUMN name text;
        RAISE NOTICE 'Added name column to profiles';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'joined_activities') THEN
        ALTER TABLE public.profiles ADD COLUMN joined_activities uuid[] DEFAULT '{}';
        RAISE NOTICE 'Added joined_activities column to profiles';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_activities') THEN
        ALTER TABLE public.profiles ADD COLUMN created_activities uuid[] DEFAULT '{}';
        RAISE NOTICE 'Added created_activities column to profiles';
    END IF;
    
    -- Update name column if it's null but we have first_name and last_name
    UPDATE public.profiles 
    SET name = CONCAT(first_name, ' ', last_name) 
    WHERE name IS NULL AND first_name IS NOT NULL AND last_name IS NOT NULL;
    
    RAISE NOTICE 'Updated name column with concatenated first_name and last_name';
END $$;

-- Drop the users table if it still exists (after ensuring profiles has all data)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        -- Copy any data from users to profiles if needed
        INSERT INTO public.profiles (id, email, first_name, last_name, age, bio, location, profile_image, interests, personality_traits, connected_services, created_at, updated_at)
        SELECT id, email, first_name, last_name, age, bio, location, profile_image, interests, personality_traits, connected_services, created_at, updated_at
        FROM public.users
        ON CONFLICT (id) DO NOTHING;
        
        DROP TABLE public.users;
        RAISE NOTICE 'Dropped users table after copying data to profiles';
    END IF;
END $$;

-- Ensure profiles table has proper constraints
ALTER TABLE public.profiles 
    ALTER COLUMN id SET NOT NULL,
    ALTER COLUMN email SET NOT NULL,
    ALTER COLUMN first_name SET NOT NULL,
    ALTER COLUMN last_name SET NOT NULL,
    ALTER COLUMN age SET NOT NULL,
    ALTER COLUMN age ADD CONSTRAINT profiles_age_check CHECK (age > 0 AND age < 150),
    ALTER COLUMN bio SET DEFAULT '',
    ALTER COLUMN location SET DEFAULT '',
    ALTER COLUMN interests SET DEFAULT '{}',
    ALTER COLUMN personality_traits SET DEFAULT '{}',
    ALTER COLUMN connected_services SET DEFAULT '{}',
    ALTER COLUMN joined_activities SET DEFAULT '{}',
    ALTER COLUMN created_activities SET DEFAULT '{}',
    ALTER COLUMN created_at SET DEFAULT now(),
    ALTER COLUMN updated_at SET DEFAULT now();

-- Add unique constraint on email if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_email_key' AND table_name = 'profiles') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
        RAISE NOTICE 'Added unique constraint on email';
    END IF;
END $$;

-- Ensure foreign key to auth.users exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_id_fkey' AND table_name = 'profiles') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint to auth.users';
    END IF;
END $$;

-- Enable Row Level Security on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow users to view their OWN profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read other users' public data" ON public.profiles;
DROP POLICY IF EXISTS "Public user profile discovery" ON public.profiles;

-- Create comprehensive RLS policies for profiles table
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read other users' public data"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true); -- Allow reading other profiles for discovery/matching

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles updated_at
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profiles_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_location_idx ON public.profiles(location);
CREATE INDEX IF NOT EXISTS profiles_interests_idx ON public.profiles USING GIN(interests);
CREATE INDEX IF NOT EXISTS profiles_personality_traits_idx ON public.profiles USING GIN(personality_traits);

-- Create a function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, name, age, bio, location, profile_image, interests, personality_traits, connected_services, joined_activities, created_activities)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'name', CONCAT(COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'), ' ', COALESCE(NEW.raw_user_meta_data->>'last_name', ''))),
    COALESCE((NEW.raw_user_meta_data->>'age')::integer, 25),
    COALESCE(NEW.raw_user_meta_data->>'bio', ''),
    COALESCE(NEW.raw_user_meta_data->>'location', ''),
    COALESCE(NEW.raw_user_meta_data->>'profile_image', ''),
    COALESCE(NEW.raw_user_meta_data->>'interests', '[]')::text[],
    COALESCE(NEW.raw_user_meta_data->>'personality_traits', '[]')::text[],
    COALESCE(NEW.raw_user_meta_data->>'connected_services', '[]')::text[],
    '{}',
    '{}'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update all foreign key references to point to profiles table
DO $$
BEGIN
    -- Update activities table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activities' AND table_schema = 'public') THEN
        -- Drop existing foreign key if it points to users
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'activities_created_by_fkey' AND table_name = 'activities') THEN
            ALTER TABLE public.activities DROP CONSTRAINT activities_created_by_fkey;
        END IF;
        
        -- Add foreign key to profiles
        ALTER TABLE public.activities ADD CONSTRAINT activities_created_by_fkey 
            FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    
    -- Update activity_attendees table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_attendees' AND table_schema = 'public') THEN
        -- Drop existing foreign keys if they point to users
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'activity_attendees_user_id_fkey' AND table_name = 'activity_attendees') THEN
            ALTER TABLE public.activity_attendees DROP CONSTRAINT activity_attendees_user_id_fkey;
        END IF;
        
        -- Add foreign key to profiles
        ALTER TABLE public.activity_attendees ADD CONSTRAINT activity_attendees_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    
    -- Update join_requests table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'join_requests' AND table_schema = 'public') THEN
        -- Drop existing foreign keys if they point to users
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'join_requests_requester_id_fkey' AND table_name = 'join_requests') THEN
            ALTER TABLE public.join_requests DROP CONSTRAINT join_requests_requester_id_fkey;
        END IF;
        
        -- Add foreign key to profiles
        ALTER TABLE public.join_requests ADD CONSTRAINT join_requests_requester_id_fkey 
            FOREIGN KEY (requester_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    
    -- Update direct_messages table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'direct_messages' AND table_schema = 'public') THEN
        -- Drop existing foreign keys if they point to users
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'direct_messages_participant1_id_fkey' AND table_name = 'direct_messages') THEN
            ALTER TABLE public.direct_messages DROP CONSTRAINT direct_messages_participant1_id_fkey;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'direct_messages_participant2_id_fkey' AND table_name = 'direct_messages') THEN
            ALTER TABLE public.direct_messages DROP CONSTRAINT direct_messages_participant2_id_fkey;
        END IF;
        
        -- Add foreign keys to profiles
        ALTER TABLE public.direct_messages ADD CONSTRAINT direct_messages_participant1_id_fkey 
            FOREIGN KEY (participant1_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
        ALTER TABLE public.direct_messages ADD CONSTRAINT direct_messages_participant2_id_fkey 
            FOREIGN KEY (participant2_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    
    -- Update chat_messages table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages' AND table_schema = 'public') THEN
        -- Drop existing foreign keys if they point to users
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'chat_messages_sender_id_fkey' AND table_name = 'chat_messages') THEN
            ALTER TABLE public.chat_messages DROP CONSTRAINT chat_messages_sender_id_fkey;
        END IF;
        
        -- Add foreign key to profiles
        ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_sender_id_fkey 
            FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.activities TO authenticated;
GRANT ALL ON public.activity_attendees TO authenticated;
GRANT ALL ON public.join_requests TO authenticated;
GRANT ALL ON public.direct_messages TO authenticated;
GRANT ALL ON public.chat_messages TO authenticated;
GRANT ALL ON public.user_spotify_tracks TO authenticated;
GRANT ALL ON public.user_spotify_artists TO authenticated;
GRANT ALL ON public.user_music_analysis TO authenticated;

-- Enable RLS on all tables
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_spotify_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_spotify_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_music_analysis ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for other tables (you can customize these later)
CREATE POLICY "Anyone can read activities" ON public.activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create activities" ON public.activities FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own activities" ON public.activities FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own activities" ON public.activities FOR DELETE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "Users can read activity attendees" ON public.activity_attendees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join activities" ON public.activity_attendees FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own attendance" ON public.activity_attendees FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can read join requests" ON public.join_requests FOR SELECT TO authenticated USING (auth.uid() = requester_id OR auth.uid() IN (SELECT created_by FROM public.activities WHERE id = activity_id));
CREATE POLICY "Users can create join requests" ON public.join_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update own requests" ON public.join_requests FOR UPDATE TO authenticated USING (auth.uid() = requester_id);

CREATE POLICY "Users can read their direct messages" ON public.direct_messages FOR SELECT TO authenticated USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);
CREATE POLICY "Users can create direct messages" ON public.direct_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can read chat messages" ON public.chat_messages FOR SELECT TO authenticated USING (auth.uid() IN (SELECT participant1_id FROM public.direct_messages WHERE id = chat_id) OR auth.uid() IN (SELECT participant2_id FROM public.direct_messages WHERE id = chat_id));
CREATE POLICY "Users can send chat messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

-- Spotify-related policies
CREATE POLICY "Users can manage their own spotify data" ON public.user_spotify_tracks FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own spotify data" ON public.user_spotify_artists FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own music analysis" ON public.user_music_analysis FOR ALL TO authenticated USING (auth.uid() = user_id); 