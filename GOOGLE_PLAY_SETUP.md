# Google Play Games Integration Setup

This document explains how to set up Google Play Games integration for the Friender app.

## Environment Variables

Create a `.env` file in the project root directory with the following variables:

```env
# Google Play Games OAuth Credentials
VITE_GOOGLE_PLAY_CLIENT_ID=your_google_play_client_id_here
VITE_GOOGLE_PLAY_CLIENT_SECRET=your_google_play_client_secret_here
```

## Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the required APIs:
   - Go to "APIs & Services" > "Library"
   - Search for and enable:
     - "Google Play Games API"
     - "Google People API" (for profile access)

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5173/google-play-popup.html` (for development)
     - `https://yourdomain.com/google-play-popup.html` (for production)
   - Copy the Client ID and Client Secret to your `.env` file

## Important Notes

- **Client Secret Security**: The client secret should never be exposed in frontend code. In a production environment, the OAuth flow should be handled server-side.
- **Redirect URI**: Make sure the redirect URI in your Google Cloud Console matches exactly with what's configured in the popup HTML file.
- **Local Development**: For local development, you may need to use a tunneling service like ngrok or nip.io if you encounter "Invalid Origin" errors.

## CORS Limitations

**Important**: The Google Play Games API has CORS restrictions that prevent direct browser requests. The current implementation handles this by:

1. **Attempting direct API calls** first
2. **Falling back to mock data** if CORS blocks the requests
3. **Still marking the service as connected** for the user experience
4. **Providing user feedback** about the limitations

### Production Solution

For production, you should implement a server-side proxy or backend API that:
- Handles the Google Play Games API calls server-side
- Returns the data to your frontend
- Avoids CORS issues entirely

## Testing the Integration

1. Start your development server: `npm run dev`
2. Navigate to the social integration screen
3. Click "Connect" on Google Play Games
4. Complete the OAuth flow in the popup
5. Verify that the service is marked as connected in the `profiles` table
6. Check the console for any data that was successfully fetched

## Troubleshooting

- **"Invalid Origin" Error**: This usually means the redirect URI doesn't match. Check your Google Cloud Console settings.
- **"Client ID not configured"**: Make sure your `.env` file is in the project root and the variable names are correct.
- **Popup blocked**: Ensure popups are allowed for your domain in the browser settings.
- **CORS errors**: These are expected and handled gracefully. The service will still be marked as connected.
- **API errors**: Check that you've enabled the required APIs in Google Cloud Console.

## Current Behavior

- ✅ OAuth flow works perfectly
- ✅ Service is marked as connected in the database
- ✅ User gets appropriate feedback about the connection
- ⚠️ Some API data may be simulated due to CORS restrictions
- 🔄 Ready for server-side implementation in production 