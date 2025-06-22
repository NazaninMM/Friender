import { useState, useEffect } from 'react';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    address: null,
    isLoading: false,
    error: null,
  });

  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
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

  const getCurrentLocation = async (): Promise<string | null> => {
    if (!('geolocation' in navigator)) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        isLoading: false,
      }));
      return null;
    }

    setLocation(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      const address = await reverseGeocode(latitude, longitude);

      setLocation({
        latitude,
        longitude,
        address,
        isLoading: false,
        error: null,
      });

      return address;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get your location';
      setLocation(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return null;
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    if (!('geolocation' in navigator)) {
      return false;
    }

    try {
      // Try to get current position to trigger permission request
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 0
        });
      });
      return true;
    } catch (err) {
      return false;
    }
  };

  return {
    location,
    getCurrentLocation,
    requestLocationPermission,
    reverseGeocode,
  };
}; 