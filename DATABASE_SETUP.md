# Database Setup Guide

This guide explains how to set up the database with the existing `profiles` table and Row Level Security (RLS) policies.

## Overview

We've updated the RLS policies for your existing `profiles` table and disabled RLS for all other tables as requested:

- **profiles table**: RLS enabled with proper policies
- **All other tables**: RLS disabled as requested

## Database Changes

### 1. Updated Migration File

The migration file `supabase/migrations/20250618194952_profiles_table_and_rls_policies.sql` now:

- Works with your existing `profiles` table (doesn't create a new one)
- Sets up proper RLS policies for the `profiles` table
- Disables RLS for all other tables
- Updates foreign key references if needed (only if they currently point to `users` table)

### 2. RLS Policies for Profiles Table

```sql
-- Users can view their own profile
CREATE POLICY "Allow users to view their OWN profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can create their own profile
CREATE POLICY "Authenticated users can create their own profile"
  ON public.profiles
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Authenticated users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### 3. Tables with RLS Disabled

The following tables have RLS disabled as requested:

- `activities`
- `activity_attendees`
- `join_requests`
- `user_spotify_tracks`
- `user_spotify_artists`
- `user_music_analysis`

## How to Apply Changes

### Option 1: Using Supabase CLI (Recommended)

1. **Install Docker Desktop** and ensure it's running
2. **Start local Supabase instance**:
   ```bash
   npx supabase start
   ```
3. **Apply migrations**:
   ```bash
   npx supabase db push
   ```

### Option 2: Using Supabase Dashboard

1. **Go to your Supabase project dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the migration SQL** from `supabase/migrations/20250618194952_profiles_table_and_rls_policies.sql`
4. **Execute the SQL**

### Option 3: Manual Application

If you prefer to apply changes manually:

1. **Enable RLS on profiles** (if not already enabled):
   ```sql
   ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
   ```

2. **Create RLS policies** (see above)

3. **Disable RLS on other tables**:
   ```sql
   ALTER TABLE public.activities DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.activity_attendees DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.join_requests DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.user_spotify_tracks DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.user_spotify_artists DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.user_music_analysis DISABLE ROW LEVEL SECURITY;
   ```

4. **Update foreign key references** if they currently point to `users` table

## Code Changes Made

### 1. Updated Supabase Types

The `src/lib/supabase.ts` file has been updated to:
- Replace `users` table with `profiles` table in types
- Add types for Spotify-related tables

### 2. Updated Spotify Integration

The `src/lib/spotify.ts` file has been updated to:
- Use `profiles` table instead of `users` table when saving Spotify data

### 3. Auth Hook Already Updated

The `src/hooks/useAuth.ts` file was already using the `profiles` table.

## What the Migration Does

The updated migration will:

1. **Enable RLS on profiles table** (if not already enabled)
2. **Drop any existing policies** on the profiles table
3. **Create new RLS policies** for the profiles table
4. **Disable RLS** on all other tables
5. **Drop all existing policies** from other tables
6. **Update foreign key references** only if they currently point to a `users` table
7. **Create necessary indexes and triggers** for the profiles table

## Verification

After applying the changes, verify that:

1. **Profiles table has RLS enabled** with proper policies
2. **Other tables have RLS disabled**
3. **Foreign key references point to profiles table**
4. **App can create and read user profiles**
5. **Spotify integration works with profiles table**

## Troubleshooting

### Docker Issues
If you encounter Docker issues on Windows:
1. Ensure Docker Desktop is installed and running
2. Run Docker Desktop as administrator
3. Check that WSL2 is properly configured

### Migration Errors
If migration fails:
1. Check that the profiles table exists and has the expected structure
2. Verify that all foreign key constraints are properly updated
3. Ensure no existing data conflicts with new constraints

### RLS Policy Issues
If RLS policies don't work as expected:
1. Check that policies are properly created
2. Verify user authentication state
3. Test policies with different user roles

## Next Steps

1. Apply the database changes using one of the methods above
2. Test the application to ensure everything works correctly
3. Update any remaining code references if needed
4. Consider adding additional RLS policies if required for your use case 