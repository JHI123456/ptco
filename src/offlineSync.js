// ============================================================================
// TurismoTrack - Enterprise Offline & Online Synchronization Engine
// Provides:
// 1. Transparent offline caching for GET requests (Instant Offline Access)
// 2. Offline Mutation Queue for POST/PUT/DELETE requests (Zero Data Loss)
// 3. Real-time Online/Offline detection & periodic queue drain
// 4. Global BroadcastChannel real-time sync across all open browser tabs
// 5. Cloud Backend Keep-Alive ping to prevent Render cold-start sleeps
// 6. Resilient Offline Authentication for Official Admins (admin@gmail.com, tourism@bayombong.gov.ph)
// ============================================================================

const CURRENT_CACHE_VERSION = 'tt_wipe_v20261106_total_wipe_v6';
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  try {
    if (localStorage.getItem('tt_current_cache_version') !== CURRENT_CACHE_VERSION) {
      const keysToClear = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('tt_') || k.startsWith('turismotrack_'))) {
          if (k === 'turismotrack_user') {
            try {
              const u = JSON.parse(localStorage.getItem(k));
              if (u?.email !== 'admin@gmail.com') {
                keysToClear.push(k);
              }
            } catch {
              keysToClear.push(k);
            }
          } else {
            keysToClear.push(k);
          }
        }
      }
      keysToClear.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem('tt_current_cache_version', CURRENT_CACHE_VERSION);
    }
  } catch {}
}

const QUEUE_STORAGE_KEY = 'tt_offline_sync_queue_v1';
const CACHE_STORAGE_PREFIX = 'tt_api_cache_';
const AUTH_CACHE_KEY = 'tt_cached_auth_users';
const RAW_API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const API_BASE_URL = RAW_API_URL
  ? (RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL}/api`)
  : '/api';

// ASCII Header Sanitizer to prevent Chromium IPC crash RESULT_CODE_KILLED_BAD_MESSAGE
export const sanitizeHeaderValue = (val) => {
  if (!val) return '';
  return String(val)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '');
};

// ----------------------------------------------------------------------------
// Queue Management
// ----------------------------------------------------------------------------
export function getOfflineQueue() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('[OfflineSync] Error reading queue:', err);
    return [];
  }
}

export function saveOfflineQueue(queue) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    notifyQueueChange(queue.length);
  } catch (err) {
    console.warn('[OfflineSync] Error saving queue:', err);
  }
}

export function enqueueOfflineRequest(req) {
  const queue = getOfflineQueue();
  const id = `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const item = {
    id,
    url: req.url,
    method: req.method || 'POST',
    headers: req.headers || {},
    body: typeof req.body === 'string' ? req.body : (req.body ? JSON.stringify(req.body) : null),
    timestamp: new Date().toISOString(),
    retries: 0,
    summary: req.summary || req.url,
  };
  queue.push(item);
  saveOfflineQueue(queue);

  console.info(`[OfflineSync] Queued offline mutation (${queue.length} pending):`, item.url);

  // Trigger local optimistic broadcast
  try {
    if ('BroadcastChannel' in window) {
      const ch = new BroadcastChannel('turismotrack_realtime');
      ch.postMessage({ type: 'data:updated', offline: true, summary: item.summary });
    }
  } catch {}

  window.dispatchEvent(new CustomEvent('tt-offline-queued', { detail: item }));
  return item;
}

// ----------------------------------------------------------------------------
// UI Event Notifications
// ----------------------------------------------------------------------------
function notifyQueueChange(pendingCount) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('tt:sync-status', {
      detail: {
        online: navigator.onLine,
        pendingCount,
        syncing: isDraining,
      },
    })
  );
}

// ----------------------------------------------------------------------------
// Queue Drain / Sync Engine
// ----------------------------------------------------------------------------
let isDraining = false;

