import { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('turismotrack_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('turismotrack_user', JSON.stringify(user))
      document.title = 'TurismoTrack — Provincial Tourism Office Dashboard'
    } else {
      localStorage.removeItem('turismotrack_user')
      document.title = 'TurismoTrack — Sign In'
    }
  }, [user])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
  }

  return user ? (
    <Dashboard user={user} onLogout={handleLogout} />
  ) : (
    <Login onLogin={handleLogin} />
  )
}

export default App
