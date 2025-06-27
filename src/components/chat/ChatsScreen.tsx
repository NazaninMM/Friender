import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Search, Clock, Heart, Users, User, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { joinRequestService, JoinRequestChat } from '../../lib/joinRequestService';
import { JoinRequestChatScreen } from './JoinRequestChatScreen';

interface ChatsScreenProps {
  onOpenChat: (otherUser: any) => void;
}

export const ChatsScreen: React.FC<ChatsScreenProps> = ({ onOpenChat }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [joinRequestChats, setJoinRequestChats] = useState<JoinRequestChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<JoinRequestChat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadJoinRequestChats();
    }
  }, [user]);

  const loadJoinRequestChats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const chats = await joinRequestService.getUserJoinRequestChats(user.id);
      setJoinRequestChats(chats);
    } catch (err) {
      console.error('Error loading join request chats:', err);
      setError('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = joinRequestChats.filter(chat => {
    const otherUser = chat.hostId === user?.id ? chat.requester : chat.host;
    const activityTitle = chat.activity.title;
    const searchTerm = searchQuery.toLowerCase();
    
    return (
      otherUser.name.toLowerCase().includes(searchTerm) ||
      activityTitle.toLowerCase().includes(searchTerm)
    );
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getStatusIcon = (chat: JoinRequestChat) => {
    const isHost = user?.id === chat.hostId;
    
    // You would need to fetch the actual join request status
    // For now, we'll assume it's pending
    return (
      <div className="flex items-center space-x-1 text-orange-600">
        <AlertCircle className="w-4 h-4" />
        <span className="text-xs font-medium">Pending</span>
      </div>
    );
  };

  if (selectedChat) {
    return (
      <JoinRequestChatScreen
        chat={selectedChat}
        onBack={() => setSelectedChat(null)}
      />
    );
  }

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

  if (joinRequestChats.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Messages</h2>
            <p className="text-gray-600">Join activities to start conversations with hosts and other participants</p>
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
                When you request to join activities, you'll be able to chat with hosts here
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
            const otherUser = chat.hostId === user?.id ? chat.requester : chat.host;
            const isHost = user?.id === chat.hostId;
            
            return (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200"
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={otherUser.profileImage || '/default-avatar.png'}
                        alt={otherUser.name}
                        className="w-14 h-14 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/default-avatar.png';
                        }}
                      />
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                        {isHost ? <Calendar className="w-3 h-3 text-white" /> : <User className="w-3 h-3 text-white" />}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {otherUser.name}
                        </h3>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(chat.lastMessageAt)}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate mb-2">
                        {chat.activity.title}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {isHost ? 'Join request from' : 'Your join request'}
                        </span>
                        
                        {getStatusIcon(chat)}
                      </div>
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