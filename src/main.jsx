// Global API Interceptor & ASCII Header Sanitizer
// Prevents Chrome IPC crash RESULT_CODE_KILLED_BAD_MESSAGE caused by non-ASCII characters (e.g. "ñ" in "Alfonso Castañeda")
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

const sanitizeHeaderValue = (val) => {
  if (typeof val !== 'string') return val;
  return val.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, '');
};

if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = function (input, init) {
    let finalInput = input;
    const finalInit = init ? { ...init } : undefined;

    // Sanitize headers to ASCII
    if (finalInit && finalInit.headers) {
      if (finalInit.headers instanceof Headers) {
        const sanitized = new Headers();
        finalInit.headers.forEach((v, k) => {
          sanitized.set(k, sanitizeHeaderValue(v));
        });
        finalInit.headers = sanitized;
      } else if (Array.isArray(finalInit.headers)) {
        finalInit.headers = finalInit.headers.map(([k, v]) => [k, sanitizeHeaderValue(v)]);
      } else if (typeof finalInit.headers === 'object') {
        const sanitized = {};
        for (const [k, v] of Object.entries(finalInit.headers)) {
          sanitized[k] = sanitizeHeaderValue(v);
        }
        finalInit.headers = sanitized;
      }
    }

    // Redirect API calls if remote backend configured
    if (API_BASE_URL) {
      if (typeof finalInput === 'string') {
        if (finalInput.startsWith('/api')) {
          finalInput = API_BASE_URL + finalInput;
        } else if (finalInput.startsWith(window.location.origin + '/api')) {
          finalInput = finalInput.replace(window.location.origin, API_BASE_URL);
        }
      } else if (finalInput instanceof URL) {
        if (finalInput.pathname.startsWith('/api')) {
          finalInput = new URL(API_BASE_URL + finalInput.pathname + finalInput.search);
        }
      } else if (finalInput instanceof Request) {
        if (finalInput.url.startsWith('/api')) {
          finalInput = new Request(API_BASE_URL + finalInput.url, finalInit || finalInput);
        } else if (finalInput.url.startsWith(window.location.origin + '/api')) {
          finalInput = new Request(finalInput.url.replace(window.location.origin, API_BASE_URL), finalInit || finalInput);
        }
      }
    }

    return originalFetch(finalInput, finalInit);
  };
}

// Force clear all persisted data, forms, and user sessions from browser storage
const DATA_WIPE_TOKEN = 'tt_clean_slate_wipe_v8_nov5_cleared';
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

// Register PWA service worker with auto-update only in production builds
// In dev mode, unregister any service workers and clear cache to prevent Chrome RESULT_CODE_KILLED_BAD_MESSAGE
if (import.meta.env.PROD) {
  registerSW({ immediate: true });
} else if (typeof window !== 'undefined') {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const r of registrations) {
        r.unregister();
      }
    });
  }
  if ('caches' in window) {
    caches.keys().then((keys) => {
      for (const k of keys) {
        caches.delete(k);
      }
    });
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
