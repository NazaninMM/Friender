import React from 'react';
import { createRoot } from 'react-dom/client';
import SpotifyOAuthScreen from './screens/SpotifyOAuthScreen';
import './index.css';

console.log('🎵 Spotify OAuth popup entry point loaded');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎵 DOM ready, initializing Spotify OAuth popup');
  
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('❌ Root element not found');
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <SpotifyOAuthScreen />
      </React.StrictMode>
    );
    console.log('✅ Spotify OAuth popup rendered successfully');
  } catch (error) {
    console.error('❌ Error rendering Spotify OAuth popup:', error);
  }
}); 