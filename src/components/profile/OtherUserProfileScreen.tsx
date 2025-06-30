import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Heart,
  MessageCircle,
  Share,
  Instagram,
  Music,
  Brain,
  Shield,
  Star,
  CheckCircle,
  Plus,
  Sparkles,
  Trophy,
  Target,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { userService, activityService } from "../../lib/database";
import { DefaultProfileImage } from "../ui/DefaultProfileImage";
import { User, Activity as ActivityType } from "../../types";

interface OtherUserProfileScreenProps {
  userId: string;
  onBack: () => void;
  onMessage?: (userId: string) => void;
}

export const OtherUserProfileScreen: React.FC<OtherUserProfileScreenProps> = ({
  userId,
  onBack,
  onMessage,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "about" | "activities" | "connections"
  >("about");
  const [userActivities, setUserActivities] = useState<ActivityType[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // Fetch user profile when component mounts
  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  // Fetch user activities when user changes
  useEffect(() => {
    if (user?.id) {
      fetchUserActivities();
    }
  }, [user?.id]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await userService.getUserProfile(userId);
      setUser(userProfile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivities = async () => {
    if (!user?.id) return;

    setActivitiesLoading(true);
    try {
      const activities = await activityService.getUserActivities(user.id);
      setUserActivities(activities);
    } catch (error) {
      console.error("Error fetching user activities:", error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const handleMessage = () => {
    if (onMessage && user) {
      onMessage(user.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">User not found</p>
          <Button onClick={onBack} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Calculate stats from user data and activities
  const createdActivities = userActivities.filter(
    (activity) => activity.createdBy.id === user.id
  );
  const joinedActivities = userActivities.filter(
    (activity) => activity.createdBy.id !== user.id
  );

  const stats = [
    {
      label: "Activities Joined",
      value: joinedActivities.length,
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Activities Created",
      value: createdActivities.length,
      icon: Plus,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Profile Views",
      value: 0,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  const connectedServices = [
    {
      name: "Instagram",
      icon: Instagram,
      connected: user.connectedServices.includes("instagram"),
      color: "text-pink-600",
    },
    {
      name: "Spotify",
      icon: Music,
      connected: user.connectedServices.includes("spotify"),
      color: "text-green-600",
    },
    {
      name: "OpenAI",
      icon: Brain,
      connected: user.connectedServices.includes("openai"),
      color: "text-purple-600",
    },
    {
      name: "Google Play",
      icon: Trophy,
      connected: user.connectedServices.includes("google-play"),
      color: "text-blue-600",
    },
  ];

  const achievements = [
    {
      name: "Early Adopter",
      description: "One of the first to join Friender",
      icon: Star,
      color: "text-yellow-500",
    },
    {
      name: "Social Butterfly",
      description: "Joined 10+ activities",
      icon: Users,
      color: "text-blue-500",
    },
    {
      name: "Activity Creator",
      description: "Created their first activity",
      icon: Plus,
      color: "text-green-500",
    },
    {
      name: "Well Connected",
      description: "Connected 3+ social accounts",
      icon: Sparkles,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <h1 className="text-xl font-bold text-gray-900">Profile</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Enhanced Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="relative overflow-hidden border-0 shadow-xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
              <div className="absolute inset-0 bg-black/10"></div>
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
            </div>

            <div className="relative p-6">
              {/* Profile Image Section */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={`${user.name}'s profile`}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden">
                      <DefaultProfileImage
                        name={user.name}
                        className="w-full h-full text-2xl"
                      />
                    </div>
                  )}
                </div>

                <div className="text-center mt-4">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {user.firstName} {user.lastName}
                  </h2>
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 text-yellow-300 fill-current" />
                      <span className="text-sm font-medium text-white">
                        4.9
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4 text-green-300" />
                      <span className="text-sm font-medium text-white">
                        Verified
                      </span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center justify-center text-white/90">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {user.location || "No location set"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <div className="text-center mb-6">
                  <p className="text-white/90 leading-relaxed">{user.bio}</p>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="text-center"
                  >
                    <div
                      className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}
                    >
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className="text-lg font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-xs text-white/70 leading-tight">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={handleMessage}
                  className="flex-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all duration-200"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button className="flex-1 bg-white text-gray-900 hover:bg-gray-100 transition-all duration-200">
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Enhanced Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="p-1 border-0 shadow-lg">
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: "about", label: "About", icon: Users },
                { id: "activities", label: "Activities", icon: Calendar },
                { id: "connections", label: "Friends", icon: Users },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Enhanced Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {activeTab === "about" && (
            <>
              {/* Interests */}
              <Card className="p-6 border-0 shadow-lg">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-pink-500" />
                  Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="px-3 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-xl text-sm font-medium hover:from-blue-200 hover:to-indigo-200 transition-all duration-200"
                    >
                      {interest}
                    </motion.span>
                  ))}
                </div>
              </Card>

              {/* Personality Traits */}
              <Card className="p-6 border-0 shadow-lg">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-500" />
                  Personality
                </h3>
                <div className="space-y-4">
                  {user.personalityTraits.map((trait, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <span className="text-gray-700 font-medium">{trait}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${75 + Math.random() * 25}%` }}
                            transition={{
                              delay: 0.5 + index * 0.1,
                              duration: 0.8,
                            }}
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-10 text-right font-medium">
                          {Math.round(75 + Math.random() * 25)}%
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Connected Services */}
              <Card className="p-6 border-0 shadow-lg">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-500" />
                  Connected Services
                </h3>
                <div className="space-y-3">
                  {connectedServices.map((service, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            service.connected ? "bg-green-100" : "bg-gray-100"
                          }`}
                        >
                          <service.icon
                            className={`w-5 h-5 ${
                              service.connected
                                ? service.color
                                : "text-gray-400"
                            }`}
                          />
                        </div>
                        <span className="text-gray-700 font-medium">
                          {service.name}
                        </span>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          service.connected
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {service.connected ? "Connected" : "Not Connected"}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Achievements */}
              <Card className="p-6 border-0 shadow-lg">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                  Achievements
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl text-center hover:from-gray-100 hover:to-gray-200 transition-all duration-200"
                    >
                      <achievement.icon
                        className={`w-6 h-6 ${achievement.color} mx-auto mb-2`}
                      />
                      <h4 className="font-medium text-gray-900 text-sm mb-1">
                        {achievement.name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {achievement.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {activeTab === "activities" && (
            <Card className="p-6 border-0 shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-4">
                Recent Activities
              </h3>
              {activitiesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading activities...</p>
                </div>
              ) : userActivities.length > 0 ? (
                <div className="space-y-4">
                  {userActivities.slice(0, 5).map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {activity.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {activity.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {activity.location}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(activity.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {activity.attendees.length} attendees
                            </span>
                          </div>
                        </div>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            activity.createdBy.id === user.id
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {activity.createdBy.id === user.id
                            ? "Created"
                            : "Joined"}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {userActivities.length > 5 && (
                    <div className="text-center pt-4">
                      <p className="text-sm text-gray-500">
                        Showing 5 of {userActivities.length} activities
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No activities to show</p>
                </div>
              )}
            </Card>
          )}

          {activeTab === "connections" && (
            <Card className="p-6 border-0 shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Friends</h3>
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No friends to show</p>
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};