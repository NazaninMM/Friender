import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
<<<<<<< HEAD
=======
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        spotifyPopup: 'spotify-popup.html',
      },
    },
  },
>>>>>>> d8664fc (Popup entry, Spotify OAuth config)
});
