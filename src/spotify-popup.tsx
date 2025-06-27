import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import SpotifySyncScreen from './screens/SpotifySyncScreen';
import './index.css';

// Ensure we're in a browser environment
if (typeof window === 'undefined') {
  throw new Error('This component must be rendered in a browser environment');
}

// Create root element for the popup
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Make sure there is a <div id="root"></div> in the HTML.');
}

// Create the root and render the app
const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <SpotifySyncScreen />
  </StrictMode>
); 