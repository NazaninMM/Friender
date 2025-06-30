import { supabase } from './supabase';
import { User, JoinRequest } from '../types';
import { activityService } from './database';

export interface JoinRequestChat {
  id: string;
  joinRequestId: string;
  activityId: string;
  requesterId: string;
  hostId: string;
  status: 'active' | 'closed' | 'archived';
  createdAt: Date;
  lastMessageAt: Date;
  requester: User;
  host: User;
  activity: {
    id: string;
    title: string;
  };
}

export interface JoinRequestChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  messageText: string;
  messageType: 'text' | 'system' | 'join_request' | 'approval' | 'rejection';
  metadata: any;
  createdAt: Date;
  sender: {
    id: string;
    name: string;
    profileImage: string;
  };
}

export const joinRequestService = {
  // Create a join request with chat and initial message
  async createJoinRequest(activityId: string, requesterId: string, message?: string): Promise<{
    joinRequestId: string;
    chatId: string;
    messageId: string | null;
  } | null> {
    try {
      const { data, error } = await supabase.rpc('create_join_request_with_chat', {
        p_activity_id: activityId,
        p_requester_id: requesterId,
        p_message: message || 'Hey! I\'d love to join your activity.'
      });

      if (error) {
        console.error('Error creating join request:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.error('No data returned from create_join_request_with_chat');
        return null;
      }

      const result = data[0];
      return {
        joinRequestId: result.join_request_id,
        chatId: result.chat_id,
        messageId: result.message_id,
      };
    } catch (error) {
      console.error('Error in createJoinRequest:', error);
      return null;
    }
  },

  // Get join request chats for a user (as host or requester)
  async getUserJoinRequestChats(userId: string): Promise<JoinRequestChat[]> {
    try {
      const { data, error } = await supabase
        .from('join_request_chats')
        .select(`
          *,
          requester:profiles!join_request_chats_requester_id_fkey(*),
          host:profiles!join_request_chats_host_id_fkey(*),
          activity:activities!join_request_chats_activity_id_fkey(id, title)
        `)
        .or(`requester_id.eq.${userId},host_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching join request chats:', error);
        return [];
      }

      return (data || []).map((chat: any) => ({
        id: chat.id,
        joinRequestId: chat.join_request_id,
        activityId: chat.activity_id,
        requesterId: chat.requester_id,
        hostId: chat.host_id,
        status: chat.status,
        createdAt: new Date(chat.created_at),
        lastMessageAt: new Date(chat.last_message_at),
        requester: {
          id: chat.requester.id,
          firstName: chat.requester.first_name,
          lastName: chat.requester.last_name,
          name: chat.requester.name || `${chat.requester.first_name} ${chat.requester.last_name}`,
          email: chat.requester.email,
          age: chat.requester.age,
          profileImage: chat.requester.profile_image || '',
          bio: chat.requester.bio || '',
          location: chat.requester.location || '',
          interests: chat.requester.interests || [],
          personalityTraits: chat.requester.personality_traits || [],
          joinedActivities: chat.requester.joined_activities || [],
          createdActivities: chat.requester.created_activities || [],
          connectedServices: chat.requester.connected_services || [],
        },
        host: {
          id: chat.host.id,
          firstName: chat.host.first_name,
          lastName: chat.host.last_name,
          name: chat.host.name || `${chat.host.first_name} ${chat.host.last_name}`,
          email: chat.host.email,
          age: chat.host.age,
          profileImage: chat.host.profile_image || '',
          bio: chat.host.bio || '',
          location: chat.host.location || '',
          interests: chat.host.interests || [],
          personalityTraits: chat.host.personality_traits || [],
          joinedActivities: chat.host.joined_activities || [],
          createdActivities: chat.host.created_activities || [],
          connectedServices: chat.host.connected_services || [],
        },
        activity: {
          id: chat.activity.id,
          title: chat.activity.title,
        },
      }));
    } catch (error) {
      console.error('Error in getUserJoinRequestChats:', error);
      return [];
    }
  },

  // Get messages for a join request chat
  async getChatMessages(chatId: string): Promise<JoinRequestChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('join_request_chat_messages')
        .select(`
          *,
          sender:profiles!join_request_chat_messages_sender_id_fkey(id, name, profile_image, first_name, last_name)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching chat messages:', error);
        return [];
      }

      return (data || []).map((msg: any) => ({
        id: msg.id,
        chatId: msg.chat_id,
        senderId: msg.sender_id,
        messageText: msg.message_text,
        messageType: msg.message_type,
        metadata: msg.metadata || {},
        createdAt: new Date(msg.created_at),
        sender: {
          id: msg.sender.id,
          name: msg.sender.name || `${msg.sender.first_name} ${msg.sender.last_name}`,
          profileImage: msg.sender.profile_image || '',
        },
      }));
    } catch (error) {
      console.error('Error in getChatMessages:', error);
      return [];
    }
  },

  // Send a message in a join request chat
  async sendMessage(
    chatId: string,
    senderId: string,
    messageText: string,
    messageType: 'text' | 'system' | 'join_request' | 'approval' | 'rejection' = 'text',
    metadata: any = {}
  ): Promise<JoinRequestChatMessage | null> {
    try {
      const { data, error } = await supabase
        .from('join_request_chat_messages')
        .insert({
          chat_id: chatId,
          sender_id: senderId,
          message_text: messageText,
          message_type: messageType,
          metadata,
        })
        .select(`
          *,
          sender:profiles!join_request_chat_messages_sender_id_fkey(id, name, profile_image, first_name, last_name)
        `)
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return null;
      }

      return {
        id: data.id,
        chatId: data.chat_id,
        senderId: data.sender_id,
        messageText: data.message_text,
        messageType: data.message_type,
        metadata: data.metadata || {},
        createdAt: new Date(data.created_at),
        sender: {
          id: data.sender.id,
          name: data.sender.name || `${data.sender.first_name} ${data.sender.last_name}`,
          profileImage: data.sender.profile_image || '',
        },
      };
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return null;
    }
  },

  // Approve a join request
  async approveJoinRequest(joinRequestId: string, hostId: string): Promise<boolean> {
    try {
      // First get the join request details
      const { data: joinRequestData, error: fetchError } = await supabase
        .from('join_requests')
        .select('activity_id, requester_id')
        .eq('id', joinRequestId)
        .single();

      if (fetchError || !joinRequestData) {
        console.error('Error fetching join request details:', fetchError);
        return false;
      }

      // Update join request status (let the database trigger handle updated_at)
      const { error: updateError } = await supabase
        .from('join_requests')
        .update({ status: 'approved' })
        .eq('id', joinRequestId);

      if (updateError) {
        console.error('Error updating join request:', updateError);
        return false;
      }

      // Add the requester to the activity as an attendee
      const joinResult = await activityService.joinActivity(
        joinRequestData.activity_id, 
        joinRequestData.requester_id
      );

      if (!joinResult) {
        console.error('Error adding user to activity');
        // Revert the join request status if adding to activity fails
        await supabase
          .from('join_requests')
          .update({ status: 'pending' })
          .eq('id', joinRequestId);
        return false;
      }

      // Get the chat for this join request
      const { data: chatData, error: chatError } = await supabase
        .from('join_request_chats')
        .select('id')
        .eq('join_request_id', joinRequestId)
        .single();

      if (chatError || !chatData) {
        console.error('Error fetching chat:', chatError);
        return false;
      }

      // Send approval system message
      await this.sendMessage(
        chatData.id,
        hostId,
        'Your join request has been approved! Welcome to the activity! 🎉',
        'approval'
      );

      return true;
    } catch (error) {
      console.error('Error in approveJoinRequest:', error);
      return false;
    }
  },

  // Deny a join request
  async denyJoinRequest(joinRequestId: string, hostId: string): Promise<boolean> {
    try {
      // Update join request status (let the database trigger handle updated_at)
      const { error: updateError } = await supabase
        .from('join_requests')
        .update({ status: 'rejected' })
        .eq('id', joinRequestId);

      if (updateError) {
        console.error('Error updating join request:', updateError);
        return false;
      }

      // Get the chat for this join request
      const { data: chatData, error: chatError } = await supabase
        .from('join_request_chats')
        .select('id')
        .eq('join_request_id', joinRequestId)
        .single();

      if (chatError || !chatData) {
        console.error('Error fetching chat:', chatError);
        return false;
      }

      // Send denial system message
      await this.sendMessage(
        chatData.id,
        hostId,
        'Your request was not approved at this time. Thank you for your interest!',
        'rejection'
      );

      return true;
    } catch (error) {
      console.error('Error in denyJoinRequest:', error);
      return false;
    }
  },

  // Get join request by ID
  async getJoinRequest(joinRequestId: string): Promise<JoinRequest | null> {
    try {
      const { data, error } = await supabase
        .from('join_requests')
        .select(`
          *,
          requester:profiles!join_requests_requester_id_fkey(*)
        `)
        .eq('id', joinRequestId)
        .single();

      if (error || !data) {
        console.error('Error fetching join request:', error);
        return null;
      }

      return {
        id: data.id,
        activityId: data.activity_id,
        requesterId: data.requester_id,
        requesterName: data.requester.name || `${data.requester.first_name} ${data.requester.last_name}`,
        requesterImage: data.requester.profile_image || '',
        message: data.message,
        timestamp: new Date(data.created_at),
        status: data.status,
      };
    } catch (error) {
      console.error('Error in getJoinRequest:', error);
      return null;
    }
  },

  // Check if user has pending join request for activity
  async hasPendingJoinRequest(activityId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('join_requests')
        .select('id')
        .eq('activity_id', activityId)
        .eq('requester_id', userId)
        .eq('status', 'pending')
        .maybeSingle();

      if (error) {
        console.error('Error checking pending join request:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in hasPendingJoinRequest:', error);
      return false;
    }
  },

  // Get all join requests for a user (both as requester and as host)
  async getUserJoinRequests(userId: string): Promise<JoinRequest[]> {
    try {
      // Get join requests where user is the requester
      const { data: requesterRequests, error: requesterError } = await supabase
        .from('join_requests')
        .select(`
          *,
          requester:profiles!join_requests_requester_id_fkey(*),
          activities!join_requests_activity_id_fkey(*)
        `)
        .eq('requester_id', userId)
        .order('created_at', { ascending: false });

      if (requesterError) {
        console.error('Error fetching requester join requests:', requesterError);
        return [];
      }

      // Get join requests for activities where user is the host
      const { data: hostRequests, error: hostError } = await supabase
        .from('join_requests')
        .select(`
          *,
          requester:profiles!join_requests_requester_id_fkey(*),
          activities!join_requests_activity_id_fkey(*)
        `)
        .eq('activities.created_by', userId)
        .order('created_at', { ascending: false });

      if (hostError) {
        console.error('Error fetching host join requests:', hostError);
        return [];
      }

      // Combine and transform all requests
      const allRequests = [...(requesterRequests || []), ...(hostRequests || [])];

      return allRequests.map((request: any) => ({
        id: request.id,
        activityId: request.activity_id,
        requesterId: request.requester_id,
        requesterName: request.requester.name || `${request.requester.first_name} ${request.requester.last_name}`,
        requesterImage: request.requester.profile_image || '',
        message: request.message,
        timestamp: new Date(request.created_at),
        status: request.status,
      }));
    } catch (error) {
      console.error('Error in getUserJoinRequests:', error);
      return [];
    }
  },
};