import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Gracefully handle, silence, and suppress benign Vite HMR WebSocket connection failure overlays and errors
if (typeof window !== 'undefined') {
  // Override console.warn and console.error to filter out HMR websocket logs entirely
  const originalWarn = console.warn;
  const originalError = console.error;

  console.warn = function (...args) {
    const message = args.map(arg => String(arg || '')).join(' ');
    if (
      message.toLowerCase().includes('websocket') || 
      message.toLowerCase().includes('hmr') ||
      message.toLowerCase().includes('fts console guard')
    ) {
      // Completely silence without logging anything
      return;
    }
    originalWarn.apply(console, args);
  };

  console.error = function (...args) {
    const message = args.map(arg => String(arg || '')).join(' ');
    if (
      message.toLowerCase().includes('websocket') || 
      message.toLowerCase().includes('hmr')
    ) {
      // Completely silence without logging anything
      return;
    }
    originalError.apply(console, args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const errorStr = String(reason || '');
    const errorMsg = reason?.message || '';
    if (
      errorStr.toLowerCase().includes('websocket') || 
      errorMsg.toLowerCase().includes('websocket')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const errorMsg = event.message || '';
    if (
      errorMsg.toLowerCase().includes('websocket') || 
      event.error?.message?.toLowerCase().includes('websocket')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
