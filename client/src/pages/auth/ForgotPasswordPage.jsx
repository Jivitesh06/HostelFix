import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';
import {
  Building2,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Shield,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please provide your registered email address.');
      return;
    }

    setLoading(true);

    try {
      await authService.forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to process password reset request. Please check your connection.'
      );
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
        background: '#f8f8f8',
        padding: '2rem 1.5rem',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          padding: '2.5rem 2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Brand Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#c8102e',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 2px 4px rgba(200, 16, 46, 0.25)',
            }}
          >
            <Building2 size={26} color="#ffffff" />
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#171717',
              letterSpacing: '-0.02em',
              margin: '0 0 0.4rem',
            }}
          >
            Forgot Password?
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
            Enter your registered college or staff email and we will send you a secure link to reset your password.
          </p>
        </div>

        {submitted ? (
          /* Success State */
          <div>
            <div
              style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '0.85rem',
                alignItems: 'flex-start',
              }}
            >
              <CheckCircle2 size={22} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', fontWeight: 700, color: '#065f46' }}>
                  Reset Request Dispatched
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#047857', lineHeight: 1.5 }}>
                  If an account exists with this email, a password reset link has been sent. The link expires in <strong>15 minutes</strong>.
                </p>
              </div>
            </div>

            <div
              style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '1rem',
                marginBottom: '1.5rem',
                fontSize: '0.8rem',
                color: '#6b7280',
                lineHeight: 1.5,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', fontWeight: 600, color: '#374151' }}>
                <Shield size={14} color="#6b7280" />
                <span>Didn't receive an email?</span>
              </div>
              Check your spam or junk folder. For student accounts, make sure you checked your registered institutional university email.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                }}
                style={{
                  width: '100%',
                  padding: '0.7rem',
                  background: '#f3f4f6',
                  color: '#374151',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Send to another email
              </button>

              <Link
                to="/login"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.75rem',
                  background: '#c8102e',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 1px 2px rgba(200, 16, 46, 0.2)',
                }}
              >
                <ArrowLeft size={16} />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  background: '#fff1f2',
                  color: '#9f1239',
                  border: '1px solid #fecdd3',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1.25rem',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                }}
              >
                <AlertCircle size={16} color="#e11d48" style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

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
                Registered Email Address
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
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="e.g. resident@chitkarauniversity.edu.in"
                  autoComplete="email"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.85rem 0.75rem 2.4rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    color: '#171717',
                    outline: 'none',
                    boxSizing: 'border-box',
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
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s ease',
                boxShadow: '0 1px 2px 0 rgba(200, 16, 46, 0.2)',
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#a50d25')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#c8102e')}
            >
              <span>{loading ? 'Sending link...' : 'Send Reset Link'}</span>
              <ArrowRight size={16} />
            </button>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#171717')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
              >
                <ArrowLeft size={14} />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
