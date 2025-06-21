import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import SpotifySyncScreen from './screens/SpotifySyncScreen';
import './index.css';

// Create root element for the popup
const rootElement = document.getElementById('root');
if (!rootElement) {
  // Create root element if it doesn't exist
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SpotifySyncScreen />
  </StrictMode>
); 