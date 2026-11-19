import React, { useState, useEffect, useRef } from 'react';

import turismoLogo from '../assets/turismo.png';
import nuevaVizcayaMap from '../assets/Backround.png';
import './Login.css';
import { API_BASE_URL } from '../services/api';
import ForgotPasswordView from './ForgotPasswordView';
import { handleRoleBasedLoginRedirect } from '../services/authPortalRouter.js';

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

// Legal Terms of Service & Privacy Policy Modal (Data Privacy Act of 2012 / RA 10173 Compliant)
function LegalTermsPrivacyModal({ activeTab, onSelectTab, onClose, onAgree }) {
    return (
        <div className="legal-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
            <div className="legal-modal-card" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="legal-modal-header">
                    <div className="legal-modal-title-group">
                        <h3>
                            {activeTab === 'terms' ? '📜 Terms of Service' : '🔒 Privacy Policy'}
                        </h3>
                        <p>TurismoTrack: Nueva Vizcaya Tourism Management &amp; Decision Support System</p>
                    </div>
                    <button
                        type="button"
                        className="legal-modal-close"
                        onClick={onClose}
                        title="Close"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="legal-modal-nav">
                    <button
                        type="button"
                        className={`legal-modal-tab-btn ${activeTab === 'terms' ? 'active' : ''}`}
                        onClick={() => onSelectTab('terms')}
                    >
                        📜 Terms of Service
                    </button>
                    <button
                        type="button"
                        className={`legal-modal-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
                        onClick={() => onSelectTab('privacy')}
                    >
                        🔒 Privacy Policy (RA 10173)
                    </button>
                </div>

                {/* Modal Body */}
                <div className="legal-modal-body">
                    {activeTab === 'terms' ? (
                        <div>
                            <div className="legal-modal-badge">
                                ⚖️ Official Terms of Service &amp; Administrative Governance Agreement
                            </div>

                            <div className="legal-section">
                                <h4>1. Acceptance of Terms</h4>
                                <p>
                                    By registering an account, accessing, or utilizing the <strong>TurismoTrack</strong> portal (operating across Accommodation Establishments, Municipal Tourism Offices, and the Provincial Tourism and Culture Office of Nueva Vizcaya), you confirm that you have read, understood, and agreed to be legally bound by these Terms of Service.
                                </p>
                            </div>

                            <div className="legal-section">
                                <h4>2. Multi-Tier Registration &amp; Verification Policy</h4>
                                <ul>
                                    <li><strong>Accommodation Establishments:</strong> Newly registered accommodation and attraction facility accounts undergo verification and approval by their respective <strong>Municipal Tourism Officer</strong> before portal access is granted.</li>
                                    <li><strong>Municipal Tourism Officers:</strong> Newly registered municipal accounts must be reviewed and officially activated by the <strong>Provincial Tourism and Culture Office (PTCO)</strong>.</li>
                                    <li>Unapproved accounts remain in a strict <em>Pending Verification</em> state and cannot access administrative workspaces.</li>
                                </ul>
                            </div>

                            <div className="legal-section">
                                <h4>3. Authenticity &amp; Integrity of Tourist Filings</h4>
                                <p>
                                    All guest entries encoded via touchless QR code scanning or front-desk manual registration, as well as official monthly reporting filings (<strong>Form A / DAE 1A, DAE 1B, VAR 2, DAE-2</strong>), must reflect genuine, accurate, and verifiable guest statistics. Submitting deliberately falsified, duplicate, or inflated numbers is strictly prohibited and subject to administrative sanctions under Department of Tourism (DOT) standards.
                                </p>
                            </div>

                            <div className="legal-section">
                                <h4>4. Submission Locking &amp; Audit Trail Governance</h4>
                                <p>
                                    Upon official approval by the reviewing Municipal or Provincial Tourism Officer, compliance submissions are automatically locked (<code>isLocked</code>) to guarantee data immutability for official DOT Region II archival. If corrections are required, the filing must be formally returned for revision with documented audit notes.
                                </p>
                            </div>

                            <div className="legal-section">
                                <h4>5. User Responsibilities &amp; Account Security</h4>
                                <p>
                                    Account holders are responsible for maintaining the confidentiality of their login credentials. Any activity conducted under an authorized account is the sole responsibility of the registered organization. Users must immediately report any suspected security breach or unauthorized access to the Provincial Tourism Office.
                                </p>
                            </div>

                            <div className="legal-section">
                                <h4>6. Progressive Web App (PWA) Offline Operation</h4>
                                <p>
                                    TurismoTrack provides client-side caching to support guest logging during temporary internet disruptions. Officers and establishment personnel agree to synchronize all locally held filings as soon as internet connectivity is restored.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="legal-modal-badge">
                                🛡️ Republic Act No. 10173 (Data Privacy Act of 2012) Compliant
                            </div>

                            <div className="legal-section">
                                <h4>1. Commitment to Data Privacy</h4>
                                <p>
                                    <strong>TurismoTrack</strong> is committed to safeguarding personal information in strict compliance with <strong>Republic Act No. 10173 (Data Privacy Act of 2012)</strong> of the Philippines, its Implementing Rules and Regulations (IRR), and all relevant administrative issuances from the <strong>National Privacy Commission (NPC)</strong> and the <strong>Department of Tourism (DOT)</strong>.
                                </p>
                            </div>

                            <div className="legal-section">
                                <h4>2. Personal Data We Collect</h4>
                                <ul>
                                    <li><strong>Establishment &amp; Officer Details:</strong> Business name, official contact person, government email address, telephone/mobile number, DOT accreditation number, and municipal jurisdiction.</li>
                                    <li><strong>Visitor &amp; Tourist Demographics:</strong> Collected through QR-code touchless self-check-in or manual front-desk entry: guest full name, sex/gender, age bracket, country and province/municipality of residence, purpose of visit (leisure, business, official), and length of stay.</li>
                                </ul>
                            </div>

                            <div className="legal-section">
                                <h4>3. Lawful Purpose of Data Processing</h4>
                                <p>
                                    Pursuant to Section 12 of RA 10173, collected personal information is processed strictly for public-interest and statutory tourism functions:
                                </p>
                                <ul>
                                    <li>Generating official DOT Region II monthly arrivals and occupancy compliance reports.</li>
                                    <li>Decision Support System (DSS) analytics to assess tourist influx patterns, optimize municipal resources, and guide local tourism development programs.</li>
                                    <li>Emergency response, disaster risk management, and guest tracing during natural calamities or civil emergencies within Nueva Vizcaya.</li>
                                </ul>
                            </div>

                            <div className="legal-section">
                                <h4>4. Non-Disclosure &amp; Tenant Data Isolation</h4>
                                <p>
                                    TurismoTrack enforces strict multi-tenant boundaries. <strong>We do not sell, rent, trade, or commercially monetize guest data to third-party advertisers or private entities.</strong> Data is shared solely across sanctioned administrative channels:
                                </p>
                                <ul>
                                    <li><strong>Establishments</strong> have access only to their own recorded guests.</li>
                                    <li><strong>Municipal LGUs</strong> access consolidated records solely for establishments within their municipal border.</li>
                                    <li><strong>The Provincial Office (PTCO)</strong> accesses macro-level consolidated statistical aggregates across all 15 municipalities.</li>
                                </ul>
                            </div>

                            <div className="legal-section">
                                <h4>5. Data Storage, Protection &amp; Retention</h4>
                                <p>
                                    All data is secured using industry-standard TLS encryption during transmission, role-based access controls (RBAC), and automated audit logs. Personal data is retained only for the duration prescribed by government and DOT audit regulations, after which individual identifiers are safely archived or anonymized for statistical reporting.
                                </p>
                            </div>

                            <div className="legal-section">
                                <h4>6. Your Rights Under RA 10173</h4>
                                <p>
                                    As a data subject, you are entitled to the <em>Right to be Informed</em>, <em>Right to Access</em>, <em>Right to Rectification</em>, and <em>Right to Erasure or Blocking</em> of false or unlawfully obtained data. Inquiries regarding data privacy may be directed to the designated Data Protection Officer at the Provincial Tourism and Culture Office (PTCO) of Nueva Vizcaya.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="legal-modal-footer">
                    <button
                        type="button"
                        className="legal-modal-btn-close"
                        onClick={onClose}
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        className="legal-modal-btn-agree"
                        onClick={onAgree}
                    >
                        ✓ I Understand &amp; Agree
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Login({ onLogin }) {
    
    // Hash-based switching state: default strictly to #login on launch
    const [currentHash, setCurrentHash] = useState('#login');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const h = window.location.hash;
            if (!h || h === '') {
                window.location.hash = '#login';
                setCurrentHash('#login');
            } else {
                if (h === '#register-municipal') {
                    setRegisterType('municipal');
                    setCurrentHash('#register');
                } else if (h === '#register-establishment') {
                    setRegisterType('establishment');
                    setCurrentHash('#register');
                } else {
                    setCurrentHash(h);
                }
            }
        }

        // Silent background pre-warming to awaken Render backend before user clicks Log In
        try {
            fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'ping@turismotrack.local', password: 'ping' }),
            }).catch(() => {});
        } catch (e) {}
    }, []);

    useEffect(() => {
        const handleHashChange = () => {
            const h = window.location.hash || '#login';
            if (h === '#register-municipal') {
                setRegisterType('municipal');
                setCurrentHash('#register');
            } else if (h === '#register-establishment') {
                setRegisterType('establishment');
                setCurrentHash('#register');
            } else {
                setCurrentHash(h);
            }
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    useEffect(() => {
        let ch = null;
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            try {
                ch = new BroadcastChannel('turismotrack_realtime');
                ch.onmessage = (event) => {
                    if (event.data?.type === 'establishment:approved' && event.data?.email) {
                        try {
                            const approved = JSON.parse(localStorage.getItem('turismotrack_approved_establishments') || '[]');
                            const em = event.data.email.toLowerCase().trim();
                            if (!approved.includes(em)) {
                                approved.push(em);
                                localStorage.setItem('turismotrack_approved_establishments', JSON.stringify(approved));
                            }
                        } catch {}
                    }
                };
            } catch {}
        }
        return () => {
            if (ch) ch.close();
        };
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
    const [registerType, setRegisterType] = useState('establishment'); // 'establishment' or 'municipal'
    const [regOfficeName, setRegOfficeName] = useState('');
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
    const [legalModalTab, setLegalModalTab] = useState(null); // 'terms' | 'privacy' | null
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

    // Resilient offline / pre-seeded accounts resolver (handles server sleep / network drops)
    const resolveDemoOfflineUser = (emailInput, passwordInput) => {
        const clean = (emailInput || '').trim().toLowerCase();
        const pwd = passwordInput || '';

        // 1. Zen Hotel Bayombong (Accommodation)
        if (
            (clean === 'zenhotel@gmail.com' || clean === 'zen hotel bayombong' || clean === 'zen hotel') &&
            (pwd === 'user1234' || pwd === 'USER1234' || pwd === 'admin123')
        ) {
            return {
                _id: '6aedcd81a788161a75ba44fc',
                id: '6aedcd81a788161a75ba44fc',
                email: 'zenhotel@gmail.com',
                name: 'Zen Hotel Bayombong',
                establishmentName: 'Zen Hotel Bayombong',
                establishmentCategory: 'Hotel',
                establishmentSubType: 'Hotel',
                category: 'Hotel',
                municipality: 'Bayombong',
                role: 'establishment',
            };
        }

        // 1.1 TORRES MOTEL
        if (
            (clean === 'torres09@gmail.com' || clean === 'torres motel') &&
            (pwd === 'USER1234' || pwd === 'user1234' || pwd === 'admin123')
        ) {
            return {
                _id: '6afb1c978c1b7a334b6ef809',
                id: '6afb1c978c1b7a334b6ef809',
                email: 'torres09@gmail.com',
                name: 'TORRES MOTEL',
                establishmentName: 'TORRES MOTEL',
                establishmentCategory: 'Mabuhay Accommodation',
                establishmentSubType: 'Mabuhay Accommodation',
                category: 'Mabuhay Accommodation',
                municipality: 'Bayombong',
                role: 'establishment',
            };
        }

        // 1.2 WILWIN HOTEL
        if (
            (clean === 'willwinhotel@gmail.com' || clean === 'wilwin hotel') &&
            (pwd === 'user1234' || pwd === 'USER1234' || pwd === 'admin123')
        ) {
            return {
                _id: '6af6ffff0c2797642772b561',
                id: '6af6ffff0c2797642772b561',
                email: 'willwinhotel@gmail.com',
                name: 'WILWIN HOTEL',
                establishmentName: 'WILWIN HOTEL',
                establishmentCategory: 'Hotel',
                establishmentSubType: 'Hotel',
                category: 'Hotel',
                municipality: 'Bayombong',
                role: 'establishment',
            };
        }

        // 1.3 Balai Andrei
        if (
            (clean === 'drei@gmail.com' || clean === 'balai andrei') &&
            (pwd === 'user1234' || pwd === 'USER1234' || pwd === 'admin123')
        ) {
            return {
                _id: '6afb1af08c1b7a334b6eee83',
                id: '6afb1af08c1b7a334b6eee83',
                email: 'drei@gmail.com',
                name: 'Balai Andrei',
                establishmentName: 'Balai Andrei',
                establishmentCategory: 'Mabuhay Accommodation',
                establishmentSubType: 'Mabuhay Accommodation',
                category: 'Mabuhay Accommodation',
                municipality: 'Bayombong',
                role: 'establishment',
            };
        }

        // 2. Bayombong Municipal Tourism Office
        if (
            (clean === 'bayombongtourism@gmail.com' ||
             clean === 'bayombong@gmail.com' ||
             clean === 'tourism@bayombong.gov.ph') &&
            (pwd === 'user1234' || pwd === 'admin123')
        ) {
            return {
                _id: '6af7e82993f9fc87bd5820e8',
                id: '6af7e82993f9fc87bd5820e8',
                name: 'Bayombong Municipal Tourism Office',
                officeName: 'Bayombong Municipal Tourism Office',
                establishmentName: 'Bayombong Municipal Tourism Office',
                email: clean,
                role: 'Municipality Admin',
                municipality: 'Bayombong',
            };
        }

        // 3. Other Nueva Vizcaya Municipalities (e.g. solanotourism@gmail.com, bambangtourism@gmail.com)
        const munis = [
            'Bayombong', 'Solano', 'Bambang', 'Diadi', 'Dupax del Sur',
            'Dupax del Norte', 'Bagabag', 'Aritao', 'Kasibu', 'Kayapa',
            'Santa Fe', 'Villaverde', 'Quezon', 'Ambaguio', 'Alfonso Castañeda'
        ];
        for (const m of munis) {
            const key = m.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (
                (clean === `${key}tourism@gmail.com` || clean === `${key}@gmail.com` || clean === `tourism@${key}.gov.ph`) &&
                (pwd === 'user1234' || pwd === 'admin123')
            ) {
                return {
                    _id: `muni_${key}_offline`,
                    id: `muni_${key}_offline`,
                    name: `${m} Municipal Tourism Office`,
                    officeName: `${m} Municipal Tourism Office`,
                    establishmentName: `${m} Municipal Tourism Office`,
                    email: clean,
                    role: 'Municipality Admin',
                    municipality: m,
                };
            }
        }

        // 4. Provincial Admin (PTCO)
        if (clean === 'admin@gmail.com' && (pwd === 'admin123' || pwd === 'user1234')) {
            return {
                _id: '6aedcd81a788161a75ba44fa',
                id: '6aedcd81a788161a75ba44fa',
                email: 'admin@gmail.com',
                name: 'Provincial Tourism Officer',
                officeName: 'Provincial Tourism and Cultural Affairs Office',
                role: 'Provincial Admin',
                municipality: 'Bayombong',
            };
        }

        // 5. Dynamic local registered accounts (Only allowed if verified and approved by Municipal Tourism Office)
        try {
            const localAccs = JSON.parse(localStorage.getItem('turismotrack_local_accounts') || '[]');
            const approvedEsts = JSON.parse(localStorage.getItem('turismotrack_approved_establishments') || '[]');
            const matched = localAccs.find(
                (a) => a.email === clean && (!a.password || a.password === pwd)
            );
            if (matched) {
                const isApproved =
                    matched.status === 'active' ||
                    matched.verificationStatus === 'approved' ||
                    matched.isApproved === true ||
                    approvedEsts.includes(clean);

                if (isApproved) {
                    return matched;
                }
                // Unapproved account: do NOT allow instant login!
                return null;
            }
        } catch (e) {}

        return null;
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

        const trimmedEmail = email.trim().toLowerCase();
        const fallbackUser = resolveDemoOfflineUser(trimmedEmail, password);

        // ⚡ INSTANT LOGIN (0ms): If official / demo account, open dashboard IMMEDIATELY without waiting for server!
        if (fallbackUser) {
            const routing = handleRoleBasedLoginRedirect(
                { user: fallbackUser, token: '' },
                (user) => {
                    try {
                        localStorage.setItem('turismotrack_user', JSON.stringify(user));
                    } catch (e) {}
                    if (typeof onLogin === 'function') {
                        onLogin(user);
                    }
                    if (typeof window !== 'undefined') {
                        window.location.hash = '';
                    }
                    setIsLoading(false);
                },
                'provincial'
            );

            if (routing?.redirected) {
                return;
            }

            // Background token sync (silent, never blocks the user)
            fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: trimmedEmail, password }),
            }).then((r) => r.json()).then((data) => {
                if (data?.token) {
                    try {
                        localStorage.setItem('turismotrack_auth_token', data.token);
                    } catch (e) {}
                }
            }).catch(() => {});

            return;
        }

        // Custom registered account: query backend with 6s timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        try {
            // Mahigpit na pagsusuri laban sa MongoDB Database
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: trimmedEmail, password }),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            const data = await res.json().catch(() => null);

            if (res.ok && data?.user) {
                const loggedInUser = {
                    ...data.user,
                    name: data.user.establishmentName || data.user.name || trimmedEmail.split('@')[0].toUpperCase(),
                    establishmentName: data.user.establishmentName || data.user.name || 'Zen Hotel Bayombong',
                    establishmentCategory: data.user.establishmentCategory || data.user.category || 'Hotel',
                    establishmentSubType: data.user.establishmentSubType || 'Hotel',
                    municipality: data.user.municipality || 'Bayombong',
                    role: data.user.role || 'Accommodation Manager',
                };

                const routing = handleRoleBasedLoginRedirect(
                    { user: loggedInUser, token: data.token || '' },
                    (user, token) => {
                        if (token) {
                            try {
                                localStorage.setItem('turismotrack_auth_token', token);
                            } catch (e) {}
                        }
                        try {
                            localStorage.setItem('turismotrack_user', JSON.stringify(user));
                        } catch (e) {}
                        if (typeof onLogin === 'function') {
                            onLogin(user);
                        }
                        if (typeof window !== 'undefined') {
                            window.location.hash = '';
                        }
                        setIsLoading(false);
                    },
                'provincial'
            );

                if (routing?.redirected) {
                    return;
                }
                return;
            } else {
                setIsLoading(false);
                const errorMessage =
                    data?.error || 'Hindi nakarehistro ang account na ito. Mangyaring mag-register muna bago mag-login.';
                setLoginError(errorMessage);
                setShake(true);
                setTimeout(() => setShake(false), 500);
                return;
            }
        } catch {
            clearTimeout(timeoutId);
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
        // Password at least 6 characters with at least one letter and one number
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;

        if (registerType === 'municipal') {
            if (!municipality) {
                newErrors.municipality = 'Municipality is required';
            }
            if (!regOfficeName.trim()) {
                newErrors.officeName = 'Name of Municipal Tourism Office is required';
            }
        } else {
            if (!establishmentName.trim()) {
                newErrors.establishmentName = 'Establishment name is required';
            }
            if (!establishmentType) {
                newErrors.establishmentType = 'Establishment type is required';
            }
            if (!municipality) {
                newErrors.municipality = 'Municipality is required';
            }
        }

        if (!registerEmail.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!emailRegex.test(registerEmail.trim())) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!registerPassword) {
            newErrors.password = 'Password is required';
        } else if (!passwordRegex.test(registerPassword)) {
            newErrors.password = 'Password must be at least 6 characters, including a letter and a number';
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
            const isMuni = registerType === 'municipal';
            const endpoint = isMuni ? `${API_BASE_URL}/auth/register-municipal` : `${API_BASE_URL}/auth/register`;
            const payload = isMuni
                ? {
                    municipality: municipality.trim(),
                    officeName: regOfficeName.trim() || `${municipality.trim()} Municipal Tourism Office`,
                    email: registerEmail.trim(),
                    password: registerPassword,
                }
                : {
                    establishmentName: establishmentName.trim(),
                    establishmentType,
                    municipality: municipality.trim(),
                    email: registerEmail.trim(),
                    password: registerPassword,
                };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const errorMsg = data?.error || data?.message || `Server error (${response.status})`;
                setServerError(errorMsg);
                setIsSubmitting(false);
                return;
            }

            const localAcc = {
                _id: data?.user?._id || `est_${Date.now()}`,
                id: data?.user?.id || `est_${Date.now()}`,
                email: registerEmail.trim().toLowerCase(),
                password: registerPassword,
                name: isMuni ? (regOfficeName.trim() || `${municipality.trim()} Municipal Tourism Office`) : establishmentName.trim(),
                establishmentName: isMuni ? (regOfficeName.trim() || `${municipality.trim()} Municipal Tourism Office`) : establishmentName.trim(),
                officeName: isMuni ? (regOfficeName.trim() || `${municipality.trim()} Municipal Tourism Office`) : undefined,
                establishmentCategory: isMuni ? 'Municipal Office' : establishmentType,
                establishmentSubType: isMuni ? 'Municipal Office' : establishmentType,
                category: isMuni ? 'Municipal Office' : establishmentType,
                municipality: municipality.trim(),
                role: isMuni ? 'Municipality Admin' : 'establishment',
                status: 'pending',
                verificationStatus: 'pending',
                isApproved: false,
            };
            try {
                const existing = JSON.parse(localStorage.getItem('turismotrack_local_accounts') || '[]');
                const filtered = existing.filter((a) => a.email !== localAcc.email);
                filtered.push(localAcc);
                localStorage.setItem('turismotrack_local_accounts', JSON.stringify(filtered));
            } catch (e) {}

            const successMsg = isMuni
                ? `Naisumite na ang inyong registration! Ang inyong Municipal Tourism Office account ay susuriin at aaprubahan muna ng Provincial Tourism Office (PTCO) bago makapag-log in.`
                : `Naisumite na ang inyong registration! Ang account ng ${establishmentName.trim()} ay kasalukuyang PENDING at susuriin muna ng Municipal Tourism Office ng ${municipality.trim()} bago kayo makapag-log in.`;
            setSuccessMessage(successMsg);
            setRegistrationSuccessMsg(successMsg);
            setIsSubmitting(false);

            try {
                if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
                    const ch = new BroadcastChannel('turismotrack_realtime');
                    ch.postMessage({
                        type: isMuni ? 'municipal:registered' : 'establishment:registered',
                        data: isMuni ? data?.lgu || { municipality } : data?.establishment || { name: establishmentName.trim(), municipality },
                    });
                    ch.close();
                }
            } catch { }

            // Reset register fields
            setEstablishmentName('');
            setEstablishmentType('');
            setRegOfficeName('');
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
            // Graceful fallback for offline / sleeping Render server
            try {
                const isMuni = registerType === 'municipal';
                const localAcc = {
                    _id: `est_offline_${Date.now()}`,
                    id: `est_offline_${Date.now()}`,
                    email: registerEmail.trim().toLowerCase(),
                    password: registerPassword,
                    name: isMuni ? (regOfficeName.trim() || `${municipality.trim()} Municipal Tourism Office`) : establishmentName.trim(),
                    establishmentName: isMuni ? (regOfficeName.trim() || `${municipality.trim()} Municipal Tourism Office`) : establishmentName.trim(),
                    officeName: isMuni ? (regOfficeName.trim() || `${municipality.trim()} Municipal Tourism Office`) : undefined,
                    establishmentCategory: isMuni ? 'Municipal Office' : establishmentType,
                    establishmentSubType: isMuni ? 'Municipal Office' : establishmentType,
                    category: isMuni ? 'Municipal Office' : establishmentType,
                    municipality: municipality.trim(),
                    role: isMuni ? 'Municipality Admin' : 'establishment',
                };
                const existing = JSON.parse(localStorage.getItem('turismotrack_local_accounts') || '[]');
                const filtered = existing.filter((a) => a.email !== localAcc.email);
                filtered.push(localAcc);
                localStorage.setItem('turismotrack_local_accounts', JSON.stringify(filtered));

                setSuccessMessage('Account registered successfully! Switching to sign in...');
                setRegistrationSuccessMsg(`Account created successfully! Please sign in with ${registerEmail.trim()}.`);
                setIsSubmitting(false);

                setEstablishmentName('');
                setEstablishmentType('');
                setRegOfficeName('');
                setMunicipality('');
                setRegisterEmail('');
                setRegisterPassword('');
                setConfirmPassword('');
                setTermsAgreed(false);

                setTimeout(() => {
                    navigateTo('#login');
                }, 1200);
                return;
            } catch (e) {}

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
                            <h1 className="login-title welcome-title">
                                {registerType === 'municipal' ? 'MUNICIPAL TOURISM REGISTRATION' : 'ESTABLISHMENT REGISTRATION'}
                            </h1>
                            <p className="login-subtitle welcome-subtitle">
                                {registerType === 'municipal'
                                    ? 'Create an official tourism account for your municipality'
                                    : 'Create your accommodation or attraction account'}
                            </p>
                        </div>

                        {/* Switcher Tabs */}
                        <div className="register-type-tabs" role="tablist">
                            <button
                                type="button"
                                className={`register-tab-btn ${registerType === 'establishment' ? 'active' : ''}`}
                                onClick={() => {
                                    setRegisterType('establishment');
                                    setServerError('');
                                    setSuccessMessage('');
                                    setRegisterErrors({});
                                }}
                                role="tab"
                                aria-selected={registerType === 'establishment'}
                            >
                                🏨 Accommodation
                            </button>
                            <button
                                type="button"
                                className={`register-tab-btn ${registerType === 'municipal' ? 'active' : ''}`}
                                onClick={() => {
                                    setRegisterType('municipal');
                                    setServerError('');
                                    setSuccessMessage('');
                                    setRegisterErrors({});
                                    if (municipality && (!regOfficeName || regOfficeName.includes('Municipal Tourism Office'))) {
                                        setRegOfficeName(`${municipality} Municipal Tourism Office`);
                                    }
                                }}
                                role="tab"
                                aria-selected={registerType === 'municipal'}
                            >
                                🏢 Municipal Tourism
                            </button>
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
                            {/* ESTABLISHMENT FIELDS */}
                            {registerType === 'establishment' && (
                                <>
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
                                </>
                            )}

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
                                                        if (registerType === 'municipal' && (!regOfficeName || regOfficeName.includes('Municipal Tourism Office'))) {
                                                            setRegOfficeName(`${muni} Municipal Tourism Office`);
                                                        }
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

                            {/* MUNICIPAL OFFICE NAME (When Municipal selected) */}
                            {registerType === 'municipal' && (
                                <div className="register-form-group">
                                    <label className="register-field-label" htmlFor="regOfficeName">
                                        NAME OF MUNICIPAL TOURISM OFFICE
                                    </label>
                                    <input
                                        id="regOfficeName"
                                        name="officeName"
                                        type="text"
                                        className={`register-input ${registerErrors.officeName ? 'input-has-error' : ''}`}
                                        placeholder="e.g. Solano Municipal Tourism Office"
                                        value={regOfficeName}
                                        onChange={(e) => {
                                            setRegOfficeName(e.target.value);
                                            if (registerErrors.officeName) {
                                                setRegisterErrors((prev) => ({ ...prev, officeName: undefined }));
                                            }
                                        }}
                                        disabled={isSubmitting}
                                        required
                                    />
                                    {registerErrors.officeName && (
                                        <span className="register-error-msg">{registerErrors.officeName}</span>
                                    )}
                                </div>
                            )}

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
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setLegalModalTab('terms');
                                            }}
                                            className="register-legal-link"
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                padding: 0,
                                                color: '#d9531e',
                                                fontWeight: 600,
                                                textDecoration: 'underline',
                                                cursor: 'pointer',
                                                fontFamily: 'inherit',
                                                fontSize: 'inherit',
                                            }}
                                        >
                                            Terms of service
                                        </button>{' '}
                                        and{' '}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setLegalModalTab('privacy');
                                            }}
                                            className="register-legal-link"
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                padding: 0,
                                                color: '#d9531e',
                                                fontWeight: 600,
                                                textDecoration: 'underline',
                                                cursor: 'pointer',
                                                fontFamily: 'inherit',
                                                fontSize: 'inherit',
                                            }}
                                        >
                                            Privacy policy
                                        </button>
                                        .
                                    </span>
                                </label>
                                {registerErrors.terms && (
                                    <span className="register-error-msg">{registerErrors.terms}</span>
                                )}
                            </div>

                            {/* Full-width CREATE ACCOUNT Button in burnt orange */}
                            <button type="submit" className="register-submit-btn" disabled={isSubmitting}>
                                {isSubmitting
                                    ? 'Creating account...'
                                    : registerType === 'municipal'
                                        ? 'REGISTER MUNICIPAL TOURISM'
                                        : 'CREATE ACCOUNT'}
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

                        <div className="login-register-options">
                            <span className="register-options-label">Don't have an official account yet?</span>
                            <div className="register-actions-row">
                                <a
                                    href="#register"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setRegisterType('establishment');
                                        setServerError('');
                                        setSuccessMessage('');
                                        setRegisterErrors({});
                                        navigateTo('#register');
                                    }}
                                    className="register-choice-link"
                                >
                                    🏨 Register Accommodation
                                </a>
                                <span className="register-choice-separator">•</span>
                                <a
                                    href="#register"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setRegisterType('municipal');
                                        setServerError('');
                                        setSuccessMessage('');
                                        setRegisterErrors({});
                                        if (municipality && (!regOfficeName || regOfficeName.includes('Municipal Tourism Office'))) {
                                            setRegOfficeName(`${municipality} Municipal Tourism Office`);
                                        }
                                        navigateTo('#register');
                                    }}
                                    className="register-choice-link"
                                >
                                    🏢 Register Municipal Tourism
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Terms of Service & Privacy Policy Modal */}
            {legalModalTab && (
                <LegalTermsPrivacyModal
                    activeTab={legalModalTab}
                    onSelectTab={setLegalModalTab}
                    onClose={() => setLegalModalTab(null)}
                    onAgree={() => {
                        setTermsAgreed(true);
                        if (registerErrors.terms) {
                            setRegisterErrors((prev) => ({ ...prev, terms: undefined }));
                        }
                        setLegalModalTab(null);
                    }}
                />
            )}
        </div>
    );
}
