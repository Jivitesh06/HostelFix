import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Wrench,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  User,
  Mail,
  Lock,
  Phone,
  KeyRound,
  ArrowLeft,
} from 'lucide-react';
import { getHostelsByGender } from '../../constants/hostelConfig';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const PHONE_REGEX = /^[0-9+\-\s]{7,15}$/;

const STAFF_CATEGORIES = [
  'Electrician',
  'Plumber',
  'Cleaning / Housekeeping',
  'Carpenter / Furniture',
  'Network / Internet Technician',
  'General Maintenance',
];

export default function StaffRegisterPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Role selection: 'WARDEN' or 'STAFF'
  const [selectedRole, setSelectedRole] = useState('WARDEN');

  const [form, setForm] = useState({
    adminKey: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: 'MALE',
    hostelName: '',
    staffCategory: 'Electrician',
    mobileNumber: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // If a student is currently logged in, strictly deny access
  if (user && user.role === 'STUDENT') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          padding: '1.5rem',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '16px',
            padding: '2.5rem',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <ShieldAlert size={34} />
          </div>

          <span
            style={{
              display: 'inline-block',
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              padding: '0.3rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem',
            }}
          >
            Access Denied &bull; 403 Forbidden
          </span>

          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '0.75rem',
            }}
          >
            Restricted Administrative Portal
          </h2>

          <p
            style={{
              fontSize: '0.95rem',
              color: '#64748b',
              lineHeight: 1.6,
              marginBottom: '1.75rem',
            }}
          >
            You are currently signed in as a student (<strong>{user.name}</strong>).
            This onboarding portal is strictly reserved for College Wardens, Facility Supervisors,
            and Campus Maintenance Workers. Students cannot access or register through this portal.
          </p>

          <button
            onClick={() => navigate('/student/dashboard')}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.25)',
            }}
          >
            <ArrowLeft size={16} />
            <span>Return to Student Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

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

  const handleRoleTabChange = (newRole) => {
    setSelectedRole(newRole);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const {
      adminKey,
      name,
      email,
      password,
      confirmPassword,
      gender,
      hostelName,
      staffCategory,
      mobileNumber,
    } = form;

    if (!adminKey.trim()) {
      setError('Administrative authorization key is required to access this portal.');
      return;
    }

    if (!name.trim() || !email.trim() || !password) {
      setError('Full name, email address, and password are required.');
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Please provide a valid official email address.');
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please retype carefully.');
      return;
    }

    if (mobileNumber && mobileNumber.trim() && !PHONE_REGEX.test(mobileNumber.trim())) {
      setError('Please enter a valid mobile number (7–15 digits).');
      return;
    }

    if (selectedRole === 'WARDEN') {
      if (!gender) {
        setError('Please specify warden gender to assign the appropriate hostel.');
        return;
      }
      if (!hostelName) {
        setError('Please assign a hostel for this warden account.');
        return;
      }
    }

    if (selectedRole === 'STAFF') {
      if (!staffCategory) {
        setError('Please select a trade or maintenance category for this worker.');
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        adminKey: adminKey.trim(),
        role: selectedRole,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        mobileNumber: mobileNumber.trim() || null,
        gender: selectedRole === 'WARDEN' ? gender : form.gender || null,
        hostelName: selectedRole === 'WARDEN' ? hostelName : null,
        staffCategory: selectedRole === 'STAFF' ? staffCategory : null,
      };

      await api.post('/auth/staff-register', payload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', {
          state: {
            message: `Account created successfully for ${payload.name} (${selectedRole === 'WARDEN' ? 'Warden' : 'Maintenance Staff'}). Please sign in.`,
          },
        });
      }, 2000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Administrative registration failed. Please verify your authorization key and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.65rem 0.85rem 0.65rem 2.4rem',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  };

  const selectStyle = {
    width: '100%',
    padding: '0.65rem 0.85rem',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#334155',
    marginBottom: '0.35rem',
  };

  const iconWrapperStyle = {
    position: 'absolute',
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
  };

  const availableHostels = getHostelsByGender(form.gender);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #090d16 0%, #111827 50%, #1e293b 100%)',
        color: '#f8fafc',
        fontFamily: 'var(--font-sans)',
        padding: '2.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '620px',
          background: '#ffffff',
          color: '#0f172a',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Header Ribbon */}
        <div
          style={{
            background: 'linear-gradient(135deg, #312e81 0%, #4338ca 100%)',
            padding: '1.75rem 2rem',
            color: '#ffffff',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(238, 242, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#e0e7ff',
              marginBottom: '0.75rem',
            }}
          >
            <ShieldCheck size={14} color="#a5b4fc" />
            <span>Administrative Onboarding Portal</span>
          </div>

          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: '0 0 0.35rem',
            }}
          >
            Warden & Staff Registration
          </h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#c7d2fe', lineHeight: 1.5 }}>
            Secure campus administrator & maintenance technician provisioning. Requires official Estate
            Office authorization key.
          </p>
        </div>

        <div style={{ padding: '2rem' }}>
          {/* Success Banner */}
          {success && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
              }}
            >
              <CheckCircle size={20} color="#059669" />
              <div>
                <strong>Account Provisioned!</strong> Redirecting to login portal...
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
              }}
            >
              <AlertCircle size={18} color="#dc2626" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Switcher Tabs */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Account Role to Provision *</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
              }}
            >
              <button
                type="button"
                onClick={() => handleRoleTabChange('WARDEN')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: selectedRole === 'WARDEN' ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                  background: selectedRole === 'WARDEN' ? '#eef2ff' : '#f8fafc',
                  color: selectedRole === 'WARDEN' ? '#312e81' : '#64748b',
                  fontWeight: selectedRole === 'WARDEN' ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Building2 size={18} color={selectedRole === 'WARDEN' ? '#4f46e5' : '#94a3b8'} />
                <span>Hostel Warden</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange('STAFF')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: selectedRole === 'STAFF' ? '2px solid #059669' : '1px solid #e2e8f0',
                  background: selectedRole === 'STAFF' ? '#ecfdf5' : '#f8fafc',
                  color: selectedRole === 'STAFF' ? '#065f46' : '#64748b',
                  fontWeight: selectedRole === 'STAFF' ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Wrench size={18} color={selectedRole === 'STAFF' ? '#059669' : '#94a3b8'} />
                <span>Worker / Maintenance Staff</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Administrative Authorization Key */}
            <div
              style={{
                marginBottom: '1.5rem',
                background: '#f8fafc',
                border: '1px dashed #cbd5e1',
                borderRadius: '10px',
                padding: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ ...labelStyle, color: '#1e293b' }}>
                  Administrative Authorization Key *
                </label>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Evaluation Key: <code>HostelFix@Admin2026</code>
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={iconWrapperStyle}>
                  <KeyRound size={16} />
                </div>
                <input
                  type="password"
                  name="adminKey"
                  value={form.adminKey}
                  onChange={handleChange}
                  placeholder="Enter secret authorization key"
                  required
                  style={inputStyle}
                />
              </div>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                Required to prevent unauthorized account creation by campus students.
              </p>
            </div>

            {/* Full Name & Email */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div>
                <label style={labelStyle}>Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapperStyle}>
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder={selectedRole === 'WARDEN' ? 'e.g. Dr. A. P. Sharma' : 'e.g. Ramesh Kumar'}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Official Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapperStyle}>
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder={selectedRole === 'WARDEN' ? 'warden@hostelfix.demo' : 'staff@hostelfix.demo'}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div>
                <label style={labelStyle}>Password *</label>
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapperStyle}>
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapperStyle}>
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Role-Specific Fields */}
            {selectedRole === 'WARDEN' ? (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  marginBottom: '1.25rem',
                }}
              >
                <h4
                  style={{
                    margin: '0 0 0.85rem',
                    fontSize: '0.85rem',
                    color: '#334155',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Warden Assignment & Hostel Scoping
                </h4>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <label style={labelStyle}>Gender *</label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleGenderChange}
                      required
                      style={selectStyle}
                    >
                      <option value="MALE">Male (Boys Hostels)</option>
                      <option value="FEMALE">Female (Girls Hostels)</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Assigned Hostel *</label>
                    <select
                      name="hostelName"
                      value={form.hostelName}
                      onChange={handleChange}
                      required
                      style={selectStyle}
                    >
                      <option value="">-- Select Assigned Hostel --</option>
                      {availableHostels.map((hostel) => (
                        <option key={hostel} value={hostel}>
                          {hostel}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                  The warden will strictly oversee complaints originating from their assigned hostel.
                </p>
              </div>
            ) : (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  marginBottom: '1.25rem',
                }}
              >
                <h4
                  style={{
                    margin: '0 0 0.85rem',
                    fontSize: '0.85rem',
                    color: '#334155',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Worker Trade & Maintenance Category
                </h4>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <label style={labelStyle}>Trade / Category *</label>
                    <select
                      name="staffCategory"
                      value={form.staffCategory}
                      onChange={handleChange}
                      required
                      style={selectStyle}
                    >
                      {STAFF_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Contact Mobile Number</label>
                    <div style={{ position: 'relative' }}>
                      <div style={iconWrapperStyle}>
                        <Phone size={16} />
                      </div>
                      <input
                        type="tel"
                        name="mobileNumber"
                        value={form.mobileNumber}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                  Wardens will assign complaint work orders matching this worker&apos;s trade specialty.
                </p>
              </div>
            )}

            {/* Optional Phone for Warden */}
            {selectedRole === 'WARDEN' && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>Official Mobile / Intercom</label>
                <div style={{ position: 'relative' }}>
                  <div style={iconWrapperStyle}>
                    <Phone size={16} />
                  </div>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={form.mobileNumber}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    style={inputStyle}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              style={{
                width: '100%',
                padding: '0.8rem',
                background: selectedRole === 'WARDEN' ? '#4f46e5' : '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: loading || success ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s ease',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            >
              <span>
                {loading
                  ? 'Authorizing & Provisioning...'
                  : selectedRole === 'WARDEN'
                  ? 'Create Warden Account'
                  : 'Register Maintenance Worker'}
              </span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Footer Back to Login */}
          <div
            style={{
              marginTop: '1.5rem',
              textAlign: 'center',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '1rem',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              Already registered?{' '}
              <Link
                to="/login"
                style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}
              >
                Sign in to HostelFix
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
