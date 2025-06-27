import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Music, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { 
  exchangeCodeForToken, 
  fetchSpotifyTopTracks, 
  fetchSpotifyTopArtists, 
  analyzeMusicTaste, 
  saveSpotifyDataToSupabase,
  getSpotifyProfile
} from '../lib/spotify';

interface SyncStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  error?: string;
}

const SpotifyOAuthScreen: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [syncSteps, setSyncSteps] = useState<SyncStep[]>([
    {
      id: 'auth',
      title: 'Authenticating with Spotify',
      description: 'Verifying your authorization...',
      status: 'pending'
    },
    {
      id: 'profile',
      title: 'Fetching Profile',
      description: 'Getting your Spotify profile...',
      status: 'pending'
    },
    {
      id: 'tracks',
      title: 'Analyzing Top Tracks',
      description: 'Fetching your favorite songs...',
      status: 'pending'
    },
    {
      id: 'artists',
      title: 'Analyzing Top Artists',
      description: 'Getting your favorite artists...',
      status: 'pending'
    },
    {
      id: 'analysis',
      title: 'Analyzing Music Taste',
      description: 'Understanding your music personality...',
      status: 'pending'
    },
    {
      id: 'save',
      title: 'Saving to Profile',
      description: 'Updating your personality data...',
      status: 'pending'
    }
  ]);
  const [overallStatus, setOverallStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const initializeSync = async () => {
      try {
        console.log('🎵 Starting Spotify sync process...');
        
        // Check if user is authenticated
        console.log('🔍 Checking user authentication...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          throw new Error(`Authentication error: ${sessionError.message}`);
        }
        
        if (!session?.user) {
          console.error('❌ No user session found');
          throw new Error('User not authenticated. Please log in first.');
        }
        
        console.log('✅ User authenticated:', session.user.id);
        setCurrentUser(session.user);

        // Get OAuth callback parameters from URL
        console.log('🔍 Getting OAuth callback parameters...');
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        console.log('📋 URL Parameters:', { code: code ? 'present' : 'missing', state: state ? 'present' : 'missing', error });

        if (error) {
          console.error('❌ Spotify authorization error:', error);
          throw new Error(`Spotify authorization failed: ${error}`);
        }

        if (!code || !state) {
          console.error('❌ Missing authorization parameters');
          throw new Error('Missing authorization code or state. Please try connecting again.');
        }

        console.log('✅ OAuth parameters received, starting sync...');
        // Start the sync process
        await performSpotifySync(code, state);

      } catch (err) {
        console.error('❌ Spotify sync initialization failed:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        setOverallStatus('error');
        updateStepStatus('auth', 'error', errorMessage);
      }
    };

    initializeSync();
  }, []);

  const updateStepStatus = (stepId: string, status: SyncStep['status'], error?: string) => {
    console.log(`🔄 Updating step ${stepId} to ${status}${error ? ` with error: ${error}` : ''}`);
    setSyncSteps((prev: SyncStep[]) => prev.map((step: SyncStep) => 
      step.id === stepId 
        ? { ...step, status, error }
        : step
    ));
  };

  const performSpotifySync = async (code: string, state: string) => {
    try {
      console.log('🎵 Starting Spotify sync steps...');

      // Step 1: Exchange code for token
      console.log('🔑 Step 1: Exchanging code for token...');
      updateStepStatus('auth', 'loading');
      const accessToken = await exchangeCodeForToken(code, state);
      if (!accessToken) {
        throw new Error('Failed to obtain access token from Spotify');
      }
      console.log('✅ Access token obtained successfully');
      updateStepStatus('auth', 'success');

      // Step 2: Get Spotify profile
      console.log('👤 Step 2: Fetching Spotify profile...');
      updateStepStatus('profile', 'loading');
      const profile = await getSpotifyProfile(accessToken);
      if (!profile) {
        throw new Error('Failed to fetch Spotify profile');
      }
      console.log('✅ Spotify profile fetched:', profile.display_name);
      updateStepStatus('profile', 'success');

      // Step 3: Fetch top tracks
      console.log('🎵 Step 3: Fetching top tracks...');
      updateStepStatus('tracks', 'loading');
      const tracks = await fetchSpotifyTopTracks(accessToken, 'medium_term');
      console.log(`📊 Fetched ${tracks.length} tracks`);
      if (tracks.length === 0) {
        throw new Error('No tracks found in your Spotify account. Please listen to some music and try again.');
      }
      updateStepStatus('tracks', 'success');

      // Step 4: Fetch top artists
      console.log('🎤 Step 4: Fetching top artists...');
      updateStepStatus('artists', 'loading');
      const artists = await fetchSpotifyTopArtists(accessToken, 'medium_term');
      console.log(`📊 Fetched ${artists.length} artists`);
      if (artists.length === 0) {
        throw new Error('No artists found in your Spotify account. Please listen to some music and try again.');
      }
      updateStepStatus('artists', 'success');

      // Step 5: Analyze music taste
      console.log('🧠 Step 5: Analyzing music taste...');
      updateStepStatus('analysis', 'loading');
      const analysis = analyzeMusicTaste(tracks, artists);
      if (!analysis) {
        throw new Error('Failed to analyze music taste');
      }
      console.log('✅ Music analysis completed:', analysis.musicPersonality);
      updateStepStatus('analysis', 'success');

      // Step 6: Save to Supabase
      console.log('💾 Step 6: Saving data to database...');
      updateStepStatus('save', 'loading');
      const saveSuccess = await saveSpotifyDataToSupabase(
        currentUser.id,
        tracks,
        artists,
        analysis
      );
      
      if (!saveSuccess) {
        throw new Error('Failed to save data to your profile. Please try again.');
      }
      console.log('✅ Data saved successfully');
      updateStepStatus('save', 'success');

      // All steps completed successfully
      console.log('🎉 All steps completed successfully!');
      setOverallStatus('success');
      
      // Notify parent window of success
      if (window.opener) {
        console.log('📤 Notifying parent window of success...');
        window.opener.postMessage({
          type: 'SPOTIFY_OAUTH_SUCCESS',
          data: {
            spotifyConnected: true,
            musicPersonality: analysis.musicPersonality,
            topGenres: analysis.topGenres
          }
        }, window.location.origin);
      }
      
      // Close popup after a short delay
      console.log('⏰ Closing popup in 2 seconds...');
      setTimeout(() => {
        window.close();
      }, 2000);

    } catch (err) {
      console.error('❌ Spotify sync failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setOverallStatus('error');
      
      // Find the current step and mark it as error
      const currentStep = syncSteps.find((step: SyncStep) => step.status === 'loading');
      if (currentStep) {
        updateStepStatus(currentStep.id, 'error', errorMessage);
      }

      // Notify parent window of error
      if (window.opener) {
        console.log('📤 Notifying parent window of error...');
        window.opener.postMessage({
          type: 'SPOTIFY_OAUTH_ERROR',
          error: errorMessage
        }, window.location.origin);
      }
    }
  };

  const handleRetry = () => {
    console.log('🔄 Retrying Spotify sync...');
    // Reload the page to retry
    window.location.reload();
  };

  const handleClose = () => {
    console.log('❌ User cancelled Spotify sync');
    // Notify parent window of cancellation
    if (window.opener) {
      window.opener.postMessage({
        type: 'SPOTIFY_OAUTH_ERROR',
        error: 'User cancelled'
      }, window.location.origin);
    }
    window.close();
  };

  const getStepIcon = (step: SyncStep) => {
    switch (step.status) {
      case 'loading':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Music className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {overallStatus === 'loading' && 'Connecting Spotify...'}
            {overallStatus === 'success' && 'Spotify Connected!'}
            {overallStatus === 'error' && 'Connection Failed'}
          </h1>
          <p className="text-gray-600">
            {overallStatus === 'loading' && 'We\'re analyzing your music taste to improve your matches'}
            {overallStatus === 'success' && 'Your music data has been successfully saved to your profile'}
            {overallStatus === 'error' && 'There was an issue connecting your Spotify account'}
          </p>
        </motion.div>

        {/* Sync Steps */}
        <div className="space-y-4 mb-8">
          {syncSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-lg p-4 border transition-all duration-200 ${
                step.status === 'error' ? 'border-red-200 bg-red-50' :
                step.status === 'success' ? 'border-green-200 bg-green-50' :
                step.status === 'loading' ? 'border-blue-200 bg-blue-50' :
                'border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                {getStepIcon(step)}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                  {step.error && (
                    <p className="text-sm text-red-600 mt-1">{step.error}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Error State */}
        {overallStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Connection Failed</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {overallStatus === 'error' && (
            <>
              <button
                onClick={handleRetry}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleClose}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </>
          )}
          
          {overallStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <p className="text-green-600 font-medium mb-2">
                Closing window...
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpotifyOAuthScreen; 