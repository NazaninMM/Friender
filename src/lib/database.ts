import { supabase } from './supabase';
import { User, Activity, CreateActivityData, JoinRequest, ChatMessage, DirectMessageChat } from '../types';

// User Profile Operations
export const userService = {
  // Get user profile by ID
  async getUserProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        name: data.name,
        email: data.email,
        age: data.age,
        profileImage: data.profile_image || '',
        bio: data.bio || '',
        location: data.location || '',
        interests: data.interests || [],
        personalityTraits: data.personality_traits || [],
        joinedActivities: data.joined_activities || [],
        createdActivities: data.created_activities || [],
        connectedServices: data.connected_services || [],
      };
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const updateData: any = {};
      
      if (updates.firstName) updateData.first_name = updates.firstName;
      if (updates.lastName) updateData.last_name = updates.lastName;
      if (updates.name) updateData.name = updates.name;
      if (updates.age) updateData.age = updates.age;
      if (updates.profileImage) updateData.profile_image = updates.profileImage;
      if (updates.bio) updateData.bio = updates.bio;
      if (updates.location) updateData.location = updates.location;
      if (updates.interests) updateData.interests = updates.interests;
      if (updates.personalityTraits) updateData.personality_traits = updates.personalityTraits;
      if (updates.connectedServices) updateData.connected_services = updates.connectedServices;

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        return null;
      }

      return this.getUserProfile(userId);
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      return null;
    }
  },

  // Upload profile image
  async uploadProfileImage(userId: string, file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/profile.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Error uploading profile image:', error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadProfileImage:', error);
      return null;
    }
  },

  // Get all users for discovery/matching
  async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all users:', error);
        return [];
      }

      return data.map(user => ({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        name: user.name,
        email: user.email,
        age: user.age,
        profileImage: user.profile_image || '',
        bio: user.bio || '',
        location: user.location || '',
        interests: user.interests || [],
        personalityTraits: user.personality_traits || [],
        joinedActivities: user.joined_activities || [],
        createdActivities: user.created_activities || [],
        connectedServices: user.connected_services || [],
      }));
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return [];
    }
  }
};

