import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Building2,
  CheckCircle,
  ShieldCheck,
  Zap,
  ArrowRight,
  User,
  Shield,
  Wrench,
  AlertCircle,
  Lock,
  Mail,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [unverifiedInfo, setUnverifiedInfo] = useState(null);
  const [successMsg, setSuccessMsg] = useState(location.state?.message || '');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
    if (unverifiedInfo) setUnverifiedInfo(null);
  };

  const fillDemo = (email, password) => {
    setForm({ email, password });
    setError('');
    setUnverifiedInfo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setUnverifiedInfo(null);

    if (!form.email.trim() || !form.password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/login', form);
      const { token, user } = res.data.data;
      login(token, user);

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
      const isUnverified = err.response?.data?.isUnverified;
      if (isUnverified) {
        setUnverifiedInfo({
          isUnverified: true,
          email: err.response?.data?.email || form.email.trim(),
        });
      }
      const msg =
        err.response?.data?.message ||
        'Unable to connect to server. Please ensure the backend is running.';
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
        background: '#ffffff',
        fontFamily: 'var(--font-sans)',
      }}
      className="login-container"
    >
      {/* ── Left Hero Panel (SaaS Branding) ───────────────────────────── */}
      <div
        style={{
          flex: '1 1 50%',
          background: '#f8f8f8',
          borderRight: '1px solid #e5e7eb',
          color: '#171717',
          padding: '4rem 3.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="login-hero-panel"
      >
        {/* Top Branding */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#c8102e',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(200, 16, 46, 0.25)',
              }}
            >
              <Building2 size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#171717', letterSpacing: '-0.02em' }}>
                HostelFix
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>
                Operations Platform
              </div>
            </div>
          </div>
        </div>

        {/* Center Value Proposition */}
        <div style={{ margin: '3rem 0', position: 'relative', zIndex: 2 }}>
          <span
            style={{
              display: 'inline-block',
              background: '#fdecef',
              border: '1px solid #fecdd3',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#c8102e',
              marginBottom: '1.25rem',
            }}
          >
            Digital Hostel Management &amp; Mess Workflow
          </span>

          <h2
            style={{
              fontSize: '2.4rem',
              fontWeight: 800,
              color: '#171717',
              lineHeight: 1.2,
              letterSpacing: '-0.03em',
              marginBottom: '1rem',
              maxWidth: '520px',
            }}
          >
            Accountability and speed for campus living.
          </h2>

          <p
            style={{
              fontSize: '1.05rem',
              color: '#6b7280',
              lineHeight: 1.6,
              maxWidth: '460px',
              marginBottom: '2.5rem',
            }}
          >
            Say goodbye to lost paper registers and WhatsApp complaints. Track maintenance lifecycle with full audit history and weekly dining feedback.
          </p>

          {/* Feature Bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#ecfdf5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle size={16} color="#059669" />
              </div>
              <span style={{ fontSize: '0.95rem', color: '#374151', fontWeight: 500 }}>
                6-stage transparent complaint workflow with immutable audit log
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#fdecef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={16} color="#c8102e" />
              </div>
              <span style={{ fontSize: '0.95rem', color: '#374151', fontWeight: 500 }}>
                Enforced role-based access for Students, Wardens, and Staff
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap size={16} color="#d97706" />
              </div>
              <span style={{ fontSize: '0.95rem', color: '#374151', fontWeight: 500 }}>
                Weekly mess menu scheduling with verified student dining reviews
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div style={{ fontSize: '0.8rem', color: '#9ca3af', position: 'relative', zIndex: 2 }}>
          HostelFix Platform &bull; College Engineering Evaluation Build 2026
        </div>
      </div>

      {/* ── Right Panel (Login Form + Demo Accounts) ──────────────────── */}
      <div
        style={{
          flex: '1 1 50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 2rem',
          background: '#ffffff',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#171717',
                letterSpacing: '-0.02em',
                marginBottom: '0.4rem',
              }}
            >
              Welcome back
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: 0 }}>
              Sign in with your registered college email to access your hostel portal.
            </p>
          </div>

          {/* Success / Error Messages */}
          {successMsg && (
            <div
              style={{
                background: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <CheckCircle size={16} color="#059669" />
              <span>{successMsg}</span>
            </div>
          )}

          {unverifiedInfo ? (
            <div
              style={{
                background: '#fffbeb',
                color: '#92400e',
                border: '1px solid #fde68a',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <AlertCircle size={18} color="#d97706" />
                <span style={{ fontWeight: 600 }}>Please verify your university email before logging in.</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/verify-email?email=${encodeURIComponent(unverifiedInfo.email)}`, {
                      state: { email: unverifiedInfo.email },
                    })
                  }
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: '#c8102e',
                    color: '#ffffff',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(200, 16, 46, 0.2)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#a50d25')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#c8102e')}
                >
                  <span>Verify your email</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ) : error ? (
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
          ) : null}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '0.4rem',
                }}
              >
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="student@hostelfix.demo"
                  autoComplete="email"
                  required
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem 0.7rem 2.4rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    color: '#171717',
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#c8102e';
                    e.target.style.boxShadow = '0 0 0 3px rgba(200, 16, 46, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '0.4rem',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem 0.7rem 2.4rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    color: '#171717',
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#c8102e';
                    e.target.style.boxShadow = '0 0 0 3px rgba(200, 16, 46, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
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
                background: '#c8102e',
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
                boxShadow: '0 1px 2px 0 rgba(200, 16, 46, 0.2)',
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#a50d25')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#c8102e')}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Registration links */}
          <div
            style={{
              marginTop: '1.25rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: '#6b7280',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
            }}
          >
            <div>
              New resident student?{' '}
              <Link
                to="/register"
                style={{ color: '#c8102e', fontWeight: 600, textDecoration: 'none' }}
              >
                Create student account
              </Link>
            </div>
            <div style={{ fontSize: '0.8rem' }}>
              Campus administrative or maintenance personnel?{' '}
              <Link
                to="/admin/staff-register"
                style={{ color: '#c8102e', fontWeight: 600, textDecoration: 'none' }}
              >
                Staff &amp; Warden Portal &rarr;
              </Link>
            </div>
          </div>

          {/* ── Evaluation Demo Accounts Panel ──────────────────────────── */}
          <div
            style={{
              marginTop: '2rem',
              padding: '1.25rem',
              background: '#f8f8f8',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#6b7280',
                }}
              >
                Evaluation Demo Accounts
              </span>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>1-click fill</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => fillDemo('student@hostelfix.demo', 'Demo@1234')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.75rem',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#fecdd3';
                  e.currentTarget.style.backgroundColor = '#fdecef';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={14} color="#c8102e" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#171717' }}>
                    Student (Room A-101)
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>student@hostelfix.demo</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('warden@hostelfix.demo', 'Demo@1234')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.75rem',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#fecdd3';
                  e.currentTarget.style.backgroundColor = '#fdecef';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={14} color="#c8102e" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#171717' }}>
                    Hostel Warden
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>warden@hostelfix.demo</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('staff@hostelfix.demo', 'Demo@1234')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.75rem',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#fecdd3';
                  e.currentTarget.style.backgroundColor = '#fdecef';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Wrench size={14} color="#059669" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#171717' }}>
                    Maintenance Staff (Plumber)
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>staff@hostelfix.demo</span>
              </button>
            </div>

            <div
              style={{
                marginTop: '0.65rem',
                textAlign: 'center',
                fontSize: '0.75rem',
                color: '#6b7280',
              }}
            >
              Demo Password for all roles: <code style={{ color: '#171717', fontWeight: 600 }}>Demo@1234</code>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive styling */}
      <style>{`
        @media (max-width: 900px) {
          .login-container {
            flex-direction: column !important;
          }
          .login-hero-panel {
            padding: 2.5rem 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
