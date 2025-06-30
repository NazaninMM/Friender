/*
  # Fix chat and join request functions

  1. Functions
    - Recreate get_or_create_direct_message function
    - Recreate create_join_request_with_chat function
    - Create update_chat_last_message_time function
  
  2. Triggers
    - Ensure all necessary triggers exist
    - Fix trigger function references
*/

-- Create the update_chat_last_message_time function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_chat_last_message_time()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.direct_messages
  SET last_message_time = NEW.created_at
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the get_or_create_direct_message function
DROP FUNCTION IF EXISTS public.get_or_create_direct_message(uuid);

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
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
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

-- Drop and recreate the create_join_request_with_chat function
DROP FUNCTION IF EXISTS public.create_join_request_with_chat(uuid, uuid, text);

CREATE OR REPLACE FUNCTION public.create_join_request_with_chat(
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
  FROM public.activities
  WHERE id = p_activity_id;

  IF v_host_id IS NULL THEN
    RAISE EXCEPTION 'Activity not found';
  END IF;

  -- Check if join request already exists
  SELECT id INTO v_join_request_id
  FROM public.join_requests
  WHERE activity_id = p_activity_id AND requester_id = p_requester_id;

  IF v_join_request_id IS NOT NULL THEN
    -- Get existing chat
    SELECT id INTO v_chat_id
    FROM public.join_request_chats
    WHERE join_request_id = v_join_request_id;
    
    RETURN QUERY SELECT v_join_request_id, v_chat_id, NULL::uuid;
    RETURN;
  END IF;

  -- Create join request
  INSERT INTO public.join_requests (activity_id, requester_id, message)
  VALUES (p_activity_id, p_requester_id, p_message)
  RETURNING id INTO v_join_request_id;

  -- Get the chat ID (created by trigger)
  SELECT id INTO v_chat_id
  FROM public.join_request_chats
  WHERE join_request_id = v_join_request_id;

  -- Create initial message
  INSERT INTO public.join_request_chat_messages (
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_or_create_direct_message(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_join_request_with_chat(uuid, uuid, text) TO authenticated;

-- Ensure the trigger for creating join request chats exists
DROP TRIGGER IF EXISTS create_join_request_chat_trigger ON public.join_requests;
CREATE TRIGGER create_join_request_chat_trigger
  AFTER INSERT ON public.join_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.create_join_request_chat();

-- Ensure the trigger for updating chat last message time exists
DROP TRIGGER IF EXISTS update_join_request_chat_last_message_trigger ON public.join_request_chat_messages;
CREATE TRIGGER update_join_request_chat_last_message_trigger
  AFTER INSERT ON public.join_request_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chat_last_message();

-- Ensure the trigger for updating direct message last message time exists
DROP TRIGGER IF EXISTS update_chat_last_message_time_trigger ON public.chat_messages;
CREATE TRIGGER update_chat_last_message_time_trigger
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chat_last_message_time();