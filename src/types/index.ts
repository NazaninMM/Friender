export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  age: number;
  profileImage: string;
  bio: string;
  location: string;
  interests: string[];
  personalityTraits: string[];
  joinedActivities: string[];
  createdActivities: string[];
  connectedServices: string[];
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  location: string;
  date: Date;
  time: string;
  maxAttendees: number;
  currentAttendees: number;
  category: ActivityCategory;
  createdBy: User;
  attendees: User[];
  pendingUsers: User[];
  image?: string;
  tags: string[];
  isJoined?: boolean;
  isApproved?: boolean;
  isPending?: boolean;
}

export type ActivityCategory = 
  | 'food' 
  | 'sports' 
  | 'culture' 
  | 'outdoor' 
  | 'social' 
  | 'learning' 
  | 'entertainment'
  | 'wellness';

export interface ActivityChat {
  id: string;
  activityId: string;
  messages: ChatMessage[];
  participants: User[];
  type: 'host_request' | 'group_chat';
}

export interface DirectMessageChat {
  id: string;
  participants: [User, User]; // Always exactly 2 participants
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  lastMessageTime: Date;
  activityContext?: {
    activityId: string;
    activityTitle: string;
    isJoinRequest?: boolean;
    joinRequestStatus?: 'pending' | 'approved' | 'denied';
    requesterId?: string;
    linkedJoinRequestId?: string;
  };
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'join_request' | 'approval' | 'denial';
  metadata?: {
    requesterId?: string;
    requesterName?: string;
    activityId?: string;
  };
}

export interface JoinRequest {
  id: string;
  activityId: string;
  requesterId: string;
  requesterName: string;
  requesterImage: string;
  message: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'denied';
}

export interface CreateActivityData {
  title: string;
  description: string;
  location: string;
  date: Date;
  time: string;
  maxAttendees: number;
  category: ActivityCategory;
  tags: string[];
}

export interface ConnectedService {
  id: string;
  name: string;
  type: 'instagram' | 'spotify' | 'google-play' | 'openai';
  connected: boolean;
  description: string;
}

export interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
}