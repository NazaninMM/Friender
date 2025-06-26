# Spotify OAuth Integration Setup Guide

This guide will help you set up Spotify OAuth integration for your Friender app to collect music data for personality-based matching.

## Prerequisites

- A Spotify Developer account
- A Supabase project with the database migrations applied
- Environment variables configured

## Step 1: Spotify Developer Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create App"
4. Fill in the app details:
   - **App name**: Friender (or your preferred name)
   - **App description**: Music-based personality matching for social activities
   - **Website**: Your app's domain (e.g., `https://yourdomain.com`)
   - **Redirect URIs**: Add your redirect URI (e.g., `https://localhost:5173/spotify-popup.html` for development)
   - **API/SDKs**: Select "Web API"
5. Accept the terms and create the app

## Step 2: Get Spotify Credentials

After creating your app, you'll get:
- **Client ID**: Copy this from the app dashboard
- **Client Secret**: Click "Show Client Secret" and copy it

## Step 3: Configure Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Supabase Configuration (you should already have these)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Spotify OAuth Configuration
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
VITE_SPOTIFY_REDIRECT_URI=https://localhost:5173/spotify-popup.html
```

**Important**: Replace the placeholder values with your actual credentials.

## Step 4: Apply Database Migrations

Run the Spotify integration migration to create the necessary tables:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the migration file:
# supabase/migrations/20250618194950_spotify_integration.sql
```

This creates the following tables:
- `user_spotify_tracks` - Stores user's top tracks with audio features
- `user_spotify_artists` - Stores user's top artists with genres
- `user_music_analysis` - Stores analyzed music personality and preferences

## Step 5: Test the Integration

1. Start your development server: `npm run dev`
2. Go through the signup flow
3. On the social integration screen, click "Connect Spotify"
4. A popup window will open with Spotify's authorization page
5. After authorizing, the popup will process your music data
6. The popup will close automatically and Spotify will be marked as connected
7. Continue with the rest of the onboarding flow

## How It Works

### OAuth Flow (Popup-based)
1. User clicks "Connect Spotify" on the social integration screen
2. App opens a popup window with Spotify OAuth URL
3. User authorizes in the popup window
4. Spotify redirects back to the popup with authorization code
5. Popup exchanges code for access token and fetches music data
6. Data is analyzed and saved to Supabase
7. Popup notifies parent window of success and closes
8. Parent window marks Spotify as connected

### Data Collection
The integration collects:
- **Top Tracks**: User's most listened to songs (with audio features)
- **Top Artists**: User's favorite artists (with genres)
- **Audio Features**: Danceability, energy, valence, acousticness, tempo, etc.
- **Music Analysis**: Derived personality traits and preferences

### Data Storage
- Tracks and artists are stored individually for detailed analysis
- Music analysis includes personality traits, mood analysis, and genre preferences
- All data is associated with the user's Supabase account
- Data is used for personality-based matching and activity recommendations

## Integration with Social Flow

The Spotify integration is **optional** and **non-blocking**:
- Users must connect at least 2 social services to continue
- Spotify is one of several options (Instagram, Google Play Games, etc.)
- The OAuth flow happens in a popup, so it doesn't interrupt the main onboarding
- Users can skip Spotify and still complete the onboarding with other services

## Error Handling

The integration handles various error scenarios:
- **Invalid/expired tokens**: Automatic retry with user feedback
- **Missing data**: Graceful fallback with appropriate messaging
- **User not authenticated**: Redirect to authentication flow
- **Network errors**: Retry mechanism with user options
- **Popup blocked**: Clear error message asking user to allow popups

## Security Considerations

- **No token storage**: Access tokens are not stored, only used for data fetching
- **State verification**: OAuth state parameter prevents CSRF attacks
- **RLS policies**: Database tables have proper Row Level Security
- **Scope limitation**: Only requests necessary scopes for data collection
- **Popup isolation**: OAuth happens in isolated popup window

## Troubleshooting

### Common Issues

1. **"Spotify Client ID not configured"**
   - Check that `VITE_SPOTIFY_CLIENT_ID` is set in your `.env` file
   - Restart your development server after adding environment variables

2. **"Invalid redirect URI"**
   - Ensure the redirect URI in your Spotify app matches `VITE_SPOTIFY_REDIRECT_URI`
   - For development, use `https://localhost:5173/spotify-popup.html`
   - For production, use your actual domain

3. **"Popup blocked"**
   - Users need to allow popups for your site
   - Check browser settings and popup blockers
   - Consider adding instructions for users

4. **"User not authenticated"**
   - Make sure the user is signed in to Supabase before connecting Spotify
   - Check that Supabase authentication is working properly

5. **"No tracks found"**
   - User needs to have listening history on Spotify
   - The app fetches medium-term (last 6 months) data
   - Consider adding a fallback for users with limited listening history

### Debug Mode

To enable debug logging, add this to your browser console:
```javascript
localStorage.setItem('debug', 'spotify:*');
```

## Production Deployment

For production deployment:

1. Update `VITE_SPOTIFY_REDIRECT_URI` to your production domain
2. Add the production redirect URI to your Spotify app settings
3. Ensure all environment variables are set in your hosting platform
4. Test the complete OAuth flow in production
5. Make sure popups work correctly in production environment

## API Scopes Used

The integration requests the following Spotify scopes:
- `user-top-read`: Access to user's top tracks and artists
- `user-read-private`: Access to user's profile information
- `user-read-email`: Access to user's email (for verification)
- `user-read-recently-played`: Access to recently played tracks

These scopes are minimal and focused on data collection for personality analysis.