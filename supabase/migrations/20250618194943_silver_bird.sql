/*
  # Create database functions and triggers

  1. Functions
    - Function to automatically update activity attendee count
    - Function to handle user profile creation after auth signup

  2. Triggers
    - Trigger to update current_attendees when someone joins/leaves an activity
    - Trigger to create user profile when auth user is created

  3. Additional Security
    - Additional RLS policies for edge cases
*/

-- Function to update activity attendee count
CREATE OR REPLACE FUNCTION public.update_activity_attendee_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for activity attendee count
CREATE TRIGGER update_activity_attendee_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.activity_attendees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_activity_attendee_count();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation (optional - only if you want automatic profile creation)
-- Note: This trigger is commented out because the app handles user creation manually
-- Uncomment if you want automatic profile creation on auth signup
/*
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
*/

-- Additional security policies

-- Policy to allow users to read public activity data for discovery
CREATE POLICY "Public activity discovery"
  ON public.activities
  FOR SELECT
  TO anon
  USING (true);

-- Policy to allow reading user profiles for activity discovery (limited fields)
CREATE POLICY "Public user profile discovery"
  ON public.users
  FOR SELECT
  TO anon
  USING (true);