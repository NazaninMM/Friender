import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, CheckCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Activity, User } from '../../types';

interface ActivitiesListProps {
  activities: Activity[];
  user: User;
  onOpenActivity: (activity: Activity) => void;
}

export const ActivitiesList: React.FC<ActivitiesListProps> = ({ activities, user, onOpenActivity }) => {
  // Filter activities where user is approved (not just pending)
  const approvedActivities = activities.filter(activity => 
    activity.attendees.some(attendee => attendee.id === user.id)
  );

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
          <p className="text-sm text-gray-600">Your approved upcoming activities</p>
        </div>
      </div>

      {/* Activities List */}
      <div className="max-w-md mx-auto p-4">
        {approvedActivities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No approved activities yet</h3>
            <p className="text-gray-600">Join activities and wait for host approval to see them here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {approvedActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200"
                  onClick={() => onOpenActivity(activity)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {activity.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {activity.description}
                      </p>
                    </div>
                    
                    <div className="ml-4 flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Approved</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{activity.location}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{formatDate(activity.date)} at {activity.time}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{activity.attendees.length} participants</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-3 border-t border-gray-100">
                    <img
                      src={activity.createdBy.profileImage}
                      alt={activity.createdBy.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Hosted by {activity.createdBy.name}
                      </p>
                      <p className="text-xs text-gray-600">{activity.createdBy.location}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};