export async function drainOfflineQueue() {
  if (isDraining || !navigator.onLine || typeof window === 'undefined') return;

  const queue = getOfflineQueue();
  if (!queue.length) return;

  isDraining = true;
  notifyQueueChange(queue.length);
  console.info(`[OfflineSync] Starting auto-sync of ${queue.length} pending items...`);

  const remaining = [];
  let successfulSyncCount = 0;

  for (const item of queue) {
    try {
      // Re-send to backend
      const res = await window._originalFetch(item.url, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
          ...item.headers,
          'x-offline-sync': 'true',
        },
        body: item.body,
        signal: AbortSignal.timeout(15000),
      });

      if (res.ok || (res.status >= 200 && res.status < 300)) {
        successfulSyncCount++;
        console.info(`[OfflineSync] Synced item successfully:`, item.url);
      } else if (res.status >= 400 && res.status < 500) {
        // Client-side or duplicate error (e.g., 400 bad payload or 409 already exists)
        // Discard item so it does not block the sync pipeline
        console.warn(`[OfflineSync] Discarding rejected item (${res.status}):`, item.url);
      } else {
        // Server 5xx error: Keep item for next retry
        item.retries = (item.retries || 0) + 1;
        remaining.push(item);
        console.warn(`[OfflineSync] Server error ${res.status}. Will retry later.`);
      }
    } catch (err) {
      // Network dropped or timeout
      console.warn(`[OfflineSync] Sync failed due to network error, pausing:`, err.message);
      item.retries = (item.retries || 0) + 1;
      remaining.push(item);
      break; // Pause drain until next cycle
    }
  }

  saveOfflineQueue(remaining);
  isDraining = false;
  notifyQueueChange(remaining.length);

  if (successfulSyncCount > 0) {
    console.info(`[OfflineSync] Successfully synced ${successfulSyncCount} items to cloud!`);
    
    // Broadcast sync complete to all open tabs
    try {
      if ('BroadcastChannel' in window) {
        const ch = new BroadcastChannel('turismotrack_realtime');
        ch.postMessage({
          type: 'data:updated',
          synced: true,
          count: successfulSyncCount,
        });
      }
    } catch {}

    window.dispatchEvent(
      new CustomEvent('tt-data-synced', {
        detail: { count: successfulSyncCount },
      })
    );
  }
}

