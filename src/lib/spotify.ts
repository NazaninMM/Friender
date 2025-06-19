// Spotify API integration for music taste analysis
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: { name: string };
  popularity: number;
  audio_features?: {
    danceability: number;
    energy: number;
    valence: number;
    acousticness: number;
    instrumentalness: number;
    tempo: number;
  };
}

export interface SpotifyTopTracksResponse {
  items: SpotifyTrack[];
}

// Mock function for Spotify top tracks (since we don't have real API integration)
export const fetchSpotifyTopTracks = async (accessToken?: string): Promise<SpotifyTrack[]> => {
  // In a real implementation, this would make API calls to Spotify
  // For now, return mock data to prevent errors
  
  console.log('fetchSpotifyTopTracks called with token:', accessToken ? 'Present' : 'None');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock Spotify tracks data
  const mockTracks: SpotifyTrack[] = [
    {
      id: '1',
      name: 'Blinding Lights',
      artists: [{ name: 'The Weeknd' }],
      album: { name: 'After Hours' },
      popularity: 95,
      audio_features: {
        danceability: 0.514,
        energy: 0.730,
        valence: 0.334,
        acousticness: 0.001,
        instrumentalness: 0.000,
        tempo: 171.005
      }
    },
    {
      id: '2',
      name: 'Watermelon Sugar',
      artists: [{ name: 'Harry Styles' }],
      album: { name: 'Fine Line' },
      popularity: 92,
      audio_features: {
        danceability: 0.548,
        energy: 0.816,
        valence: 0.557,
        acousticness: 0.122,
        instrumentalness: 0.000,
        tempo: 95.039
      }
    },
    {
      id: '3',
      name: 'Good 4 U',
      artists: [{ name: 'Olivia Rodrigo' }],
      album: { name: 'SOUR' },
      popularity: 89,
      audio_features: {
        danceability: 0.563,
        energy: 0.664,
        valence: 0.688,
        acousticness: 0.020,
        instrumentalness: 0.000,
        tempo: 178.990
      }
    },
    {
      id: '4',
      name: 'Levitating',
      artists: [{ name: 'Dua Lipa' }],
      album: { name: 'Future Nostalgia' },
      popularity: 88,
      audio_features: {
        danceability: 0.702,
        energy: 0.825,
        valence: 0.915,
        acousticness: 0.003,
        instrumentalness: 0.000,
        tempo: 103.001
      }
    },
    {
      id: '5',
      name: 'Stay',
      artists: [{ name: 'The Kid LAROI' }, { name: 'Justin Bieber' }],
      album: { name: 'Stay' },
      popularity: 87,
      audio_features: {
        danceability: 0.591,
        energy: 0.764,
        valence: 0.478,
        acousticness: 0.012,
        instrumentalness: 0.000,
        tempo: 169.928
      }
    }
  ];
  
  return mockTracks;
};

// Function to get Spotify authorization URL
export const getSpotifyAuthUrl = (): string => {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || `${window.location.origin}/callback`;
  const scopes = 'user-top-read user-read-private user-read-email';
  
  if (!clientId) {
    console.warn('Spotify Client ID not configured');
    return '#';
  }
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri,
    state: Math.random().toString(36).substring(7)
  });
  
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

// Function to exchange authorization code for access token
export const exchangeCodeForToken = async (code: string): Promise<string | null> => {
  try {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
    const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || `${window.location.origin}/callback`;
    
    if (!clientId || !clientSecret) {
      console.warn('Spotify credentials not configured');
      return null;
    }
    
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return null;
  }
};

// Function to get user's Spotify profile
export const getSpotifyProfile = async (accessToken: string) => {
  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch Spotify profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Spotify profile:', error);
    return null;
  }
};

// Function to analyze music taste from tracks
export const analyzeMusicTaste = (tracks: SpotifyTrack[]) => {
  if (!tracks.length) return null;
  
  const features = tracks
    .filter(track => track.audio_features)
    .map(track => track.audio_features!);
  
  if (!features.length) return null;
  
  const avgFeatures = {
    danceability: features.reduce((sum, f) => sum + f.danceability, 0) / features.length,
    energy: features.reduce((sum, f) => sum + f.energy, 0) / features.length,
    valence: features.reduce((sum, f) => sum + f.valence, 0) / features.length,
    acousticness: features.reduce((sum, f) => sum + f.acousticness, 0) / features.length,
    instrumentalness: features.reduce((sum, f) => sum + f.instrumentalness, 0) / features.length,
    tempo: features.reduce((sum, f) => sum + f.tempo, 0) / features.length
  };
  
  // Derive personality insights from music features
  const insights = {
    energyLevel: avgFeatures.energy > 0.7 ? 'high' : avgFeatures.energy > 0.4 ? 'medium' : 'low',
    mood: avgFeatures.valence > 0.6 ? 'positive' : avgFeatures.valence > 0.4 ? 'neutral' : 'melancholic',
    socialness: avgFeatures.danceability > 0.6 ? 'social' : 'introspective',
    musicStyle: avgFeatures.acousticness > 0.5 ? 'acoustic' : 'electronic'
  };
  
  return {
    features: avgFeatures,
    insights,
    topArtists: [...new Set(tracks.flatMap(track => track.artists.map(artist => artist.name)))].slice(0, 5)
  };
};