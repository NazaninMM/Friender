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

-- Create or replace the updated_at trigger function
-- Instead of dropping it first, we'll just replace it
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on join_requests table
CREATE TRIGGER join_requests_updated_at
  BEFORE UPDATE ON join_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Also ensure other tables that use this trigger have it properly set up
-- Drop and recreate triggers for other tables that might have the same issue

-- Activity attendees
DROP TRIGGER IF EXISTS activity_attendees_updated_at ON activity_attendees;
CREATE TRIGGER activity_attendees_updated_at
  BEFORE UPDATE ON activity_attendees
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Join request chats
DROP TRIGGER IF EXISTS join_request_chats_updated_at ON join_request_chats;
CREATE TRIGGER join_request_chats_updated_at
  BEFORE UPDATE ON join_request_chats
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- User connections
DROP TRIGGER IF EXISTS user_connections_updated_at ON user_connections;
CREATE TRIGGER user_connections_updated_at
  BEFORE UPDATE ON user_connections
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Activity reviews
DROP TRIGGER IF EXISTS activity_reviews_updated_at ON activity_reviews;
CREATE TRIGGER activity_reviews_updated_at
  BEFORE UPDATE ON activity_reviews
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- User preferences
DROP TRIGGER IF EXISTS user_preferences_updated_at ON user_preferences;
CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Direct messages
DROP TRIGGER IF EXISTS direct_messages_updated_at ON direct_messages;
CREATE TRIGGER direct_messages_updated_at
  BEFORE UPDATE ON direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Chat messages
DROP TRIGGER IF EXISTS chat_messages_updated_at ON chat_messages;
CREATE TRIGGER chat_messages_updated_at
  BEFORE UPDATE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Activity chat messages
DROP TRIGGER IF EXISTS activity_chat_messages_updated_at ON activity_chat_messages;
CREATE TRIGGER activity_chat_messages_updated_at
  BEFORE UPDATE ON activity_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Activity chats
DROP TRIGGER IF EXISTS activity_chats_updated_at ON activity_chats;
CREATE TRIGGER activity_chats_updated_at
  BEFORE UPDATE ON activity_chats
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();