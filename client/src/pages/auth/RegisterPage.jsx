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
  Lock,
  Phone,
  GraduationCap,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { getHostelsByGender } from '../../constants/hostelConfig';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CHITKARA_EMAIL_DOMAIN = '@chitkarauniversity.edu.in';
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
    gender: '',
    mobileNumber: '',
    universityRollNumber: '',
    branch: '',
    year: '',
    hostelName: '',
    roomNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleGenderChange = (e) => {
    const newGender = e.target.value;
    const currentHostel = form.hostelName;
    const allowed = getHostelsByGender(newGender);
    const stillValid = allowed.includes(currentHostel);
    setForm((prev) => ({
      ...prev,
      gender: newGender,
      hostelName: stillValid ? currentHostel : '',
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const {
      name,
      email,
      gender,
      mobileNumber,
      universityRollNumber,
      branch,
      year,
      hostelName,
      roomNumber,
      password,
      confirmPassword,
    } = form;

    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      setError('Please provide a valid university email address.');
      return;
    }

    if (!cleanEmail.endsWith(CHITKARA_EMAIL_DOMAIN)) {
      setError(
        'Registration requires an institutional Chitkara University email address (@chitkarauniversity.edu.in). Personal email accounts are not permitted.'
      );
      return;
    }

    if (!mobileNumber.trim()) {
      setError('Mobile contact number is required.');
      return;
    }

    if (!PHONE_REGEX.test(mobileNumber.trim())) {
      setError('Please provide a valid mobile contact number (7-15 digits).');
      return;
    }

    if (!universityRollNumber.trim()) {
      setError('University Roll Number is required.');
      return;
    }

    if (!branch.trim()) {
      setError('Academic branch / program is required.');
      return;
    }

    if (!year.trim()) {
      setError('Current year of study is required.');
      return;
    }

    if (!hostelName.trim()) {
      setError('Please select your assigned hostel name.');
      return;
    }

    if (!roomNumber.trim()) {
      setError('Room number is required (e.g. A-101).');
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
        email: cleanEmail,
        gender: gender || null,
        mobileNumber: mobileNumber.trim(),
        universityRollNumber: universityRollNumber.trim(),
        branch: branch.trim(),
        year: year.trim(),
        hostelName: hostelName.trim(),
        roomNumber: roomNumber.trim(),
        password,
      });

      navigate(`/verify-email?email=${encodeURIComponent(cleanEmail)}`, {
        state: {
          message: 'Verification code sent to your university email.',
          email: cleanEmail,
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
        background: '#f8f8f8',
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
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e5e7eb',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#c8102e',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem',
              boxShadow: '0 2px 4px rgba(200, 16, 46, 0.25)',
            }}
          >
            <Building2 size={24} />
          </div>
          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: '#171717',
              letterSpacing: '-0.02em',
              margin: '0 0 0.35rem',
            }}
          >
            Create Resident Account
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
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

            <div style={{ marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ ...fieldLabelStyle, marginBottom: 0 }}>University Institutional Email *</label>
                <span style={{ fontSize: '0.72rem', color: '#c8102e', fontWeight: 600 }}>@chitkarauniversity.edu.in</span>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={iconWrapperStyle}><Mail size={16} /></div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="e.g. rahul.sharma@chitkarauniversity.edu.in"
                  required
                  style={inputWithIconStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={fieldLabelStyle}>Mobile Number *</label>
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapperStyle}><Phone size={16} /></div>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={form.mobileNumber}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    required
                    style={inputWithIconStyle}
                  />
                </div>
              </div>
              <div>
                <label style={fieldLabelStyle}>Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleGenderChange}
                  style={selectStyle}
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
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
                <label style={fieldLabelStyle}>University Roll Number *</label>
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapperStyle}><GraduationCap size={16} /></div>
                  <input
                    type="text"
                    name="universityRollNumber"
                    value={form.universityRollNumber}
                    onChange={handleChange}
                    placeholder="e.g. CUH2024CS001"
                    required
                    style={inputWithIconStyle}
                  />
                </div>
              </div>
              <div>
                <label style={fieldLabelStyle}>Year of Study *</label>
                <select
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  required
                  style={selectStyle}
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
            <div>
              <label style={fieldLabelStyle}>Branch / Specialization *</label>
              <div style={{ position: 'relative' }}>
                <div style={iconWrapperStyle}><BookOpen size={16} /></div>
                <input
                  type="text"
                  name="branch"
                  value={form.branch}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science & Engineering"
                  required
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
              <label style={fieldLabelStyle}>
                Hostel / Hall Name * {form.gender ? `(${form.gender === 'MALE' ? 'Boys Hostels' : 'Girls Hostels'})` : ''}
              </label>
              <select
                name="hostelName"
                value={form.hostelName}
                onChange={handleChange}
                required
                style={selectStyle}
              >
                <option value="">
                  {form.gender ? '-- Select Hostel --' : '-- Select Gender First --'}
                </option>
                {getHostelsByGender(form.gender).map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              {!form.gender && (
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', marginBottom: 0 }}>
                  Select your gender above to view available hostels for your accommodation.
                </p>
              )}
            </div>
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
              marginTop: '0.5rem',
              border: 'none',
              boxShadow: '0 1px 2px 0 rgba(200, 16, 46, 0.2)',
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#a50d25')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#c8102e')}
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
            color: '#6b7280',
          }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: '#c8102e', fontWeight: 600, textDecoration: 'none' }}
          >
            Sign In here
          </Link>
        </p>

        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid #e5e7eb',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#9ca3af',
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
  color: '#c8102e',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '0.65rem',
};

const fieldLabelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '0.35rem',
};

const iconWrapperStyle = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#9ca3af',
  display: 'flex',
  alignItems: 'center',
};

const inputWithIconStyle = {
  width: '100%',
  padding: '0.65rem 0.85rem 0.65rem 2.4rem',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  background: '#ffffff',
  color: '#171717',
};

const selectStyle = {
  width: '100%',
  padding: '0.65rem 0.85rem',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  background: '#ffffff',
  color: '#171717',
  cursor: 'pointer',
};
