import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, MapPin, Shield, Users, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface LocationPermissionScreenProps {
  onAllow: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export const LocationPermissionScreen: React.FC<LocationPermissionScreenProps> = ({ 
  onAllow, 
  onSkip, 
  onBack 
}) => {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleAllowLocation = async () => {
    setIsRequesting(true);
    
    try {
      if ('geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          });
        });
        
        // Location permission granted
        console.log('Location granted:', position.coords);
        onAllow();
      } else {
        // Geolocation not supported
        onSkip();
      }
    } catch (error) {
      // Permission denied or error occurred
      console.log('Location permission denied or error:', error);
      setIsRequesting(false);
      // Don't automatically skip, let user choose
    }
  };

  const benefits = [
    {
      icon: Users,
      title: 'Find Nearby Friends',
      description: 'Discover people in your area who share your interests and personality',
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      icon: Zap,
      title: 'Better Matches',
      description: 'Get more relevant friend suggestions based on your location',
      color: 'text-indigo-600',
      bg: 'bg-indigo-100',
    },
    {
      icon: Shield,
      title: 'Privacy Protected',
      description: 'Your exact location is never shared, only general area for matching',
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-40 h-40 bg-blue-200/20 rounded-full blur-xl"
          animate={{
            x: [50, 150, 50],
            y: [50, 200, 50],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-32 h-32 bg-indigo-200/20 rounded-full blur-xl"
          animate={{
            x: [250, 350, 250],
            y: [150, 50, 150],
            scale: [1.2, 0.8, 1.2],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"
            >
              <MapPin className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Enable Location</h2>
            <p className="text-gray-600 leading-relaxed">
              Help us find amazing people near you for better friend matches
            </p>
          </motion.div>

          {/* Benefits Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4 mb-8"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className="p-4 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 ${benefit.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                      <p className="text-sm text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <Button
              onClick={handleAllowLocation}
              disabled={isRequesting}
              className="w-full flex items-center justify-center space-x-2 text-lg py-4"
            >
              <MapPin className="w-5 h-5" />
              <span>{isRequesting ? 'Requesting Permission...' : 'Allow Location Access'}</span>
            </Button>
            
            <Button
              onClick={onSkip}
              variant="outline"
              className="w-full flex items-center justify-center space-x-2"
              disabled={isRequesting}
            >
              <span>Skip for Now</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              onClick={onBack}
              variant="ghost"
              className="w-full flex items-center justify-center space-x-2"
              disabled={isRequesting}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          </motion.div>

          {/* Privacy Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 bg-blue-50 rounded-xl p-4 border border-blue-200"
          >
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Your Privacy Matters</h4>
                <p className="text-sm text-blue-700">
                  We only use your general location (city/area) to suggest nearby friends. 
                  Your exact location is never stored or shared with other users.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};