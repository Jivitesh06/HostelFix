import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Building2,
  CheckCircle,
  AlertCircle,
  Mail,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';

const maskEmail = (email) => {
  if (!email || !email.includes('@')) return '***@***';
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  return `${local[0]}${'*'.repeat(Math.min(local.length - 2, 4))}${local[local.length - 1]}@${domain}`;
};

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const initialEmail = searchParams.get('email') || location.state?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(location.state?.message || '');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleOtpChange = (e) => {
    // Restrict to numeric characters and max length 6
    const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(clean);
    if (error) setError('');
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please provide your university email address.');
      return;
    }

    if (!otp || otp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/verify-email', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      setSuccessMsg(res.data.message || 'Email verified successfully! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Your institutional university email has been verified! You can now sign in.',
          },
        });
      }, 1800);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Verification failed. Please check your verification code and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resendLoading) return;
    setError('');

    if (!email.trim()) {
      setError('Please enter your university email to resend verification code.');
      return;
    }

    setResendLoading(true);

    try {
      const res = await api.post('/auth/resend-verification', {
        email: email.trim().toLowerCase(),
      });

      setSuccessMsg(res.data.message || 'A fresh verification code has been dispatched to your email.');
      setCooldown(60);
      setOtp('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Unable to resend code. Please verify your email or try again later.';
      setError(msg);
    } finally {
      setResendLoading(false);
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
      {/* ── Left Hero Panel ────────────────────────────────────────────── */}
      <div
        style={{
          flex: '1 1 45%',
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
            Chitkara University Campus Security
          </span>

          <h2
            style={{
              fontSize: '2.3rem',
              fontWeight: 800,
              color: '#171717',
              lineHeight: 1.25,
              letterSpacing: '-0.03em',
              marginBottom: '1rem',
              maxWidth: '480px',
            }}
          >
            Verifying your university identity.
          </h2>

          <p
            style={{
              fontSize: '1rem',
              color: '#6b7280',
              lineHeight: 1.6,
              maxWidth: '440px',
              marginBottom: '2rem',
            }}
          >
            To maintain strict safety and accurate hostel hall residence records, all students must confirm ownership of their institutional email address.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: '#ecfdf5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle size={15} color="#059669" />
              </div>
              <span style={{ fontSize: '0.9rem', color: '#374151' }}>
                Single-use 6-digit cryptographic verification code
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: '#fdecef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={15} color="#c8102e" />
              </div>
              <span style={{ fontSize: '0.9rem', color: '#374151' }}>
                Strict Chitkara domain protection (@chitkarauniversity.edu.in)
              </span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#9ca3af', position: 'relative', zIndex: 2 }}>
          HostelFix Platform &bull; Student Identity Verification
        </div>
      </div>

      {/* ── Right Action Form Panel ────────────────────────────────────── */}
      <div
        style={{
          flex: '1 1 55%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 2rem',
          background: '#f8f8f8',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Card Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#fdecef',
                color: '#c8102e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <KeyRound size={24} />
            </div>

            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#171717',
                letterSpacing: '-0.02em',
                marginBottom: '0.5rem',
              }}
            >
              Verify Your Email
            </h1>

            <p style={{ color: '#6b7280', fontSize: '0.925rem', lineHeight: 1.5, margin: 0 }}>
              Verification code sent to your university email.
            </p>

            {email && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  marginTop: '0.75rem',
                  fontSize: '0.85rem',
                  color: '#171717',
                  fontWeight: 600,
                }}
              >
                <Mail size={14} color="#c8102e" />
                <span>{maskEmail(email)}</span>
              </div>
            )}
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div
              style={{
                background: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <CheckCircle size={18} color="#059669" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div
              style={{
                background: '#fff1f2',
                color: '#9f1239',
                border: '1px solid #fecdd3',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <AlertCircle size={18} color="#e11d48" />
              <span>{error}</span>
            </div>
          )}

          {/* Verification Form Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e5e7eb',
              padding: '2rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
            }}
          >
            <form onSubmit={handleVerify}>
              {/* Email (editable if not prefilled) */}
              {!initialEmail && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Institutional Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@chitkarauniversity.edu.in"
                    required
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.85rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.925rem',
                      color: '#171717',
                      outline: 'none',
                      boxSizing: 'border-box',
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
              )}

              {/* 6-Digit OTP Input */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '0.4rem',
                  }}
                >
                  6-Digit Verification Code *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={6}
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="1 2 3 4 5 6"
                    autoComplete="one-time-code"
                    autoFocus
                    required
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '1.6rem',
                      fontWeight: 700,
                      letterSpacing: '10px',
                      textAlign: 'center',
                      color: '#171717',
                      background: '#ffffff',
                      outline: 'none',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                      boxSizing: 'border-box',
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
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: '#6b7280',
                    marginTop: '0.4rem',
                    textAlign: 'center',
                  }}
                >
                  Code expires in 10 minutes &bull; Single-use only
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.8rem 1rem',
                  background: otp.length === 6 ? '#c8102e' : '#9ca3af',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: loading || otp.length !== 6 ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.15s ease',
                  boxShadow: otp.length === 6 ? '0 1px 3px rgba(200, 16, 46, 0.3)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!loading && otp.length === 6) {
                    e.currentTarget.style.backgroundColor = '#a50d25';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && otp.length === 6) {
                    e.currentTarget.style.backgroundColor = '#c8102e';
                  }
                }}
              >
                <span>{loading ? 'Verifying Code...' : 'Verify Email & Continue'}</span>
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            {/* Resend Cooldown Actions */}
            <div
              style={{
                marginTop: '1.5rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                Didn't receive the email?
              </div>

              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || resendLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'none',
                  border: 'none',
                  color: cooldown > 0 ? '#9ca3af' : '#c8102e',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: cooldown > 0 || resendLoading ? 'not-allowed' : 'pointer',
                  padding: 0,
                }}
              >
                <RefreshCw
                  size={14}
                  className={resendLoading ? 'spin' : ''}
                  style={{ animation: resendLoading ? 'spin 1s linear infinite' : 'none' }}
                />
                <span>
                  {resendLoading
                    ? 'Resending...'
                    : cooldown > 0
                    ? `Resend code in ${cooldown}s`
                    : 'Resend code'}
                </span>
              </button>
            </div>
          </div>

          {/* Footer Back/Change Options */}
          <div
            style={{
              marginTop: '1.5rem',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.25rem',
              fontSize: '0.85rem',
            }}
          >
            <Link
              to="/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: '#6b7280',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              <ArrowLeft size={14} />
              <span>Change email / Return to sign up</span>
            </Link>

            <span style={{ color: '#e5e7eb' }}>&bull;</span>

            <Link
              to="/login"
              style={{
                color: '#c8102e',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
