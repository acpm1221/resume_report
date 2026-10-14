import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logoutUser();
  };

  const closeMenu = () => setMobileMenuOpen(false);

  const initial = user?.username?.charAt(0)?.toUpperCase() || '?';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <div className="navbar-logo">AI</div>
          <span className="navbar-title">InterviewAI</span>
        </Link>

        {/* Desktop actions */}
        <div className="navbar-actions desktop-only">
          {user ? (
            <>
              <Link to="/interview" className="btn btn-ghost">
                ✦ Generate Report
              </Link>
              <div className="navbar-user">
                <div className="navbar-avatar">{initial}</div>
                <span className="navbar-username">{user.username}</span>
              </div>
              <Link to="/profile" className="btn btn-ghost">Profile</Link>
              <button className="btn btn-danger" onClick={handleLogout} id="navbar-logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Sign in</Link>
              <Link to="/register" className="btn btn-primary">Get started</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          {user ? (
            <>
              <div className="mobile-user-card">
                <div className="navbar-avatar">{initial}</div>
                <div className="mobile-user-info">
                  <div className="mobile-user-name">{user.username}</div>
                  <div className="mobile-user-status">● Signed in</div>
                </div>
              </div>
              <Link
                to="/interview"
                className={`mobile-link ${location.pathname === '/interview' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                ✦ Generate Interview Report
              </Link>
              <Link
                to="/profile"
                className={`mobile-link ${location.pathname === '/profile' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                👤 My Profile
              </Link>
              <button
                className="btn btn-danger mobile-logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`mobile-link ${location.pathname === '/login' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
                onClick={closeMenu}
                style={{ textAlign: 'center', marginTop: '0.5rem' }}
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
