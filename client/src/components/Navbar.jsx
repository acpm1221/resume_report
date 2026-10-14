import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logoutUser } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
  };

  const initial = user?.username?.charAt(0)?.toUpperCase() || '?';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="navbar-logo">AI</div>
        <span className="navbar-title">InterviewAI</span>
      </Link>

      <div className="navbar-actions">
        {user ? (
          <>
            <Link to="/interview" className="btn btn-ghost">
              ✦ Generate Report
            </Link>
            <div className="navbar-user">
              <div className="navbar-avatar">{initial}</div>
              {user.username}
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
    </nav>
  );
}
