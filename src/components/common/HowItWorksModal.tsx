import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Shield, Users, Zap, Heart, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  const features = [
    {
      icon: Brain,
      title: 'AI Personality Analysis',
      description: 'We analyze patterns in your music taste, gaming style, and social posts to understand your personality',
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      icon: Shield,
      title: 'Privacy Protected',
      description: 'Your personal data is never shared. We only use compatibility scores, not your actual content',
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      icon: Users,
      title: 'Real-World Activities',
      description: 'Meet through shared activities and experiences, not endless online chatting',
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      icon: Heart,
      title: 'Genuine Connections',
      description: 'Build meaningful friendships based on true compatibility and shared interests',
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">How Friender Works</h2>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Introduction */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Friender helps you connect with people who genuinely align with your personality and lifestyle — 
                    not through swiping or online chats, but through real-world activities and shared experiences.
                  </p>
                </div>
              </motion.div>

              {/* How It Works Steps */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-6">The Process</h3>
                
                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Connect Your Accounts</h4>
                      <p className="text-gray-600">
                        When you link accounts like Spotify, Instagram, or Google Play, Friender analyzes patterns 
                        in your everyday interests. This might include your music taste, gaming style, or the general 
                        vibe of your social posts.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">AI Personality Matching</h4>
                      <p className="text-gray-600">
                        Using this information, our system finds people who are likely to match your energy — 
                        without asking you to answer a bunch of questions or fill out long personality tests.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Join Real Activities</h4>
                      <p className="text-gray-600">
                        Discover and join activities that interest you both. Meet face-to-face through shared 
                        experiences like coffee meetups, hiking trips, or creative workshops.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Build Genuine Friendships</h4>
                      <p className="text-gray-600">
                        You'll get to explore and meet people yourself, face to face, through activities that 
                        interest you both. It's about discovering people you actually enjoy spending time with in real life.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Features Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-6">What Makes Friender Different</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <Card className="p-4 h-full hover:shadow-lg transition-all duration-200">
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 ${feature.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <feature.icon className={`w-5 h-5 ${feature.color}`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Privacy Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-blue-50 rounded-xl p-6 border border-blue-200"
              >
                <div className="flex items-start space-x-3">
                  <Shield className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Your Privacy is Our Priority</h4>
                    <p className="text-blue-800 mb-3">
                      Your hobbies, interests, and personal data are never shared with anyone. We don't display 
                      them to your matches, and they won't see anything you've connected.
                    </p>
                    <p className="text-blue-800">
                      What matters is compatibility — not labels or bios. Friender is built for organic, 
                      in-person connection. It's not about finding online friends or growing your follower 
                      list — it's about discovering people you actually enjoy spending time with in real life.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center pt-4"
              >
                <Button
                  onClick={onClose}
                  size="lg"
                  className="px-8"
                >
                  Ready to Get Started
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};