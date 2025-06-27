/*
  # Complete Join Activity Schema

  1. Tables
    - Ensures all required tables exist with proper structure
    - Sets up proper relationships and constraints
    - Enables RLS with appropriate policies

  2. Security
    - Row Level Security enabled on all tables
    - Policies for join requests, chats, and messages
    - Proper access control for hosts and requesters

  3. Functions
    - Database functions for complex operations
    - Triggers for automatic updates
*/

-- Ensure join_requests table exists with proper structure
CREATE TABLE IF NOT EXISTS join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message text DEFAULT 'Hey! I''d love to join your activity.' NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(activity_id, requester_id)
);

-- Ensure join_request_chats table exists
CREATE TABLE IF NOT EXISTS join_request_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  join_request_id uuid NOT NULL REFERENCES join_requests(id) ON DELETE CASCADE UNIQUE,
  activity_id uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  host_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  last_message_at timestamptz DEFAULT now()
);

-- Ensure join_request_chat_messages table exists
CREATE TABLE IF NOT EXISTS join_request_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES join_request_chats(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_text text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'join_request', 'approval', 'rejection')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS join_requests_activity_id_idx ON join_requests(activity_id);
CREATE INDEX IF NOT EXISTS join_requests_requester_id_idx ON join_requests(requester_id);
CREATE INDEX IF NOT EXISTS join_requests_status_idx ON join_requests(status);
CREATE INDEX IF NOT EXISTS join_requests_pending_idx ON join_requests(activity_id, created_at) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS join_request_chats_join_request_id_idx ON join_request_chats(join_request_id);
CREATE INDEX IF NOT EXISTS join_request_chats_activity_id_idx ON join_request_chats(activity_id);
CREATE INDEX IF NOT EXISTS join_request_chats_requester_idx ON join_request_chats(requester_id);
CREATE INDEX IF NOT EXISTS join_request_chats_host_idx ON join_request_chats(host_id);
CREATE INDEX IF NOT EXISTS join_request_chats_last_message_idx ON join_request_chats(last_message_at DESC);

CREATE INDEX IF NOT EXISTS join_request_chat_messages_chat_id_idx ON join_request_chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS join_request_chat_messages_sender_idx ON join_request_chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS join_request_chat_messages_created_at_idx ON join_request_chat_messages(created_at DESC);

-- Enable RLS
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_request_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_request_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for join_requests
DROP POLICY IF EXISTS "Users can create join requests" ON join_requests;
CREATE POLICY "Users can create join requests"
  ON join_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Users can read join requests" ON join_requests;
CREATE POLICY "Users can read join requests"
  ON join_requests FOR SELECT
  TO authenticated
  USING (
    auth.uid() = requester_id OR 
    auth.uid() IN (
      SELECT created_by FROM activities WHERE id = activity_id
    )
  );

DROP POLICY IF EXISTS "Users can update own requests" ON join_requests;
CREATE POLICY "Users can update own requests"
  ON join_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Hosts can update join requests" ON join_requests;
CREATE POLICY "Hosts can update join requests"
  ON join_requests FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT created_by FROM activities WHERE id = activity_id
    )
  );

-- RLS Policies for join_request_chats
DROP POLICY IF EXISTS "Join request participants can create chats" ON join_request_chats;
CREATE POLICY "Join request participants can create chats"
  ON join_request_chats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id OR auth.uid() = host_id);

DROP POLICY IF EXISTS "Join request participants can view chats" ON join_request_chats;
CREATE POLICY "Join request participants can view chats"
  ON join_request_chats FOR SELECT
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = host_id);

DROP POLICY IF EXISTS "Join request participants can update chats" ON join_request_chats;
CREATE POLICY "Join request participants can update chats"
  ON join_request_chats FOR UPDATE
  TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = host_id);

