import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Building2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  User,
  Mail,
  Home,
  Layers,
  Lock,
} from 'lucide-react';

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

    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Please provide a valid email address (e.g. student@college.edu).');
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }

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

      navigate('/login', {
        state: {
          message: 'Student account registered successfully! You can now sign in.',
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        padding: '2.5rem 1.5rem',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem',
              boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.25)',
            }}
          >
            <Building2 size={24} />
          </div>
          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              margin: '0 0 0.35rem',
            }}
          >
            Create Resident Account
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Register as a hostel resident to submit complaints and view mess menus.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#fff1f2',
              color: '#9f1239',
              border: '1px solid #fecdd3',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <AlertCircle size={16} color="#e11d48" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div style={{ marginBottom: '1.1rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.35rem',
              }}
            >
              Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              >
                <User size={16} />
              </div>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* College Email */}
          <div style={{ marginBottom: '1.1rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.35rem',
              }}
            >
              College Email *
            </label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              >
                <Mail size={16} />
              </div>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. rahul@college.edu"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Room & Block */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.1rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '0.35rem',
                }}
              >
                Room Number *
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                  }}
                >
                  <Home size={16} />
                </div>
                <input
                  type="text"
                  name="roomNumber"
                  value={form.roomNumber}
                  onChange={handleChange}
                  placeholder="e.g. A-101"
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '0.35rem',
                }}
              >
                Hostel Block *
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                  }}
                >
                  <Layers size={16} />
                </div>
                <input
                  type="text"
                  name="hostelBlock"
                  value={form.hostelBlock}
                  onChange={handleChange}
                  placeholder="e.g. Block A"
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Password & Confirm */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '0.35rem',
                }}
              >
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min 6 chars"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '0.35rem',
                }}
              >
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#4f46e5',
              color: '#ffffff',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#4338ca')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#4f46e5')}
          >
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <p
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#64748b',
          }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}
          >
            Sign In here
          </Link>
        </p>

        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid #f1f5f9',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#94a3b8',
          }}
        >
          Warden and Maintenance Staff accounts are provisioned directly by the hostel office.
        </div>
      </div>
    </div>
  );
}
