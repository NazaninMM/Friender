import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowRight, Shield, Sparkles, MapPin, Eye, EyeOff, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';

export const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, signUp } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    age: 18,
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        // Validate email format
        if (!formData.email.trim()) {
          setError('Please enter your email address');
          setLoading(false);
          return;
        }

        if (!formData.password.trim()) {
          setError('Please enter your password');
          setLoading(false);
          return;
        }

        const { error } = await signIn(formData.email.trim(), formData.password);
        if (error) {
          setError(error.message);
        }
      } else {
        // Validation for signup
        if (!formData.firstName.trim()) {
          setError('First name is required');
          setLoading(false);
          return;
        }

        if (!formData.lastName.trim()) {
          setError('Last name is required');
          setLoading(false);
          return;
        }

        if (!formData.email.trim()) {
          setError('Email address is required');
          setLoading(false);
          return;
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
          setError('Please enter a valid email address');
          setLoading(false);
          return;
        }

        if (!formData.password.trim()) {
          setError('Password is required');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        if (formData.age < 18) {
          setError('You must be at least 18 years old to sign up');
          setLoading(false);
          return;
        }

        const { error } = await signUp(formData.email.trim(), formData.password, {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          age: formData.age,
          bio: 'New to Friender! Excited to meet amazing people through shared activities.',
          location: 'San Francisco, CA',
          interests: ['Social', 'Adventure', 'Food'],
          personalityTraits: ['Friendly', 'Open-minded'],
          connectedServices: [],
        });

        if (error) {
          setError(error.message);
        }
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      age: 18,
      confirmPassword: '',
    });
    setError('');
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {mode === 'signin' ? 'Welcome Back' : 'Join Friender'}
            </h2>
            <p className="text-gray-600">
              {mode === 'signin' 
                ? 'Sign in to continue your friendship journey' 
                : 'Create your account to start discovering amazing activities'
              }
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-red-800 font-medium mb-1">
                    {mode === 'signin' ? 'Sign In Failed' : 'Sign Up Failed'}
                  </h4>
                  <p className="text-red-700 text-sm leading-relaxed">{error}</p>
                  {mode === 'signin' && error.includes('No account found') && (
                    <div className="mt-3">
                      <button
                        onClick={switchMode}
                        className="text-sm text-red-600 hover:text-red-700 font-medium underline"
                      >
                        Create a new account instead
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <UserIcon className="w-4 h-4 inline mr-1" />
                      First Name
                    </label>
                    <Input
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={(value) => setFormData({ ...formData, firstName: value })}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <Input
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={(value) => setFormData({ ...formData, lastName: value })}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <Input
                    type="number"
                    placeholder="Age"
                    value={formData.age.toString()}
                    onChange={(value) => setFormData({ ...formData, age: parseInt(value) || 18 })}
                    disabled={loading}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(value) => setFormData({ ...formData, email: value })}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-1" />
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(value) => setFormData({ ...formData, password: value })}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
                  disabled={loading}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full mt-6"
              disabled={loading || !formData.email || !formData.password}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{mode === 'signin' ? 'Signing In...' : 'Creating Account...'}</span>
                </div>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Switch Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={switchMode}
                className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
                disabled={loading}
              >
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          {/* Features */}
          {mode === 'signup' && (
            <div className="mt-8 space-y-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-3 text-gray-700"
              >
                <MapPin className="w-5 h-5 text-blue-500" />
                <span className="text-sm">Discover activities happening near you</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center space-x-3 text-gray-700"
              >
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span className="text-sm">Join group activities that match your interests</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center space-x-3 text-gray-700"
              >
                <Shield className="w-5 h-5 text-blue-500" />
                <span className="text-sm">Build genuine friendships in a safe environment</span>
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};