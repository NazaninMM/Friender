import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Users, Mail, Calendar, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { LocationCaptureScreen } from './LocationCaptureScreen';
import { SignupFormData } from '../../types';

interface SignupFormScreenProps {
  onComplete: (formData: SignupFormData) => void;
  onBack: () => void;
}

export const SignupFormScreen: React.FC<SignupFormScreenProps> = ({ onComplete, onBack }) => {
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    age: 18,
  });
  const [showLocationCapture, setShowLocationCapture] = useState(false);
  const [errors, setErrors] = useState<Partial<SignupFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<SignupFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.age < 18) {
      newErrors.age = 'You must be at least 18 years old to sign up';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowLocationCapture(true);
    }
  };

  const handleLocationComplete = (location: string) => {
    const completeFormData = { ...formData, age: Number(formData.age), location };
    onComplete(completeFormData);
  };

  const handleLocationSkip = () => {
    onComplete({ ...formData, age: Number(formData.age) });
  };

  const handleLocationBack = () => {
    setShowLocationCapture(false);
  };

  const updateFormData = (field: keyof SignupFormData, value: string | number) => {
    if (field === 'age') {
      setFormData(prev => ({ ...prev, [field]: typeof value === 'number' ? value : Number(value) || 18 }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Show location capture screen if we're in that step
  if (showLocationCapture) {
    return (
      <LocationCaptureScreen
        onComplete={handleLocationComplete}
        onBack={handleLocationBack}
        onSkip={handleLocationSkip}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-32 h-32 bg-blue-200/20 rounded-full blur-xl"
          animate={{
            x: [100, 200, 100],
            y: [100, 300, 100],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-24 h-24 bg-indigo-200/20 rounded-full blur-xl"
          animate={{
            x: [300, 400, 300],
            y: [200, 100, 200],
            scale: [1.2, 0.8, 1.2],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Friender</h2>
            <p className="text-gray-600">Let's get to know you better</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-8 shadow-xl border-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    First Name *
                  </label>
                  <Input
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={(value) => updateFormData('firstName', value)}
                    className={errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.firstName && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-1"
                    >
                      {errors.firstName}
                    </motion.p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Last Name *
                  </label>
                  <Input
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={(value) => updateFormData('lastName', value)}
                    className={errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.lastName && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-1"
                    >
                      {errors.lastName}
                    </motion.p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(value) => updateFormData('email', value)}
                    className={errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-1"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Age *
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter your age"
                    value={formData.age.toString()}
                    onChange={(value) => updateFormData('age', Number(value) || 18)}
                    className={errors.age ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.age && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-1"
                    >
                      {errors.age}
                    </motion.p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    You must be at least 18 years old to use Friender
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    onClick={onBack}
                    variant="outline"
                    className="flex-1 flex items-center justify-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </Button>
                  
                  <Button
                    type="submit"
                    className="flex-1 flex items-center justify-center space-x-2"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>

          {/* Privacy Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-gray-500">
              By continuing, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};