import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Search, Clock, Heart, Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Match } from '../../types';

interface ChatsScreenProps {
  matches: Match[];
  onOpenChat: (match: Match) => void;
}

export const ChatsScreen: React.FC<ChatsScreenProps> = ({ matches, onOpenChat }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const connectedMatches = matches.filter(match => match.status === 'matched' || match.status === 'liked');
  
  const filteredMatches = connectedMatches.filter(match =>
    match.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (connectedMatches.length === 0) {
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
          {filteredMatches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200"
                onClick={() => onOpenChat(match)}
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={match.user.profileImage}
                      alt={match.user.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    {match.status === 'matched' && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                        <Heart className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {match.user.name}
                      </h3>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(new Date())}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 truncate">
                      {match.status === 'matched' 
                        ? "You're connected! Start a conversation 👋" 
                        : `${Math.round(match.similarityScore * 100)}% friend match • ${match.matchReason}`
                      }
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {match.status === 'matched' && (
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    )}
                    <div className="w-2 h-2 bg-primary-500 rounded-full opacity-60"></div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredMatches.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-gray-600">No conversations found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
};