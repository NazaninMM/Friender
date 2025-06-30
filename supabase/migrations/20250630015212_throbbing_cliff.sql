/*
  # Fix updated_at trigger handling
  
  1. Changes
    - Ensures the updated_at column exists on join_requests table
    - Creates a new handle_join_request_updated_at function instead of replacing the existing handle_updated_at function
    - Sets up proper triggers for join_requests table
    - Ensures other tables have their updated_at triggers properly set up
*/

-- First, ensure the updated_at column exists and has the correct type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'join_requests' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE join_requests ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS join_requests_updated_at ON join_requests;

-- Create a new function specifically for join_requests
CREATE OR REPLACE FUNCTION handle_join_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on join_requests table using the new function
CREATE TRIGGER join_requests_updated_at
  BEFORE UPDATE ON join_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_join_request_updated_at();

-- Ensure other tables have their updated_at triggers properly set up
-- We'll check if the triggers exist and create them if they don't

-- Activity attendees
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'activity_attendees_updated_at'
    AND tgrelid = 'activity_attendees'::regclass
  ) THEN
    CREATE TRIGGER activity_attendees_updated_at
      BEFORE UPDATE ON activity_attendees
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;

-- Join request chats
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'join_request_chats_updated_at'
    AND tgrelid = 'join_request_chats'::regclass
  ) THEN
    CREATE TRIGGER join_request_chats_updated_at
      BEFORE UPDATE ON join_request_chats
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;

-- User connections
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'user_connections_updated_at'
    AND tgrelid = 'user_connections'::regclass
  ) THEN
    CREATE TRIGGER user_connections_updated_at
      BEFORE UPDATE ON user_connections
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;

-- Activity reviews
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'activity_reviews_updated_at'
    AND tgrelid = 'activity_reviews'::regclass
  ) THEN
    CREATE TRIGGER activity_reviews_updated_at
      BEFORE UPDATE ON activity_reviews
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;

-- User preferences
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'user_preferences_updated_at'
    AND tgrelid = 'user_preferences'::regclass
  ) THEN
    CREATE TRIGGER user_preferences_updated_at
      BEFORE UPDATE ON user_preferences
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;

-- Direct messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'direct_messages_updated_at'
    AND tgrelid = 'direct_messages'::regclass
  ) THEN
    CREATE TRIGGER direct_messages_updated_at
      BEFORE UPDATE ON direct_messages
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;

-- Chat messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'chat_messages_updated_at'
    AND tgrelid = 'chat_messages'::regclass
  ) THEN
    CREATE TRIGGER chat_messages_updated_at
      BEFORE UPDATE ON chat_messages
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;

-- Activity chat messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'activity_chat_messages_updated_at'
    AND tgrelid = 'activity_chat_messages'::regclass
  ) THEN
    CREATE TRIGGER activity_chat_messages_updated_at
      BEFORE UPDATE ON activity_chat_messages
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;

-- Activity chats
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'activity_chats_updated_at'
    AND tgrelid = 'activity_chats'::regclass
  ) THEN
    CREATE TRIGGER activity_chats_updated_at
      BEFORE UPDATE ON activity_chats
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;