/*
  # Create Direct Messages and Chat Messages Tables

  1. New Tables
    - `direct_messages` - Stores private conversations between two users
      - `id` (uuid, primary key)
      - `participant1_id` (uuid, references profiles)
      - `participant2_id` (uuid, references profiles)
      - `last_message_time` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `activity_context` (jsonb)
    - `chat_messages` - Stores individual messages in direct conversations
      - `id` (uuid, primary key)
      - `chat_id` (uuid, references direct_messages)
      - `sender_id` (uuid, references profiles)
      - `message_text` (text)
      - `message_type` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on both tables
    - Add policies for participants to read/write their own messages
*/

-- Create direct_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant2_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_time timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  activity_context jsonb DEFAULT '{}',
  CONSTRAINT direct_messages_different_participants CHECK (participant1_id != participant2_id)
);

-- Create unique constraint to prevent duplicate conversations
-- This avoids using LEAST/GREATEST functions which caused the error
CREATE UNIQUE INDEX IF NOT EXISTS direct_messages_participant1_id_participant2_id_key 
ON public.direct_messages(participant1_id, participant2_id);

CREATE UNIQUE INDEX IF NOT EXISTS direct_messages_participant2_id_participant1_id_key 
ON public.direct_messages(participant2_id, participant1_id);

-- Create chat_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES public.direct_messages(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_text text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'join_request', 'approval', 'rejection')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS direct_messages_participant1_idx ON public.direct_messages(participant1_id);
CREATE INDEX IF NOT EXISTS direct_messages_participant2_idx ON public.direct_messages(participant2_id);
CREATE INDEX IF NOT EXISTS direct_messages_last_message_time_idx ON public.direct_messages(last_message_time DESC);
CREATE INDEX IF NOT EXISTS chat_messages_chat_id_idx ON public.chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS chat_messages_sender_id_idx ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON public.chat_messages(created_at);

-- Enable RLS on tables
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for direct_messages
DROP POLICY IF EXISTS "Users can read their direct messages" ON public.direct_messages;
CREATE POLICY "Users can read their direct messages" ON public.direct_messages 
  FOR SELECT TO authenticated 
  USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

DROP POLICY IF EXISTS "Users can create direct messages" ON public.direct_messages;
CREATE POLICY "Users can create direct messages" ON public.direct_messages 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

DROP POLICY IF EXISTS "Users can update their direct messages" ON public.direct_messages;
CREATE POLICY "Users can update their direct messages" ON public.direct_messages 
  FOR UPDATE TO authenticated 
  USING (auth.uid() = participant1_id OR auth.uid() = participant2_id)
  WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- Create RLS policies for chat_messages
DROP POLICY IF EXISTS "Chat participants can read messages" ON public.chat_messages;
CREATE POLICY "Chat participants can read messages" ON public.chat_messages 
  FOR SELECT TO authenticated 
  USING (
    auth.uid() IN (SELECT participant1_id FROM public.direct_messages WHERE id = chat_id) OR 
    auth.uid() IN (SELECT participant2_id FROM public.direct_messages WHERE id = chat_id)
  );

DROP POLICY IF EXISTS "Chat participants can send messages" ON public.chat_messages;
CREATE POLICY "Chat participants can send messages" ON public.chat_messages 
  FOR INSERT TO authenticated 
  WITH CHECK (
    auth.uid() = sender_id AND
    chat_id IN (
      SELECT id FROM public.direct_messages 
      WHERE participant1_id = auth.uid() OR participant2_id = auth.uid()
    )
  );

-- Grant permissions
GRANT ALL ON public.direct_messages TO authenticated;
GRANT ALL ON public.chat_messages TO authenticated;

-- Create trigger for updated_at on direct_messages
DROP TRIGGER IF EXISTS direct_messages_updated_at ON public.direct_messages;
CREATE TRIGGER direct_messages_updated_at
  BEFORE UPDATE ON public.direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for updated_at on chat_messages
DROP TRIGGER IF EXISTS chat_messages_updated_at ON public.chat_messages;
CREATE TRIGGER chat_messages_updated_at
  BEFORE UPDATE ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to update last_message_time when a new message is added
CREATE OR REPLACE FUNCTION update_chat_last_message_time()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.direct_messages
  SET last_message_time = NEW.created_at
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update last_message_time
DROP TRIGGER IF EXISTS update_chat_last_message_time_trigger ON public.chat_messages;
CREATE TRIGGER update_chat_last_message_time_trigger
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_last_message_time();

-- Create function to get or create a direct message chat
CREATE OR REPLACE FUNCTION get_or_create_direct_message(other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  chat_id UUID;
BEGIN
  -- Get the current user ID
  current_user_id := auth.uid();
  
  -- Check if a chat already exists between these users
  SELECT id INTO chat_id
  FROM direct_messages
  WHERE (participant1_id = current_user_id AND participant2_id = other_user_id)
     OR (participant1_id = other_user_id AND participant2_id = current_user_id)
  LIMIT 1;
  
  -- If no chat exists, create one
  IF chat_id IS NULL THEN
    INSERT INTO direct_messages (participant1_id, participant2_id)
    VALUES (current_user_id, other_user_id)
    RETURNING id INTO chat_id;
  END IF;
  
  RETURN chat_id;
END;
$$;