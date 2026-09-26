import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import authService from '../../services/authService';
import {
  Building2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token.trim()) {
      setError('Password reset token is missing from the link. Please request a new link.');
      return;
    }

    if (!form.newPassword) {
      setError('Please enter a new password.');
      return;
    }

    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match. Please verify your new password.');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({
        token: token.trim(),
        newPassword: form.newPassword,
      });

      setSuccess(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Password reset failed. The link may have expired or already been used.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // If token parameter is completely absent from URL
  if (!token) {
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
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#fff1f2',
              color: '#c8102e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              border: '1px solid #fecdd3',
            }}
          >
            <AlertCircle size={26} color="#c8102e" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#171717', margin: '0 0 0.5rem' }}>
            Invalid Reset Link
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
            No password reset token was found in this link. Please check your email and make sure the entire URL was opened.
          </p>
          <Link
            to="/forgot-password"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.7rem 1.25rem',
              background: '#c8102e',
              color: '#ffffff',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <RefreshCw size={15} />
            <span>Request a New Reset Link</span>
          </Link>
        </div>
      </div>
    );
  }

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
        {/* Brand Header */}
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
            Create New Password
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
            Choose a strong password to secure your HostelFix account.
          </p>
        </div>

        {success ? (
          /* Success Screen */
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                border: '1px solid #a7f3d0',
              }}
            >
              <CheckCircle2 size={32} color="#059669" />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065f46', margin: '0 0 0.5rem' }}>
              Password Reset Successful!
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#4b5563', margin: '0 0 1.75rem', lineHeight: 1.5 }}>
              Your password has been updated. You can now sign in to your hostel portal with your new credentials.
            </p>

            <button
              type="button"
              onClick={() => navigate('/login', { state: { message: 'Password updated successfully! Please sign in.' } })}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#c8102e',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 1px 2px rgba(200, 16, 46, 0.2)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#a50d25')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#c8102e')}
            >
              <span>Sign In to Portal</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          /* Form Screen */
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
                  alignItems: 'flex-start',
                  gap: '0.6rem',
                }}
              >
                <AlertCircle size={16} color="#e11d48" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <span>{error}</span>
                  {(error.includes('expired') || error.includes('Invalid')) && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <Link
                        to="/forgot-password"
                        style={{ color: '#c8102e', fontWeight: 600, textDecoration: 'underline' }}
                      >
                        Request a fresh reset link &rarr;
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* New Password */}
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
                New Password
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
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.5rem 0.75rem 2.4rem',
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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
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
                Confirm New Password
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
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your new password"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.5rem 0.75rem 2.4rem',
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
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
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
              <span>{loading ? 'Resetting password...' : 'Update Password'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