// Activity Operations
export const activityService = {
  // Get all activities
  async getAllActivities(): Promise<Activity[]> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          created_by:profiles!activities_created_by_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching activities:', error);
        return [];
      }

      return data.map(activity => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        location: activity.location,
        date: new Date(activity.date),
        time: activity.time,
        maxAttendees: activity.max_attendees,
        currentAttendees: activity.current_attendees,
        category: activity.category,
        createdBy: {
          id: activity.created_by.id,
          firstName: activity.created_by.first_name,
          lastName: activity.created_by.last_name,
          name: activity.created_by.name,
          email: activity.created_by.email,
          age: activity.created_by.age,
          profileImage: activity.created_by.profile_image || '',
          bio: activity.created_by.bio || '',
          location: activity.created_by.location || '',
          interests: activity.created_by.interests || [],
          personalityTraits: activity.created_by.personality_traits || [],
          joinedActivities: activity.created_by.joined_activities || [],
          createdActivities: activity.created_by.created_activities || [],
          connectedServices: activity.created_by.connected_services || [],
        },
        attendees: [], // Will be populated separately
        pendingUsers: [],
        image: activity.image,
        tags: activity.tags || [],
      }));
    } catch (error) {
      console.error('Error in getAllActivities:', error);
      return [];
    }
  },

  // Create new activity
  async createActivity(activityData: CreateActivityData, userId: string): Promise<Activity | null> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert({
          title: activityData.title,
          description: activityData.description,
          location: activityData.location,
          date: activityData.date.toISOString(),
          time: activityData.time,
          max_attendees: activityData.maxAttendees,
          current_attendees: 1, // Creator is first attendee
          category: activityData.category,
          created_by: userId,
          tags: activityData.tags,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating activity:', error);
        return null;
      }

      // Add creator as attendee
      await this.joinActivity(data.id, userId);

      return this.getActivityById(data.id);
    } catch (error) {
      console.error('Error in createActivity:', error);
      return null;
    }
  },

  // Get activity by ID
  async getActivityById(activityId: string): Promise<Activity | null> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          created_by:profiles!activities_created_by_fkey(*)
        `)
        .eq('id', activityId)
        .single();

      if (error) {
        console.error('Error fetching activity:', error);
        return null;
      }

      // Get attendees
      const attendees = await this.getActivityAttendees(activityId);

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        location: data.location,
        date: new Date(data.date),
        time: data.time,
        maxAttendees: data.max_attendees,
        currentAttendees: data.current_attendees,
        category: data.category,
        createdBy: {
          id: data.created_by.id,
          firstName: data.created_by.first_name,
          lastName: data.created_by.last_name,
          name: data.created_by.name,
          email: data.created_by.email,
          age: data.created_by.age,
          profileImage: data.created_by.profile_image || '',
          bio: data.created_by.bio || '',
          location: data.created_by.location || '',
          interests: data.created_by.interests || [],
          personalityTraits: data.created_by.personality_traits || [],
          joinedActivities: data.created_by.joined_activities || [],
          createdActivities: data.created_by.created_activities || [],
          connectedServices: data.created_by.connected_services || [],
        },
        attendees,
        pendingUsers: [],
        image: data.image,
        tags: data.tags || [],
      };
    } catch (error) {
      console.error('Error in getActivityById:', error);
      return null;
    }
  },

  // Join activity
  async joinActivity(activityId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('activity_attendees')
        .insert({
          activity_id: activityId,
          user_id: userId,
          joined_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error joining activity:', error);
        return false;
      }

      // Update activity attendee count
      await supabase
        .from('activities')
        .update({ current_attendees: supabase.rpc('increment') })
        .eq('id', activityId);

      return true;
    } catch (error) {
      console.error('Error in joinActivity:', error);
      return false;
    }
  },

  // Get activity attendees
  async getActivityAttendees(activityId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('activity_attendees')
        .select(`
          user_id,
          profiles!activity_attendees_user_id_fkey(*)
        `)
        .eq('activity_id', activityId);

      if (error) {
        console.error('Error fetching activity attendees:', error);
        return [];
      }

      return data.map(attendee => ({
        id: attendee.profiles.id,
        firstName: attendee.profiles.first_name,
        lastName: attendee.profiles.last_name,
        name: attendee.profiles.name,
        email: attendee.profiles.email,
        age: attendee.profiles.age,
        profileImage: attendee.profiles.profile_image || '',
        bio: attendee.profiles.bio || '',
        location: attendee.profiles.location || '',
        interests: attendee.profiles.interests || [],
        personalityTraits: attendee.profiles.personality_traits || [],
        joinedActivities: attendee.profiles.joined_activities || [],
        createdActivities: attendee.profiles.created_activities || [],
        connectedServices: attendee.profiles.connected_services || [],
      }));
    } catch (error) {
      console.error('Error in getActivityAttendees:', error);
      return [];
    }
  }
};

// Join Request Operations
export const joinRequestService = {
  // Create join request
  async createJoinRequest(activityId: string, userId: string, message: string): Promise<JoinRequest | null> {
    try {
      const user = await userService.getUserProfile(userId);
      if (!user) return null;

      const { data, error } = await supabase
        .from('join_requests')
        .insert({
          activity_id: activityId,
          requester_id: userId,
          message,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating join request:', error);
        return null;
      }

      return {
        id: data.id,
        activityId: data.activity_id,
        requesterId: data.requester_id,
        requesterName: user.name,
        requesterImage: user.profileImage,
        message: data.message,
        timestamp: new Date(data.created_at),
        status: data.status,
      };
    } catch (error) {
      console.error('Error in createJoinRequest:', error);
      return null;
    }
  },

  // Get join requests for an activity
  async getActivityJoinRequests(activityId: string): Promise<JoinRequest[]> {
    try {
      const { data, error } = await supabase
        .from('join_requests')
        .select(`
          *,
          requester:profiles!join_requests_requester_id_fkey(*)
        `)
        .eq('activity_id', activityId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching join requests:', error);
        return [];
      }

      return data.map(request => ({
        id: request.id,
        activityId: request.activity_id,
        requesterId: request.requester_id,
        requesterName: request.requester.name,
        requesterImage: request.requester.profile_image || '',
        message: request.message,
        timestamp: new Date(request.created_at),
        status: request.status,
      }));
    } catch (error) {
      console.error('Error in getActivityJoinRequests:', error);
      return [];
    }
  },

  // Approve join request
  async approveJoinRequest(requestId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('join_requests')
        .update({ status: 'approved' })
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        console.error('Error approving join request:', error);
        return false;
      }

      // Add user to activity attendees
      await activityService.joinActivity(data.activity_id, data.requester_id);

      return true;
    } catch (error) {
      console.error('Error in approveJoinRequest:', error);
      return false;
    }
  },

  // Deny join request
  async denyJoinRequest(requestId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('join_requests')
        .update({ status: 'denied' })
        .eq('id', requestId);

      if (error) {
        console.error('Error denying join request:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in denyJoinRequest:', error);
      return false;
    }
  }
};

// Chat Operations
export const chatService = {
  // Get activity chat messages
  async getActivityChatMessages(activityId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('activity_chat_messages')
        .select(`
          *,
          user:profiles!activity_chat_messages_user_id_fkey(*)
        `)
        .eq('activity_id', activityId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching chat messages:', error);
        return [];
      }

      return data.map(message => ({
        id: message.id,
        userId: message.user_id,
        userName: message.user.name,
        userImage: message.user.profile_image || '',
        message: message.message,
        timestamp: new Date(message.created_at),
        type: message.type,
        metadata: message.metadata,
      }));
    } catch (error) {
      console.error('Error in getActivityChatMessages:', error);
      return [];
    }
  },

  // Send activity chat message
  async sendActivityChatMessage(activityId: string, userId: string, message: string, type: 'text' | 'system' = 'text'): Promise<ChatMessage | null> {
    try {
      const user = await userService.getUserProfile(userId);
      if (!user) return null;

      const { data, error } = await supabase
        .from('activity_chat_messages')
        .insert({
          activity_id: activityId,
          user_id: userId,
          message,
          type,
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending chat message:', error);
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        userName: user.name,
        userImage: user.profileImage,
        message: data.message,
        timestamp: new Date(data.created_at),
        type: data.type,
        metadata: data.metadata,
      };
    } catch (error) {
      console.error('Error in sendActivityChatMessage:', error);
      return null;
    }
  }
}; 