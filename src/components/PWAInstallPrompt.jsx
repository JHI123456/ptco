import React, { useState, useEffect } from 'react';
import { drainOfflineQueue, getOfflineQueue } from '../offlineSync.js';

export default function PWAInstallPrompt({ appName = 'TurismoTrack' }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  useEffect(() => {
    // Check if running in standalone PWA mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };
    checkStandalone();

    // Check pending offline items
    setPendingCount(getOfflineQueue().length);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Online/offline listeners
    const handleOnline = () => {
      setIsOffline(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setPendingCount(getOfflineQueue().length);
    };

    // Sync status listeners
    const handleSyncStatus = (e) => {
      const detail = e.detail || {};
      if (typeof detail.online === 'boolean') setIsOffline(!detail.online);
      if (typeof detail.pendingCount === 'number') setPendingCount(detail.pendingCount);
      if (typeof detail.syncing === 'boolean') setIsSyncing(detail.syncing);
    };

    const handleDataSynced = (e) => {
      setPendingCount(getOfflineQueue().length);
      setIsSyncing(false);
      setJustSynced(true);
      setTimeout(() => setJustSynced(false), 4000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('tt:sync-status', handleSyncStatus);
    window.addEventListener('tt-data-synced', handleDataSynced);
    window.addEventListener('tt-offline-queued', () => setPendingCount(getOfflineQueue().length));

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('tt:sync-status', handleSyncStatus);
      window.removeEventListener('tt-data-synced', handleDataSynced);
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

  const handleManualSync = async () => {
    setIsSyncing(true);
    await drainOfflineQueue();
    setIsSyncing(false);
  };

  return (
    <aside
      aria-label="App Status and Installation"
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 380,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* 1. Offline Banner */}
      {isOffline && (
        <div
          style={{
            backgroundColor: '#d97706',
            color: '#ffffff',
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 600,
            boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            border: '1px solid #f59e0b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>⚡</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Naka-Offline Mode</div>
              <div style={{ fontSize: 11, opacity: 0.9 }}>
                {pendingCount > 0
                  ? `${pendingCount} item(s) naka-save sa device. Mag-o-auto sync kapag online.`
                  : 'Ligtas na magagamit kahit walang internet connection.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Syncing In Progress Banner */}
      {!isOffline && isSyncing && (
        <div
          style={{
            backgroundColor: '#0284c7',
            color: '#ffffff',
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 600,
            boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            border: '1px solid #38bdf8',
          }}
        >
          <span style={{ fontSize: 15, animation: 'spin 1s linear infinite' }}>🔄</span>
          <span>Nagsi-sync ng data sa cloud backend...</span>
        </div>
      )}

      {/* 3. Success Just Synced Banner */}
      {!isOffline && justSynced && (
        <div
          style={{
            backgroundColor: '#059669',
            color: '#ffffff',
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 600,
            boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            border: '1px solid #34d399',
          }}
        >
          <span style={{ fontSize: 16 }}>✓</span>
          <span>Matagumpay na nai-sync sa cloud ang mga transaksyon!</span>
        </div>
      )}

      {/* 4. Pending Sync Available button (Online but queue still draining) */}
      {!isOffline && pendingCount > 0 && !isSyncing && (
        <div
          style={{
            backgroundColor: '#0f766e',
            color: '#ffffff',
            padding: '8px 12px',
            borderRadius: 10,
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
          }}
        >
          <span>{pendingCount} offline item(s) pending sync</span>
          <button
            onClick={handleManualSync}
            style={{
              backgroundColor: '#ffffff',
              color: '#0f766e',
              border: 'none',
              padding: '4px 10px',
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            I-sync Ngayon
          </button>
        </div>
      )}

      {/* 5. PWA Install Prompt */}
      {!isStandalone && deferredPrompt && !isDismissed && (
        <div
          style={{
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
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="/pwa-192x192.png"
              alt="App Icon"
              style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'contain' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#064e3b' }}>
                I-install ang {appName}
              </div>
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
                whiteSpace: 'nowrap',
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
                fontSize: 16,
                cursor: 'pointer',
                padding: '4px',
              }}
              title="Isara"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
