import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Edit, 
  MapPin, 
  Calendar, 
  Users, 
  Heart, 
  Settings, 
  Camera,
  Star,
  Award,
  Activity,
  MessageCircle,
  Share,
  MoreHorizontal,
  Instagram,
  Music,
  Brain,
  Shield,
  Bell,
  LogOut
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { User } from '../../types';

interface ProfileScreenProps {
  user: User;
  onEdit?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  user, 
  onEdit, 
  onSettings,
  onLogout 
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'activities' | 'connections'>('about');

  const stats = [
    { label: 'Activities Joined', value: user.joinedActivities.length + 8, icon: Calendar, color: 'text-blue-600' },
    { label: 'Activities Created', value: user.createdActivities.length + 3, icon: Users, color: 'text-green-600' },
    { label: 'Friends Made', value: 24, icon: Heart, color: 'text-pink-600' },
    { label: 'Profile Views', value: 156, icon: Activity, color: 'text-purple-600' },
  ];

  const recentActivities = [
    {
      id: '1',
      title: 'Coffee & Chat at Blue Bottle',
      type: 'joined',
      date: '2 days ago',
      participants: 6,
      status: 'completed'
    },
    {
      id: '2',
      title: 'Weekend Hiking Adventure',
      type: 'created',
      date: '1 week ago',
      participants: 8,
      status: 'completed'
    },
    {
      id: '3',
      title: 'Board Game Night',
      type: 'joined',
      date: '2 weeks ago',
      participants: 10,
      status: 'completed'
    }
  ];

  const connections = [
    {
      id: '1',
      name: 'Maya Chen',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      mutualActivities: 3,
      lastActivity: 'Coffee & Chat'
    },
    {
      id: '2',
      name: 'Jordan Kim',
      image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
      mutualActivities: 2,
      lastActivity: 'Hiking Adventure'
    },
    {
      id: '3',
      name: 'Sam Rodriguez',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
      mutualActivities: 1,
      lastActivity: 'Board Game Night'
    }
  ];

  const connectedServices = [
    { name: 'Instagram', icon: Instagram, connected: true, color: 'text-pink-600' },
    { name: 'Spotify', icon: Music, connected: true, color: 'text-green-600' },
    { name: 'OpenAI', icon: Brain, connected: false, color: 'text-purple-600' },
  ];

  const achievements = [
    { title: 'Social Butterfly', description: 'Joined 10+ activities', icon: '🦋', earned: true },
    { title: 'Community Builder', description: 'Created 5+ activities', icon: '🏗️', earned: true },
    { title: 'Friend Magnet', description: 'Made 20+ connections', icon: '🧲', earned: true },
    { title: 'Explorer', description: 'Tried 5+ activity types', icon: '🗺️', earned: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <div className="flex items-center space-x-2">
              <Button
                onClick={onEdit}
                variant="ghost"
                size="sm"
                className="p-2"
              >
                <Edit className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
              >
                <Share className="w-5 h-5" />
              </Button>
              <Button
                onClick={onSettings}
                variant="ghost"
                size="sm"
                className="p-2"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 pb-24">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="overflow-hidden">
            {/* Cover Photo */}
            <div className="relative h-32 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              <div className="absolute inset-0 bg-black/20"></div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-3 right-3 p-2 bg-black/20 backdrop-blur-sm text-white hover:bg-black/30"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>

            {/* Profile Info */}
            <div className="relative px-6 pb-6">
              {/* Profile Picture */}
              <div className="absolute -top-12 left-6">
                <div className="relative">
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-0 right-0 p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                  >
                    <Camera className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="pt-16">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {user.firstName} {user.lastName}
                    </h2>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{user.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-yellow-700">4.9</span>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-4">{user.bio}</p>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-3 py-4 border-t border-gray-100">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-xs text-gray-600 leading-tight">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-100">
                  <Button className="flex-1 flex items-center justify-center space-x-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Message</span>
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Connect
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-200">
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'about', label: 'About' },
                { id: 'activities', label: 'Activities' },
                { id: 'connections', label: 'Friends' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {activeTab === 'about' && (
            <>
              {/* Interests */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-pink-500" />
                  Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </Card>

              {/* Personality Traits */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-500" />
                  Personality
                </h3>
                <div className="space-y-3">
                  {user.personalityTraits.map((trait, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{trait}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            style={{ width: `${75 + Math.random() * 25}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8">
                          {Math.round(75 + Math.random() * 25)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Connected Services */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-500" />
                  Connected Services
                </h3>
                <div className="space-y-3">
                  {connectedServices.map((service, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <service.icon className={`w-5 h-5 ${service.color}`} />
                        <span className="text-gray-700">{service.name}</span>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        service.connected 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {service.connected ? 'Connected' : 'Not Connected'}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Achievements */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-500" />
                  Achievements
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        achievement.earned
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="text-2xl mb-1">{achievement.icon}</div>
                      <h4 className="font-medium text-gray-900 text-sm mb-1">
                        {achievement.title}
                      </h4>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {activeTab === 'activities' && (
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Activities</h3>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'created' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {activity.type === 'created' ? <Users className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{activity.title}</h4>
                      <div className="flex items-center space-x-3 text-xs text-gray-600">
                        <span>{activity.type === 'created' ? 'Created' : 'Joined'}</span>
                        <span>•</span>
                        <span>{activity.participants} participants</span>
                        <span>•</span>
                        <span>{activity.date}</span>
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {activity.status}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'connections' && (
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Friends ({connections.length})</h3>
              <div className="space-y-4">
                {connections.map((connection, index) => (
                  <div key={connection.id} className="flex items-center space-x-4">
                    <img
                      src={connection.image}
                      alt={connection.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{connection.name}</h4>
                      <p className="text-sm text-gray-600">
                        {connection.mutualActivities} mutual activities • Last: {connection.lastActivity}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>

        {/* Settings Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          
          <Button
            variant="outline"
            className="w-full flex items-center justify-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};