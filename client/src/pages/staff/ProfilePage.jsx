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
  Wrench,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Lock,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

const PHONE_REGEX = /^[0-9+\-\s]{7,15}$/;

export default function StaffProfilePage() {
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
  });

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userService.getStaffProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        gender: data.gender || '',
        mobileNumber: data.mobileNumber || '',
      });
    } catch (err) {
      setError('Unable to load staff profile. Please try again.');
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

    if (!formData.name.trim()) {
      setEditError('Staff member name cannot be empty.');
      return;
    }

    if (formData.mobileNumber && !PHONE_REGEX.test(formData.mobileNumber.trim())) {
      setEditError('Please enter a valid mobile number (7-15 digits).');
      return;
    }

    setEditLoading(true);
    try {
      const updated = await userService.updateStaffProfile({
        name: formData.name.trim(),
        gender: formData.gender || null,
        mobileNumber: formData.mobileNumber.trim() || null,
      });

      setProfile(updated);
      updateUser(updated);
      setSuccessMsg('Your staff profile has been successfully updated!');
      setEditModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update staff profile.');
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

  const labelStyle = {
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#6b7280',
    display: 'block',
    marginBottom: '0.35rem',
  };

  const valueStyle = {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#171717',
  };

  return (
    <AppShell
      title="Staff Profile"
      subtitle="View your trade specialization, personal details, and manage account credentials"
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
              e.currentTarget.style.borderColor = '#059669';
              e.currentTarget.style.color = '#059669';
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
            type="button"
            onClick={openEditModal}
            disabled={loading || !profile}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#059669',
              color: '#ffffff',
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              border: 'none',
              boxShadow: '0 1px 2px rgba(5, 150, 105, 0.2)',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#047857')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#059669')}
          >
            <Edit3 size={16} />
            <span>Edit Profile</span>
          </button>
        </div>
      }
    >
      <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '3rem' }}>
        {/* Status Alerts */}
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
              padding: '3.5rem',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              textAlign: 'center',
              color: '#6b7280',
            }}
          >
            Loading staff profile...
          </div>
        ) : profile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header Hero Card */}
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
                    background: '#ecfdf5',
                    color: '#059669',
                    border: '1.5px solid #a7f3d0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                  }}
                >
                  <Wrench size={32} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#171717', margin: 0 }}>
                    {profile.name}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem' }}>
                    <span
                      style={{
                        background: '#ecfdf5',
                        color: '#047857',
                        border: '1px solid #a7f3d0',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.65rem',
                        borderRadius: '9999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <Wrench size={13} />
                      {profile.staffCategory || 'Maintenance Specialist'}
                    </span>
                    <span
                      style={{
                        background: '#f3f4f6',
                        color: '#374151',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                      }}
                    >
                      Active Technician
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid: 2 Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {/* Card 1: Contact Details */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
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
                      background: '#ecfdf5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <User size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#171717', margin: 0 }}>
                      Personal &amp; Contact Details
                    </h3>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div>
                    <span style={labelStyle}>Full Name</span>
                    <div style={valueStyle}>{profile.name}</div>
                  </div>
                  <div>
                    <span style={labelStyle}>Email Address</span>
                    <div style={valueStyle}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Mail size={14} color="#64748b" />
                        {profile.email}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span style={labelStyle}>Mobile Phone</span>
                    <div style={valueStyle}>
                      {profile.mobileNumber ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Phone size={14} color="#64748b" />
                          {profile.mobileNumber}
                        </span>
                      ) : (
                        <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                          Not provided (Click Edit Profile to add)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Trade & Membership */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
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
                      background: '#ecfdf5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Wrench size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#171717', margin: 0 }}>
                      Trade &amp; Service Role
                    </h3>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div>
                    <span style={labelStyle}>Assigned Trade Category</span>
                    <div style={valueStyle}>
                      {profile.staffCategory || 'Maintenance'}
                    </div>
                  </div>
                  <div>
                    <span style={labelStyle}>Service Duty</span>
                    <div style={{ ...valueStyle, fontSize: '0.85rem', color: '#374151', lineHeight: 1.5 }}>
                      Resolves assigned complaints across campus hostels and provides completion proof photos upon task resolution.
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
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#ecfdf5',
                    color: '#059669',
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
                    Staff account password is encrypted with bcrypt. Keep your credentials secure.
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
                  e.currentTarget.style.borderColor = '#059669';
                  e.currentTarget.style.color = '#059669';
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
        ) : null}

        {/* Change Password Modal */}
        <ChangePasswordModal
          isOpen={changePasswordOpen}
          onClose={() => setChangePasswordOpen(false)}
        />

        {/* Edit Staff Profile Modal */}
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Edit Staff Profile"
          subtitle="Update your contact mobile number and details"
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
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
              }}
            >
              <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
              <span>{editError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                  Contact Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. 9876543210"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '1.5rem',
                borderTop: '1px solid #f3f4f6',
                paddingTop: '1rem',
              }}
            >
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                disabled={editLoading}
                style={{
                  padding: '0.6rem 1.1rem',
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
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#059669',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: editLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {editLoading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
