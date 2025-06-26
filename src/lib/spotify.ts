// Spotify API integration for music taste analysis
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string; id: string }>;
  album: { name: string; id: string };
  popularity: number;
  audio_features?: {
    danceability: number;
    energy: number;
    valence: number;
    acousticness: number;
    instrumentalness: number;
    tempo: number;
    key: number;
    mode: number;
    speechiness: number;
    liveness: number;
  };
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  images?: Array<{ url: string; width: number; height: number }>;
}

export interface SpotifyTopTracksResponse {
  items: SpotifyTrack[];
  total: number;
  limit: number;
  offset: number;
}

export interface SpotifyTopArtistsResponse {
  items: SpotifyArtist[];
  total: number;
  limit: number;
  offset: number;
}

export interface SpotifyProfile {
  id: string;
  display_name: string;
  email: string;
  images?: Array<{ url: string; width: number; height: number }>;
  country: string;
  product: string;
}

// Spotify OAuth configuration
const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || `http://localhost:5173/spotify-popup.html`;

// Generate Spotify OAuth URL
export const getSpotifyAuthUrl = (): string => {
  if (!SPOTIFY_CLIENT_ID) {
    throw new Error('Spotify Client ID not configured');
  }

  const scopes = [
    'user-top-read',
    'user-read-private',
    'user-read-email',
    'user-read-recently-played'
  ].join(' ');

  const state = Math.random().toString(36).substring(7);
  
  // Store state in localStorage for verification
  localStorage.setItem('spotify_oauth_state', state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: scopes,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    state: state,
    show_dialog: 'true' // Force user to authorize each time
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

// Exchange authorization code for access token
export const exchangeCodeForToken = async (code: string, state: string): Promise<string | null> => {
  try {
    // Verify state parameter
    const storedState = localStorage.getItem('spotify_oauth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    // Clear stored state
    localStorage.removeItem('spotify_oauth_state');

    const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
    if (!SPOTIFY_CLIENT_ID || !clientSecret) {
      throw new Error('Spotify credentials not configured');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${clientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return null;
  }
};

// Fetch user's Spotify profile
export const getSpotifyProfile = async (accessToken: string): Promise<SpotifyProfile | null> => {
  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Spotify profile: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Spotify profile:', error);
    return null;
  }
};

// Fetch user's top tracks
export const fetchSpotifyTopTracks = async (accessToken: string, timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<SpotifyTrack[]> => {
  try {
    const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=${timeRange}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch top tracks: ${response.status}`);
    }

    const data: SpotifyTopTracksResponse = await response.json();
    
    // Fetch audio features for each track
    const tracksWithFeatures = await Promise.all(
      data.items.map(async (track) => {
        const features = await fetchTrackAudioFeatures(accessToken, track.id);
        return {
          ...track,
          audio_features: features
        };
      })
    );

    return tracksWithFeatures;
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    return [];
  }
};

// Fetch user's top artists
export const fetchSpotifyTopArtists = async (accessToken: string, timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<SpotifyArtist[]> => {
  try {
    const response = await fetch(`https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${timeRange}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch top artists: ${response.status}`);
    }

    const data: SpotifyTopArtistsResponse = await response.json();
    return data.items;
  } catch (error) {
    console.error('Error fetching top artists:', error);
    return [];
  }
};

// Fetch audio features for a track
export const fetchTrackAudioFeatures = async (accessToken: string, trackId: string) => {
  try {
    const response = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching audio features:', error);
    return null;
  }
};

// Analyze music taste from tracks and artists
export const analyzeMusicTaste = (tracks: SpotifyTrack[], artists: SpotifyArtist[]) => {
  if (!tracks.length && !artists.length) return null;

  const analysis = {
    genres: new Map<string, number>(),
    moods: {
      energetic: 0,
      calm: 0,
      happy: 0,
      melancholic: 0,
      danceable: 0,
      acoustic: 0
    },
    audioFeatures: {
      avgDanceability: 0,
      avgEnergy: 0,
      avgValence: 0,
      avgAcousticness: 0,
      avgTempo: 0
    },
    topArtists: artists.slice(0, 10).map(artist => artist.name),
    topTracks: tracks.slice(0, 10).map(track => track.name),
    musicPersonality: [] as string[]
  };

  // Analyze genres from artists
  artists.forEach(artist => {
    artist.genres.forEach(genre => {
      analysis.genres.set(genre, (analysis.genres.get(genre) || 0) + 1);
    });
  });

  // Analyze audio features from tracks
  const tracksWithFeatures = tracks.filter(track => track.audio_features);
  if (tracksWithFeatures.length > 0) {
    const totalFeatures = tracksWithFeatures.reduce((acc, track) => {
      const features = track.audio_features!;
      return {
        danceability: acc.danceability + features.danceability,
        energy: acc.energy + features.energy,
        valence: acc.valence + features.valence,
        acousticness: acc.acousticness + features.acousticness,
        tempo: acc.tempo + features.tempo
      };
    }, { danceability: 0, energy: 0, valence: 0, acousticness: 0, tempo: 0 });

    analysis.audioFeatures = {
      avgDanceability: totalFeatures.danceability / tracksWithFeatures.length,
      avgEnergy: totalFeatures.energy / tracksWithFeatures.length,
      avgValence: totalFeatures.valence / tracksWithFeatures.length,
      avgAcousticness: totalFeatures.acousticness / tracksWithFeatures.length,
      avgTempo: totalFeatures.tempo / tracksWithFeatures.length
    };

    // Determine moods based on audio features
    if (analysis.audioFeatures.avgEnergy > 0.7) analysis.moods.energetic++;
    if (analysis.audioFeatures.avgEnergy < 0.3) analysis.moods.calm++;
    if (analysis.audioFeatures.avgValence > 0.6) analysis.moods.happy++;
    if (analysis.audioFeatures.avgValence < 0.4) analysis.moods.melancholic++;
    if (analysis.audioFeatures.avgDanceability > 0.6) analysis.moods.danceable++;
    if (analysis.audioFeatures.avgAcousticness > 0.5) analysis.moods.acoustic++;
  }

  // Generate music personality traits
  const topGenres = Array.from(analysis.genres.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre]) => genre);

  if (analysis.moods.energetic > 0) analysis.musicPersonality.push('high-energy');
  if (analysis.moods.calm > 0) analysis.musicPersonality.push('chill');
  if (analysis.moods.happy > 0) analysis.musicPersonality.push('upbeat');
  if (analysis.moods.melancholic > 0) analysis.musicPersonality.push('introspective');
  if (analysis.moods.danceable > 0) analysis.musicPersonality.push('dance-lover');
  if (analysis.moods.acoustic > 0) analysis.musicPersonality.push('acoustic-appreciator');

  // Add genre-based personality traits
  topGenres.forEach(genre => {
    if (genre.includes('rock')) analysis.musicPersonality.push('rock-enthusiast');
    if (genre.includes('pop')) analysis.musicPersonality.push('pop-lover');
    if (genre.includes('hip')) analysis.musicPersonality.push('hip-hop-fan');
    if (genre.includes('electronic')) analysis.musicPersonality.push('electronic-music-fan');
    if (genre.includes('jazz')) analysis.musicPersonality.push('jazz-appreciator');
    if (genre.includes('classical')) analysis.musicPersonality.push('classical-music-fan');
  });

  return {
    ...analysis,
    topGenres: topGenres,
    musicPersonality: [...new Set(analysis.musicPersonality)] // Remove duplicates
  };
};

// Save Spotify data to Supabase
export const saveSpotifyDataToSupabase = async (
  userId: string,
  tracks: SpotifyTrack[],
  artists: SpotifyArtist[],
  analysis: any
) => {
  try {
    const { supabase } = await import('./supabase');
    
    // Update user's connected services
    await supabase
      .from('users')
      .update({
        connected_services: supabase.sql`array_append(connected_services, 'spotify')`,
        personality_traits: supabase.sql`array_append(personality_traits, ${analysis.musicPersonality})`,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    // Save tracks data
    const tracksData = tracks.map(track => ({
      user_id: userId,
      spotify_id: track.id,
      name: track.name,
      artist_names: track.artists.map(a => a.name),
      album_name: track.album.name,
      popularity: track.popularity,
      audio_features: track.audio_features,
      created_at: new Date().toISOString()
    }));

    if (tracksData.length > 0) {
      await supabase
        .from('user_spotify_tracks')
        .upsert(tracksData, { onConflict: 'user_id,spotify_id' });
    }

    // Save artists data
    const artistsData = artists.map(artist => ({
      user_id: userId,
      spotify_id: artist.id,
      name: artist.name,
      genres: artist.genres,
      popularity: artist.popularity,
      created_at: new Date().toISOString()
    }));

    if (artistsData.length > 0) {
      await supabase
        .from('user_spotify_artists')
        .upsert(artistsData, { onConflict: 'user_id,spotify_id' });
    }

    // Save music analysis
    await supabase
      .from('user_music_analysis')
      .upsert({
        user_id: userId,
        top_genres: analysis.topGenres,
        music_personality: analysis.musicPersonality,
        audio_features_summary: analysis.audioFeatures,
        mood_analysis: analysis.moods,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    return true;
  } catch (error) {
    console.error('Error saving Spotify data to Supabase:', error);
    return false;
  }
};