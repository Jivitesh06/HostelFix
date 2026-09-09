import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import AppShell from '../../components/AppShell';
import Modal from '../../components/Modal';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Calendar,
  Building2,
  Home,
  Layers,
  Edit3,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

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
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    universityRollNumber: '',
    branch: '',
    year: '',
    hostelName: '',
    roomNumber: '',
    hostelBlock: '',
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
        mobileNumber: data.mobileNumber || '',
        universityRollNumber: data.universityRollNumber || '',
        branch: data.branch || '',
        year: data.year || '',
        hostelName: data.hostelName || '',
        roomNumber: data.roomNumber || '',
        hostelBlock: data.hostelBlock || '',
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
        mobileNumber: profile.mobileNumber || '',
        universityRollNumber: profile.universityRollNumber || '',
        branch: profile.branch || '',
        year: profile.year || '',
        hostelName: profile.hostelName || '',
        roomNumber: profile.roomNumber || '',
        hostelBlock: profile.hostelBlock || '',
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
    if (!formData.hostelBlock.trim()) {
      setEditError('Hostel block is required.');
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
        mobileNumber: formData.mobileNumber.trim() || null,
        universityRollNumber: formData.universityRollNumber.trim() || null,
        branch: formData.branch.trim() || null,
        year: formData.year.trim() || null,
        hostelName: formData.hostelName.trim() || null,
        roomNumber: formData.roomNumber.trim(),
        hostelBlock: formData.hostelBlock.trim(),
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
        <button
          onClick={openEditModal}
          disabled={loading || !profile}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#4f46e5',
            color: '#ffffff',
            padding: '0.625rem 1.25rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            border: 'none',
            boxShadow: '0 1px 2px rgba(79, 70, 229, 0.2)',
          }}
        >
          <Edit3 size={16} />
          <span>Edit Profile</span>
        </button>
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
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            color: '#64748b',
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
              border: '1px solid #e2e8f0',
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
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.25)',
                }}
              >
                {initials}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    {profile.name}
                  </h2>
                  <span
                    style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
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
                    color: '#64748b',
                    fontSize: '0.875rem',
                    marginTop: '0.4rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Mail size={15} color="#94a3b8" />
                    {profile.email}
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Home size={15} color="#94a3b8" />
                    Room {profile.roomNumber || '—'}, {profile.hostelBlock || ''}
                  </span>
                  {profile.hostelName && (
                    <>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Building2 size={15} color="#94a3b8" />
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
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
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
                border: '1px solid #e2e8f0',
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
                  borderBottom: '1px solid #f1f5f9',
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
                  <User size={18} />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Personal Information
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
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
                border: '1px solid #e2e8f0',
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
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: '0.85rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#f5f3ff',
                    color: '#7c3aed',
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
                      color: '#0f172a',
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Academic Information
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
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
                          background: '#f8fafc',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          fontWeight: 700,
                          color: '#1e293b',
                        }}
                      >
                        {profile.universityRollNumber}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
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
                        <BookOpen size={14} color="#64748b" />
                        {profile.branch}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
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
                          background: '#f5f3ff',
                          color: '#6d28d9',
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
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
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
                border: '1px solid #e2e8f0',
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
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: '0.85rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#f0fdf4',
                    color: '#16a34a',
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
                      color: '#0f172a',
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Hostel Information
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
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
                        <Building2 size={14} color="#64748b" />
                        {profile.hostelName}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
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
                        color: '#0f172a',
                        background: '#f8fafc',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      Room {profile.roomNumber}
                    </span>
                  </div>
                </div>

                <div>
                  <span style={labelStyle}>Hostel Block / Wing</span>
                  <div style={valueStyle}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Layers size={14} color="#64748b" />
                      {profile.hostelBlock}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                color: '#4f46e5',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem',
              }}
            >
              1. Personal Information
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
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
          </div>

          {/* Section B: Academic Details */}
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#4f46e5',
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
                color: '#4f46e5',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem',
              }}
            >
              3. Hostel Residence Information
            </div>
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={modalLabelStyle}>Hostel / Hall Name</label>
              <input
                type="text"
                name="hostelName"
                value={formData.hostelName}
                onChange={handleInputChange}
                placeholder="e.g. Aravali Boys Hostel"
                style={modalInputStyle}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
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
              <div>
                <label style={modalLabelStyle}>Hostel Block *</label>
                <input
                  type="text"
                  name="hostelBlock"
                  value={formData.hostelBlock}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Block A"
                  style={modalInputStyle}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '0.75rem',
              borderTop: '1px solid #f1f5f9',
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
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
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
                background: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: editLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 2px rgba(79, 70, 229, 0.2)',
              }}
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
  color: '#64748b',
  display: 'block',
  marginBottom: '0.2rem',
  letterSpacing: '0.04em',
};

const valueStyle = {
  fontSize: '0.925rem',
  fontWeight: 600,
  color: '#0f172a',
};

const modalLabelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#334155',
  marginBottom: '0.35rem',
};

const modalInputStyle = {
  width: '100%',
  padding: '0.65rem 0.75rem',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  fontSize: '0.875rem',
  color: '#0f172a',
  background: '#ffffff',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};
