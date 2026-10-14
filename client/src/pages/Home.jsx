import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: '🎯',
    color: 'purple',
    title: 'Match Score',
    desc: 'Instant AI-powered match analysis between your resume and job description.',
  },
  {
    icon: '⚡',
    color: 'indigo',
    title: 'Technical Questions',
    desc: 'Curated technical questions tailored specifically to the role.',
  },
  {
    icon: '🧠',
    color: 'blue',
    title: 'Behavioural Prep',
    desc: 'STAR-format behavioural questions to ace the soft-skills interview.',
  },
  {
    icon: '🗺️',
    color: 'teal',
    title: 'Preparation Plan',
    desc: 'Day-by-day study plan to close skill gaps before your interview.',
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="page-wrapper">
      <div className="home-wrapper">
        <div className="hero">
          <div className="hero-badge">
            <span>✦</span>
            AI-Powered Interview Prep
          </div>

          <h1>
            Ace every interview<br />
            with <span>AI insights</span>
          </h1>

          <p className="hero-desc">
            Upload your resume, paste the job description, and receive an instant
            personalized interview report — questions, answers, skill gaps &amp; a
            day-by-day prep plan.
          </p>

          <div className="hero-actions">
            {user ? (
              <>
                <Link to="/interview" className="btn btn-primary">
                  ✦ Generate My Report
                </Link>
                <Link to="/profile" className="btn btn-outline">
                  View Profile
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn btn-outline">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="features-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className={`feature-icon ${f.color}`}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