-- RLS Policies for join_request_chat_messages
DROP POLICY IF EXISTS "Join request participants can send messages" ON join_request_chat_messages;
CREATE POLICY "Join request participants can send messages"
  ON join_request_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    chat_id IN (
      SELECT id FROM join_request_chats 
      WHERE requester_id = auth.uid() OR host_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Join request participants can view messages" ON join_request_chat_messages;
CREATE POLICY "Join request participants can view messages"
  ON join_request_chat_messages FOR SELECT
  TO authenticated
  USING (
    chat_id IN (
      SELECT id FROM join_request_chats 
      WHERE requester_id = auth.uid() OR host_id = auth.uid()
    )
  );

-- Function to create join request chat automatically
CREATE OR REPLACE FUNCTION create_join_request_chat()
RETURNS TRIGGER AS $$
DECLARE
  host_user_id uuid;
BEGIN
  -- Get the host user ID from the activity
  SELECT created_by INTO host_user_id
  FROM activities
  WHERE id = NEW.activity_id;

  -- Create the chat
  INSERT INTO join_request_chats (
    join_request_id,
    activity_id,
    requester_id,
    host_id
  ) VALUES (
    NEW.id,
    NEW.activity_id,
    NEW.requester_id,
    host_user_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle join request status changes
CREATE OR REPLACE FUNCTION handle_join_request_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If request was approved, add to activity_attendees
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    INSERT INTO activity_attendees (
      activity_id,
      user_id,
      status,
      joined_at
    ) VALUES (
      NEW.activity_id,
      NEW.requester_id,
      'joined',
      now()
    ) ON CONFLICT (activity_id, user_id) DO NOTHING;

    -- Update activity current_attendees count
    UPDATE activities 
    SET current_attendees = current_attendees + 1
    WHERE id = NEW.activity_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update chat last message time
CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE join_request_chats
  SET last_message_at = NEW.created_at
  WHERE id = NEW.chat_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS create_join_request_chat_trigger ON join_requests;
CREATE TRIGGER create_join_request_chat_trigger
  AFTER INSERT ON join_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_join_request_chat();

DROP TRIGGER IF EXISTS handle_join_request_status_change_trigger ON join_requests;
CREATE TRIGGER handle_join_request_status_change_trigger
  AFTER UPDATE ON join_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_join_request_status_change();

DROP TRIGGER IF EXISTS update_join_request_chat_last_message_trigger ON join_request_chat_messages;
CREATE TRIGGER update_join_request_chat_last_message_trigger
  AFTER INSERT ON join_request_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_last_message();

-- Function to create join request with chat and initial message
CREATE OR REPLACE FUNCTION create_join_request_with_chat(
  p_activity_id uuid,
  p_requester_id uuid,
  p_message text DEFAULT 'Hey! I''d love to join your activity.'
)
RETURNS TABLE (
  join_request_id uuid,
  chat_id uuid,
  message_id uuid
) AS $$
DECLARE
  v_join_request_id uuid;
  v_chat_id uuid;
  v_message_id uuid;
  v_host_id uuid;
BEGIN
  -- Get host ID
  SELECT created_by INTO v_host_id
  FROM activities
  WHERE id = p_activity_id;

  IF v_host_id IS NULL THEN
    RAISE EXCEPTION 'Activity not found';
  END IF;

  -- Check if join request already exists
  SELECT id INTO v_join_request_id
  FROM join_requests
  WHERE activity_id = p_activity_id AND requester_id = p_requester_id;

  IF v_join_request_id IS NOT NULL THEN
    -- Get existing chat
    SELECT id INTO v_chat_id
    FROM join_request_chats
    WHERE join_request_id = v_join_request_id;
    
    RETURN QUERY SELECT v_join_request_id, v_chat_id, NULL::uuid;
    RETURN;
  END IF;

  -- Create join request
  INSERT INTO join_requests (activity_id, requester_id, message)
  VALUES (p_activity_id, p_requester_id, p_message)
  RETURNING id INTO v_join_request_id;

  -- Get the chat ID (created by trigger)
  SELECT id INTO v_chat_id
  FROM join_request_chats
  WHERE join_request_id = v_join_request_id;

  -- Create initial message
  INSERT INTO join_request_chat_messages (
    chat_id,
    sender_id,
    message_text,
    message_type
  ) VALUES (
    v_chat_id,
    p_requester_id,
    p_message,
    'join_request'
  ) RETURNING id INTO v_message_id;

  RETURN QUERY SELECT v_join_request_id, v_chat_id, v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;