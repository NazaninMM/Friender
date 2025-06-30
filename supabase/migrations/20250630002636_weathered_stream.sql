/*
  # Fix Ambiguous Column Reference in Join Request Function

  This migration fixes the ambiguous column reference error in the 
  create_join_request_with_chat function by properly qualifying all column names.
*/

-- Drop and recreate the create_join_request_with_chat function with proper column qualification
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
  SELECT a.created_by INTO v_host_id
  FROM public.activities a
  WHERE a.id = p_activity_id;

  IF v_host_id IS NULL THEN
    RAISE EXCEPTION 'Activity not found';
  END IF;

  -- Check if join request already exists
  SELECT jr.id INTO v_join_request_id
  FROM public.join_requests jr
  WHERE jr.activity_id = p_activity_id AND jr.requester_id = p_requester_id;

  IF v_join_request_id IS NOT NULL THEN
    -- Get existing chat
    SELECT jrc.id INTO v_chat_id
    FROM public.join_request_chats jrc
    WHERE jrc.join_request_id = v_join_request_id;
    
    RETURN QUERY SELECT v_join_request_id, v_chat_id, NULL::uuid;
    RETURN;
  END IF;

  -- Create join request
  INSERT INTO public.join_requests (activity_id, requester_id, message)
  VALUES (p_activity_id, p_requester_id, p_message)
  RETURNING id INTO v_join_request_id;

  -- Get the chat ID (created by trigger)
  SELECT jrc.id INTO v_chat_id
  FROM public.join_request_chats jrc
  WHERE jrc.join_request_id = v_join_request_id;

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
GRANT EXECUTE ON FUNCTION public.create_join_request_with_chat(uuid, uuid, text) TO authenticated;