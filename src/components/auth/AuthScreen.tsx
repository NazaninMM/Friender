import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowRight, Shield, Sparkles, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { User } from '../../types';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'welcome' | 'signup'>('welcome');
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    location: '',
    bio: '',
  });

  const handleSignup = () => {
    if (formData.name && formData.age && formData.location) {
      const newUser: User = {
        id: 'current-user',
        name: formData.name,
        age: parseInt(formData.age),
        profileImage: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=400',
        bio: formData.bio || 'New to Friender! Excited to meet amazing people through shared activities.',
        location: formData.location,
        interests: ['Social', 'Adventure', 'Food'],
        personalityTraits: ['Friendly', 'Open-minded'],
        joinedActivities: [],
        createdActivities: [],
      };
      onLogin(newUser);
    }
  };

  if (step === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Join Friender</h2>
              <p className="text-gray-600">Create your profile to start discovering amazing activities</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <Input
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(value) => setFormData({ ...formData, name: value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <Input
                  type="number"
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={(value) => setFormData({ ...formData, age: value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <Input
                  placeholder="City, State"
                  value={formData.location}
                  onChange={(value) => setFormData({ ...formData, location: value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio (Optional)</label>
                <textarea
                  placeholder="Tell us a bit about yourself..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-all duration-200 resize-none h-20"
                />
              </div>

              <Button
                onClick={handleSignup}
                className="w-full mt-6"
                disabled={!formData.name || !formData.age || !formData.location}
              >
                Start Exploring
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="mb-12">
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1] 
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
          >
            <Users className="w-12 h-12 text-white" />
          </motion.div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Friender
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Make real friends through shared activities and experiences
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center space-x-3 text-gray-700"
          >
            <MapPin className="w-5 h-5 text-indigo-500" />
            <span>Discover activities happening near you</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center space-x-3 text-gray-700"
          >
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span>Join group activities that match your interests</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center space-x-3 text-gray-700"
          >
            <Shield className="w-5 h-5 text-indigo-500" />
            <span>Build genuine friendships in a safe environment</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            onClick={() => setStep('signup')}
            size="lg"
            className="w-full text-lg shadow-xl"
          >
            Start Making Friends
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <p className="text-sm text-gray-500 mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};