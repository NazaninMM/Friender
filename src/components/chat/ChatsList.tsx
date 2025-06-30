import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Clock, Users, AlertCircle, CheckCircle, User } from 'lucide-react';
import { Card } from '../ui/Card';
import { Activity, User as UserType, JoinRequest, DirectMessageChat } from '../../types';
import { DefaultProfileImage } from '../ui/DefaultProfileImage';

interface ChatsListProps {
  activities: Activity[];
  user: UserType;
  joinRequests: JoinRequest[];
  directChats: DirectMessageChat[];
  onOpenChat: (activity: Activity) => void;
  onOpenHostRequest: (activity: Activity, request: JoinRequest) => void;
  onOpenDirectChat: (directChat: DirectMessageChat) => void;
}

interface ChatItem {
  id: string;
  type: 'host_request' | 'group_chat' | 'direct_message';
  title: string;
  subtitle: string;
  timestamp: Date;
  activity?: Activity;
  request?: JoinRequest;
  directChat?: DirectMessageChat;
  status?: string;
  statusColor?: string;
  icon: React.ComponentType<any>;
  iconColor: string;
  borderColor?: string;
}

export const ChatsList: React.FC<ChatsListProps> = ({ 
  activities, 
  user, 
  joinRequests,
  directChats,
  onOpenChat,
  onOpenHostRequest,
  onOpenDirectChat
}) => {
  // Create unified chat items
  const createChatItems = (): ChatItem[] => {
    const items: ChatItem[] = [];

    // Add direct message chats
    directChats.forEach(directChat => {
      const otherParticipant = directChat.participants.find(p => p.id !== user.id) || directChat.participants[0];
      
      items.push({
        id: `direct-${directChat.id}`,
        type: 'direct_message',
        title: otherParticipant.name,
        subtitle: directChat.lastMessage?.message || 'Start a conversation',
        timestamp: directChat.lastMessageTime,
        directChat,
        icon: User,
        iconColor: 'text-purple-600',
      });
    });

    // Add host requests (incoming requests for activities the user hosts)
    const hostRequests = joinRequests.filter(request => 
      activities.some(activity => 
        activity.id === request.activityId && 
        activity.createdBy.id === user.id &&
        request.status === 'pending'
      )
    );

    hostRequests.forEach(request => {
      const activity = activities.find(a => a.id === request.activityId);
      if (activity) {
        items.push({
          id: `request-${request.id}`,
          type: 'host_request',
          title: `${request.requesterName} wants to join`,
          subtitle: activity.title,
          timestamp: request.timestamp,
          activity,
          request,
          status: 'Pending Review',
          statusColor: 'bg-orange-100 text-orange-700',
          icon: AlertCircle,
          iconColor: 'text-orange-600',
          borderColor: 'border-l-orange-400',
        });
      }
    });

    // Add group chats (only for activities where user is an APPROVED attendee)
    const approvedActivities = activities.filter(activity => 
      activity.attendees.some(attendee => attendee.id === user.id)
    );

    approvedActivities.forEach(activity => {
      // Use a more realistic timestamp - either recent activity or the activity date
      const now = new Date();
      const activityDate = new Date(activity.date);
      
      // If activity is in the future, use current time minus a few hours to simulate recent chat activity
      // If activity is in the past, use the activity date
      const timestamp = activityDate > now 
        ? new Date(now.getTime() - Math.random() * 6 * 60 * 60 * 1000) // Random time within last 6 hours
        : activityDate;
      
      items.push({
        id: `activity-${activity.id}`,
        type: 'group_chat',
        title: activity.title,
        subtitle: `${activity.attendees.length} participants`,
        timestamp,
        activity,
        status: 'Active Chat',
        statusColor: 'bg-green-100 text-green-700',
        icon: Users,
        iconColor: 'text-blue-600',
      });
    });

    // Sort by timestamp (most recent first)
    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const chatItems = createChatItems();

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const handleItemClick = (item: ChatItem) => {
    if (item.type === 'host_request' && item.activity && item.request) {
      onOpenHostRequest(item.activity, item.request);
    } else if (item.type === 'group_chat' && item.activity) {
      onOpenChat(item.activity);
    } else if (item.type === 'direct_message' && item.directChat) {
      onOpenDirectChat(item.directChat);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
          <p className="text-sm text-gray-600">Your activity conversations</p>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {chatItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-600">Join activities and get approved to start chatting with other participants</p>
          </div>
        ) : (
          <div className="space-y-3">
            {chatItems.map((item, index) => {
              const Icon = item.icon;
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`p-4 cursor-pointer hover:shadow-lg transition-all duration-200 ${item.borderColor ? `border-l-4 ${item.borderColor}` : ''}`}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${
                        item.type === 'host_request' 
                          ? 'bg-gradient-to-r from-orange-100 to-red-100' 
                          : item.type === 'direct_message'
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100'
                          : 'bg-gradient-to-r from-blue-100 to-indigo-100'
                      } rounded-full flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${item.iconColor}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {item.title}
                          </h3>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(item.timestamp)}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 truncate mb-1">
                          {item.subtitle}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {item.type === 'host_request' 
                              ? 'Tap to review request' 
                              : item.type === 'direct_message'
                              ? 'Direct message'
                              : 'Tap to open chat'
                            }
                          </span>
                          
                          {item.status && (
                            <span className={`text-xs px-2 py-1 rounded-full flex items-center space-x-1 ${item.statusColor}`}>
                              {item.status.includes('Pending') && <Clock className="w-3 h-3" />}
                              {item.status.includes('Active') && <CheckCircle className="w-3 h-3" />}
                              <span>{item.status}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};