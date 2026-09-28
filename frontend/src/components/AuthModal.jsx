import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  XIcon,
  MailIcon,
  LockIcon,
  UserIcon,
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon,
  SpinnerIcon,
  LogoMarkIcon
} from './Icons';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleClose = useCallback(() => {
    setName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setError('');
    onClose();
  }, [onClose]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  // Handle keyboard Escape dismissal
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        handleClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;


  function handleToggleMode(registerMode) {
    setIsRegister(registerMode);
    setError('');
    setPassword('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setError('');

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (isRegister && !trimmedName) {
      setError('Please provide your full name to create an account.');
      return;
    }

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      if (isRegister) {
        await register(trimmedName, trimmedEmail, password);
      } else {
        await login(trimmedEmail, password);
      }
      handleClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="editorial-modal-overlay auth-modal-backdrop"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="auth-card-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Close Button */}
        <button
          type="button"
          className="auth-card-close-btn"
          onClick={handleClose}
          aria-label="Close authentication dialog"
        >
          <XIcon size={16} />
        </button>

        {/* Card Header with Brand Icon Badge */}
        <div className="auth-card-header">
          <div className="auth-brand-emblem-wrap" aria-hidden="true">
            <LogoMarkIcon size={28} />
          </div>
          <h2 id="auth-modal-title" className="auth-card-title">
            {isRegister ? 'Create an account' : 'Welcome back'}
          </h2>
          <p className="auth-card-subtitle">
            {isRegister
              ? 'Join CodeAlpha Store to track orders and save your bag'
              : 'Enter your credentials to access your account and orders'}
          </p>
        </div>

        {/* Segmented Mode Switcher */}
        <div className="auth-segmented-switch" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            role="tab"
            aria-selected={!isRegister}
            className={`auth-segment-btn ${!isRegister ? 'active' : ''}`}
            onClick={() => handleToggleMode(false)}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isRegister}
            className={`auth-segment-btn ${isRegister ? 'active' : ''}`}
            onClick={() => handleToggleMode(true)}
          >
            Register
          </button>
        </div>

        {/* Inline Form Error Alert */}
        {error && (
          <div className="auth-error-banner" role="alert">
            <AlertCircleIcon size={16} className="auth-error-icon" />
            <span className="auth-error-text">{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="auth-card-form" noValidate>
          {isRegister && (
            <div className="auth-input-group">
              <label htmlFor="auth-name-input" className="auth-input-label">
                Full Name
              </label>
              <div className="auth-input-field-wrap">
                <span className="auth-field-icon" aria-hidden="true">
                  <UserIcon size={17} />
                </span>
                <input
                  id="auth-name-input"
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  className="auth-text-input"
                  required
                  disabled={submitting}
                />
              </div>
            </div>
          )}

          <div className="auth-input-group">
            <label htmlFor="auth-email-input" className="auth-input-label">
              Email Address
            </label>
            <div className="auth-input-field-wrap">
              <span className="auth-field-icon" aria-hidden="true">
                <MailIcon size={17} />
              </span>
              <input
                id="auth-email-input"
                type="email"
                name="email"
                autoComplete="email"
                spellCheck={false}
                inputMode="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                className="auth-text-input"
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="auth-input-group">
            <div className="auth-label-row">
              <label htmlFor="auth-password-input" className="auth-input-label">
                Password
              </label>
            </div>
            <div className="auth-input-field-wrap">
              <span className="auth-field-icon" aria-hidden="true">
                <LockIcon size={17} />
              </span>
              <input
                id="auth-password-input"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                placeholder={isRegister ? 'At least 8 characters' : 'Enter your password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                className="auth-text-input auth-password-input"
                required
                disabled={submitting}
              />
              <button
                type="button"
                className="auth-toggle-pwd-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
                disabled={submitting}
              >
                {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            className="auth-primary-submit-btn"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <SpinnerIcon size={16} />
                <span>{isRegister ? 'Creating Account…' : 'Signing In…'}</span>
              </>
            ) : (
              <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
            )}
          </button>
        </form>

        {/* Card Footer Switcher */}
        <div className="auth-card-footer">
          <p className="auth-switch-prompt">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              className="auth-switch-toggle-btn"
              onClick={() => handleToggleMode(!isRegister)}
              disabled={submitting}
            >
              {isRegister ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
