import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, Users, MessageCircle, Calendar, Tag, Heart, Share, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Activity, User } from '../../types';
import { categoryIcons, categoryColors } from '../../constants/categories';

interface ActivityDetailScreenProps {
  activity: Activity;
  onJoin: () => void;
  onLeave: () => void;
  onOpenChat: () => void;
  onBack: () => void;
  user: User;
}

export const ActivityDetailScreen: React.FC<ActivityDetailScreenProps> = ({
  activity,
  onJoin,
  onLeave,
  onOpenChat,
  onBack,
  user
}) => {
  const isUserJoined = activity.attendees.some(attendee => attendee.id === user.id);
  const isCreator = activity.createdBy.id === user.id;
  const isFull = activity.currentAttendees >= activity.maxAttendees;
  const isPending = activity.pendingUsers?.some(pendingUser => pendingUser.id === user.id);

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric',
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const getJoinButtonText = () => {
    if (isUserJoined) return 'Leave Activity';
    if (isPending) return 'Request Pending';
    if (isFull) return 'Activity Full';
    return 'Join Activity';
  };

  const getJoinButtonAction = () => {
    if (isUserJoined) return onLeave;
    if (isPending || isFull) return undefined;
    return onJoin;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm border-b border-gray-100 px-4 py-3 sticky top-0 z-50"
      >
        <div className="max-w-md mx-auto flex items-center space-x-3">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Activity Details</h1>
        </div>
      </motion.div>

      <div className="max-w-md mx-auto p-4 pb-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <Card className="overflow-hidden">
            <div className="relative">
              {/* Activity Image */}
              <div className="h-64 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 relative">
                <div className="absolute inset-0 bg-black/20"></div>
                
                {/* Category Badge */}
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r ${categoryColors[activity.category]}`}>
                  {categoryIcons[activity.category]} {activity.category.charAt(0).toUpperCase() + activity.category.slice(1)}
                </div>

                {/* Attendee Count */}
                <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-white text-sm font-medium">
                    {activity.currentAttendees}/{activity.maxAttendees}
                  </span>
                </div>

                {/* Status Indicators */}
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  {isUserJoined && (
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white fill-current" />
                    </div>
                  )}
                  {isPending && (
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">{activity.title}</h2>
                  <div className="flex items-center text-white/90">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{activity.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Activity Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="p-6">
            {/* Date & Time */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-700">
                <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                <div>
                  <span className="font-medium">{formatDate(activity.date)}</span>
                  <span className="text-gray-500 ml-2">at {activity.time}</span>
                </div>
              </div>
              
              <div className="flex items-center text-gray-700">
                <MapPin className="w-5 h-5 mr-3 text-red-500" />
                <span>{activity.location}</span>
              </div>
              
              <div className="flex items-center text-gray-700">
                <Users className="w-5 h-5 mr-3 text-green-500" />
                <span>{activity.currentAttendees} going • {activity.maxAttendees} max capacity</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">About This Activity</h3>
              <p className="text-gray-700 leading-relaxed">{activity.description}</p>
            </div>

            {/* Tags */}
            {activity.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activity.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Host Info */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Hosted by</h3>
              <div className="flex items-center space-x-3">
                <img
                  src={activity.createdBy.profileImage}
                  alt={activity.createdBy.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.createdBy.name}</p>
                  <p className="text-sm text-gray-600">{activity.createdBy.location}</p>
                </div>
                <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="text-xs font-medium text-yellow-700">4.9</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Attendees */}
        {activity.attendees.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Who's Going ({activity.attendees.length})
              </h3>
              <div className="space-y-3">
                {activity.attendees.slice(0, 5).map((attendee, index) => (
                  <div key={attendee.id} className="flex items-center space-x-3">
                    <img
                      src={attendee.profileImage}
                      alt={attendee.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {attendee.name}
                        {attendee.id === activity.createdBy.id && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Host
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">{attendee.location}</p>
                    </div>
                  </div>
                ))}
                {activity.attendees.length > 5 && (
                  <div className="text-center pt-2">
                    <span className="text-sm text-gray-500">
                      +{activity.attendees.length - 5} more attendees
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {!isCreator && (
            <Button
              onClick={getJoinButtonAction()}
              className={`w-full ${
                isUserJoined 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : isPending
                  ? 'bg-orange-500 cursor-not-allowed'
                  : isFull
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
              }`}
              disabled={isPending || isFull}
            >
              {getJoinButtonText()}
            </Button>
          )}

          {(isUserJoined || isCreator) && (
            <Button
              onClick={onOpenChat}
              variant="outline"
              className="w-full flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Open Group Chat</span>
            </Button>
          )}

          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <Share className="w-4 h-4" />
              <span>Share</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <Heart className="w-4 h-4" />
              <span>Save</span>
            </Button>
          </div>

          {isCreator && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-blue-700 font-medium">
                  You're hosting this activity
                </span>
              </div>
            </div>
          )}

          {isPending && (
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-700 font-medium">
                  Your join request is pending host approval
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};