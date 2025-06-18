import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, MapPin, Music, MessageCircle, Star, Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Match, User } from '../../types';
import { generateMatches } from '../../data/mockData';

interface DiscoverScreenProps {
  user: User;
  onMatch: (match: Match) => void;
}

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({ user, onMatch }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading matches
    setTimeout(() => {
      setMatches(generateMatches(user));
      setIsLoading(false);
    }, 1500);
  }, [user]);

  const handleSwipe = (action: 'like' | 'pass') => {
    if (currentIndex >= matches.length) return;

    const currentMatch = matches[currentIndex];
    const updatedMatch = { ...currentMatch, status: action === 'like' ? 'liked' : 'passed' };
    
    if (action === 'like') {
      onMatch(updatedMatch);
    }

    setCurrentIndex(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Users className="w-8 h-8 text-white" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Finding Your Friend Matches</h3>
          <p className="text-gray-600">AI is analyzing personalities and shared interests...</p>
        </motion.div>
      </div>
    );
  }

  if (currentIndex >= matches.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Star className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">You're All Caught Up!</h3>
          <p className="text-gray-600">Check back later for new friend matches based on your interests</p>
        </motion.div>
      </div>
    );
  }

  const currentMatch = matches[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Discover Friends</h2>
            <div className="bg-white rounded-full px-3 py-1 shadow-sm border border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                {currentIndex + 1}/{matches.length}
              </span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentMatch.id}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-6 overflow-hidden">
              <div className="relative">
                <img
                  src={currentMatch.user.profileImage}
                  alt={currentMatch.user.name}
                  className="w-full h-96 object-cover"
                />
                
                <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-white font-medium text-sm">
                      {Math.round(currentMatch.similarityScore * 100)}%
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {currentMatch.user.name}, {currentMatch.user.age}
                  </h3>
                  <div className="flex items-center text-white/90 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{currentMatch.user.location}</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">{currentMatch.user.bio}</p>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">Why You'll Be Great Friends</h4>
                    <span className="text-sm text-primary-600 font-medium">
                      {Math.round(currentMatch.similarityScore * 100)}% compatible
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 bg-primary-50 rounded-lg p-3">
                    {currentMatch.matchReason}
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Shared Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentMatch.sharedInterests.slice(0, 6).map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 rounded-full text-sm font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {currentMatch.user.topArtists.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <Music className="w-4 h-4 text-gray-600" />
                      <h4 className="font-semibold text-gray-900">Music Taste</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentMatch.user.topArtists.slice(0, 3).map((artist, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                        >
                          {artist}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center space-x-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => handleSwipe('pass')}
              variant="outline"
              className="w-16 h-16 rounded-full border-2 border-gray-300 hover:border-gray-400"
            >
              <X className="w-6 h-6 text-gray-600" />
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => handleSwipe('like')}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
            >
              <Heart className="w-6 h-6 text-white" />
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => {}} // TODO: Implement super like or message
              variant="outline"
              className="w-16 h-16 rounded-full border-2 border-accent-300 hover:border-accent-400"
            >
              <MessageCircle className="w-6 h-6 text-accent-600" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};