import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    roomNumber: '',
    hostelBlock: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Required fields check
    const { name, email, roomNumber, hostelBlock, password, confirmPassword } = form;
    if (
      !name.trim() ||
      !email.trim() ||
      !roomNumber.trim() ||
      !hostelBlock.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError('All fields are required.');
      return;
    }

    // 2. Email format validation
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Please provide a valid email address (e.g. name@college.edu).');
      return;
    }

    // 3. Password length check
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }

    // 4. Password confirmation match
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        roomNumber: roomNumber.trim(),
        hostelBlock: hostelBlock.trim(),
        password,
      });

      // Redirect to login with success message in location state
      navigate('/login', {
        state: {
          message: 'Registration successful! Please sign in with your credentials.',
        },
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Registration failed. Please try again or check your network connection.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <h1 style={styles.title}>HostelFix 🏠</h1>
          <p style={styles.subtitle}>Student Self-Registration</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name *</label>
            <input
              style={styles.input}
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Rahul Sharma"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>College Email *</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="e.g. rahul@college.edu"
              required
            />
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Room Number *</label>
              <input
                style={styles.input}
                type="text"
                name="roomNumber"
                value={form.roomNumber}
                onChange={handleChange}
                placeholder="e.g. A-101"
                required
              />
            </div>

            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Hostel Block *</label>
              <input
                style={styles.input}
                type="text"
                name="hostelBlock"
                value={form.hostelBlock}
                onChange={handleChange}
                placeholder="e.g. Block A"
                required
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password (min 6 characters) *</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Confirm Password *</label>
            <input
              style={styles.input}
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
            />
          </div>

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register as Student'}
          </button>
        </form>

        <p style={styles.loginPrompt}>
          Already registered?{' '}
          <Link to="/login" style={styles.link}>
            Sign In here
          </Link>
        </p>

        <div style={styles.roleNote}>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            ℹ️ Warden and Staff accounts are provisioned by hostel administration
            and cannot self-register.
          </span>
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
    maxWidth: '460px',
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
    marginBottom: '1rem',
  },
  row: {
    display: 'flex',
    gap: '0.75rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.35rem',
    fontSize: '0.85rem',
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
  },
  loginPrompt: {
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
  roleNote: {
    marginTop: '1.25rem',
    paddingTop: '0.75rem',
    borderTop: '1px dashed #cbd5e1',
    textAlign: 'center',
  },
};
