import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_DASHBOARDS = {
  STUDENT: '/student/dashboard',
  WARDEN: '/warden/dashboard',
  STAFF: '/staff/dashboard',
};

/**
 * Route guard component: RoleRoute
 * Ensures the authenticated user possesses the specific role required for this route.
 * If role does not match, displays an Unauthorized Access Denied view
 * and does not expose restricted page content.
 */
export default function RoleRoute({ role, children }) {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  if (user.role !== role) {
    const userDashboard = ROLE_DASHBOARDS[user.role] || '/login';

    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'sans-serif',
          background: '#f8fafc',
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '2.5rem',
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              fontSize: '3rem',
              marginBottom: '0.5rem',
            }}
          >
            🚫
          </div>
          <h2 style={{ color: '#b91c1c', margin: '0 0 0.5rem' }}>
            Access Denied
          </h2>
          <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
            You do not have permission to view this section. This page requires
            the <strong>{role}</strong> role, but your account is registered as{' '}
            <strong>{user.role}</strong>.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              marginTop: '1.5rem',
            }}
          >
            <Link
              to={userDashboard}
              style={{
                background: '#2563eb',
                color: '#fff',
                padding: '0.65rem 1.25rem',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.9rem',
              }}
            >
              Go to My Dashboard
            </Link>
            <button
              onClick={logout}
              style={{
                background: '#fff',
                color: '#64748b',
                border: '1px solid #cbd5e1',
                padding: '0.65rem 1.25rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
