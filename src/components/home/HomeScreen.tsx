import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Clock, Users as UsersIcon, Heart, ArrowRight, Plus } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Activity, User, ActivityCategory } from '../../types';
import { categoryIcons, categoryColors } from '../../constants/categories';
import { joinRequestService } from '../../lib/joinRequestService';

interface HomeScreenProps {
  activities: Activity[];
  onOpenActivity: (activity: Activity) => void;
  onJoinActivity: (activityId: string) => void;
  onCreateActivity: () => void;
  user: User;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  activities, 
  onOpenActivity, 
  onJoinActivity,
  onCreateActivity,
  user 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'all'>('all');
  const [showAll, setShowAll] = useState(false);
  const [joiningActivity, setJoiningActivity] = useState<string | null>(null);

  const categories: (ActivityCategory | 'all')[] = [
    'all', 'food', 'sports', 'culture', 'outdoor', 'social', 'learning', 'entertainment', 'wellness'
  ];

  // Get activities matched to user's interests
  const getMatchedActivities = () => {
    return activities.filter(activity => {
      // Check if activity category matches user interests
      const categoryMatch = user.interests.some(interest => 
        interest.toLowerCase().includes(activity.category) || 
        activity.category.includes(interest.toLowerCase())
      );
      
      // Check if activity tags match user interests
      const tagMatch = activity.tags.some(tag => 
        user.interests.some(interest => 
          interest.toLowerCase().includes(tag.toLowerCase()) || 
          tag.toLowerCase().includes(interest.toLowerCase())
        )
      );
      
      // Check if activity location is nearby (same city)
      const locationMatch = activity.location.includes(user.location.split(',')[0]);
      
      return categoryMatch || tagMatch || locationMatch;
    });
  };

  const filteredActivities = showAll ? 
    activities.filter(activity => {
      const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           activity.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    }) :
    getMatchedActivities().filter(activity => {
      const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           activity.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });

  // Show only first 3 activities unless "Show All" is clicked
  const displayedActivities = showAll ? filteredActivities : filteredActivities.slice(0, 3);

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

  const isUserJoined = (activity: Activity) => {
    return activity.attendees.some(attendee => attendee.id === user.id);
  };

  const handleSeeAllToggle = () => {
    setShowAll(!showAll);
    if (!showAll) {
      // Reset category filter when showing all
      setSelectedCategory('all');
    }
  };

  const handleJoinActivity = async (activityId: string) => {
    if (joiningActivity || !user) return;

    setJoiningActivity(activityId);
    try {
      // Check if user already has a pending join request
      const hasPending = await joinRequestService.hasPendingJoinRequest(activityId, user.id);
      if (hasPending) {
        alert('You already have a pending join request for this activity.');
        return;
      }

      // Create join request with chat
      const result = await joinRequestService.createJoinRequest(
        activityId,
        user.id,
        'Hey! I\'d love to join your activity.'
      );

      if (result) {
        // Call the parent handler to update UI state
        onJoinActivity(activityId);
        
        // Show success message
        alert('Join request sent! You can now chat with the host.');
      } else {
        alert('Failed to send join request. Please try again.');
      }
    } catch (error) {
      console.error('Error joining activity:', error);
      alert('Failed to send join request. Please try again.');
    } finally {
      setJoiningActivity(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header with Create Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {showAll ? 'Explore All Activities' : `Perfect for You, ${user.firstName}! 👋`}
            </h2>
            <Button
              onClick={onCreateActivity}
              size="sm"
              className="rounded-full p-3 shadow-lg"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-gray-600">
            {showAll ? 'Browse all activities by category' : 'Activities matched to your interests and location'}
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Category Filter - Only show when "Show All" is active */}
        {showAll && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {category === 'all' ? '🌟 All' : `${category.charAt(0).toUpperCase() + category.slice(1)}`}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Activities Header with See All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between mb-4"
        >
          <h3 className="text-lg font-semibold text-gray-900">
            {showAll 
              ? (selectedCategory === 'all' ? 'All Activities' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Activities`)
              : 'Recommended for You'
            }
          </h3>
          <Button
            onClick={handleSeeAllToggle}
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700"
          >
            <span>{showAll ? 'Show Matched' : 'See All'}</span>
            <ArrowRight className={`w-4 h-4 transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`} />
          </Button>
        </motion.div>

        {/* Activities List */}
        <div className="space-y-4">
          {displayedActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card 
                className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
                onClick={() => onOpenActivity(activity)}
              >
                <div className="p-4">
                  {/* Category Badge and Attendee Count */}
                  <div className="flex items-center justify-between mb-3">
                    <div className={`px-3 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r ${categoryColors[activity.category]}`}>
                      {categoryIcons[activity.category]} {activity.category.charAt(0).toUpperCase() + activity.category.slice(1)}
                    </div>
                    <div className="bg-gray-100 rounded-full px-3 py-1">
                      <span className="text-gray-700 text-sm font-medium">
                        {activity.currentAttendees}/{activity.maxAttendees}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {activity.title}
                    </h3>
                    {isUserJoined(activity) && (
                      <div className="ml-2 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <Heart className="w-3 h-3 text-green-600 fill-current" />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {activity.description}
                  </p>

                  {/* Match indicator for recommended activities */}
                  {!showAll && (
                    <div className="mb-3 px-3 py-1 bg-indigo-50 rounded-lg border border-indigo-100">
                      <p className="text-xs text-indigo-700 font-medium">
                        ✨ Matches your interests: {user.interests.filter(interest => 
                          activity.tags.some(tag => tag.toLowerCase().includes(interest.toLowerCase())) ||
                          interest.toLowerCase().includes(activity.category)
                        ).slice(0, 2).join(', ')}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{activity.location}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{formatDate(activity.date)} at {activity.time}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <UsersIcon className="w-4 h-4 mr-2" />
                      <span>{activity.currentAttendees} going</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img
                        src={activity.createdBy.profileImage}
                        alt={activity.createdBy.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm text-gray-600">
                        by {activity.createdBy.name}
                      </span>
                    </div>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isUserJoined(activity)) {
                          handleJoinActivity(activity.id);
                        }
                      }}
                      size="sm"
                      variant={isUserJoined(activity) ? "outline" : "primary"}
                      disabled={activity.currentAttendees >= activity.maxAttendees || joiningActivity === activity.id}
                      className={isUserJoined(activity) ? "border-green-500 text-green-600" : ""}
                    >
                      {joiningActivity === activity.id ? 'Joining...' :
                       isUserJoined(activity) ? 'Joined' : 
                       activity.currentAttendees >= activity.maxAttendees ? 'Full' : 'Join'}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Show remaining count when collapsed */}
        {!showAll && filteredActivities.length > 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-4"
          >
            <p className="text-sm text-gray-600">
              +{filteredActivities.length - 3} more matched activities available
            </p>
          </motion.div>
        )}

        {filteredActivities.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {showAll ? 'No activities found' : 'No matched activities'}
            </h3>
            
            <p className="text-gray-600">
              {showAll 
                ? (searchQuery ? `No activities match "${searchQuery}"` : 'No activities in this category yet')
                : 'Try exploring all activities to find something interesting'
              }
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};