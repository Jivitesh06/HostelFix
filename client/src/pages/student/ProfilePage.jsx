import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import AppShell from '../../components/AppShell';
import Modal from '../../components/Modal';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Calendar,
  Building2,
  Home,
  Edit3,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Lock,
  KeyRound,
} from 'lucide-react';
import { getHostelsByGender } from '../../constants/hostelConfig';

const YEAR_OPTIONS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year (Dual Degree)',
  'Post Graduate / Masters',
  'PhD Scholar',
];

const PHONE_REGEX = /^[0-9+\-\s]{7,15}$/;

export default function StudentProfilePage() {
  const { user: authUser, updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    mobileNumber: '',
    universityRollNumber: '',
    branch: '',
    year: '',
    hostelName: '',
    roomNumber: '',
  });

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userService.getProfile();
      setProfile(data);
      // Synchronize edit form with loaded profile
      setFormData({
        name: data.name || '',
        gender: data.gender || '',
        mobileNumber: data.mobileNumber || '',
        universityRollNumber: data.universityRollNumber || '',
        branch: data.branch || '',
        year: data.year || '',
        hostelName: data.hostelName || '',
        roomNumber: data.roomNumber || '',
      });
    } catch (err) {
      setError('Unable to load student profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const openEditModal = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        gender: profile.gender || '',
        mobileNumber: profile.mobileNumber || '',
        universityRollNumber: profile.universityRollNumber || '',
        branch: profile.branch || '',
        year: profile.year || '',
        hostelName: profile.hostelName || '',
        roomNumber: profile.roomNumber || '',
      });
    }
    setEditError('');
    setEditModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (editError) setEditError('');
  };

  const handleGenderChange = (e) => {
    const newGender = e.target.value;
    const currentHostel = formData.hostelName;
    const allowed = getHostelsByGender(newGender);
    const stillValid = allowed.includes(currentHostel);
    setFormData((prev) => ({
      ...prev,
      gender: newGender,
      hostelName: stillValid ? currentHostel : '',
    }));
    if (editError) setEditError('');
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setEditError('');

    // Form validations
    if (!formData.name.trim()) {
      setEditError('Full name cannot be empty.');
      return;
    }
    if (!formData.roomNumber.trim()) {
      setEditError('Room number is required.');
      return;
    }
    if (formData.mobileNumber.trim() && !PHONE_REGEX.test(formData.mobileNumber.trim())) {
      setEditError('Please enter a valid mobile number (7-15 numeric digits).');
      return;
    }

    setEditLoading(true);
    try {
      const updated = await userService.updateProfile({
        name: formData.name.trim(),
        gender: formData.gender || null,
        mobileNumber: formData.mobileNumber.trim() || null,
        universityRollNumber: formData.universityRollNumber.trim() || null,
        branch: formData.branch.trim() || null,
        year: formData.year.trim() || null,
        hostelName: formData.hostelName.trim() || null,
        roomNumber: formData.roomNumber.trim(),
      });

      setProfile(updated);
      updateUser(updated);
      setSuccessMsg('Your student profile has been updated successfully!');
      setEditModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const initials = profile?.name
    ? profile.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('')
    : 'ST';

  return (
    <AppShell
      title="Student Resident Profile"
      subtitle="Manage your personal contact details, academic credentials, and hostel room information"
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            type="button"
            onClick={() => setChangePasswordOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: '#ffffff',
              color: '#374151',
              padding: '0.625rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#c8102e';
              e.currentTarget.style.color = '#c8102e';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.color = '#374151';
            }}
          >
            <KeyRound size={15} />
            <span>Change Password</span>
          </button>

          <button
            onClick={openEditModal}
            disabled={loading || !profile}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#c8102e',
              color: '#ffffff',
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              border: 'none',
              boxShadow: '0 1px 2px rgba(200, 16, 46, 0.2)',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#a50d25')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#c8102e')}
          >
            <Edit3 size={16} />
            <span>Edit Profile</span>
          </button>
        </div>
      }
    >
      {/* ── Status Notifications ────────────────────────────────────────── */}
      {successMsg && (
        <div
          style={{
            background: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            padding: '0.85rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <CheckCircle2 size={18} color="#059669" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            background: '#fff1f2',
            color: '#9f1239',
            border: '1px solid #fecdd3',
            padding: '0.85rem 1.25rem',
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

      {loading ? (
        <div
          style={{
            background: '#ffffff',
            padding: '3.5rem',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            textAlign: 'center',
            color: '#6b7280',
          }}
        >
          Loading your student profile...
        </div>
      ) : !profile ? null : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* ── Profile Hero Header Card ─────────────────────────────────── */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e5e7eb',
              padding: '1.75rem 2rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '16px',
                  background: '#fdecef',
                  color: '#c8102e',
                  border: '1.5px solid #fecdd3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                }}
              >
                {initials}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#171717', margin: 0 }}>
                    {profile.name}
                  </h2>
                  <span
                    style={{
                      background: '#f8f8f8',
                      color: '#374151',
                      border: '1px solid #e5e7eb',
                      padding: '0.2rem 0.65rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    Resident Student
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    marginTop: '0.4rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Mail size={15} color="#9ca3af" />
                    {profile.email}
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Home size={15} color="#9ca3af" />
                    Room {profile.roomNumber || '—'}
                  </span>
                  {profile.hostelName && (
                    <>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Building2 size={15} color="#9ca3af" />
                        {profile.hostelName}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={openEditModal}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  color: '#374151',
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#c8102e';
                  e.currentTarget.style.color = '#c8102e';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.color = '#374151';
                }}
              >
                <Edit3 size={15} />
                <span>Update Details</span>
              </button>
            </div>
          </div>

          {/* ── 3 Section Profile Cards Grid ─────────────────────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* SECTION 1: PERSONAL INFORMATION */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: '0.85rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#fdecef',
                    color: '#c8102e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <User size={18} />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: '#171717',
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Personal Information
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    Identity and emergency contact
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', flex: 1 }}>
                <div>
                  <span style={labelStyle}>Full Name</span>
                  <div style={valueStyle}>{profile.name}</div>
                </div>

                <div>
                  <span style={labelStyle}>Gender</span>
                  <div style={valueStyle}>
                    {profile.gender ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: profile.gender === 'FEMALE' ? '#fdf2f8' : '#eff6ff',
                          color: profile.gender === 'FEMALE' ? '#be185d' : '#1d4ed8',
                          padding: '0.2rem 0.65rem',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          border: `1px solid ${profile.gender === 'FEMALE' ? '#fbcfe8' : '#bfdbfe'}`,
                        }}
                      >
                        {profile.gender === 'MALE' ? 'Male (Boys Hostels)' : profile.gender === 'FEMALE' ? 'Female (Girls Hostels)' : profile.gender}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                        Not specified (Click Update Details to select)
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span style={labelStyle}>Contact Email</span>
                  <div
                    style={{
                      ...valueStyle,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span>{profile.email}</span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.7rem',
                        color: '#059669',
                        background: '#ecfdf5',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        fontWeight: 600,
                      }}
                    >
                      <ShieldCheck size={12} />
                      Verified
                    </span>
                  </div>
                </div>

                <div>
                  <span style={labelStyle}>Mobile Number</span>
                  <div style={valueStyle}>
                    {profile.mobileNumber ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Phone size={14} color="#64748b" />
                        {profile.mobileNumber}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                        Not provided (Click Edit Profile to add)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: ACADEMIC INFORMATION */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: '0.85rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <GraduationCap size={18} />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: '#171717',
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Academic Information
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    University enrollment and discipline
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', flex: 1 }}>
                <div>
                  <span style={labelStyle}>University Roll Number</span>
                  <div style={valueStyle}>
                    {profile.universityRollNumber ? (
                      <span
                        style={{
                          display: 'inline-block',
                          fontFamily: 'monospace',
                          background: '#f8f8f8',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb',
                          fontWeight: 700,
                          color: '#171717',
                        }}
                      >
                        {profile.universityRollNumber}
                      </span>
                    ) : (
                      <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                        Not provided
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span style={labelStyle}>Branch / Specialization</span>
                  <div style={valueStyle}>
                    {profile.branch ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <BookOpen size={14} color="#6b7280" />
                        {profile.branch}
                      </span>
                    ) : (
                      <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                        Not specified
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span style={labelStyle}>Year of Study</span>
                  <div style={valueStyle}>
                    {profile.year ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: '#f8f8f8',
                          color: '#374151',
                          border: '1px solid #e5e7eb',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                        }}
                      >
                        <Calendar size={13} />
                        {profile.year}
                      </span>
                    ) : (
                      <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                        Not specified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: HOSTEL INFORMATION */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: '0.85rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#fef3c7',
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Home size={18} />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: '#171717',
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Hostel Information
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    Campus residence and room allocation
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', flex: 1 }}>
                <div>
                  <span style={labelStyle}>Hostel / Hall Name</span>
                  <div style={valueStyle}>
                    {profile.hostelName ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Building2 size={14} color="#6b7280" />
                        {profile.hostelName}
                      </span>
                    ) : (
                      <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                        Campus Hostel
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span style={labelStyle}>Assigned Room Number</span>
                  <div style={valueStyle}>
                    <span
                      style={{
                        fontWeight: 700,
                        color: '#171717',
                        background: '#f8f8f8',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      Room {profile.roomNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: ACCOUNT SECURITY & PASSWORD */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#fdecef',
                    color: '#c8102e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Lock size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#171717', margin: 0 }}>
                    Account Security &amp; Password
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    Password is encrypted with industry-standard bcrypt. Update anytime.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setChangePasswordOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1rem',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#374151',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#c8102e';
                  e.currentTarget.style.color = '#c8102e';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.color = '#374151';
                }}
              >
                <KeyRound size={15} />
                <span>Change Password</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Change Password Modal ─────────────────────────────────────── */}
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />

      {/* ── Edit Profile Modal ────────────────────────────────────────── */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Student Profile"
        subtitle="Keep your personal, academic, and hostel residence details accurate"
      >
        {editError && (
          <div
            style={{
              background: '#fff1f2',
              color: '#9f1239',
              border: '1px solid #fecdd3',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} color="#e11d48" />
            <span>{editError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Section A: Personal Details */}
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#c8102e',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem',
              }}
            >
              1. Personal Information
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
              <div>
                <label style={modalLabelStyle}>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Priya Sharma"
                  style={modalInputStyle}
                />
              </div>
              <div>
                <label style={modalLabelStyle}>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleGenderChange}
                  style={modalInputStyle}
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
            </div>
            <div>
              <label style={modalLabelStyle}>Mobile Contact Number</label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                placeholder="e.g. 9876543210"
                style={modalInputStyle}
              />
            </div>
          </div>

          {/* Section B: Academic Details */}
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#c8102e',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem',
              }}
            >
              2. Academic Information
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
              <div>
                <label style={modalLabelStyle}>University Roll Number</label>
                <input
                  type="text"
                  name="universityRollNumber"
                  value={formData.universityRollNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. CUH2024CS001"
                  style={modalInputStyle}
                />
              </div>
              <div>
                <label style={modalLabelStyle}>Year of Study</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  style={modalInputStyle}
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
              <label style={modalLabelStyle}>Branch / Academic Specialization</label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                placeholder="e.g. Computer Science & Engineering"
                style={modalInputStyle}
              />
            </div>
          </div>

          {/* Section C: Hostel Details */}
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#c8102e',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem',
              }}
            >
              3. Hostel Residence Information
            </div>
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={modalLabelStyle}>
                Hostel / Hall Name {formData.gender ? `(${formData.gender === 'MALE' ? 'Boys Hostels' : 'Girls Hostels'})` : ''}
              </label>
              <select
                name="hostelName"
                value={formData.hostelName}
                onChange={handleInputChange}
                style={modalInputStyle}
              >
                <option value="">
                  {formData.gender ? '-- Select Hostel --' : '-- Select Gender First --'}
                </option>
                {getHostelsByGender(formData.gender).map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              {!formData.gender && (
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', marginBottom: 0 }}>
                  Select gender above to filter available hostels.
                </p>
              )}
            </div>
            <div>
              <label style={modalLabelStyle}>Room Number *</label>
              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleInputChange}
                required
                placeholder="e.g. A-101"
                style={modalInputStyle}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '0.75rem',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '1rem',
            }}
          >
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              disabled={editLoading}
              style={{
                padding: '0.625rem 1.15rem',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                background: '#ffffff',
                color: '#374151',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.625rem 1.35rem',
                borderRadius: '8px',
                background: '#c8102e',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: editLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 2px rgba(200, 16, 46, 0.2)',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => !editLoading && (e.currentTarget.style.backgroundColor = '#a50d25')}
              onMouseLeave={(e) => !editLoading && (e.currentTarget.style.backgroundColor = '#c8102e')}
            >
              <CheckCircle2 size={16} />
              <span>{editLoading ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

const labelStyle = {
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  color: '#6b7280',
  display: 'block',
  marginBottom: '0.2rem',
  letterSpacing: '0.04em',
};

const valueStyle = {
  fontSize: '0.925rem',
  fontWeight: 600,
  color: '#171717',
};

const modalLabelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '0.35rem',
};

const modalInputStyle = {
  width: '100%',
  padding: '0.65rem 0.75rem',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '0.875rem',
  color: '#171717',
  background: '#ffffff',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};
