import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Users, Heart } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000); // 4 seconds to show the loading animation

    return () => clearTimeout(timer);
  }, [onComplete]);

  const steps = [
    { icon: Brain, text: 'Analyzing your personality...', delay: 0 },
    { icon: Sparkles, text: 'Finding compatibility patterns...', delay: 1 },
    { icon: Users, text: 'Discovering potential friends...', delay: 2 },
    { icon: Heart, text: 'Creating your perfect matches...', delay: 3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              scale: 0,
            }}
            animate={{
              y: [null, -100],
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              delay: Math.random() * 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Neural Network Background */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1200 800">
          {/* Animated connecting lines */}
          <motion.path
            d="M100,200 Q300,100 500,200 T900,200"
            stroke="url(#gradient1)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M200,400 Q400,300 600,400 T1000,400"
            stroke="url(#gradient2)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.5, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M150,600 Q350,500 550,600 T950,600"
            stroke="url(#gradient3)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, delay: 1, repeat: Infinity, ease: "easeInOut" }}
          />
          
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0" />
              <stop offset="50%" stopColor="#3B82F6" stopOpacity="1" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0" />
              <stop offset="50%" stopColor="#6366F1" stopOpacity="1" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0" />
              <stop offset="50%" stopColor="#8B5CF6" stopOpacity="1" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md mx-auto">
          {/* Main Loading Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            {/* Central Brain Icon with Pulsing Effect */}
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-24 h-24 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-2xl"
              >
                <Brain className="w-12 h-12 text-white" />
              </motion.div>

              {/* Orbiting Icons */}
              {[Users, Sparkles, Heart].map((Icon, index) => (
                <motion.div
                  key={index}
                  className="absolute w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center"
                  style={{
                    top: '50%',
                    left: '50%',
                    marginTop: '-16px',
                    marginLeft: '-16px',
                  }}
                  animate={{
                    x: [
                      Math.cos((index * 120 * Math.PI) / 180) * 60,
                      Math.cos(((index * 120 + 360) * Math.PI) / 180) * 60,
                    ],
                    y: [
                      Math.sin((index * 120 * Math.PI) / 180) * 60,
                      Math.sin(((index * 120 + 360) * Math.PI) / 180) * 60,
                    ],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Icon className="w-4 h-4 text-indigo-600" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-900 mb-8"
          >
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              We're Getting to Know You
            </span>
          </motion.h2>

          {/* Progress Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: step.delay + 0.5 }}
                className="flex items-center space-x-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: step.delay + 0.7, type: "spring" }}
                  className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <step.icon className="w-5 h-5 text-white" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: step.delay + 0.8 }}
                  className="flex-1"
                >
                  <p className="text-gray-700 font-medium text-left">{step.text}</p>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ 
                        delay: step.delay + 1,
                        duration: 0.8,
                        ease: "easeOut"
                      }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Loading Dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="flex justify-center space-x-2 mt-12"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="text-gray-600 mt-6 leading-relaxed"
          >
            Our AI is analyzing your personality and preferences to find your perfect friend matches. 
            This will only take a moment...
          </motion.p>
        </div>
      </div>
    </div>
  );
};