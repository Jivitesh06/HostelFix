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
  Phone,
  GraduationCap,
  BookOpen,
  Calendar,
} from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const PHONE_REGEX = /^[0-9+\-\s]{7,15}$/;

const YEAR_OPTIONS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year (Dual Degree)',
  'Post Graduate / Masters',
  'PhD Scholar',
];

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    universityRollNumber: '',
    branch: '',
    year: '',
    hostelName: '',
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

    const {
      name,
      email,
      mobileNumber,
      universityRollNumber,
      branch,
      year,
      hostelName,
      roomNumber,
      hostelBlock,
      password,
      confirmPassword,
    } = form;

    if (
      !name.trim() ||
      !email.trim() ||
      !roomNumber.trim() ||
      !hostelBlock.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError('Name, email, room number, hostel block, and password are required.');
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Please provide a valid email address (e.g. student@college.edu).');
      return;
    }

    if (mobileNumber.trim() && !PHONE_REGEX.test(mobileNumber.trim())) {
      setError('Please provide a valid mobile contact number (7-15 digits).');
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
        hostelName: hostelName.trim() || null,
        mobileNumber: mobileNumber.trim() || null,
        universityRollNumber: universityRollNumber.trim() || null,
        branch: branch.trim() || null,
        year: year.trim() || null,
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
          maxWidth: '580px',
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
            Register your student profile to submit maintenance tickets and access mess portals.
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* SECTION 1: Personal Information */}
          <div>
            <div style={sectionHeadingStyle}>
              1. Personal Information
            </div>
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={fieldLabelStyle}>Full Name *</label>
              <div style={{ position: 'relative' }}>
                <div style={iconWrapperStyle}><User size={16} /></div>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  required
                  style={inputWithIconStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={fieldLabelStyle}>College Email *</label>
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapperStyle}><Mail size={16} /></div>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="student@college.edu"
                    required
                    style={inputWithIconStyle}
                  />
                </div>
              </div>
              <div>
                <label style={fieldLabelStyle}>Mobile Number</label>
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapperStyle}><Phone size={16} /></div>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={form.mobileNumber}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    style={inputWithIconStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Academic Information */}
          <div>
            <div style={sectionHeadingStyle}>
              2. Academic Information
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div>
                <label style={fieldLabelStyle}>University Roll Number</label>
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapperStyle}><GraduationCap size={16} /></div>
                  <input
                    type="text"
                    name="universityRollNumber"
                    value={form.universityRollNumber}
                    onChange={handleChange}
                    placeholder="e.g. CUH2024CS001"
                    style={inputWithIconStyle}
                  />
                </div>
              </div>
              <div>
                <label style={fieldLabelStyle}>Year of Study</label>
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapperStyle}><Calendar size={16} /></div>
                  <select
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    style={inputWithIconStyle}
                  >
                    <option value="">Select current year</option>
                    {YEAR_OPTIONS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label style={fieldLabelStyle}>Branch / Specialization</label>
              <div style={{ position: 'relative' }}>
                <div style={iconWrapperStyle}><BookOpen size={16} /></div>
                <input
                  type="text"
                  name="branch"
                  value={form.branch}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science & Engineering"
                  style={inputWithIconStyle}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Hostel Information */}
          <div>
            <div style={sectionHeadingStyle}>
              3. Hostel Residence
            </div>
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={fieldLabelStyle}>Hostel / Hall Name</label>
              <div style={{ position: 'relative' }}>
                <div style={iconWrapperStyle}><Building2 size={16} /></div>
                <input
                  type="text"
                  name="hostelName"
                  value={form.hostelName}
                  onChange={handleChange}
                  placeholder="e.g. Aravali Boys Hostel"
                  style={inputWithIconStyle}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={fieldLabelStyle}>Room Number *</label>
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapperStyle}><Home size={16} /></div>
                  <input
                    type="text"
                    name="roomNumber"
                    value={form.roomNumber}
                    onChange={handleChange}
                    placeholder="e.g. A-101"
                    required
                    style={inputWithIconStyle}
                  />
                </div>
              </div>
              <div>
                <label style={fieldLabelStyle}>Hostel Block *</label>
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapperStyle}><Layers size={16} /></div>
                  <input
                    type="text"
                    name="hostelBlock"
                    value={form.hostelBlock}
                    onChange={handleChange}
                    placeholder="e.g. Block A"
                    required
                    style={inputWithIconStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Account Security */}
          <div>
            <div style={sectionHeadingStyle}>
              4. Account Password
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={fieldLabelStyle}>Password *</label>
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapperStyle}><Lock size={16} /></div>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    required
                    style={inputWithIconStyle}
                  />
                </div>
              </div>
              <div>
                <label style={fieldLabelStyle}>Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapperStyle}><Lock size={16} /></div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    required
                    style={inputWithIconStyle}
                  />
                </div>
              </div>
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
              marginTop: '0.5rem',
              border: 'none',
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

const sectionHeadingStyle = {
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#4f46e5',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '0.65rem',
};

const fieldLabelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#334155',
  marginBottom: '0.35rem',
};

const iconWrapperStyle = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#94a3b8',
  display: 'flex',
  alignItems: 'center',
};

const inputWithIconStyle = {
  width: '100%',
  padding: '0.65rem 0.85rem 0.65rem 2.4rem',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  background: '#ffffff',
};
