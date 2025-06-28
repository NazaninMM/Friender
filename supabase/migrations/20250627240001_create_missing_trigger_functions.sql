/*
  # Create Missing Trigger Functions

  This migration creates the trigger functions that are referenced in the previous migration
  but might not exist yet.
*/

-- Function to create join request chat automatically
CREATE OR REPLACE FUNCTION public.create_join_request_chat()
RETURNS TRIGGER AS $$
DECLARE
  host_user_id uuid;
BEGIN
  -- Get the host user ID from the activity
  SELECT created_by INTO host_user_id
  FROM public.activities
  WHERE id = NEW.activity_id;

  -- Create the chat
  INSERT INTO public.join_request_chats (
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

-- Function to update chat last message time
CREATE OR REPLACE FUNCTION public.update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.join_request_chats
  SET last_message_at = NEW.created_at
  WHERE id = NEW.chat_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update direct message chat last message time
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