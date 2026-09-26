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
  Building2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Shield,
  Briefcase,
  Lock,
  KeyRound,
} from 'lucide-react';
import { getHostelsByGender } from '../../constants/hostelConfig';

const PHONE_REGEX = /^[0-9+\-\s]{7,15}$/;

export default function WardenProfilePage() {
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
    hostelName: '',
  });

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userService.getWardenProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        gender: data.gender || '',
        mobileNumber: data.mobileNumber || '',
        hostelName: data.hostelName || '',
      });
    } catch (err) {
      setError('Unable to load warden profile. Please try again.');
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
        hostelName: profile.hostelName || '',
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

    if (!formData.name.trim()) {
      setEditError('Full name cannot be empty.');
      return;
    }
    if (formData.mobileNumber.trim() && !PHONE_REGEX.test(formData.mobileNumber.trim())) {
      setEditError('Please enter a valid mobile number (7-15 numeric digits).');
      return;
    }

    setEditLoading(true);
    try {
      const updated = await userService.updateWardenProfile({
        name: formData.name.trim(),
        gender: formData.gender || null,
        mobileNumber: formData.mobileNumber.trim() || null,
        hostelName: formData.hostelName.trim() || null,
      });

      setProfile(updated);
      if (updateUser) {
        updateUser({
          ...authUser,
          ...updated,
        });
      }
      setSuccessMsg('Your warden profile has been updated successfully!');
      setEditModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update warden profile. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <AppShell
      title="Warden Profile"
      subtitle="View administrative jurisdiction, contact info, and manage your account credentials"
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
      <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '3rem' }}>
        {/* Alerts */}
        {successMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              padding: '0.9rem 1.25rem',
              borderRadius: '10px',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            <CheckCircle2 size={18} color="#059669" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '0.9rem 1.25rem',
              borderRadius: '10px',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            <AlertCircle size={18} color="#dc2626" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '3rem',
              textAlign: 'center',
              color: '#64748b',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ fontSize: '1rem', fontWeight: 500 }}>Loading warden profile...</div>
          </div>
        ) : profile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header Hero Banner */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderTop: '3px solid #c8102e',
                borderRadius: '12px',
                padding: '1.75rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.25rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#fdecef',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#c8102e',
                    border: '2px solid #fecdd3',
                    textTransform: 'uppercase',
                  }}
                >
                  {profile.name?.charAt(0) || 'W'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#171717' }}>
                      {profile.name}
                    </h2>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.75rem',
                        background: '#fdecef',
                        color: '#c8102e',
                        padding: '0.2rem 0.65rem',
                        borderRadius: '9999px',
                        fontWeight: 600,
                        border: '1px solid #fecdd3',
                      }}
                    >
                      <Shield size={13} />
                      Hostel Warden
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
                      <Building2 size={15} color="#9ca3af" />
                      Assigned to: <strong style={{ color: '#171717' }}>{profile.hostelName || 'Unassigned'}</strong>
                    </span>
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
                    background: '#c8102e',
                    border: 'none',
                    color: '#ffffff',
                    padding: '0.6rem 1.15rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(200, 16, 46, 0.2)',
                  }}
                >
                  <Edit3 size={15} />
                  <span>Update Profile</span>
                </button>
              </div>
            </div>

            {/* Information Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {/* Card 1: Warden Personal Information */}
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
                    borderBottom: '1px solid #f3f4f6',
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
                      Personal Details
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Official warden profile & contact
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
                          {profile.gender === 'MALE' ? 'Male (Boys Hostels Warden)' : profile.gender === 'FEMALE' ? 'Female (Girls Hostels Warden)' : profile.gender}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                          Not specified (Click Update Profile to select)
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span style={labelStyle}>Official Email</span>
                    <div
                      style={{
                        ...valueStyle,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
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
                    <span style={labelStyle}>Contact Mobile Number</span>
                    <div style={valueStyle}>
                      {profile.mobileNumber ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Phone size={14} color="#64748b" />
                          {profile.mobileNumber}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                          Not provided (Click Update Profile to add)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Hostel Assignment & Jurisdiction */}
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
                    borderBottom: '1px solid #f3f4f6',
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
                    <Building2 size={18} />
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
                      Hostel Jurisdiction
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      Assigned hostel and complaint scope
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', flex: 1 }}>
                  <div>
                    <span style={labelStyle}>Assigned Hostel</span>
                    <div style={valueStyle}>
                      {profile.hostelName ? (
                        <span
                          style={{
                            fontWeight: 700,
                            color: '#171717',
                            background: '#f8f8f8',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                          }}
                        >
                          <Building2 size={16} color="#c8102e" />
                          {profile.hostelName}
                        </span>
                      ) : (
                        <span style={{ color: '#dc2626', fontWeight: 600 }}>
                          No hostel assigned. You will not see student complaints until assigned to a hostel.
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span style={labelStyle}>Scope of Authority</span>
                    <div style={{ ...valueStyle, fontSize: '0.85rem', color: '#374151', lineHeight: 1.5 }}>
                      You receive, review, approve, and resolve complaints submitted by students living in{' '}
                      <strong>{profile.hostelName || 'your assigned hostel'}</strong>. Complaints from other hostels are isolated.
                    </div>
                  </div>

                  <div>
                    <span style={labelStyle}>Administrative Role</span>
                    <div style={valueStyle}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Briefcase size={14} color="#64748b" />
                        Hostel Authority & Approver
                      </span>
                    </div>
                  </div>

                  <div>
                    <span style={labelStyle}>Staff Member Since</span>
                    <div style={valueStyle}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={14} color="#64748b" />
                        {memberSince}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Account Security & Password */}
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
                  marginTop: '1.5rem',
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
                      Administrative account password is encrypted with bcrypt. Keep your credentials secure.
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
        ) : null}

        {/* Change Password Modal */}
        <ChangePasswordModal
          isOpen={changePasswordOpen}
          onClose={() => setChangePasswordOpen(false)}
        />

        {/* Edit Warden Profile Modal */}
        <Modal
          isOpen={editModalOpen}
          onClose={() => !editLoading && setEditModalOpen(false)}
          title="Update Warden Profile"
        >
          {editError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.85rem',
              }}
            >
              <AlertCircle size={16} color="#dc2626" />
              <span>{editError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div>
                <label style={modalLabelStyle}>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Dr. Rajesh Kumar"
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
              <label style={modalLabelStyle}>Contact Mobile Number</label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                placeholder="e.g. 9876543210"
                style={modalInputStyle}
              />
            </div>

            <div>
              <label style={modalLabelStyle}>
                Assigned Hostel {formData.gender ? `(${formData.gender === 'MALE' ? 'Boys Hostels' : 'Girls Hostels'})` : ''} *
              </label>
              <select
                name="hostelName"
                value={formData.hostelName}
                onChange={handleInputChange}
                style={modalInputStyle}
                required
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
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', marginBottom: 0 }}>
                  Select gender above to filter available hostels for warden assignment.
                </p>
              )}
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
                  gap: '0.5rem',
                  padding: '0.625rem 1.35rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#c8102e',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: editLoading ? 0.7 : 1,
                }}
              >
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: '0.25rem',
};

const valueStyle = {
  fontSize: '0.95rem',
  fontWeight: 600,
  color: '#171717',
};

const modalLabelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#171717',
  marginBottom: '0.35rem',
};

const modalInputStyle = {
  width: '100%',
  padding: '0.6rem 0.8rem',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '0.875rem',
  color: '#171717',
  background: '#ffffff',
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: 'inherit',
};
