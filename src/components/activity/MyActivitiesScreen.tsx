import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, MessageCircle, Settings } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Activity, User } from '../../types';
import { categoryIcons, categoryColors } from '../../data/mockData';

interface MyActivitiesScreenProps {
  activities: Activity[];
  onOpenActivity: (activity: Activity) => void;
  user: User;
}

export const MyActivitiesScreen: React.FC<MyActivitiesScreenProps> = ({
  activities,
  onOpenActivity,
  user
}) => {
  const [activeTab, setActiveTab] = useState<'joined' | 'created'>('joined');

  const joinedActivities = activities.filter(activity => 
    activity.attendees.some(attendee => attendee.id === user.id) && 
    activity.createdBy.id !== user.id
  );

  const createdActivities = activities.filter(activity => 
    activity.createdBy.id === user.id
  );

  const currentActivities = activeTab === 'joined' ? joinedActivities : createdActivities;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">My Activities</h2>
          <p className="text-gray-600">Manage your joined and created activities</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-200">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setActiveTab('joined')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'joined'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Joined ({joinedActivities.length})
              </button>
              <button
                onClick={() => setActiveTab('created')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'created'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Created ({createdActivities.length})
              </button>
            </div>
          </div>
        </motion.div>

        {/* Activities List */}
        <div className="space-y-4">
          {currentActivities.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No {activeTab} activities yet
              </h3>
              <p className="text-gray-600">
                {activeTab === 'joined' 
                  ? 'Start exploring activities to join your first one!'
                  : 'Create your first activity to bring people together!'
                }
              </p>
            </motion.div>
          ) : (
            currentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card 
                  className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
                  onClick={() => onOpenActivity(activity)}
                >
                  <div className="flex">
                    <div className="w-24 h-24 flex-shrink-0">
                      <img
                        src={activity.image}
                        alt={activity.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                          {activity.title}
                        </h3>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${categoryColors[activity.category]} text-white`}>
                          {categoryIcons[activity.category]}
                        </div>
                      </div>
                      
                      <div className="space-y-1 mb-3">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{formatDate(activity.date)} at {activity.time}</span>
                        </div>
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="truncate">{activity.location}</span>
                        </div>
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <Users className="w-3 h-3 mr-1" />
                          <span>{activity.currentAttendees}/{activity.maxAttendees} going</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        {activeTab === 'created' ? (
                          <span className="text-xs text-indigo-600 font-medium">
                            You're organizing
                          </span>
                        ) : (
                          <span className="text-xs text-green-600 font-medium">
                            You're going
                          </span>
                        )}
                        
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenActivity(activity);
                          }}
                          size="sm"
                          variant="ghost"
                          className="p-1"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};