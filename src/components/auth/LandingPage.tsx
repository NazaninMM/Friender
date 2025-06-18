import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowRight, Sparkles, MapPin, Calendar, Heart, Shield, Zap, Brain, HelpCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { HowItWorksModal } from '../common/HowItWorksModal';

interface LandingPageProps {
  onSignUp: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSignUp, onLogin }) => {
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);

  // Floating shapes animation variants
  const floatingShapes = [
    { size: 'w-32 h-32', color: 'bg-blue-200/20', delay: 0, duration: 8 },
    { size: 'w-24 h-24', color: 'bg-indigo-200/20', delay: 1, duration: 6 },
    { size: 'w-40 h-40', color: 'bg-purple-200/15', delay: 2, duration: 10 },
    { size: 'w-20 h-20', color: 'bg-blue-300/25', delay: 0.5, duration: 7 },
    { size: 'w-36 h-36', color: 'bg-indigo-300/15', delay: 1.5, duration: 9 },
    { size: 'w-28 h-28', color: 'bg-purple-300/20', delay: 2.5, duration: 8 },
  ];

  const features = [
    {
      icon: Brain,
      title: 'AI Personality Matching',
      description: 'Our advanced AI analyzes your digital footprint across platforms to understand your true personality',
      gradient: 'from-purple-400 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
    },
    {
      icon: Sparkles,
      title: 'Beyond the Surface',
      description: 'Skip the small talk. Connect with people who truly understand you through deep compatibility',
      gradient: 'from-indigo-400 to-indigo-600',
      bgGradient: 'from-indigo-50 to-indigo-100',
    },
    {
      icon: Heart,
      title: 'Authentic Connections',
      description: 'Build meaningful friendships based on genuine personality compatibility, not just shared interests',
      gradient: 'from-pink-400 to-pink-600',
      bgGradient: 'from-pink-50 to-pink-100',
    },
  ];

  const handleHowItWorks = () => {
    setShowHowItWorksModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Bolt.new Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute top-4 right-4 z-20"
      >
        <a
          href="https://bolt.new/"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-blue-600 p-2 rounded-lg hover:scale-105 transition-transform duration-200 shadow-lg"
        >
          <img
            src="/logotext_poweredby_360w.png"
            alt="Powered by Bolt.new"
            className="h-8 w-auto drop-shadow-lg hover:drop-shadow-xl transition-all duration-200"
          />
        </a>
      </motion.div>

      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingShapes.map((shape, index) => (
          <motion.div
            key={index}
            className={`absolute rounded-full ${shape.size} ${shape.color} blur-xl`}
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              scale: 0.8,
            }}
            animate={{
              x: [
                Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              ],
              y: [
                Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              ],
              scale: [0.8, 1.2, 0.8],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: shape.duration,
              delay: shape.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Geometric Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            {/* Enhanced Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1] 
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut"
                }}
                className="w-24 h-24 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/25"
              >
                <Users className="w-12 h-12 text-white" />
              </motion.div>
            </motion.div>
            
            {/* Enhanced Typography */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-6xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Friender
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto"
            >
              Discover genuine connections through AI-powered personality matching, leveraging insights from your favorite platforms
            </motion.p>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex items-center justify-center space-x-8 mb-12 text-sm text-gray-500"
            >
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Privacy Protected</span>
              </div>
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-purple-500" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Real Connections</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="grid md:grid-cols-3 gap-8 mb-16"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.2 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <Card className="p-8 h-full relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                  {/* Card Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-50 group-hover:opacity-70 transition-opacity duration-300`} />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>

                    {/* Text */}
                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                      {feature.description}
                    </p>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8 }}
            className="space-y-6"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={onSignUp}
                size="lg"
                className="text-xl px-12 py-4 shadow-2xl hover:shadow-3xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 transform transition-all duration-300"
              >
                Discover Your People
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-6 h-6 ml-3" />
                </motion.div>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={onLogin}
                variant="outline"
                size="lg"
                className="text-lg px-10 py-3 border-2 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300"
              >
                Already have an account? Sign In
              </Button>
            </motion.div>

            {/* How it Works Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleHowItWorks}
                variant="ghost"
                size="lg"
                className="text-lg px-8 py-3 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-all duration-300"
              >
                <HelpCircle className="w-5 h-5 mr-2" />
                How it Works
              </Button>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2 }}
              className="text-sm text-gray-500 mt-8 max-w-md mx-auto"
            >
              Join thousands of people who have found their community through Friender. 
              Your next adventure and new friendships are just a click away.
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* How It Works Modal */}
      <HowItWorksModal 
        isOpen={showHowItWorksModal}
        onClose={() => setShowHowItWorksModal(false)}
      />
    </div>
  );
};