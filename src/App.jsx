import { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import ErrorBoundary from './components/ErrorBoundary'
import { consumeIncomingSession } from './services/authPortalRouter'

function App() {
  // Check for incoming cross-portal session or restore logged-in provincial user session
  const [user, setUser] = useState(() => {
    try {
      const incoming = consumeIncomingSession('turismotrack_user', 'turismotrack_auth_token');
      if (incoming?.user) return incoming.user;
      const stored = localStorage.getItem('turismotrack_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('turismotrack_user', JSON.stringify(user));
      } catch (e) {}
      document.title = 'TurismoTrack — Provincial Tourism Office Dashboard';
    } else {
      try {
        localStorage.removeItem('turismotrack_user');
      } catch (e) {}
      document.title = 'TurismoTrack — Sign In';
    }
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem('turismotrack_user');
      sessionStorage.removeItem('turismotrack_user');
    } catch (e) {}
  };

  return (
    <ErrorBoundary
      title="Application Display Notice"
      description="An interface update occurred. Click Refresh to restore the dashboard."
    >
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
      <PWAInstallPrompt appName="TurismoTrack PTCO" />
    </ErrorBoundary>
  )
}

export default App
