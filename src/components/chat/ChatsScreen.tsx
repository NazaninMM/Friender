import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Search, Clock, Heart, Users, User } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { DirectMessageChat, User as UserType, ChatMessage } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { chatStorage } from '../../lib/chatStorage';

interface ChatsScreenProps {
  onOpenChat: (otherUser: UserType) => void;
}

export const ChatsScreen: React.FC<ChatsScreenProps> = ({ onOpenChat }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<DirectMessageChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load chats with real message data from storage
  useEffect(() => {
    if (user) {
      setLoading(true);
      
      // Create mock users for demo
      const mockUsers: UserType[] = [
        {
          id: 'user-2',
          firstName: 'Alex',
          lastName: 'Johnson',
          name: 'Alex Johnson',
          email: 'alex@example.com',
          age: 25,
          profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          bio: 'Love hiking and photography!',
          location: 'San Francisco, CA',
          interests: ['hiking', 'photography', 'coffee'],
          personalityTraits: ['adventurous', 'creative'],
          joinedActivities: [],
          createdActivities: [],
          connectedServices: ['spotify', 'instagram'],
        },
        {
          id: 'user-3',
          firstName: 'Maya',
          lastName: 'Chen',
          name: 'Maya Chen',
          email: 'maya@example.com',
          age: 28,
          profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          bio: 'Foodie and travel enthusiast',
          location: 'New York, NY',
          interests: ['cooking', 'travel', 'yoga'],
          personalityTraits: ['friendly', 'organized'],
          joinedActivities: [],
          createdActivities: [],
          connectedServices: ['spotify', 'instagram'],
        },
        {
          id: 'user-4',
          firstName: 'Jordan',
          lastName: 'Kim',
          name: 'Jordan Kim',
          email: 'jordan@example.com',
          age: 26,
          profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          bio: 'Tech enthusiast and coffee lover',
          location: 'Seattle, WA',
          interests: ['technology', 'coffee', 'reading'],
          personalityTraits: ['analytical', 'curious'],
          joinedActivities: [],
          createdActivities: [],
          connectedServices: ['spotify', 'google-play'],
        },
      ];

      // Create chats with real message data from storage
      const chatsWithMessages: DirectMessageChat[] = mockUsers.map((mockUser, index) => {
        // Get actual messages from storage
        const storedMessages = chatStorage.getChatMessages(user.id, mockUser.id);
        
        // Convert timestamps back to Date objects
        const messagesWithDates = storedMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));

        // Get the last message
        const lastMessage = messagesWithDates.length > 0 
          ? messagesWithDates[messagesWithDates.length - 1]
          : undefined;

        // Use last message time or fallback to a default time
        const lastMessageTime = lastMessage 
          ? lastMessage.timestamp 
          : new Date(Date.now() - (index + 1) * 60 * 60 * 1000);

        return {
          id: `chat-${index + 1}`,
          participants: [user, mockUser] as [UserType, UserType],
          messages: messagesWithDates,
          lastMessage: lastMessage,
          lastMessageTime: lastMessageTime,
        };
      });

      // Filter out chats with no messages and sort by last message time
      const activeChats = chatsWithMessages
        .filter(chat => chat.messages.length > 0)
        .sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());

      // If no active chats, show all mock chats
      const finalChats = activeChats.length > 0 ? activeChats : chatsWithMessages;

      setTimeout(() => {
        setChats(finalChats);
        setLoading(false);
      }, 500);
    }
  }, [user]);

  const filteredChats = chats.filter(chat => {
    const otherParticipant = chat.participants.find(p => p.id !== user?.id) || chat.participants[0];
    return otherParticipant.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getLastMessage = (chat: DirectMessageChat) => {
    if (chat.lastMessage) {
      return chat.lastMessage.message;
    }
    return 'Start a conversation';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Messages</h2>
            <p className="text-gray-600">Loading your conversations...</p>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Messages</h2>
            <p className="text-red-600">Error loading conversations: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Messages</h2>
            <p className="text-gray-600">Start connecting with potential friends to begin conversations</p>
          </div>

          <div className="flex items-center justify-center py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Conversations Yet</h3>
              <p className="text-gray-600">
                When you connect with someone, you'll be able to start meaningful conversations here
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Messages</h2>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredChats.map((chat, index) => {
            const otherParticipant = chat.participants.find(p => p.id !== user?.id) || chat.participants[0];
            
            return (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200"
                  onClick={() => onOpenChat(otherParticipant)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={otherParticipant.profileImage || '/default-avatar.png'}
                        alt={otherParticipant.name}
                        className="w-14 h-14 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/default-avatar.png';
                        }}
                      />
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {otherParticipant.name}
                        </h3>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(chat.lastMessageTime)}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate">
                        {getLastMessage(chat)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-primary-500 rounded-full opacity-60"></div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredChats.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-gray-600">No conversations found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
};