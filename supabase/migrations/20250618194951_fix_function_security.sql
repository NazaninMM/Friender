/*
  # Fix Function Security Warnings

  This migration addresses the Supabase Database Linter warnings about
  function search paths being mutable. We'll add explicit search_path
  parameters to all functions for better security.
*/

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, age)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'age')::integer, 25)
  );
  RETURN NEW;
END;
$$;

-- Fix handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_activity_attendee_count function
CREATE OR REPLACE FUNCTION public.update_activity_attendee_count()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'joined' THEN
    UPDATE public.activities 
    SET current_attendees = current_attendees + 1 
    WHERE id = NEW.activity_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'joined' AND NEW.status = 'joined' THEN
      UPDATE public.activities 
      SET current_attendees = current_attendees + 1 
      WHERE id = NEW.activity_id;
    ELSIF OLD.status = 'joined' AND NEW.status != 'joined' THEN
      UPDATE public.activities 
      SET current_attendees = current_attendees - 1 
      WHERE id = NEW.activity_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'joined' THEN
    UPDATE public.activities 
    SET current_attendees = current_attendees - 1 
    WHERE id = OLD.activity_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Fix handle_spotify_updated_at function (from our Spotify migration)
CREATE OR REPLACE FUNCTION public.handle_spotify_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$; 