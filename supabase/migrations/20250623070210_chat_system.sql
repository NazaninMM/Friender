-- Create chat system tables
-- This migration sets up the direct messaging and chat functionality

-- Create direct_messages table to store chat sessions between two users
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant2_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_context jsonb, -- Optional context for activity-related chats
  last_message_time timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Ensure participants are different users
  CONSTRAINT direct_messages_different_participants CHECK (participant1_id != participant2_id),
  
  -- Ensure unique chat between any two users (order doesn't matter)
  CONSTRAINT direct_messages_unique_participants UNIQUE (
    LEAST(participant1_id, participant2_id),
    GREATEST(participant1_id, participant2_id)
  )
);

-- Create chat_messages table to store individual messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES public.direct_messages(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_text text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'join_request', 'approval', 'denial')),
  metadata jsonb, -- For additional message data like activity context, etc.
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS direct_messages_participant1_idx ON public.direct_messages(participant1_id);
CREATE INDEX IF NOT EXISTS direct_messages_participant2_idx ON public.direct_messages(participant2_id);
CREATE INDEX IF NOT EXISTS direct_messages_last_message_time_idx ON public.direct_messages(last_message_time DESC);
CREATE INDEX IF NOT EXISTS chat_messages_chat_id_idx ON public.chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS chat_messages_sender_id_idx ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON public.chat_messages(created_at);

-- Enable Row Level Security
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for direct_messages
CREATE POLICY "Users can read their direct message chats"
  ON public.direct_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can create direct message chats"
  ON public.direct_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can update their direct message chats"
  ON public.direct_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- Create RLS policies for chat_messages
CREATE POLICY "Users can read messages in their chats"
  ON public.chat_messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT participant1_id FROM public.direct_messages WHERE id = chat_id
      UNION
      SELECT participant2_id FROM public.direct_messages WHERE id = chat_id
    )
  );

CREATE POLICY "Users can send messages in their chats"
  ON public.chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    auth.uid() IN (
      SELECT participant1_id FROM public.direct_messages WHERE id = chat_id
      UNION
      SELECT participant2_id FROM public.direct_messages WHERE id = chat_id
    )
  );

-- Create function to update last_message_time when a new message is added
CREATE OR REPLACE FUNCTION public.update_chat_last_message_time()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.direct_messages 
  SET last_message_time = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update last_message_time
CREATE TRIGGER update_chat_last_message_time_trigger
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chat_last_message_time();

-- Create function to get or create a direct message chat between two users
CREATE OR REPLACE FUNCTION public.get_or_create_direct_message(
  other_user_id uuid
)
RETURNS uuid AS $$
DECLARE
  current_user_id uuid;
  chat_id uuid;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Check if chat already exists (in either direction)
  SELECT id INTO chat_id
  FROM public.direct_messages
  WHERE (participant1_id = current_user_id AND participant2_id = other_user_id)
     OR (participant1_id = other_user_id AND participant2_id = current_user_id);
  
  -- If chat doesn't exist, create it
  IF chat_id IS NULL THEN
    INSERT INTO public.direct_messages (participant1_id, participant2_id)
    VALUES (LEAST(current_user_id, other_user_id), GREATEST(current_user_id, other_user_id))
    RETURNING id INTO chat_id;
  END IF;
  
  RETURN chat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON public.direct_messages TO authenticated;
GRANT ALL ON public.chat_messages TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_direct_message TO authenticated; 