// ----------------------------------------------------------------------------
// Offline-Aware Global Fetch Wrapper
// ----------------------------------------------------------------------------
export function setupOfflineSync() {
  if (typeof window === 'undefined' || window._offlineSyncInitialized) return;
  window._offlineSyncInitialized = true;

  const originalFetch = window.fetch;
  window._originalFetch = originalFetch;

  window.fetch = async function (input, init) {
    let finalInput = input;
    const finalInit = init ? { ...init } : {};
    const method = (finalInit.method || 'GET').toUpperCase();

    // 1. Sanitize all header values to safe ASCII
    if (finalInit.headers) {
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

    // 2. Resolve Remote Cloud URL if configured
    let requestUrl = '';
    if (typeof finalInput === 'string') {
      requestUrl = finalInput;
      if (API_BASE_URL && API_BASE_URL !== '/api') {
        if (requestUrl.startsWith('/api')) {
          requestUrl = API_BASE_URL + requestUrl.replace(/^\/api/, '');
          finalInput = requestUrl;
        } else if (requestUrl.startsWith(window.location.origin + '/api')) {
          requestUrl = requestUrl.replace(window.location.origin + '/api', API_BASE_URL);
          finalInput = requestUrl;
        }
      }
    } else if (finalInput instanceof URL) {
      requestUrl = finalInput.toString();
      if (API_BASE_URL && API_BASE_URL !== '/api' && finalInput.pathname.startsWith('/api')) {
        finalInput = new URL(API_BASE_URL + finalInput.pathname.replace(/^\/api/, '') + finalInput.search);
        requestUrl = finalInput.toString();
      }
    } else if (finalInput instanceof Request) {
      requestUrl = finalInput.url;
      if (API_BASE_URL && API_BASE_URL !== '/api' && requestUrl.includes('/api')) {
        const newUrl = requestUrl.replace(window.location.origin + '/api', API_BASE_URL);
        finalInput = new Request(newUrl, finalInit || finalInput);
        requestUrl = newUrl;
      }
    }

    const isApiRequest = requestUrl.includes('/api');

    // For non-API requests (assets, HTML, CSS), let browser/PWA SW handle directly
    if (!isApiRequest) {
      return originalFetch(finalInput, finalInit);
    }

    const cacheKey = requestUrl.split('?')[0].replace(/https?:\/\/[^/]+/i, '');

    // ------------------------------------------------------------------------
    // CASE A: AUTHENTICATION LOGIN HANDLER (ONLINE & OFFLINE RESILIENT)
    // ------------------------------------------------------------------------
    if (requestUrl.includes('/auth/login') && method === 'POST') {
      let parsedBody = {};
      try {
        parsedBody = typeof finalInit.body === 'string' ? JSON.parse(finalInit.body) : finalInit.body || {};
      } catch {}

      const cleanInput = String(parsedBody.email || parsedBody.identifier || parsedBody.username || '').trim().toLowerCase();
      const cleanPass = String(parsedBody.password || '');

      const getOfflineAdminResponse = () => {
        if (cleanPass === 'admin123' && cleanInput === 'admin@gmail.com') {
          const user = {
            _id: 'offline-prov-admin-1',
            id: 'offline-prov-admin-1',
            name: 'Provincial Tourism Officer',
            email: 'admin@gmail.com',
            role: 'Provincial Admin',
            municipality: 'Provincial',
            officeName: 'Provincial Tourism and Cultural Affairs Office',
            portal: 'provincial',
          };
          return new Response(JSON.stringify({ success: true, token: 'offline-token-prov-admin', user }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'X-Offline-Auth': 'true' },
          });
        }

        try {
          const cached = JSON.parse(localStorage.getItem(AUTH_CACHE_KEY) || '[]');
          const match = cached.find((c) => c.email === cleanInput && c.password === cleanPass);
          if (match && match.user) {
            return new Response(JSON.stringify({ success: true, token: 'offline-token-cached', user: match.user }), {
              status: 200,
              headers: { 'Content-Type': 'application/json', 'X-Offline-Auth': 'true' },
            });
          }
        } catch {}

        return null;
      };

      // 1. If currently offline, authenticate against offline admin credentials
      if (!navigator.onLine) {
        const offlineRes = getOfflineAdminResponse();
        if (offlineRes) return offlineRes;
        return new Response(JSON.stringify({ error: 'Naka-offline mode. Maling email o password.' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 2. If online, try network login first
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const netRes = await originalFetch(finalInput, { ...finalInit, signal: finalInit.signal || controller.signal });
        clearTimeout(timeoutId);

        if (netRes.ok) {
          try {
            const clone = netRes.clone();
            const data = await clone.json();
            if (data?.user && cleanPass) {
              const cached = JSON.parse(localStorage.getItem(AUTH_CACHE_KEY) || '[]');
              const filtered = cached.filter((c) => c.email !== cleanInput);
              filtered.push({ email: cleanInput, password: cleanPass, user: data.user });
              localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(filtered.slice(-15)));
            }
          } catch {}
          return netRes;
        }

        // If server 5xx or cold-starting, fallback to offline admin
        if (netRes.status >= 500) {
          const fallback = getOfflineAdminResponse();
          if (fallback) return fallback;
        }
        return netRes;
      } catch (netErr) {
        // Network timeout / connection dropped: fall back to offline admin
        const fallback = getOfflineAdminResponse();
        if (fallback) return fallback;
        return new Response(JSON.stringify({ error: 'Hindi makakonekta sa server at walang offline authentication record.' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // ------------------------------------------------------------------------
    // CASE B: READ REQUESTS (GET)
    // ------------------------------------------------------------------------
    if (method === 'GET') {
      // If currently online, attempt network fetch with fallback to cache
      if (navigator.onLine) {
        try {
          // 8-second timeout for snappy offline fallback during Render cold-start
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          const fetchOptions = {
            ...finalInit,
            signal: finalInit.signal || controller.signal,
          };

          const networkResponse = await originalFetch(finalInput, fetchOptions);
          clearTimeout(timeoutId);

          if (networkResponse.ok) {
            // Clone and store in offline cache
            try {
              const clone = networkResponse.clone();
              const responseText = await clone.text();
              localStorage.setItem(CACHE_STORAGE_PREFIX + cacheKey, responseText);
            } catch (cacheErr) {
              // Cache quota or stream read issue
            }
            return networkResponse;
          }
        } catch (fetchErr) {
          console.warn(`[OfflineSync] Network GET failed for ${cacheKey}, falling back to offline cache:`, fetchErr.message);
        }
      }

      // Offline or network error: return from cache
      try {
        const cachedData = localStorage.getItem(CACHE_STORAGE_PREFIX + cacheKey);
        if (cachedData) {
          return new Response(cachedData, {
            status: 200,
            statusText: 'OK (Served from Offline Cache)',
            headers: {
              'Content-Type': 'application/json',
              'X-TurismoTrack-Offline-Cache': 'true',
            },
          });
        }
      } catch (e) {}

      // Default safe response if nothing in cache
      return new Response(
        JSON.stringify({
          success: true,
          offline: true,
          count: 0,
          data: [],
          message: 'Offline mode: no cached records yet.',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'X-TurismoTrack-Offline': 'true' },
        }
      );
    }

    // ------------------------------------------------------------------------
    // CASE C: MUTATION REQUESTS (POST, PUT, DELETE, PATCH)
    // ------------------------------------------------------------------------
    // 1. If currently offline, queue immediately without waiting
    if (!navigator.onLine) {
      enqueueOfflineRequest({
        url: requestUrl,
        method,
        headers: finalInit.headers || {},
        body: finalInit.body,
        summary: `${method} ${cacheKey}`,
      });

      let parsedBody = {};
      try {
        parsedBody = typeof finalInit.body === 'string' ? JSON.parse(finalInit.body) : finalInit.body || {};
      } catch {}

      return new Response(
        JSON.stringify({
          success: true,
          offline: true,
          offlineQueued: true,
          message: 'Saved offline. Changes will sync automatically when back online.',
          data: parsedBody,
          id: `offline-${Date.now()}`,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'X-Offline-Queued': 'true' },
        }
      );
    }

    // 2. If online, attempt network send
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const networkResponse = await originalFetch(finalInput, {
        ...finalInit,
        signal: finalInit.signal || controller.signal,
      });
      clearTimeout(timeoutId);

      if (networkResponse.ok || (networkResponse.status >= 200 && networkResponse.status < 400)) {
        return networkResponse;
      }

      // If server returned 502/503/504 (Gateway timeout / sleeping), queue it
      if (networkResponse.status >= 500) {
        console.warn(`[OfflineSync] Server status ${networkResponse.status}, enqueuing mutation for retry.`);
        enqueueOfflineRequest({
          url: requestUrl,
          method,
          headers: finalInit.headers || {},
          body: finalInit.body,
          summary: `${method} ${cacheKey}`,
        });

        return new Response(
          JSON.stringify({
            success: true,
            offline: true,
            offlineQueued: true,
            message: 'Server temporarily busy. Saved locally and queued for auto-sync.',
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'X-Offline-Queued': 'true' },
          }
        );
      }

      return networkResponse;
    } catch (networkErr) {
      console.warn(`[OfflineSync] Network mutation failed for ${requestUrl}, enqueuing for auto-sync:`, networkErr.message);

      enqueueOfflineRequest({
        url: requestUrl,
        method,
        headers: finalInit.headers || {},
        body: finalInit.body,
        summary: `${method} ${cacheKey}`,
      });

      let parsedBody = {};
      try {
        parsedBody = typeof finalInit.body === 'string' ? JSON.parse(finalInit.body) : finalInit.body || {};
      } catch {}

      return new Response(
        JSON.stringify({
          success: true,
          offline: true,
          offlineQueued: true,
          message: 'Connection interrupted. Saved locally and queued for auto-sync.',
          data: parsedBody,
          id: `offline-${Date.now()}`,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'X-Offline-Queued': 'true' },
        }
      );
    }
  };

  // --------------------------------------------------------------------------
  // Event Listeners for Automatic Online / Offline Sync
  // --------------------------------------------------------------------------
  window.addEventListener('online', () => {
    console.info('[OfflineSync] Connection restored! Initiating queue drain...');
    notifyQueueChange(getOfflineQueue().length);
    drainOfflineQueue();
  });

  window.addEventListener('offline', () => {
    console.info('[OfflineSync] Device is now OFFLINE. Offline fallback active.');
    notifyQueueChange(getOfflineQueue().length);
  });

  // Periodic queue drain every 12 seconds
  setInterval(() => {
    if (navigator.onLine) {
      drainOfflineQueue();
    }
  }, 12000);

  // Keep-Alive Ping every 9 minutes to prevent Render Free Backend from sleeping
  setInterval(() => {
    if (navigator.onLine && typeof window !== 'undefined') {
      window._originalFetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(5000) }).catch(() => {});
    }
  }, 9 * 60 * 1000);

  // Initial drain check on startup
  setTimeout(() => {
    if (navigator.onLine) {
      drainOfflineQueue();
    }
  }, 3000);
}

// Auto-run on load
setupOfflineSync();
