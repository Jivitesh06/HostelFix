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
          background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 45%, #4338ca 100%)',
          color: '#ffffff',
          padding: '4rem 3.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="login-hero-panel"
      >
        {/* Subtle background glow effect */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0) 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Branding */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                HostelFix
              </div>
              <div style={{ fontSize: '0.75rem', color: '#c7d2fe', fontWeight: 500 }}>
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
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#e0e7ff',
              marginBottom: '1.25rem',
            }}
          >
            Digital Hostel Management & Mess Workflow
          </span>

          <h2
            style={{
              fontSize: '2.4rem',
              fontWeight: 800,
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
              color: '#c7d2fe',
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
                  background: 'rgba(52, 211, 153, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle size={16} color="#34d399" />
              </div>
              <span style={{ fontSize: '0.95rem', color: '#e0e7ff', fontWeight: 500 }}>
                6-stage transparent complaint workflow with immutable audit log
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(96, 165, 250, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={16} color="#60a5fa" />
              </div>
              <span style={{ fontSize: '0.95rem', color: '#e0e7ff', fontWeight: 500 }}>
                Enforced role-based access for Students, Wardens, and Staff
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(251, 191, 36, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap size={16} color="#fbbf24" />
              </div>
              <span style={{ fontSize: '0.95rem', color: '#e0e7ff', fontWeight: 500 }}>
                Weekly mess menu scheduling with verified student dining reviews
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div style={{ fontSize: '0.8rem', color: '#a5b4fc', position: 'relative', zIndex: 2 }}>
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
                color: '#0f172a',
                letterSpacing: '-0.02em',
                marginBottom: '0.4rem',
              }}
            >
              Welcome back
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
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

          {/* Sign In Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#334155',
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
                    color: '#94a3b8',
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
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4f46e5';
                    e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
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
                  color: '#334155',
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
                    color: '#94a3b8',
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
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4f46e5';
                    e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
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
                boxShadow: '0 1px 2px 0 rgba(79, 70, 229, 0.2)',
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#4338ca')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#4f46e5')}
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
              color: '#64748b',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
            }}
          >
            <div>
              New resident student?{' '}
              <Link
                to="/register"
                style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}
              >
                Create student account
              </Link>
            </div>
            <div style={{ fontSize: '0.8rem' }}>
              Campus administrative or maintenance personnel?{' '}
              <Link
                to="/admin/staff-register"
                style={{ color: '#4338ca', fontWeight: 600, textDecoration: 'none' }}
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
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
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
                  color: '#475569',
                }}
              >
                Evaluation Demo Accounts
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>1-click fill</span>
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
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#bfdbfe')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={14} color="#2563eb" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>
                    Student (Room A-101)
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>student@hostelfix.demo</span>
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
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#ddd6fe')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={14} color="#7c3aed" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>
                    Hostel Warden
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>warden@hostelfix.demo</span>
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
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#a7f3d0')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Wrench size={14} color="#059669" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>
                    Maintenance Staff (Plumber)
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>staff@hostelfix.demo</span>
              </button>
            </div>

            <div
              style={{
                marginTop: '0.65rem',
                textAlign: 'center',
                fontSize: '0.75rem',
                color: '#64748b',
              }}
            >
              Demo Password for all roles: <code style={{ color: '#0f172a', fontWeight: 600 }}>Demo@1234</code>
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
