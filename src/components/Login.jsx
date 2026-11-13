import React, { useState, useEffect, useRef } from 'react';
import turismoLogo from '../assets/turismo.png';
import nuevaVizcayaMap from '../assets/Backround.png';
import './Login.css';
import { API_BASE_URL } from '../services/api';
import ForgotPasswordView from './ForgotPasswordView';
import { handleRoleBasedLoginRedirect } from '../services/authPortalRouter';

// SVG Icons
const MailIcon = () => (
    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-10 6L2 7" />
    </svg>
);

const LockIcon = () => (
    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const EyeIcon = ({ off }) => (
    <svg className="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
        {off && <path d="m3 3 18 18" />}
    </svg>
);

const CaretIcon = ({ open }) => (
    <svg
        className={`register-dropdown-caret ${open ? 'open' : ''}`}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const ESTABLISHMENT_TYPES = [
    'Hotel',
    'Resort',
    'Mabuhay Accommodation',
    'Homestay',
    'Farm Tourism Camps',
    'Tourism Attractions'
];

const NUEVA_VIZCAYA_MUNICIPALITIES = [
    'Alfonso Castañeda',
    'Ambaguio',
    'Aritao',
    'Bagabag',
    'Bambang',
    'Bayombong',
    'Diadi',
    'Dupax del Norte',
    'Dupax del Sur',
    'Kasibu',
    'Kayapa',
    'Quezon',
    'Santa Fe',
    'Solano',
    'Villaverde',
];

export default function Login({ onLogin }) {
    // Hash-based switching state: default strictly to #login on launch
    const [currentHash, setCurrentHash] = useState('#login');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (
                !window.location.hash ||
                window.location.hash === '#register' ||
                window.location.hash === '#forgot' ||
                window.location.hash === ''
            ) {
                window.location.hash = '#login';
                setCurrentHash('#login');
            } else {
                setCurrentHash(window.location.hash);
            }
        }
    }, []);

    useEffect(() => {
        const handleHashChange = () => {
            setCurrentHash(window.location.hash || '#login');
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const navigateTo = (hash) => {
        window.location.hash = hash;
        setCurrentHash(hash);
    };

    const isRegister = currentHash === '#register';
    const isForgot = currentHash === '#forgot';

    // Login Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [loginError, setLoginError] = useState('');
    const [redirectNotice, setRedirectNotice] = useState(null);
    const [shake, setShake] = useState(false);
    const [registrationSuccessMsg, setRegistrationSuccessMsg] = useState('');

    // Register Form State
    const [establishmentName, setEstablishmentName] = useState('');
    const [establishmentType, setEstablishmentType] = useState('');
    const [municipality, setMunicipality] = useState('');
    const [isMuniOpen, setIsMuniOpen] = useState(false);
    const [focusedMuniIndex, setFocusedMuniIndex] = useState(-1);
    const muniDropdownRef = useRef(null);
    const muniDropdownTriggerRef = useRef(null);
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registerErrors, setRegisterErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Custom Dropdown State
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [focusedOptionIndex, setFocusedOptionIndex] = useState(-1);
    const dropdownRef = useRef(null);
    const dropdownTriggerRef = useRef(null);

    // Dropdown close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
                setFocusedOptionIndex(-1);
            }
            if (muniDropdownRef.current && !muniDropdownRef.current.contains(event.target)) {
                setIsMuniOpen(false);
                setFocusedMuniIndex(-1);
            }
        };
        if (isDropdownOpen || isMuniOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isDropdownOpen, isMuniOpen]);

    // Municipality dropdown keyboard accessibility
    const handleMuniDropdownKeyDown = (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (!isMuniOpen) {
                setIsMuniOpen(true);
                setFocusedMuniIndex(municipality ? NUEVA_VIZCAYA_MUNICIPALITIES.indexOf(municipality) : 0);
            } else if (focusedMuniIndex >= 0 && focusedMuniIndex < NUEVA_VIZCAYA_MUNICIPALITIES.length) {
                setMunicipality(NUEVA_VIZCAYA_MUNICIPALITIES[focusedMuniIndex]);
                if (registerErrors.municipality) {
                    setRegisterErrors((prev) => ({ ...prev, municipality: undefined }));
                }
                setIsMuniOpen(false);
                setFocusedMuniIndex(-1);
                if (muniDropdownTriggerRef.current) muniDropdownTriggerRef.current.focus();
            } else {
                setIsMuniOpen(false);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!isMuniOpen) {
                setIsMuniOpen(true);
                setFocusedMuniIndex(municipality ? NUEVA_VIZCAYA_MUNICIPALITIES.indexOf(municipality) : 0);
            } else {
                setFocusedMuniIndex((prev) => (prev + 1) % NUEVA_VIZCAYA_MUNICIPALITIES.length);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (!isMuniOpen) {
                setIsMuniOpen(true);
                setFocusedMuniIndex(municipality ? NUEVA_VIZCAYA_MUNICIPALITIES.indexOf(municipality) : NUEVA_VIZCAYA_MUNICIPALITIES.length - 1);
            } else {
                setFocusedMuniIndex((prev) => (prev - 1 + NUEVA_VIZCAYA_MUNICIPALITIES.length) % NUEVA_VIZCAYA_MUNICIPALITIES.length);
            }
        } else if (e.key === 'Escape' || e.key === 'Tab') {
            if (isMuniOpen) {
                if (e.key === 'Escape') e.preventDefault();
                setIsMuniOpen(false);
                setFocusedMuniIndex(-1);
            }
        }
    };

    // Dropdown keyboard accessibility
    const handleDropdownKeyDown = (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (!isDropdownOpen) {
                setIsDropdownOpen(true);
                setFocusedOptionIndex(establishmentType ? ESTABLISHMENT_TYPES.indexOf(establishmentType) : 0);
            } else if (focusedOptionIndex >= 0 && focusedOptionIndex < ESTABLISHMENT_TYPES.length) {
                setEstablishmentType(ESTABLISHMENT_TYPES[focusedOptionIndex]);
                if (registerErrors.establishmentType) {
                    setRegisterErrors((prev) => ({ ...prev, establishmentType: undefined }));
                }
                setIsDropdownOpen(false);
                setFocusedOptionIndex(-1);
                if (dropdownTriggerRef.current) dropdownTriggerRef.current.focus();
            } else {
                setIsDropdownOpen(false);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!isDropdownOpen) {
                setIsDropdownOpen(true);
                setFocusedOptionIndex(establishmentType ? ESTABLISHMENT_TYPES.indexOf(establishmentType) : 0);
            } else {
                setFocusedOptionIndex((prev) => (prev + 1) % ESTABLISHMENT_TYPES.length);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (!isDropdownOpen) {
                setIsDropdownOpen(true);
                setFocusedOptionIndex(establishmentType ? ESTABLISHMENT_TYPES.indexOf(establishmentType) : ESTABLISHMENT_TYPES.length - 1);
            } else {
                setFocusedOptionIndex((prev) => (prev - 1 + ESTABLISHMENT_TYPES.length) % ESTABLISHMENT_TYPES.length);
            }
        } else if (e.key === 'Escape' || e.key === 'Tab') {
            if (isDropdownOpen) {
                if (e.key === 'Escape') e.preventDefault();
                setIsDropdownOpen(false);
                setFocusedOptionIndex(-1);
            }
        }
    };

    // Validation for Login
    const validateLoginForm = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            newErrors.email = 'Email address is required';
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');

        if (!validateLoginForm()) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }

        setIsLoading(true);
        setLoginError('');
        setRedirectNotice(null);

        try {
            // Mahigpit na pagsusuri laban sa MongoDB Database
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
            });

            const data = await res.json().catch(() => null);
            setIsLoading(false);

            if (!res.ok || !data?.success || !data?.user) {
                // HINDI NAKAREHISTRO O MALI ANG PASSWORD -> HINDI MAKAKAPASOK
                const errorMessage =
                    data?.error || 'Hindi nakarehistro ang account na ito. Mangyaring mag-register muna bago mag-login.';
                setLoginError(errorMessage);
                setShake(true);
                setTimeout(() => setShake(false), 500);
                return;
            }

            // Universal Role-Based Login Routing
            const routing = handleRoleBasedLoginRedirect(data, onLogin);
            if (routing.redirected) {
                setRedirectNotice({
                    role: routing.role,
                    portalLabel: routing.portal?.shortLabel || 'Authorized',
                });
                setTimeout(() => {
                    window.location.href = routing.targetUrl;
                }, 750);
            }
        } catch {
            setIsLoading(false);
            setLoginError('Hindi makakonekta sa server. Pakisiguradong tumatakbo ang backend server.');
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    };

    // Validation for Register
    const validateRegisterForm = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Password at least 8 characters with at least one letter and one number
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

        if (!establishmentName.trim()) {
            newErrors.establishmentName = 'Establishment name is required';
        }

        if (!establishmentType) {
            newErrors.establishmentType = 'Establishment type is required';
        }

        if (!municipality) {
            newErrors.municipality = 'Municipality is required';
        }

        if (!registerEmail.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!emailRegex.test(registerEmail.trim())) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!registerPassword) {
            newErrors.password = 'Password is required';
        } else if (!passwordRegex.test(registerPassword)) {
            newErrors.password = 'Password must be at least 8 characters, including a letter and a number';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Confirm password is required';
        } else if (confirmPassword !== registerPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!termsAgreed) {
            newErrors.terms = 'You must agree to the Terms of service and Privacy policy';
        }

        setRegisterErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        setSuccessMessage('');

        if (!validateRegisterForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    establishmentName: establishmentName.trim(),
                    establishmentType,
                    municipality,
                    email: registerEmail.trim(),
                    password: registerPassword,
                }),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const errorMsg = data?.error || data?.message || `Server error (${response.status})`;
                setServerError(errorMsg);
                setIsSubmitting(false);
                return;
            }

            const successMsg = data?.message || 'Account created successfully! Switching to sign in...';
            setSuccessMessage(successMsg);
            setRegistrationSuccessMsg('Account created successfully! Please sign in with your email and password.');
            setIsSubmitting(false);

            try {
                if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
                    const ch = new BroadcastChannel('turismotrack_realtime');
                    ch.postMessage({
                        type: 'establishment:registered',
                        data: data?.establishment || { name: establishmentName.trim(), municipality },
                    });
                    ch.close();
                }
            } catch { }

            // Reset register fields
            setEstablishmentName('');
            setEstablishmentType('');
            setMunicipality('');
            setRegisterEmail('');
            setRegisterPassword('');
            setConfirmPassword('');
            setTermsAgreed(false);

            // Switch back to #login on success
            setTimeout(() => {
                navigateTo('#login');
            }, 1200);
        } catch (err) {
            setServerError(err.message || 'Unable to connect to the server. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-container">
            {/* Left Hero */}
            <div className="login-hero">
                <div className="login-hero-header">
                    <img src={turismoLogo} alt="TurismoTrack Logo" className="turismo-logo" />
                </div>
                <div className="login-map-container">
                    <img
                        src={nuevaVizcayaMap}
                        alt="Map of Nueva Vizcaya Municipalities"
                        className="login-hero-image"
                    />
                </div>
            </div>

            {/* Right Panel */}
            <div className="login-form-panel">
                {isForgot ? (
                    <ForgotPasswordView
                        initialEmail={email}
                        apiBaseUrl={API_BASE_URL}
                        onBackToLogin={() => {
                            setLoginError('');
                            navigateTo('#login');
                        }}
                        onResetSuccess={(resetEmail, msg) => {
                            setEmail(resetEmail);
                            setPassword('');
                            setErrors({});
                            setLoginError('');
                            setRegistrationSuccessMsg(msg);
                            navigateTo('#login');
                        }}
                    />
                ) : isRegister ? (
                    /* Registration View */
                    <div className="login-form-wrapper">
                        <div className="login-form-header">
                            <h1 className="login-title welcome-title">PROVINCIAL TOURISM OFFICE</h1>
                            <p className="login-subtitle welcome-subtitle">Create your establishment account</p>
                        </div>

                        {serverError && (
                            <div className="register-alert-banner register-alert-error" role="alert">
                                {serverError}
                            </div>
                        )}

                        {successMessage && (
                            <div className="register-alert-banner register-alert-success" role="status">
                                {successMessage}
                            </div>
                        )}

                        <form className="register-form" onSubmit={handleRegisterSubmit} noValidate>
                            {/* ESTABLISHMENT NAME */}
                            <div className="register-form-group">
                                <label className="register-field-label" htmlFor="establishmentName">
                                    ESTABLISHMENT NAME
                                </label>
                                <input
                                    id="establishmentName"
                                    name="establishmentName"
                                    type="text"
                                    className={`register-input ${registerErrors.establishmentName ? 'input-has-error' : ''}`}
                                    placeholder="Enter establishment name"
                                    value={establishmentName}
                                    onChange={(e) => {
                                        setEstablishmentName(e.target.value);
                                        if (registerErrors.establishmentName) {
                                            setRegisterErrors((prev) => ({ ...prev, establishmentName: undefined }));
                                        }
                                    }}
                                    disabled={isSubmitting}
                                    required
                                />
                                {registerErrors.establishmentName && (
                                    <span className="register-error-msg">{registerErrors.establishmentName}</span>
                                )}
                            </div>

                            {/* ESTABLISHMENT TYPE (Custom Dropdown) */}
                            <div className="register-form-group">
                                <label className="register-field-label" id="establishmentTypeLabel">
                                    ESTABLISHMENT TYPE
                                </label>
                                <div className="register-dropdown-wrapper" ref={dropdownRef}>
                                    <button
                                        type="button"
                                        ref={dropdownTriggerRef}
                                        className={`register-dropdown-trigger ${isDropdownOpen ? 'open' : ''} ${registerErrors.establishmentType ? 'input-has-error' : ''}`}
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        onKeyDown={handleDropdownKeyDown}
                                        aria-haspopup="listbox"
                                        aria-expanded={isDropdownOpen}
                                        aria-labelledby="establishmentTypeLabel"
                                        aria-controls="establishment-type-listbox"
                                        disabled={isSubmitting}
                                    >
                                        <span className={establishmentType ? 'register-dropdown-value' : 'register-dropdown-placeholder'}>
                                            {establishmentType || 'Select establishment type'}
                                        </span>
                                        <CaretIcon open={isDropdownOpen} />
                                    </button>

                                    {isDropdownOpen && (
                                        <ul
                                            id="establishment-type-listbox"
                                            className="register-dropdown-menu"
                                            role="listbox"
                                            aria-labelledby="establishmentTypeLabel"
                                        >
                                            {ESTABLISHMENT_TYPES.map((type, idx) => (
                                                <li
                                                    key={type}
                                                    role="option"
                                                    aria-selected={establishmentType === type}
                                                    className={`register-dropdown-item ${establishmentType === type ? 'selected' : ''} ${focusedOptionIndex === idx ? 'focused' : ''}`}
                                                    onClick={() => {
                                                        setEstablishmentType(type);
                                                        if (registerErrors.establishmentType) {
                                                            setRegisterErrors((prev) => ({ ...prev, establishmentType: undefined }));
                                                        }
                                                        setIsDropdownOpen(false);
                                                        setFocusedOptionIndex(-1);
                                                    }}
                                                    onMouseEnter={() => setFocusedOptionIndex(idx)}
                                                >
                                                    {type}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {registerErrors.establishmentType && (
                                    <span className="register-error-msg">{registerErrors.establishmentType}</span>
                                )}
                            </div>

                            {/* MUNICIPALITY (Custom Dropdown) */}
                            <div className="register-form-group">
                                <label className="register-field-label" id="municipalityLabel">
                                    MUNICIPALITY
                                </label>
                                <div className="register-dropdown-wrapper" ref={muniDropdownRef}>
                                    <button
                                        type="button"
                                        id="municipalityBtn"
                                        ref={muniDropdownTriggerRef}
                                        className={`register-dropdown-trigger ${isMuniOpen ? 'open' : ''} ${registerErrors.municipality ? 'input-has-error' : ''}`}
                                        onClick={() => {
                                            setIsMuniOpen(!isMuniOpen);
                                            setIsDropdownOpen(false);
                                        }}
                                        onKeyDown={handleMuniDropdownKeyDown}
                                        aria-haspopup="listbox"
                                        aria-expanded={isMuniOpen}
                                        aria-labelledby="municipalityLabel"
                                        aria-controls="municipality-listbox"
                                        disabled={isSubmitting}
                                    >
                                        <span className={municipality ? 'register-dropdown-value' : 'register-dropdown-placeholder'}>
                                            {municipality || 'Select municipality'}
                                        </span>
                                        <CaretIcon open={isMuniOpen} />
                                    </button>

                                    {isMuniOpen && (
                                        <ul
                                            id="municipality-listbox"
                                            className="register-dropdown-menu"
                                            role="listbox"
                                            aria-labelledby="municipalityLabel"
                                        >
                                            {NUEVA_VIZCAYA_MUNICIPALITIES.map((muni, idx) => (
                                                <li
                                                    key={muni}
                                                    role="option"
                                                    aria-selected={municipality === muni}
                                                    className={`register-dropdown-item ${municipality === muni ? 'selected' : ''} ${focusedMuniIndex === idx ? 'focused' : ''}`}
                                                    onClick={() => {
                                                        setMunicipality(muni);
                                                        if (registerErrors.municipality) {
                                                            setRegisterErrors((prev) => ({ ...prev, municipality: undefined }));
                                                        }
                                                        setIsMuniOpen(false);
                                                        setFocusedMuniIndex(-1);
                                                    }}
                                                    onMouseEnter={() => setFocusedMuniIndex(idx)}
                                                >
                                                    {muni}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {registerErrors.municipality && (
                                    <span className="register-error-msg">{registerErrors.municipality}</span>
                                )}
                            </div>

                            {/* EMAIL ADDRESS */}
                            <div className="register-form-group">
                                <label className="register-field-label" htmlFor="registerEmail">
                                    EMAIL ADDRESS
                                </label>
                                <input
                                    id="registerEmail"
                                    name="email"
                                    type="email"
                                    className={`register-input ${registerErrors.email ? 'input-has-error' : ''}`}
                                    placeholder="Enter email address"
                                    value={registerEmail}
                                    onChange={(e) => {
                                        setRegisterEmail(e.target.value);
                                        if (registerErrors.email) {
                                            setRegisterErrors((prev) => ({ ...prev, email: undefined }));
                                        }
                                    }}
                                    disabled={isSubmitting}
                                    autoComplete="email"
                                    required
                                />
                                {registerErrors.email && (
                                    <span className="register-error-msg">{registerErrors.email}</span>
                                )}
                            </div>

                            {/* PASSWORD */}
                            <div className="register-form-group">
                                <label className="register-field-label" htmlFor="registerPassword">
                                    PASSWORD
                                </label>
                                <div className="register-input-wrapper">
                                    <input
                                        id="registerPassword"
                                        name="password"
                                        type={showRegisterPassword ? 'text' : 'password'}
                                        className={`register-input has-trailing-btn ${registerErrors.password ? 'input-has-error' : ''}`}
                                        placeholder="Create a password"
                                        value={registerPassword}
                                        onChange={(e) => {
                                            setRegisterPassword(e.target.value);
                                            if (registerErrors.password) {
                                                setRegisterErrors((prev) => ({ ...prev, password: undefined }));
                                            }
                                        }}
                                        disabled={isSubmitting}
                                        autoComplete="new-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="register-toggle-btn"
                                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                        aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                                        disabled={isSubmitting}
                                        tabIndex={-1}
                                    >
                                        <EyeIcon off={showRegisterPassword} />
                                    </button>
                                </div>
                                {registerErrors.password && (
                                    <span className="register-error-msg">{registerErrors.password}</span>
                                )}
                            </div>

                            {/* CONFIRM PASSWORD */}
                            <div className="register-form-group">
                                <label className="register-field-label" htmlFor="confirmPassword">
                                    CONFIRM PASSWORD
                                </label>
                                <div className="register-input-wrapper">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        className={`register-input has-trailing-btn ${registerErrors.confirmPassword ? 'input-has-error' : ''}`}
                                        placeholder="Re-enter password"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            if (registerErrors.confirmPassword) {
                                                setRegisterErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                                            }
                                        }}
                                        disabled={isSubmitting}
                                        autoComplete="new-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="register-toggle-btn"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                        disabled={isSubmitting}
                                        tabIndex={-1}
                                    >
                                        <EyeIcon off={showConfirmPassword} />
                                    </button>
                                </div>
                                {registerErrors.confirmPassword && (
                                    <span className="register-error-msg">{registerErrors.confirmPassword}</span>
                                )}
                            </div>

                            {/* Small helper text under password fields */}
                            <p className="register-password-helper">
                                Use at least 8 characters, including a letter and a number.
                            </p>

                            {/* Terms Checkbox */}
                            <div className="register-checkbox-container">
                                <label className="register-checkbox-label">
                                    <input
                                        type="checkbox"
                                        className="register-checkbox-input"
                                        checked={termsAgreed}
                                        onChange={(e) => {
                                            setTermsAgreed(e.target.checked);
                                            if (registerErrors.terms) {
                                                setRegisterErrors((prev) => ({ ...prev, terms: undefined }));
                                            }
                                        }}
                                        disabled={isSubmitting}
                                    />
                                    <span>
                                        I agree to the{' '}
                                        <a href="#terms" onClick={(e) => e.preventDefault()} className="register-legal-link">
                                            Terms of service
                                        </a>{' '}
                                        and{' '}
                                        <a href="#privacy" onClick={(e) => e.preventDefault()} className="register-legal-link">
                                            Privacy policy
                                        </a>
                                        .
                                    </span>
                                </label>
                                {registerErrors.terms && (
                                    <span className="register-error-msg">{registerErrors.terms}</span>
                                )}
                            </div>

                            {/* Full-width CREATE ACCOUNT Button in burnt orange */}
                            <button type="submit" className="register-submit-btn" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating account...' : 'CREATE ACCOUNT'}
                            </button>
                        </form>

                        {/* Already have an account? Sign in */}
                        <div className="register-switch-container">
                            Already have an account?{' '}
                            <a
                                href="#login"
                                onClick={() => navigateTo('#login')}
                                className="register-signin-link"
                            >
                                Sign in
                            </a>
                        </div>
                    </div>
                ) : (
                    /* Login View */
                    <div className={`login-form-wrapper ${shake ? 'shake-animation' : ''}`}>
                        <div className="login-form-header">
                            <h1 className="login-title welcome-title">TURISMOTRACK NUEVA VIZCAYA</h1>
                            <p className="login-subtitle welcome-subtitle">Official Tourism Operations & Analytics Portal</p>
                            <div className="universal-role-badges" aria-label="Supported User Roles">
                                <span className="role-pill">🏛️ Provincial (PTCO)</span>
                                <span className="role-pill">🏢 Municipal Tourism</span>
                                <span className="role-pill">🏨 Accommodation</span>
                            </div>
                            <p className="universal-login-hint">Universal Role-Based Login: Sign in with your registered account to access your designated workspace.</p>
                        </div>

                        {redirectNotice && (
                            <div className="login-redirect-banner" role="status">
                                <div className="redirect-spinner"></div>
                                <div>
                                    <strong>Signing in as {redirectNotice.role}...</strong>
                                    <p>Routing to {redirectNotice.portalLabel} Workspace...</p>
                                </div>
                            </div>
                        )}

                        {loginError && (
                            <div className="login-error-banner" role="alert">
                                {loginError}
                            </div>
                        )}

                        {registrationSuccessMsg && (
                            <div className="login-success-msg">
                                {registrationSuccessMsg}
                            </div>
                        )}

                        <form className="login-form" onSubmit={handleLoginSubmit} noValidate>
                            <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
                                <div className="input-wrapper">
                                    <MailIcon />
                                    <input
                                        id="email"
                                        type="email"
                                        className="input-field has-leading-icon"
                                        placeholder="EMAIL ADDRESS"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                                            if (loginError) setLoginError('');
                                        }}
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
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                                            if (loginError) setLoginError('');
                                        }}
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
                                <a
                                    href="#forgot"
                                    className="forgot-password-link"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setRegistrationSuccessMsg('');
                                        setLoginError('');
                                        setErrors({});
                                        navigateTo('#forgot');
                                    }}
                                >
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
                                    'LOG IN'
                                )}
                            </button>
                        </form>

                        <div className="login-footer-links">
                            <a
                                href="#register"
                                onClick={() => navigateTo('#register')}
                                className="footer-link"
                            >
                                Register as new Accommodation Establishment
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
