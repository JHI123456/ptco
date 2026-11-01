import React, { useState, useEffect } from 'react';

export default function PWAInstallPrompt({ appName = 'TurismoTrack' }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [reconnected, setReconnected] = useState(false);

  useEffect(() => {
    // Check if already running in standalone PWA mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Online/offline listeners
    const handleOnline = () => {
      setIsOffline(false);
      setReconnected(true);
      setTimeout(() => setReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <aside aria-label="App Status and Installation" style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
      {/* Offline Alert */}
      {isOffline && (
        <div style={{
          backgroundColor: '#b91c1c',
          color: '#ffffff',
          padding: '8px 14px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          animation: 'fadeIn 0.3s ease'
        }}>
          <span style={{ fontSize: 16 }}>📶❌</span>
          <span>Naka-offline mode. Naka-save ang lokal na data at puwedeng gamitin.</span>
        </div>
      )}

      {/* Reconnected Alert */}
      {reconnected && (
        <div style={{
          backgroundColor: '#047857',
          color: '#ffffff',
          padding: '8px 14px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          animation: 'fadeIn 0.3s ease'
        }}>
          <span style={{ fontSize: 16 }}>✅</span>
          <span>Online muli! Naka-konekta na ang koneksyon.</span>
        </div>
      )}

      {/* PWA Install Banner */}
      {!isStandalone && deferredPrompt && !isDismissed && (
        <div style={{
          backgroundColor: '#ffffff',
          color: '#1e293b',
          border: '1px solid #10b981',
          padding: '12px 14px',
          borderRadius: 12,
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/pwa-192x192.png" alt="App Icon" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'contain' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#064e3b' }}>I-install ang {appName}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>Mas mabilis at may offline access</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={handleInstallClick}
              style={{
                backgroundColor: '#047857',
                color: '#ffffff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Install
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: 14,
                cursor: 'pointer',
                padding: '4px'
              }}
              title="Isara"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

