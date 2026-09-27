import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import {
  Building2,
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

const STEPS = {
  EMAIL: 'EMAIL',
  OTP: 'OTP',
  PASSWORD: 'PASSWORD',
  SUCCESS: 'SUCCESS',
};

const RESEND_COOLDOWN_SECONDS = 60;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Wizard step state
  const [step, setStep] = useState(STEPS.EMAIL);

  // Form fields
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Resend OTP countdown timer
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer = null;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  // Step 1: Submit Email to request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);

    try {
      await authService.forgotPassword(cleanEmail);
      setStep(STEPS.OTP);
      setCountdown(RESEND_COOLDOWN_SECONDS);
      setInfoMessage(`A 6-digit verification code has been dispatched to ${cleanEmail}.`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to dispatch reset code. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-digit OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setError('Please enter the complete 6-digit numeric OTP code.');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.verifyResetOtp({
        email: email.trim(),
        otp: cleanOtp,
      });

      const token = res.data?.verificationToken || res.verificationToken;
      if (!token) {
        throw new Error('Verification proof token not received. Please try again.');
      }

      setVerificationToken(token);
      setStep(STEPS.PASSWORD);
      setInfoMessage('Code verified successfully. Please enter your new password.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2 Resend: Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || loading) return;
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      await authService.resendResetOtp(email.trim());
      setCountdown(RESEND_COOLDOWN_SECONDS);
      setInfoMessage('A new 6-digit OTP has been dispatched to your email.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend code. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Update New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({
        email: email.trim(),
        verificationToken,
        newPassword,
      });

      setStep(STEPS.SUCCESS);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Password update failed. Your verification session may have expired.';
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
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
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
            {step === STEPS.EMAIL && 'Forgot Password'}
            {step === STEPS.OTP && 'Verify 6-Digit OTP'}
            {step === STEPS.PASSWORD && 'Set New Password'}
            {step === STEPS.SUCCESS && 'Password Reset Complete'}
          </h1>

          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
            {step === STEPS.EMAIL &&
              'Enter your registered email to receive a 6-digit password reset code.'}
            {step === STEPS.OTP && (
              <>
                Enter the verification code dispatched to{' '}
                <strong style={{ color: '#171717' }}>{email}</strong>
              </>
            )}
            {step === STEPS.PASSWORD &&
              'Enter a strong new password to secure your HostelFix account.'}
            {step === STEPS.SUCCESS &&
              'Your password has been securely updated. You can now log in.'}
          </p>
        </div>

        {/* Step Progression Indicators */}
        {step !== STEPS.SUCCESS && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '1.75rem',
            }}
          >
            {[
              { id: STEPS.EMAIL, label: 'Email' },
              { id: STEPS.OTP, label: 'Verify OTP' },
              { id: STEPS.PASSWORD, label: 'New Password' },
            ].map((s, idx) => {
              const isCurrent = step === s.id;
              const isPast =
                (step === STEPS.OTP && idx === 0) ||
                (step === STEPS.PASSWORD && (idx === 0 || idx === 1));

              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: isCurrent ? '#c8102e' : isPast ? '#059669' : '#9ca3af',
                    }}
                  >
                    <span
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: isCurrent
                          ? '#fee2e2'
                          : isPast
                          ? '#d1fae5'
                          : '#f3f4f6',
                        color: isCurrent ? '#c8102e' : isPast ? '#059669' : '#6b7280',
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span>{s.label}</span>
                  </div>
                  {idx < 2 && (
                    <div
                      style={{
                        width: '20px',
                        height: '1px',
                        background: isPast ? '#059669' : '#e5e7eb',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Error Alert */}
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

        {/* Info / Success Alert */}
        {infoMessage && (
          <div
            style={{
              background: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0 }} />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* STEP 1: EMAIL INPUT */}
        {step === STEPS.EMAIL && (
          <form onSubmit={handleRequestOtp}>
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
              <span>{loading ? 'Sending OTP code...' : 'Send Reset Code'}</span>
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

        {/* STEP 2: OTP VERIFICATION */}
        {step === STEPS.OTP && (
          <form onSubmit={handleVerifyOtp}>
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
                6-Digit Verification Code
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
                  <KeyRound size={16} />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setOtp(val);
                    if (error) setError('');
                  }}
                  placeholder="123456"
                  autoFocus
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.85rem 0.75rem 2.4rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    letterSpacing: '0.3em',
                    color: '#171717',
                    outline: 'none',
                    boxSizing: 'border-box',
                    textAlign: 'left',
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
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
                Code expires in 10 minutes. Max 5 verification attempts.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: otp.length === 6 ? '#c8102e' : '#9ca3af',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                border: 'none',
                cursor: loading || otp.length !== 6 ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s ease',
                boxShadow: '0 1px 2px 0 rgba(200, 16, 46, 0.2)',
              }}
            >
              <span>{loading ? 'Verifying code...' : 'Verify Code'}</span>
              <ArrowRight size={16} />
            </button>

            {/* Resend & Back actions */}
            <div
              style={{
                marginTop: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
              }}
            >
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0 || loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: countdown > 0 ? '#9ca3af' : '#c8102e',
                  fontWeight: 600,
                  cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <RotateCcw size={14} />
                <span>
                  {countdown > 0 ? `Resend Code in ${countdown}s` : 'Resend Code'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(STEPS.EMAIL);
                  setOtp('');
                  setError('');
                  setInfoMessage('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Change email
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SET NEW PASSWORD */}
        {step === STEPS.PASSWORD && (
          <form onSubmit={handleResetPassword}>
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
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (error) setError('');
                  }}
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
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError('');
                  }}
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
              <span>{loading ? 'Updating password...' : 'Update Password'}</span>
              <ShieldCheck size={16} />
            </button>
          </form>
        )}

        {/* STEP 4: SUCCESS */}
        {step === STEPS.SUCCESS && (
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
              Password Updated Successfully!
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#4b5563', margin: '0 0 1.75rem', lineHeight: 1.5 }}>
              Your password has been changed. You can now sign in to your HostelFix account with your new credentials.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate('/login', {
                  state: { message: 'Password updated successfully! Please sign in with your new password.' },
                })
              }
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
        )}
      </div>
    </div>
  );
}
