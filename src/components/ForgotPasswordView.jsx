import React, { useState, useEffect } from 'react';

const MailIcon = () => (
    <svg className="login-input-icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-10 6L2 7" />
    </svg>
);

const KeyIcon = () => (
    <svg className="login-input-icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
        <path d="m21 2-9.6 9.6" />
        <circle cx="7.5" cy="15.5" r="5.5" />
    </svg>
);

const LockIcon = () => (
    <svg className="login-input-icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const EyeIcon = ({ off }) => (
    <svg className="login-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
        {off && <path d="m3 3 18 18" />}
    </svg>
);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

export default function ForgotPasswordView({
    initialEmail = '',
    apiBaseUrl = '/api',
    onBackToLogin,
    onResetSuccess,
}) {
    const cleanBase = (apiBaseUrl || '/api').replace(/\/+$/, '');
    const defaultEmail = initialEmail && initialEmail.includes('@') ? initialEmail.trim() : '';

    const [step, setStep] = useState('request'); // 'request' | 'verify' | 'reset'
    const [email, setEmail] = useState(defaultEmail);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [infoMsg, setInfoMsg] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [shake, setShake] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        if (resendCooldown <= 0) return undefined;
        const timerId = setInterval(() => {
            setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timerId);
    }, [resendCooldown]);

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 450);
    };

    const requestCode = async (isResend = false) => {
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail) {
            setFieldErrors({ email: 'Email address is required' });
            triggerShake();
            return;
        }
        if (!EMAIL_REGEX.test(cleanEmail)) {
            setFieldErrors({ email: 'Please enter a valid email address' });
            triggerShake();
            return;
        }

        setFieldErrors({});
        setErrorMsg('');
        setInfoMsg('');
        setIsLoading(true);

        try {
            const res = await fetch(`${cleanBase}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: cleanEmail }),
            });
            const data = await res.json().catch(() => null);
            setIsLoading(false);

            if (!res.ok) {
                if (data?.retryAfterSeconds) {
                    setResendCooldown(Number(data.retryAfterSeconds));
                }
                setErrorMsg(data?.error || 'Unable to send verification code. Please try again.');
                triggerShake();
                return;
            }

            setEmail(cleanEmail);
            if (isResend) setOtp('');
            setStep('verify');
            setResendCooldown(60);
            setInfoMsg(
                data?.message || `Verification code sent to ${cleanEmail}. Valid for 10 minutes.`
            );
        } catch {
            setIsLoading(false);
            setErrorMsg('Unable to reach the authentication server. Please check your connection.');
            triggerShake();
        }
    };

    const handleRequestSubmit = (e) => {
        e.preventDefault();
        requestCode(false);
    };

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        const cleanOtp = otp.trim();
        if (!/^\d{6}$/.test(cleanOtp)) {
            setFieldErrors({ otp: 'Please enter the 6-digit verification code' });
            triggerShake();
            return;
        }

        setFieldErrors({});
        setErrorMsg('');
        setInfoMsg('');
        setIsLoading(true);

        try {
            const res = await fetch(`${cleanBase}/auth/verify-reset-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase(), otp: cleanOtp }),
            });
            const data = await res.json().catch(() => null);
            setIsLoading(false);

            if (!res.ok) {
                setErrorMsg(data?.error || 'Invalid or expired verification code.');
                triggerShake();
                return;
            }

            setStep('reset');
            setInfoMsg('Code verified! Enter your new password below.');
        } catch {
            setIsLoading(false);
            setErrorMsg('Unable to verify code right now. Please try again.');
            triggerShake();
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!newPassword) {
            errs.newPassword = 'New password is required';
        } else if (!PASSWORD_REGEX.test(newPassword)) {
            errs.newPassword = 'Password must be at least 8 characters, including a letter and a number';
        }

        if (!confirmPassword) {
            errs.confirmPassword = 'Confirm password is required';
        } else if (confirmPassword !== newPassword) {
            errs.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs);
            triggerShake();
            return;
        }

        setFieldErrors({});
        setErrorMsg('');
        setInfoMsg('');
        setIsLoading(true);

        try {
            const cleanEmail = email.trim().toLowerCase();
            const res = await fetch(`${cleanBase}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: cleanEmail,
                    otp: otp.trim(),
                    newPassword,
                }),
            });
            const data = await res.json().catch(() => null);
            setIsLoading(false);

            if (!res.ok) {
                setErrorMsg(data?.error || 'Unable to reset password. Please try again.');
                triggerShake();
                return;
            }

            if (onResetSuccess) {
                onResetSuccess(
                    cleanEmail,
                    data?.message || 'Password updated successfully! Please sign in with your new password.'
                );
            }
        } catch {
            setIsLoading(false);
            setErrorMsg('Unable to update password right now. Please try again.');
            triggerShake();
        }
    };

    const headingByStep = {
        request: {
            title: 'RESET PASSWORD',
            subtitle: 'Enter your registered email address to receive a 6-digit code',
        },
        verify: {
            title: 'VERIFY EMAIL CODE',
            subtitle: 'Enter the 6-digit verification code sent to your email',
        },
        reset: {
            title: 'SET NEW PASSWORD',
            subtitle: 'Create a strong new password for your TurismoTrack account',
        },
    };

    const currentHeading = headingByStep[step];

    return (
        <div className={`login-form-wrapper ${shake ? 'shake-animation' : ''}`}>
            <div className="login-form-header">
                <h1 className="login-title welcome-title">{currentHeading.title}</h1>
                <p className="login-subtitle welcome-subtitle">{currentHeading.subtitle}</p>
            </div>

            {errorMsg && (
                <div className="login-alert-banner login-alert-error" role="alert">
                    {errorMsg}
                </div>
            )}

            {infoMsg && (
                <div className="login-alert-banner login-alert-success" role="status">
                    {infoMsg}
                </div>
            )}

            {step === 'request' && (
                <form className="login-form" onSubmit={handleRequestSubmit} noValidate>
                    <div className={`form-group ${fieldErrors.email ? 'has-error' : ''}`}>
                        <label className="form-label" htmlFor="forgotEmail">
                            REGISTERED EMAIL ADDRESS
                        </label>
                        <div className="input-wrapper">
                            <MailIcon />
                            <input
                                id="forgotEmail"
                                type="email"
                                className="input-field has-leading-icon"
                                placeholder="EMAIL ADDRESS"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                                    if (errorMsg) setErrorMsg('');
                                }}
                                disabled={isLoading}
                                autoComplete="email"
                                required
                            />
                        </div>
                        {fieldErrors.email && <span className="error-message">{fieldErrors.email}</span>}
                    </div>

                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <span className="spinner" />
                                SENDING CODE...
                            </>
                        ) : (
                            'SEND VERIFICATION CODE'
                        )}
                    </button>
                </form>
            )}

            {step === 'verify' && (
                <form className="login-form" onSubmit={handleVerifySubmit} noValidate>
                    <div className={`form-group ${fieldErrors.otp ? 'has-error' : ''}`}>
                        <label className="form-label" htmlFor="forgotOtp">
                            6-DIGIT VERIFICATION CODE
                        </label>
                        <div className="input-wrapper">
                            <KeyIcon />
                            <input
                                id="forgotOtp"
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                className="input-field has-leading-icon otp-input-field"
                                placeholder="ENTER 6-DIGIT CODE"
                                value={otp}
                                onChange={(e) => {
                                    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    setOtp(digitsOnly);
                                    if (fieldErrors.otp) setFieldErrors((prev) => ({ ...prev, otp: undefined }));
                                    if (errorMsg) setErrorMsg('');
                                }}
                                disabled={isLoading}
                                autoComplete="one-time-code"
                                required
                            />
                        </div>
                        {fieldErrors.otp && <span className="error-message">{fieldErrors.otp}</span>}

                        <div className="forgot-helper-row">
                            <button
                                type="button"
                                className="forgot-link-btn"
                                onClick={() => {
                                    setStep('request');
                                    setOtp('');
                                    setErrorMsg('');
                                    setInfoMsg('');
                                    setFieldErrors({});
                                }}
                                disabled={isLoading}
                            >
                                Change email
                            </button>
                            <button
                                type="button"
                                className="forgot-link-btn"
                                onClick={() => requestCode(true)}
                                disabled={isLoading || resendCooldown > 0}
                            >
                                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <span className="spinner" />
                                VERIFYING...
                            </>
                        ) : (
                            'VERIFY CODE'
                        )}
                    </button>
                </form>
            )}

            {step === 'reset' && (
                <form className="login-form" onSubmit={handleResetSubmit} noValidate>
                    <div className={`form-group ${fieldErrors.newPassword ? 'has-error' : ''}`}>
                        <label className="form-label" htmlFor="forgotNewPassword">
                            NEW PASSWORD
                        </label>
                        <div className="input-wrapper">
                            <LockIcon />
                            <input
                                id="forgotNewPassword"
                                type={showNewPassword ? 'text' : 'password'}
                                className="input-field has-leading-icon has-trailing-icon"
                                placeholder="NEW PASSWORD"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    if (fieldErrors.newPassword) {
                                        setFieldErrors((prev) => ({ ...prev, newPassword: undefined }));
                                    }
                                    if (errorMsg) setErrorMsg('');
                                }}
                                disabled={isLoading}
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowNewPassword((prev) => !prev)}
                                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                                disabled={isLoading}
                            >
                                <EyeIcon off={showNewPassword} />
                            </button>
                        </div>
                        {fieldErrors.newPassword && (
                            <span className="error-message">{fieldErrors.newPassword}</span>
                        )}
                    </div>

                    <div className={`form-group ${fieldErrors.confirmPassword ? 'has-error' : ''}`}>
                        <label className="form-label" htmlFor="forgotConfirmPassword">
                            CONFIRM NEW PASSWORD
                        </label>
                        <div className="input-wrapper">
                            <LockIcon />
                            <input
                                id="forgotConfirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                className="input-field has-leading-icon has-trailing-icon"
                                placeholder="CONFIRM NEW PASSWORD"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    if (fieldErrors.confirmPassword) {
                                        setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                                    }
                                    if (errorMsg) setErrorMsg('');
                                }}
                                disabled={isLoading}
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                disabled={isLoading}
                            >
                                <EyeIcon off={showConfirmPassword} />
                            </button>
                        </div>
                        {fieldErrors.confirmPassword && (
                            <span className="error-message">{fieldErrors.confirmPassword}</span>
                        )}
                    </div>

                    <p className="forgot-password-helper">
                        Use at least 8 characters, including a letter and a number.
                    </p>

                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <span className="spinner" />
                                UPDATING PASSWORD...
                            </>
                        ) : (
                            'UPDATE PASSWORD'
                        )}
                    </button>
                </form>
            )}

            <div className="login-footer-links">
                <a
                    href="#login"
                    onClick={(e) => {
                        e.preventDefault();
                        if (onBackToLogin) onBackToLogin();
                    }}
                    className="footer-link"
                >
                    ← Back to Sign In
                </a>
            </div>
        </div>
    );
}

