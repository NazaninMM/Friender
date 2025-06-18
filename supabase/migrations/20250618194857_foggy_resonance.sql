/*
  # Create users table and authentication setup

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique, not null)
      - `first_name` (text, not null)
      - `last_name` (text, not null)
      - `age` (integer, not null)
      - `bio` (text, nullable)
      - `location` (text, nullable)
      - `profile_image` (text, nullable)
      - `interests` (text array, default empty array)
      - `personality_traits` (text array, default empty array)
      - `connected_services` (text array, default empty array)
      - `created_at` (timestamp with timezone, default now)
      - `updated_at` (timestamp with timezone, default now)

  2. Security
    - Enable RLS on `users` table
    - Add policies for authenticated users to manage their own data
    - Add policy for users to read other users' public profile data

  3. Functions
    - Create trigger to automatically update `updated_at` timestamp
*/

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  age integer NOT NULL CHECK (age > 0 AND age < 150),
  bio text DEFAULT '',
  location text DEFAULT '',
  profile_image text,
  interests text[] DEFAULT '{}',
  personality_traits text[] DEFAULT '{}',
  connected_services text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read other users' public data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_location_idx ON public.users(location);
CREATE INDEX IF NOT EXISTS users_interests_idx ON public.users USING GIN(interests);