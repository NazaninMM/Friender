import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, MapPin, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface LocationCaptureScreenProps {
  onComplete: (location: string) => void;
  onBack: () => void;
  onSkip: () => void;
}

export const LocationCaptureScreen: React.FC<LocationCaptureScreenProps> = ({ 
  onComplete, 
  onBack, 
  onSkip 
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [location, setLocation] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'capturing' | 'success' | 'error'>('idle');

  const captureLocation = async () => {
    setIsCapturing(true);
    setError('');
    setStatus('capturing');

    try {
      if (!('geolocation' in navigator)) {
        throw new Error('Geolocation is not supported by your browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      // Convert coordinates to readable location using reverse geocoding
      const { latitude, longitude } = position.coords;
      const locationString = await reverseGeocode(latitude, longitude);
      
      setLocation(locationString);
      setStatus('success');
      
      // Auto-complete after a short delay
      setTimeout(() => {
        onComplete(locationString);
      }, 1500);

    } catch (err: any) {
      console.error('Location capture error:', err);
      setError(err.message || 'Failed to get your location');
      setStatus('error');
    } finally {
      setIsCapturing(false);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      // Fallback: Use a free reverse geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to get location details');
      }

      const data = await response.json();
      
      // Extract city and state/country from the response
      const address = data.address;
      if (address.city) {
        return `${address.city}, ${address.state || address.country}`;
      } else if (address.town) {
        return `${address.town}, ${address.state || address.country}`;
      } else if (address.village) {
        return `${address.village}, ${address.state || address.country}`;
      } else if (address.county) {
        return `${address.county}, ${address.state || address.country}`;
      } else {
        return `${address.state || address.country}`;
      }

    } catch (err) {
      console.error('Reverse geocoding error:', err);
      // Fallback to coordinates if geocoding fails
      return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
    }
  };

  const handleManualLocation = () => {
    // Allow user to enter location manually
    const manualLocation = prompt('Please enter your city and state (e.g., "San Francisco, CA"):');
    if (manualLocation && manualLocation.trim()) {
      setLocation(manualLocation.trim());
      setStatus('success');
      setTimeout(() => {
        onComplete(manualLocation.trim());
      }, 500);
    }
  };

  useEffect(() => {
    // Auto-start location capture when component mounts
    captureLocation();
  }, []);

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
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <MapPin className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Where are you?</h2>
            <p className="text-gray-600">We're getting your location to find friends nearby</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-8 shadow-xl border-0">
              <div className="space-y-6">
                {/* Status Display */}
                <div className="text-center">
                  {status === 'capturing' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center space-y-4"
                    >
                      <Loader className="w-8 h-8 text-blue-500 animate-spin" />
                      <p className="text-gray-600">Getting your location...</p>
                    </motion.div>
                  )}

                  {status === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center space-y-4"
                    >
                      <CheckCircle className="w-8 h-8 text-green-500" />
                      <div>
                        <p className="text-gray-600 mb-2">Location found:</p>
                        <p className="text-lg font-semibold text-gray-900">{location}</p>
                      </div>
                    </motion.div>
                  )}

                  {status === 'error' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center space-y-4"
                    >
                      <AlertCircle className="w-8 h-8 text-red-500" />
                      <div>
                        <p className="text-red-600 mb-2">{error}</p>
                        <p className="text-sm text-gray-600">You can enter your location manually</p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  {status === 'error' && (
                    <Button
                      onClick={handleManualLocation}
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Enter Location Manually</span>
                    </Button>
                  )}

                  {status === 'capturing' && (
                    <Button
                      onClick={captureLocation}
                      disabled={isCapturing}
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Retry Location</span>
                    </Button>
                  )}

                  <div className="flex space-x-4">
                    <Button
                      onClick={onBack}
                      variant="outline"
                      className="flex-1 flex items-center justify-center space-x-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </Button>
                    
                    <Button
                      onClick={onSkip}
                      variant="outline"
                      className="flex-1 flex items-center justify-center space-x-2"
                    >
                      <span>Skip</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
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
              Your location helps us find friends nearby. We only use your general area, not your exact location.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}; 