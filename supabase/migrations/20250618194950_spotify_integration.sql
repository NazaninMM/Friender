/*
  # Spotify Integration Tables

  This migration creates tables to store Spotify data for users:
  
  1. `user_spotify_tracks` - Store user's top tracks with audio features
  2. `user_spotify_artists` - Store user's top artists with genres
  3. `user_music_analysis` - Store analyzed music personality and preferences

  These tables will be used for personality-based matching and activity recommendations.
*/

-- Create user_spotify_tracks table
CREATE TABLE IF NOT EXISTS public.user_spotify_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  spotify_id text NOT NULL,
  name text NOT NULL,
  artist_names text[] NOT NULL,
  album_name text NOT NULL,
  popularity integer,
  audio_features jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Ensure unique combination of user and spotify track
  UNIQUE(user_id, spotify_id)
);

-- Create user_spotify_artists table
CREATE TABLE IF NOT EXISTS public.user_spotify_artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  spotify_id text NOT NULL,
  name text NOT NULL,
  genres text[] NOT NULL,
  popularity integer,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Ensure unique combination of user and spotify artist
  UNIQUE(user_id, spotify_id)
);

-- Create user_music_analysis table
CREATE TABLE IF NOT EXISTS public.user_music_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  top_genres text[] NOT NULL DEFAULT '{}',
  music_personality text[] NOT NULL DEFAULT '{}',
  audio_features_summary jsonb,
  mood_analysis jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- One analysis per user
  UNIQUE(user_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.user_spotify_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_spotify_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_music_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies for user_spotify_tracks
CREATE POLICY "Users can manage their own spotify tracks"
  ON public.user_spotify_tracks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read other users' spotify tracks for matching"
  ON public.user_spotify_tracks
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for user_spotify_artists
CREATE POLICY "Users can manage their own spotify artists"
  ON public.user_spotify_artists
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read other users' spotify artists for matching"
  ON public.user_spotify_artists
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for user_music_analysis
CREATE POLICY "Users can manage their own music analysis"
  ON public.user_music_analysis
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read other users' music analysis for matching"
  ON public.user_music_analysis
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS user_spotify_tracks_user_id_idx ON public.user_spotify_tracks(user_id);
CREATE INDEX IF NOT EXISTS user_spotify_tracks_spotify_id_idx ON public.user_spotify_tracks(spotify_id);
CREATE INDEX IF NOT EXISTS user_spotify_tracks_popularity_idx ON public.user_spotify_tracks(popularity);

CREATE INDEX IF NOT EXISTS user_spotify_artists_user_id_idx ON public.user_spotify_artists(user_id);
CREATE INDEX IF NOT EXISTS user_spotify_artists_spotify_id_idx ON public.user_spotify_artists(spotify_id);
CREATE INDEX IF NOT EXISTS user_spotify_artists_genres_idx ON public.user_spotify_artists USING GIN(genres);
CREATE INDEX IF NOT EXISTS user_spotify_artists_popularity_idx ON public.user_spotify_artists(popularity);

CREATE INDEX IF NOT EXISTS user_music_analysis_user_id_idx ON public.user_music_analysis(user_id);
CREATE INDEX IF NOT EXISTS user_music_analysis_top_genres_idx ON public.user_music_analysis USING GIN(top_genres);
CREATE INDEX IF NOT EXISTS user_music_analysis_music_personality_idx ON public.user_music_analysis USING GIN(music_personality);

-- Create function to update updated_at timestamp for all tables
CREATE OR REPLACE FUNCTION public.handle_spotify_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER user_spotify_tracks_updated_at
  BEFORE UPDATE ON public.user_spotify_tracks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_spotify_updated_at();

CREATE TRIGGER user_spotify_artists_updated_at
  BEFORE UPDATE ON public.user_spotify_artists
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_spotify_updated_at();

CREATE TRIGGER user_music_analysis_updated_at
  BEFORE UPDATE ON public.user_music_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_spotify_updated_at(); 