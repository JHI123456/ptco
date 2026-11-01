// API Interceptor: Redirects /api calls to remote cloud backend if VITE_API_URL is configured
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
if (API_BASE_URL && typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = function (input, init) {
    if (typeof input === 'string' && input.startsWith('/api')) {
      input = API_BASE_URL + input;
    } else if (input instanceof Request && input.url.startsWith('/api')) {
      input = new Request(API_BASE_URL + input.url, input);
    }
    return originalFetch(input, init);
  };
}

// Force clear all persisted data, forms, and user sessions from browser storage
const DATA_WIPE_TOKEN = 'tt_clean_slate_wipe_v5_oct28';
if (typeof window !== 'undefined' && !localStorage.getItem(DATA_WIPE_TOKEN)) {
  try {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(DATA_WIPE_TOKEN, 'true');
  } catch (err) {
    console.warn('Storage wipe exception:', err);
  }
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App'

// Register PWA service worker with auto-update
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
