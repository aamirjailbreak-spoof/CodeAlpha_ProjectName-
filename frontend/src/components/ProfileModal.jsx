import { useAuth } from '../context/AuthContext';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  if (!isOpen || !user) return null;

  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown';

  function handleLogout() {
    logout();
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card profile-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>User Profile</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="profile-body">
          <div className="profile-avatar-large">👤</div>
          <h3 className="profile-user-name">{user.name}</h3>
          <p className="profile-user-email">{user.email}</p>

          <div className="profile-details-grid">
            <div className="detail-item">
              <span className="detail-label">User ID</span>
              <span className="detail-value">#{user.id}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Member Since</span>
              <span className="detail-value">{joinDate}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Account Status</span>
              <span className="detail-value status-active">Active</span>
            </div>
          </div>

          <div className="profile-actions">
            <button className="profile-logout-btn" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
