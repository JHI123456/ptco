// Universal Role-Based Login & Cross-Portal Routing Service for TurismoTrack

export const PORTAL_TARGETS = {
  provincial: {
    key: 'provincial',
    role: 'Provincial Admin',
    label: 'PTCO Provincial Tourism & Culture Office',
    shortLabel: 'Provincial (PTCO)',
    badgeClass: 'portal-badge-provincial',
    icon: '🏛️',
    productionUrl: 'https://turismotrack-nv.web.app',
    localPort: '5173',
    storageKey: 'turismotrack_user',
    tokenKey: 'turismotrack_auth_token',
  },
  municipal: {
    key: 'municipal',
    role: 'Municipality Admin',
    label: 'Municipal Tourism Operations Office',
    shortLabel: 'Municipal Tourism',
    badgeClass: 'portal-badge-municipal',
    icon: '🏢',
    productionUrl: 'https://turismotrack-muni.web.app',
    localPort: '5174',
    storageKey: 'turismotrack_municipal_user',
    tokenKey: 'turismotrack_auth_token',
  },
  establishment: {
    key: 'establishment',
    role: 'Accommodation Manager',
    label: 'Accommodation Establishment Management',
    shortLabel: 'Accommodation Establishment',
    badgeClass: 'portal-badge-establishment',
    icon: '🏨',
    productionUrl: 'https://turismotrack-est.web.app',
    localPort: '5175',
    storageKey: 'turismotrack_establishment_user',
    tokenKey: 'turismotrack_auth_token',
  },
};

/**
 * Detect which portal this frontend is currently running as.
 */
export function detectCurrentPortal() {
  if (typeof window === 'undefined') return 'provincial';
  const hostname = window.location.hostname.toLowerCase();
  const port = window.location.port;

  if (hostname.includes('turismotrack-muni') || port === '5174') {
    return 'municipal';
  }
  if (hostname.includes('turismotrack-est') || port === '5175') {
    return 'establishment';
  }
  return 'provincial';
}

/**
 * Resolve which portal a user belongs to based on their role and data.
 */
export function resolveUserPortal(user) {
  if (!user) return 'establishment';
  const role = (user.role || '').toLowerCase();
  const muni = (user.municipality || '').toLowerCase();

  if (role.includes('provincial') || role === 'ptco' || muni === 'provincial') {
    return 'provincial';
  }
  if (role.includes('muni') || role === 'municipality admin') {
    return 'municipal';
  }
  return 'establishment';
}

/**
 * Safe base64 encoding helper supporting Unicode characters.
 */
export function toBase64(str) {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    })
  );
}

/**
 * Safe base64 decoding helper supporting Unicode characters.
 */
export function fromBase64(str) {
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(str), (c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );
}

/**
 * Handle routing after a successful login.
 * If user belongs to this portal, triggers onLocalLogin immediately.
 * If user belongs to a different portal, constructs secure handoff URL and redirects.
 */
export function handleRoleBasedLoginRedirect(data, onLocalLogin) {
  const user = data.user;
  const token = data.token || '';
  const targetPortalKey = resolveUserPortal(user);
  const currentPortalKey = detectCurrentPortal();
  const targetPortal = PORTAL_TARGETS[targetPortalKey] || PORTAL_TARGETS.provincial;

  if (currentPortalKey === targetPortalKey) {
    if (onLocalLogin) onLocalLogin(user, token);
    return { redirected: false, user, token, portal: targetPortal };
  }

  // Cross-portal routing needed!
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  let targetOrigin = targetPortal.productionUrl;
  if (isLocalhost) {
    targetOrigin = `http://localhost:${targetPortal.localPort}`;
  }

  const encodedUser = encodeURIComponent(toBase64(JSON.stringify(user)));
  const encodedToken = encodeURIComponent(token);
  const targetUrl = `${targetOrigin}/#session_token=${encodedToken}&session_data=${encodedUser}`;

  return {
    redirected: true,
    targetUrl,
    portal: targetPortal,
    user,
    token,
  };
}

/**
 * Read and consume incoming session from URL hash if redirected from another portal.
 * Cleans the URL hash immediately so no auth data lingers in history/address bar.
 */
export function consumeIncomingSession(storageKey, tokenKey) {
  if (typeof window === 'undefined') return null;
  try {
    const hash = window.location.hash || '';
    if (hash.includes('session_token=') && hash.includes('session_data=')) {
      const searchParams = new URLSearchParams(hash.replace(/^#/, ''));
      const token = searchParams.get('session_token') || '';
      const rawData = searchParams.get('session_data');
      if (rawData) {
        const jsonStr = fromBase64(decodeURIComponent(rawData));
        const user = JSON.parse(jsonStr);
        if (user) {
          if (storageKey) localStorage.setItem(storageKey, JSON.stringify(user));
          if (tokenKey && token) localStorage.setItem(tokenKey, token);

          // Clean hash from browser URL without triggering reload
          window.history.replaceState(null, '', window.location.pathname);
          return { user, token };
        }
      }
    }
  } catch (err) {
    console.warn('Failed to parse incoming cross-portal session:', err);
  }
  return null;
}
