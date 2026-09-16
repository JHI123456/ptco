    import { useState } from 'react'
    import turismoLogo from '../assets/turismo.png'
    import nuevaVizcayaMap from '../assets/Backround.png'
    import './Login.css'

    const MailIcon = () => (
      <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-10 6L2 7" />
      </svg>
    )

    const LockIcon = () => (
      <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    )

    const EyeIcon = ({ off }) => (
      <svg className="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
        {off && <path d="m3 3 18 18" />}
      </svg>
    )

    export default function Login({ onLogin }) {
      const [email, setEmail] = useState('')
      const [password, setPassword] = useState('')
      const [showPassword, setShowPassword] = useState(false)
      const [isLoading, setIsLoading] = useState(false)

      const [errors, setErrors] = useState({})
      const [shake, setShake] = useState(false)

      const validateForm = () => {
        const newErrors = {}

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email) {
          newErrors.email = 'Email address is required'
        } else if (!emailRegex.test(email)) {
          newErrors.email = 'Please enter a valid email address'
        }

        if (!password) {
          newErrors.password = 'Password is required'
        } else if (password.length < 6) {
          newErrors.password = 'Password must be at least 6 characters'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
      }

      const handleSubmit = (e) => {
        e.preventDefault()

        if (!validateForm()) {
          setShake(true)
          setTimeout(() => setShake(false), 500)
          return
        }

        setIsLoading(true)

        setTimeout(() => {
          setIsLoading(false)
          if (onLogin) {
            onLogin({ name: 'PTCO Admin', email, role: 'Administrator' })
          } else {
            alert(`Successfully logged in as ${email}! (Mock authentication successful)`)
          }
        }, 800)
      }

      const handleEmailChange = (e) => {
        setEmail(e.target.value)
        if (errors.email) {
          setErrors((prev) => ({ ...prev, email: undefined }))
        }
      }

      const handlePasswordChange = (e) => {
        setPassword(e.target.value)
        if (errors.password) {
          setErrors((prev) => ({ ...prev, password: undefined }))
        }
      }

      return (
        <div className="login-container">
          <div className="login-hero">
            <div className="logo-container">
              <img src={turismoLogo} alt="TurismoTrack" className="turismo-logo" />
            </div>
            <img
              src={nuevaVizcayaMap}
              alt="Map of Nueva Vizcaya municipalities — TurismoTrack"
              className="login-hero-image"
            />
          </div>

          <div className="login-form-panel">
            <div className={`login-form-wrapper ${shake ? 'shake-animation' : ''}`}>
              <h1 className="welcome-title">Provincial Tourism Office</h1>
              <p className="welcome-subtitle">Track and manage your tourism Data</p>

              <form className="login-form" onSubmit={handleSubmit} noValidate>
                <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
                  <div className="input-wrapper">
                    <MailIcon />
                    <input
                      id="email"
                      type="email"
                      className="input-field has-leading-icon"
                      placeholder="EMAIL ADDRESS"
                      value={email}
                      onChange={handleEmailChange}
                      disabled={isLoading}
                      autoComplete="email"
                      required
                    />
                  </div>
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
                  <div className="input-wrapper">
                    <LockIcon />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className="input-field has-leading-icon has-trailing-icon"
                      placeholder="PASSWORD"
                      value={password}
                      onChange={handlePasswordChange}
                      disabled={isLoading}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      disabled={isLoading}
                    >
                      <EyeIcon off={showPassword} />
                    </button>
                  </div>
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="form-options">
                  <a href="#forgot" className="forgot-password-link" onClick={(e) => e.preventDefault()}>
                    Forgot Password?
                  </a>
                </div>

                <button type="submit" className="submit-btn" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="spinner" />
                      Logging In...
                    </>
                  ) : (
                    'Log In'
                  )}
                </button>
              </form>

              <a href="#register" onClick={(e) => e.preventDefault()} className="footer-link">
                Register as new Municipal Tourism
              </a>
              <a href="#about" onClick={(e) => e.preventDefault()} className="footer-link">
                About the Provincial Tourism Program
              </a>
            </div>
          </div>
        </div>
      )
    }