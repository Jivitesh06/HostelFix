import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Graceful automatic redirect to /forgot-password after 2 seconds
    const timer = setTimeout(() => {
      navigate('/forgot-password', { replace: true });
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

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
            background: '#c8102e',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: '0 2px 4px rgba(200, 16, 46, 0.25)',
          }}
        >
          <Building2 size={26} color="#ffffff" />
        </div>

        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}
        >
          <ShieldCheck size={24} color="#2563eb" />
        </div>

        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#171717', margin: '0 0 0.5rem' }}>
          Secure OTP Password Reset
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
          HostelFix now uses a faster and more reliable <strong>6-digit OTP verification code</strong> sent directly to your email.
          <br />
          Redirecting you to the verification portal...
        </p>

        <Link
          to="/forgot-password"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            padding: '0.75rem',
            background: '#c8102e',
            color: '#ffffff',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: 600,
            textDecoration: 'none',
            boxShadow: '0 1px 2px rgba(200, 16, 46, 0.2)',
          }}
        >
          <span>Continue to Forgot Password</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
