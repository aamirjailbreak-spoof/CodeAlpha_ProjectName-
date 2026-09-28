import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { XIcon, LogOutIcon } from './Icons';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const joinDate = user.created_at
    ? new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(new Date(user.created_at))
    : 'Active Client';

  function handleLogout() {
    logout();
    onClose();
  }

  return (
    <div className="editorial-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="editorial-modal-box profile-modal-box"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-heading"
      >
        <button
          type="button"
          className="editorial-modal-close"
          onClick={onClose}
          aria-label="Close client profile"
        >
          <XIcon size={18} />
        </button>

        <div className="profile-editorial-header">
          <span className="profile-eyebrow">CLIENT RECORD</span>
          <h2 id="profile-heading" className="profile-client-name">
            {user.name}
          </h2>
          <span className="profile-client-email">{user.email}</span>
        </div>

        <div className="profile-metadata-table">
          <div className="profile-row">
            <span className="profile-label">Client ID</span>
            <span className="profile-data tabular-nums">№ {user.id}</span>
          </div>

          <div className="profile-row">
            <span className="profile-label">Membership</span>
            <span className="profile-data status-confirmed">Verified Member</span>
          </div>

          <div className="profile-row">
            <span className="profile-label">Registered Since</span>
            <span className="profile-data">{joinDate}</span>
          </div>
        </div>

        <div className="profile-footer-actions">
          <button
            type="button"
            className="editorial-button-secondary profile-signout-action"
            onClick={handleLogout}
          >
            <LogOutIcon size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
