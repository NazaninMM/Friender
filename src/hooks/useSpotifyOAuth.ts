import { useState, useEffect } from 'react';
import { getSpotifyAuthUrl } from '../lib/spotify';

interface SpotifyOAuthState {
  isConnecting: boolean;
  error: string | null;
  success: boolean;
}

export const useSpotifyOAuth = () => {
  const [state, setState] = useState<SpotifyOAuthState>({
    isConnecting: false,
    error: null,
    success: false
  });

  const initiateOAuth = async () => {
    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));
      
      const authUrl = getSpotifyAuthUrl();
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('Failed to initiate Spotify OAuth:', error);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to connect Spotify'
      }));
    }
  };

  const resetState = () => {
    setState({
      isConnecting: false,
      error: null,
      success: false
    });
  };

  const setSuccess = () => {
    setState(prev => ({ ...prev, success: true, isConnecting: false }));
  };

  const setError = (error: string) => {
    setState(prev => ({ ...prev, error, isConnecting: false }));
  };

  return {
    ...state,
    initiateOAuth,
    resetState,
    setSuccess,
    setError
  };
}; 