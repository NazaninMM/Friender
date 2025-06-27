import { supabase } from './supabase';
import { ChatMessage, DirectMessageChat, User } from '../types';

export interface ChatService {
  // Get all chats for the current user
  getUserChats(): Promise<DirectMessageChat[]>;
  
  // Get or create a chat between two users
  getOrCreateChat(otherUserId: string): Promise<string>;
  
  // Get messages for a specific chat
  getChatMessages(chatId: string): Promise<ChatMessage[]>;
  
  // Send a message
  sendMessage(chatId: string, message: string, messageType?: string, metadata?: any): Promise<ChatMessage>;
  
  // Subscribe to real-time messages
  subscribeToMessages(chatId: string, callback: (message: ChatMessage) => void): () => void;
  
  // Subscribe to chat updates
  subscribeToChatUpdates(callback: (chat: DirectMessageChat) => void): () => void;
}

class ChatServiceImpl implements ChatService {
  async getUserChats(): Promise<DirectMessageChat[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get all direct message chats for the current user
      const { data: chats, error } = await supabase
        .from('direct_messages')
        .select(`
          *,
          participant1:profiles!direct_messages_participant1_id_fkey(*),
          participant2:profiles!direct_messages_participant2_id_fkey(*)
        `)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order('last_message_time', { ascending: false });

      if (error) throw error;

      // Transform the data to match our types and load messages for each chat
      const chatPromises = (chats || []).map(async (chat: any) => {
        const otherParticipant = chat.participant1_id === user.id 
          ? chat.participant2 
          : chat.participant1;
        
        // Load messages for this chat
        const messages = await this.getChatMessages(chat.id);
        
        return {
          id: chat.id,
          participants: [
            {
              id: chat.participant1.id,
              firstName: chat.participant1.first_name,
              lastName: chat.participant1.last_name,
              name: chat.participant1.name,
              email: chat.participant1.email,
              age: chat.participant1.age,
              profileImage: chat.participant1.profile_image || '',
              bio: chat.participant1.bio || '',
              location: chat.participant1.location || '',
              interests: chat.participant1.interests || [],
              personalityTraits: chat.participant1.personality_traits || [],
              joinedActivities: chat.participant1.joined_activities || [],
              createdActivities: chat.participant1.created_activities || [],
              connectedServices: chat.participant1.connected_services || [],
            },
            {
              id: chat.participant2.id,
              firstName: chat.participant2.first_name,
              lastName: chat.participant2.last_name,
              name: chat.participant2.name,
              email: chat.participant2.email,
              age: chat.participant2.age,
              profileImage: chat.participant2.profile_image || '',
              bio: chat.participant2.bio || '',
              location: chat.participant2.location || '',
              interests: chat.participant2.interests || [],
              personalityTraits: chat.participant2.personality_traits || [],
              joinedActivities: chat.participant2.joined_activities || [],
              createdActivities: chat.participant2.created_activities || [],
              connectedServices: chat.participant2.connected_services || [],
            }
          ] as [User, User],
          messages: messages,
          lastMessage: messages.length > 0 ? messages[messages.length - 1] : undefined,
          lastMessageTime: new Date(chat.last_message_time),
          activityContext: chat.activity_context,
        };
      });

      return Promise.all(chatPromises);
    } catch (error) {
      console.error('Error fetching user chats:', error);
      throw error;
    }
  }

  async getOrCreateChat(otherUserId: string): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Use the database function to get or create chat
      const { data, error } = await supabase
        .rpc('get_or_create_direct_message', {
          other_user_id: otherUserId
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting or creating chat:', error);
      throw error;
    }
  }

  async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    try {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles!chat_messages_sender_id_fkey(*)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (messages || []).map((msg: any) => ({
        id: msg.id,
        userId: msg.sender_id,
        userName: msg.sender.name,
        userImage: msg.sender.profile_image || '',
        message: msg.message_text,
        timestamp: new Date(msg.created_at),
        type: msg.message_type as any,
        metadata: msg.metadata,
      }));
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  }

  async sendMessage(chatId: string, message: string, messageType: string = 'text', metadata?: any): Promise<ChatMessage> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          message_text: message,
          message_type: messageType,
          metadata: metadata || null,
        })
        .select(`
          *,
          sender:profiles!chat_messages_sender_id_fkey(*)
        `)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.sender_id,
        userName: data.sender.name,
        userImage: data.sender.profile_image || '',
        message: data.message_text,
        timestamp: new Date(data.created_at),
        type: data.message_type as any,
        metadata: data.metadata,
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  subscribeToMessages(chatId: string, callback: (message: ChatMessage) => void): () => void {
    const subscription = supabase
      .channel(`chat_messages:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload: any) => {
          try {
            // Fetch the complete message with sender info
            const { data: message, error } = await supabase
              .from('chat_messages')
              .select(`
                *,
                sender:profiles!chat_messages_sender_id_fkey(*)
              `)
              .eq('id', payload.new.id)
              .single();

            if (error || !message) return;

            const chatMessage: ChatMessage = {
              id: message.id,
              userId: message.sender_id,
              userName: message.sender.name,
              userImage: message.sender.profile_image || '',
              message: message.message_text,
              timestamp: new Date(message.created_at),
              type: message.message_type as any,
              metadata: message.metadata,
            };

            callback(chatMessage);
          } catch (error) {
            console.error('Error processing real-time message:', error);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  subscribeToChatUpdates(callback: (chat: DirectMessageChat) => void): () => void {
    const { data: { user } } = supabase.auth.getUser();
    if (!user) return () => {};

    const subscription = supabase
      .channel(`user_chats:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'direct_messages',
          filter: `participant1_id=eq.${user.id},participant2_id=eq.${user.id}`,
        },
        async (payload: any) => {
          try {
            // Fetch the updated chat with participant info
            const { data: chat, error } = await supabase
              .from('direct_messages')
              .select(`
                *,
                participant1:profiles!direct_messages_participant1_id_fkey(*),
                participant2:profiles!direct_messages_participant2_id_fkey(*)
              `)
              .eq('id', payload.new.id)
              .single();

            if (error || !chat) return;

            const otherParticipant = chat.participant1_id === user.id 
              ? chat.participant2 
              : chat.participant1;

            const directMessageChat: DirectMessageChat = {
              id: chat.id,
              participants: [
                {
                  id: chat.participant1.id,
                  firstName: chat.participant1.first_name,
                  lastName: chat.participant1.last_name,
                  name: chat.participant1.name,
                  email: chat.participant1.email,
                  age: chat.participant1.age,
                  profileImage: chat.participant1.profile_image || '',
                  bio: chat.participant1.bio || '',
                  location: chat.participant1.location || '',
                  interests: chat.participant1.interests || [],
                  personalityTraits: chat.participant1.personality_traits || [],
                  joinedActivities: chat.participant1.joined_activities || [],
                  createdActivities: chat.participant1.created_activities || [],
                  connectedServices: chat.participant1.connected_services || [],
                },
                {
                  id: chat.participant2.id,
                  firstName: chat.participant2.first_name,
                  lastName: chat.participant2.last_name,
                  name: chat.participant2.name,
                  email: chat.participant2.email,
                  age: chat.participant2.age,
                  profileImage: chat.participant2.profile_image || '',
                  bio: chat.participant2.bio || '',
                  location: chat.participant2.location || '',
                  interests: chat.participant2.interests || [],
                  personalityTraits: chat.participant2.personality_traits || [],
                  joinedActivities: chat.participant2.joined_activities || [],
                  createdActivities: chat.participant2.created_activities || [],
                  connectedServices: chat.participant2.connected_services || [],
                }
              ] as [User, User],
              messages: [], // Will be populated separately
              lastMessageTime: new Date(chat.last_message_time),
              activityContext: chat.activity_context,
            };

            callback(directMessageChat);
          } catch (error) {
            console.error('Error processing real-time chat update:', error);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}

export const chatService = new ChatServiceImpl(); 