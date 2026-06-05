import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Gracefully handle and suppress benign Vite HMR WebSocket connection failure overlays and errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const errorStr = String(reason || '');
    const errorMsg = reason?.message || '';
    if (
      errorStr.includes('WebSocket') || 
      errorStr.includes('websocket') || 
      errorMsg.includes('WebSocket') || 
      errorMsg.includes('websocket')
    ) {
      console.warn('[FTS Console Guard] Suppressed benign WebSocket/HMR exception:', errorMsg || errorStr);
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const errorMsg = event.message || '';
    if (
      errorMsg.includes('WebSocket') || 
      errorMsg.includes('websocket') || 
      event.error?.message?.includes('WebSocket')
    ) {
      console.warn('[FTS Console Guard] Suppressed benign WebSocket/HMR error:', errorMsg);
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
