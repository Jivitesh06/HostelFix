import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(location.state?.message || '');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const fillDemo = (email, password) => {
    setForm({ email, password });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!form.email.trim() || !form.password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/login', form);
      const { token, user } = res.data.data;
      login(token, user);

      // Redirect according to user role
      if (user.role === 'STUDENT') {
        navigate('/student/dashboard');
      } else if (user.role === 'WARDEN') {
        navigate('/warden/dashboard');
      } else if (user.role === 'STAFF') {
        navigate('/staff/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Unable to connect to server. Please ensure the backend is running.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={styles.title}>HostelFix 🏠</h1>
          <p style={styles.subtitle}>
            Smart Hostel Complaint & Mess Management System
          </p>
        </div>

        <h2 style={styles.heading}>Sign In</h2>

        {successMsg && <div style={styles.success}>{successMsg}</div>}
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="e.g. student@hostelfix.demo"
              autoComplete="email"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.registerPrompt}>
          Are you a hostel student without an account?{' '}
          <Link to="/register" style={styles.link}>
            Register here
          </Link>
        </p>

        {/* Demo Accounts Panel for Evaluation */}
        <div style={styles.demoSection}>
          <div style={styles.demoHeader}>
            <strong>Evaluation Demo Accounts</strong>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              (Click to auto-fill)
            </span>
          </div>

          <div style={styles.demoList}>
            <button
              type="button"
              onClick={() => fillDemo('student@hostelfix.demo', 'Demo@1234')}
              style={styles.demoBtn}
            >
              <strong>Student:</strong> student@hostelfix.demo
            </button>

            <button
              type="button"
              onClick={() => fillDemo('warden@hostelfix.demo', 'Demo@1234')}
              style={{ ...styles.demoBtn, borderColor: '#c4b5fd' }}
            >
              <strong>Warden:</strong> warden@hostelfix.demo
            </button>

            <button
              type="button"
              onClick={() => fillDemo('staff@hostelfix.demo', 'Demo@1234')}
              style={{ ...styles.demoBtn, borderColor: '#a7f3d0' }}
            >
              <strong>Staff:</strong> staff@hostelfix.demo
            </button>
          </div>
          <div style={styles.demoPassword}>
            Common Demo Password: <code>Demo@1234</code>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)',
    padding: '1.5rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    background: '#ffffff',
    borderRadius: '10px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
  },
  title: {
    margin: '0 0 0.25rem',
    color: '#1d4ed8',
    fontSize: '1.9rem',
    fontWeight: 700,
  },
  subtitle: {
    margin: 0,
    color: '#64748b',
    fontSize: '0.85rem',
  },
  heading: {
    margin: '0 0 1.25rem',
    fontSize: '1.25rem',
    color: '#1e293b',
    fontWeight: 600,
  },
  success: {
    background: '#dcfce7',
    color: '#166534',
    border: '1px solid #86efac',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    marginBottom: '1.25rem',
    fontSize: '0.9rem',
  },
  error: {
    background: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    marginBottom: '1.25rem',
    fontSize: '0.9rem',
  },
  field: {
    marginBottom: '1.1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.4rem',
    fontSize: '0.875rem',
    color: '#334155',
    fontWeight: 500,
  },
  input: {
    width: '100%',
    padding: '0.65rem 0.85rem',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  },
  btn: {
    width: '100%',
    padding: '0.75rem',
    background: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '0.5rem',
    transition: 'background 0.2s',
  },
  registerPrompt: {
    marginTop: '1.25rem',
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#64748b',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 500,
  },
  demoSection: {
    marginTop: '1.75rem',
    paddingTop: '1.25rem',
    borderTop: '1px dashed #cbd5e1',
  },
  demoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '0.6rem',
    fontSize: '0.85rem',
    color: '#334155',
  },
  demoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  demoBtn: {
    textAlign: 'left',
    background: '#f8fafc',
    border: '1px solid #bfdbfe',
    borderRadius: '4px',
    padding: '0.45rem 0.65rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
    color: '#1e293b',
  },
  demoPassword: {
    marginTop: '0.5rem',
    fontSize: '0.8rem',
    color: '#64748b',
    textAlign: 'center',
  },
};
