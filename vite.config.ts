import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Force JSX runtime to be used
      jsxRuntime: 'automatic',
      // Ensure proper preamble detection
      include: ['**/*.{jsx,tsx}', '**/*.{js,ts}'],
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        spotifyPopup: 'spotify-popup.html',
      },
    },
  },
  // Ensure proper handling of popup entry point
  define: {
    'process.env.NODE_ENV': '"development"'
  }
});
