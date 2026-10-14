import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logoutUser, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="page-loader">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const initial = user.username?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="page-wrapper">
      <div className="profile-wrapper">
        <div className="profile-card">
          <div className="profile-banner" />

          <div className="profile-avatar-wrap">
            <div className="profile-avatar">{initial}</div>
          </div>

          <div className="profile-body">
            <h2 className="profile-name">{user.username}</h2>
            <p className="profile-role">Pro Candidate • Active Member</p>

            <div className="profile-stats">
              <div className="profile-stat">
                <div className="profile-stat-value">AI</div>
                <div className="profile-stat-label">Model</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-value">Unlimited</div>
                <div className="profile-stat-label">Analyses</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-value">Active</div>
                <div className="profile-stat-label">Session</div>
              </div>
            </div>

            <div className="profile-details">
              <div className="profile-detail-item">
                <div className="profile-detail-icon">👤</div>
                <div className="profile-detail-content">
                  <div className="profile-detail-label">Username</div>
                  <div className="profile-detail-value">{user.username}</div>
                </div>
              </div>

              {user.email && (
                <div className="profile-detail-item">
                  <div className="profile-detail-icon">✉️</div>
                  <div className="profile-detail-content">
                    <div className="profile-detail-label">Email Address</div>
                    <div className="profile-detail-value">{user.email}</div>
                  </div>
                </div>
              )}

              <div className="profile-detail-item">
                <div className="profile-detail-icon">🆔</div>
                <div className="profile-detail-content">
                  <div className="profile-detail-label">Account ID</div>
                  <div className="profile-detail-value">{user.id || user._id || 'Verified'}</div>
                </div>
              </div>
            </div>

            <div className="profile-actions">
              <Link to="/interview" className="btn btn-primary" id="profile-prep-btn">
                ✦ Generate Interview Report
              </Link>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleLogout}
                id="profile-logout-btn"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
