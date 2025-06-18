import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Users, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Activity, User } from '../../types';

interface ActivityFeedProps {
  activities: Activity[];
  user: User;
  onJoinActivity: (activityId: string) => void;
  onCreateActivity: () => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities, 
  user, 
  onJoinActivity,
  onCreateActivity 
}) => {
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
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getLocationDisplay = (location: string) => {
    // Extract city/area from full location
    const parts = location.split(',');
    if (parts.length > 1) {
      return `Near ${parts[0].trim()}`;
    }
    return `Near ${location}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ActivityConnect</h1>
              <p className="text-sm text-gray-600">Discover activities near you</p>
            </div>
            <Button
              onClick={onCreateActivity}
              size="sm"
              className="rounded-full p-3"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-md mx-auto p-4">
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all duration-200">
                {/* User Info */}
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={activity.createdBy.profileImage}
                    alt={activity.createdBy.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900">{activity.createdBy.name}</h3>
                    <p className="text-sm text-gray-600">{activity.createdBy.location}</p>
                  </div>
                </div>

                {/* Activity Content */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{activity.title}</h4>
                  <p className="text-gray-700 leading-relaxed mb-3">{activity.description}</p>
                  
                  {/* Activity Details */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{getLocationDisplay(activity.location)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{formatDate(activity.date)} at {activity.time}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{activity.currentAttendees} going • {activity.maxAttendees} max</span>
                    </div>
                  </div>
                </div>

                {/* Join Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={() => onJoinActivity(activity.id)}
                    size="sm"
                    disabled={activity.currentAttendees >= activity.maxAttendees}
                    className="px-6"
                  >
                    {activity.currentAttendees >= activity.maxAttendees ? 'Full' : 'Join'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {activities.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities yet</h3>
            <p className="text-gray-600 mb-4">Be the first to create an activity in your area!</p>
            <Button onClick={onCreateActivity}>
              Create Activity
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};