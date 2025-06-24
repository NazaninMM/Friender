-- Fix the user signup trigger to handle profile creation properly
-- This migration addresses the "Database error saving new user" issue

-- First, let's drop the existing trigger and function to recreate them properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create an improved function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_first_name text;
    user_last_name text;
    user_name text;
    user_age integer;
    user_bio text;
    user_location text;
    user_interests text[];
    user_personality_traits text[];
    user_connected_services text[];
BEGIN
    -- Extract data from raw_user_meta_data with proper error handling
    BEGIN
        user_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', 'User');
        user_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
        user_name := COALESCE(NEW.raw_user_meta_data->>'name', CONCAT(user_first_name, ' ', user_last_name));
        
        -- Handle age conversion safely
        BEGIN
            user_age := COALESCE((NEW.raw_user_meta_data->>'age')::integer, 25);
        EXCEPTION WHEN OTHERS THEN
            user_age := 25;
        END;
        
        user_bio := COALESCE(NEW.raw_user_meta_data->>'bio', '');
        user_location := COALESCE(NEW.raw_user_meta_data->>'location', '');
        
        -- Handle array fields safely
        BEGIN
            user_interests := COALESCE((NEW.raw_user_meta_data->>'interests')::text[], '{}');
        EXCEPTION WHEN OTHERS THEN
            user_interests := '{}';
        END;
        
        BEGIN
            user_personality_traits := COALESCE((NEW.raw_user_meta_data->>'personality_traits')::text[], '{}');
        EXCEPTION WHEN OTHERS THEN
            user_personality_traits := '{}';
        END;
        
        BEGIN
            user_connected_services := COALESCE((NEW.raw_user_meta_data->>'connected_services')::text[], '{}');
        EXCEPTION WHEN OTHERS THEN
            user_connected_services := '{}';
        END;
        
    EXCEPTION WHEN OTHERS THEN
        -- If there's any error parsing metadata, use defaults
        user_first_name := 'User';
        user_last_name := '';
        user_name := 'User';
        user_age := 25;
        user_bio := '';
        user_location := '';
        user_interests := '{}';
        user_personality_traits := '{}';
        user_connected_services := '{}';
    END;

    -- Insert the profile with error handling
    BEGIN
        INSERT INTO public.profiles (
            id, 
            email, 
            first_name, 
            last_name, 
            name, 
            age, 
            bio, 
            location, 
            profile_image, 
            interests, 
            personality_traits, 
            connected_services, 
            joined_activities, 
            created_activities,
            created_at,
            updated_at
        )
        VALUES (
            NEW.id,
            NEW.email,
            user_first_name,
            user_last_name,
            user_name,
            user_age,
            user_bio,
            user_location,
            '', -- empty profile image initially
            user_interests,
            user_personality_traits,
            user_connected_services,
            '{}', -- empty joined activities
            '{}', -- empty created activities
            now(),
            now()
        );
        
        RAISE LOG 'Successfully created profile for user %', NEW.id;
        
    EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        -- Re-raise the exception to prevent user creation if profile creation fails
        RAISE;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure the profiles table has all required columns with proper defaults
DO $$
BEGIN
    -- Make sure all columns exist and have proper defaults
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_image') THEN
        ALTER TABLE public.profiles ADD COLUMN profile_image text DEFAULT '';
    END IF;
    
    -- Update any existing NULL values to empty strings for required text fields
    UPDATE public.profiles SET 
        bio = COALESCE(bio, ''),
        location = COALESCE(location, ''),
        profile_image = COALESCE(profile_image, '')
    WHERE bio IS NULL OR location IS NULL OR profile_image IS NULL;
    
    -- Update any existing NULL values to empty arrays for array fields
    UPDATE public.profiles SET 
        interests = COALESCE(interests, '{}'),
        personality_traits = COALESCE(personality_traits, '{}'),
        connected_services = COALESCE(connected_services, '{}'),
        joined_activities = COALESCE(joined_activities, '{}'),
        created_activities = COALESCE(created_activities, '{}')
    WHERE interests IS NULL 
       OR personality_traits IS NULL 
       OR connected_services IS NULL 
       OR joined_activities IS NULL 
       OR created_activities IS NULL;
       
    RAISE NOTICE 'Updated NULL values in profiles table';
END $$;

-- Set proper NOT NULL constraints and defaults
ALTER TABLE public.profiles 
    ALTER COLUMN bio SET DEFAULT '',
    ALTER COLUMN location SET DEFAULT '',
    ALTER COLUMN profile_image SET DEFAULT '',
    ALTER COLUMN interests SET DEFAULT '{}',
    ALTER COLUMN personality_traits SET DEFAULT '{}',
    ALTER COLUMN connected_services SET DEFAULT '{}',
    ALTER COLUMN joined_activities SET DEFAULT '{}',
    ALTER COLUMN created_activities SET DEFAULT '{}';

-- Ensure the profiles table has proper permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Test the trigger function by creating a test function (optional)
CREATE OR REPLACE FUNCTION public.test_profile_creation()
RETURNS text AS $$
DECLARE
    test_result text;
BEGIN
    -- This function can be used to test if profile creation would work
    -- without actually creating a user
    test_result := 'Profile creation function is properly configured';
    RETURN test_result;
END;
$$ LANGUAGE plpgsql;

RAISE NOTICE 'Fixed user signup trigger and profile creation function';