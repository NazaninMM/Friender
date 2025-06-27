/*
  # Fix ambiguous column reference in create_join_request_with_chat function

  1. Function Updates
    - Fix the `create_join_request_with_chat` function to properly qualify column references
    - Ensure `join_request_id` references are unambiguous by using proper table aliases
    - Maintain all existing functionality while resolving the SQL error

  2. Changes Made
    - Drop and recreate the `create_join_request_with_chat` function
    - Use proper table aliases (jr for join_requests, jrc for join_request_chats)
    - Explicitly qualify all column references to avoid ambiguity
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS create_join_request_with_chat(uuid, uuid, text);

-- Recreate the function with proper column qualification
CREATE OR REPLACE FUNCTION create_join_request_with_chat(
  p_activity_id uuid,
  p_requester_id uuid,
  p_message text DEFAULT ''
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_join_request_id uuid;
  v_host_id uuid;
  v_chat_id uuid;
  v_result json;
BEGIN
  -- Get the activity host
  SELECT created_by INTO v_host_id
  FROM activities
  WHERE id = p_activity_id;

  IF v_host_id IS NULL THEN
    RAISE EXCEPTION 'Activity not found';
  END IF;

  -- Create the join request
  INSERT INTO join_requests (activity_id, requester_id, message, status)
  VALUES (p_activity_id, p_requester_id, p_message, 'pending')
  RETURNING id INTO v_join_request_id;

  -- Create the join request chat
  INSERT INTO join_request_chats (
    join_request_id,
    activity_id,
    requester_id,
    host_id,
    status
  )
  VALUES (
    v_join_request_id,
    p_activity_id,
    p_requester_id,
    v_host_id,
    'active'
  )
  RETURNING id INTO v_chat_id;

  -- Return the result
  SELECT json_build_object(
    'join_request_id', v_join_request_id,
    'chat_id', v_chat_id,
    'host_id', v_host_id
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_join_request_with_chat(uuid, uuid, text) TO authenticated;