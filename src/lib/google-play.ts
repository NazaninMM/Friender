// Google Play Games configuration and utilities

export const GOOGLE_PLAY_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_PLAY_CLIENT_ID,
  clientSecret: import.meta.env.VITE_GOOGLE_PLAY_CLIENT_SECRET,
  redirectUri: `${window.location.origin}/google-play-popup.html`,
  scope: 'https://www.googleapis.com/auth/games https://www.googleapis.com/auth/userinfo.profile',
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth'
} as const;

// Validate that required environment variables are set
export function validateGooglePlayConfig(): boolean {
  if (!GOOGLE_PLAY_CONFIG.clientId || GOOGLE_PLAY_CONFIG.clientId === 'your-google-play-client-id.apps.googleusercontent.com') {
    console.warn('Google Play Client ID is not configured or using placeholder value');
    return false;
  }
  
  if (!GOOGLE_PLAY_CONFIG.clientSecret || GOOGLE_PLAY_CONFIG.clientSecret === 'your-google-play-client-secret') {
    console.warn('Google Play Client Secret is not configured or using placeholder value');
    return false;
  }
  
  return true;
}

// Google Play Games API endpoints
export const GOOGLE_PLAY_API = {
  games: 'https://games.googleapis.com/games/v1/players/me/playedGames',
  achievements: 'https://games.googleapis.com/games/v1/players/me/achievements',
  friends: 'https://games.googleapis.com/games/v1/players/me/friends'
} as const;

// Helper function to make authenticated requests to Google Play Games API
export async function fetchGooglePlayData(endpoint: string, accessToken: string) {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Google Play API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error(`Failed to fetch from ${endpoint}:`, error);
    
    // Return mock data for development/testing purposes
    // In production, this should be handled server-side
    if (endpoint.includes('playedGames')) {
      return {
        items: [
          {
            gameId: 'mock_game_1',
            name: 'Sample Game 1',
            playTime: '2 hours',
            lastPlayed: new Date().toISOString()
          },
          {
            gameId: 'mock_game_2', 
            name: 'Sample Game 2',
            playTime: '1 hour',
            lastPlayed: new Date().toISOString()
          }
        ]
      };
    } else if (endpoint.includes('achievements')) {
      return {
        items: [
          {
            id: 'mock_achievement_1',
            name: 'First Steps',
            description: 'Complete your first game',
            unlocked: true
          }
        ]
      };
    } else if (endpoint.includes('friends')) {
      return {
        items: [
          {
            id: 'mock_friend_1',
            displayName: 'Friend 1',
            profileImageUrl: null
          }
        ]
      };
    }
    
    throw new Error(`Failed to fetch Google Play Games data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Alternative approach: Use Google People API for basic profile info
export async function fetchGoogleProfile(accessToken: string) {
  try {
    const response = await fetch('https://people.googleapis.com/v1/people/me?personFields=names,photos,emailAddresses', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Google People API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Failed to fetch Google profile:', error);
    return null;
  }
}