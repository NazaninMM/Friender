import React, { useState, useEffect } from 'react';
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
import { userService } from '../../lib/database';
import { DefaultProfileImage } from '../ui/DefaultProfileImage';
import { useAuth } from '../../hooks/useAuth';

interface ProfileScreenProps {
  onEdit?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  onEdit, 
  onSettings,
  onLogout 
}) => {
  const { user, loading, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'about' | 'activities' | 'connections'>('about');
  const [isUploading, setIsUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage ?? '');
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [newLocation, setNewLocation] = useState(user?.location ?? '');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync local profileImage state with user prop
  useEffect(() => {
    if (user) {
      setProfileImage(user.profileImage);
      setNewLocation(user.location);
    }
  }, [user?.profileImage, user?.location]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Loading profile...' : 'No user found'}
          </p>
        </div>
      </div>
    );
  }

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, GIF, etc.)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file is too large. Please select an image smaller than 5MB.');
      return;
    }
    
    setIsUploading(true);
    try {
      // Upload the image to Supabase Storage
      const url = await userService.uploadProfileImage(user.id, file);
      if (url) {
        // Update the profile in the database and user state
        await updateProfile({ profileImage: url });
        setProfileImage(url);
        console.log('✅ Profile image updated successfully');
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('❌ Error updating profile image:', error);
      alert('Failed to update profile image. Please try again.');
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLocationEdit = () => {
    setIsEditingLocation(true);
  };

  const handleLocationSave = async () => {
    if (newLocation.trim() !== user.location) {
      try {
        await updateProfile({ location: newLocation.trim() });
        console.log('✅ Location updated successfully');
      } catch (error) {
        console.error('❌ Error updating location:', error);
        alert('Failed to update location. Please try again.');
        setNewLocation(user.location); // Reset to original
      }
    }
    setIsEditingLocation(false);
  };

  const handleLocationCancel = () => {
    setNewLocation(user.location);
    setIsEditingLocation(false);
  };

  const stats = [
    { label: 'Activities Joined', value: user.joinedActivities.length + 8, icon: Calendar, color: 'text-blue-600' },
    { label: 'Activities Created', value: user.createdActivities.length + 3, icon: Users, color: 'text-green-600' },
    { label: 'Friends Made', value: 24, icon: Heart, color: 'text-pink-600' },
    { label: 'Profile Views', value: 156, icon: Activity, color: 'text-purple-600' },
  ];

  const connectedServices = [
    { name: 'Instagram', icon: Instagram, connected: true, color: 'text-pink-600' },
    { name: 'Spotify', icon: Music, connected: true, color: 'text-green-600' },
    { name: 'OpenAI', icon: Brain, connected: false, color: 'text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={onSettings}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={onLogout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="relative overflow-hidden">
            {/* Profile Image Section */}
            <div className="relative">
              <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-indigo-600 relative">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={`${user.name}'s profile`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <DefaultProfileImage name={user.name} className="w-full h-full" />
                )}
                {/* Edit Image Button */}
                <div className="absolute bottom-4 right-4">
                  <Button
                    onClick={handleImageButtonClick}
                    className="w-10 h-10 rounded-full p-0 bg-white/90 hover:bg-white shadow-lg"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
                    ) : (
                      <Camera className="w-3 h-3" />
                    )}
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <div className="absolute -bottom-8 left-0 right-0 text-xs text-blue-600 bg-white/90 text-center py-1 rounded">
                      Uploading image...
                    </div>
                  )}
                </div>
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
                    {isEditingLocation ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newLocation}
                          onChange={(e) => setNewLocation(e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                          placeholder="Enter your location"
                        />
                        <button
                          onClick={handleLocationSave}
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleLocationCancel}
                          className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{user.location || 'No location set'}</span>
                        <button
                          onClick={handleLocationEdit}
                          className="text-xs text-blue-500 hover:text-blue-700"
                        >
                          Edit
                        </button>
                      </div>
                    )}
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
            </>
          )}

          {activeTab === 'activities' && (
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Activities</h3>
              <div className="space-y-4">
                <p className="text-gray-600 text-center py-8">No recent activities to show</p>
              </div>
            </Card>
          )}

          {activeTab === 'connections' && (
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Friends</h3>
              <div className="space-y-4">
                <p className="text-gray-600 text-center py-8">No friends to show</p>
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};