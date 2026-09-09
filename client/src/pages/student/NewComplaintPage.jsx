import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import complaintService from '../../services/complaintService';
import AppShell from '../../components/AppShell';
import {
  ArrowLeft,
  Zap,
  Droplets,
  Sparkles,
  Armchair,
  Wifi,
  Wrench,
  AlertCircle,
  Link as LinkIcon,
  HelpCircle,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'ELECTRICAL', label: 'Electrical & Lighting', icon: Zap, desc: 'Tube lights, fans, power switches' },
  { value: 'PLUMBING', label: 'Plumbing & Water Supply', icon: Droplets, desc: 'Taps, washrooms, leaks' },
  { value: 'CLEANING', label: 'Cleaning & Washroom Hygiene', icon: Sparkles, desc: 'Room hygiene, corridor, garbage' },
  { value: 'FURNITURE', label: 'Furniture & Carpentry', icon: Armchair, desc: 'Bed, study table, chair, door lock' },
  { value: 'INTERNET', label: 'Internet & WiFi', icon: Wifi, desc: 'LAN ports, hostel Wi-Fi routers' },
  { value: 'OTHER', label: 'Other Maintenance', icon: Wrench, desc: 'General hostel infrastructure' },
];

export default function NewComplaintPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    category: 'ELECTRICAL',
    description: '',
    imageUrl: '',
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

    if (!form.description.trim()) {
      setError('Please provide a detailed description of the complaint.');
      return;
    }

    if (form.description.trim().length < 5) {
      setError('Description must be at least 5 characters long.');
      return;
    }

    setLoading(true);

    try {
      await complaintService.createComplaint({
        category: form.category,
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim() || null,
      });

      navigate('/student/complaints', {
        state: { message: 'Complaint registered successfully! It is now pending review.' },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to submit complaint. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      title="Raise New Complaint"
      subtitle={`Lodged by ${user?.name} for Room ${user?.roomNumber || '—'}, ${user?.hostelBlock || 'Hostel Block'}`}
      actions={
        <Link
          to="/student/complaints"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#64748b',
            fontSize: '0.875rem',
            fontWeight: 600,
            padding: '0.5rem 0.85rem',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Complaints</span>
        </Link>
      }
    >
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        {error && (
          <div
            style={{
              background: '#fff1f2',
              color: '#9f1239',
              border: '1px solid #fecdd3',
              padding: '0.85rem 1rem',
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

        <form onSubmit={handleSubmit}>
          {/* Card 1: Issue Category Selection */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              marginBottom: '1.5rem',
            }}
          >
            <label
              style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#0f172a',
                marginBottom: '0.3rem',
              }}
            >
              Select Maintenance Category *
            </label>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1rem' }}>
              Choose the category that best matches your maintenance requirement.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem',
              }}
            >
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = form.category === cat.value;

                return (
                  <div
                    key={cat.value}
                    onClick={() => setForm({ ...form, category: cat.value })}
                    style={{
                      border: `1.5px solid ${isSelected ? '#4f46e5' : '#e2e8f0'}`,
                      backgroundColor: isSelected ? '#eef2ff' : '#ffffff',
                      borderRadius: '10px',
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '8px',
                          backgroundColor: isSelected ? '#4f46e5' : '#f1f5f9',
                          color: isSelected ? '#ffffff' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: isSelected ? '#3730a3' : '#0f172a',
                        }}
                      >
                        {cat.label}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                      {cat.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Issue Details */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: '#0f172a',
                  }}
                >
                  Problem Description *
                </label>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Min 5 characters
                </span>
              </div>
              <textarea
                name="description"
                rows={5}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the issue in detail. For example: 'The study table tube light in Room A-101 is flickering rapidly and won't turn on properly.'"
                required
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.925rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  lineHeight: 1.5,
                  resize: 'vertical',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4f46e5';
                  e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Optional Photo Attachment URL */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '0.4rem',
                }}
              >
                <LinkIcon size={14} />
                <span>Evidence Image URL</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'normal' }}>
                  (Optional photo link)
                </span>
              </label>
              <input
                type="url"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/... or hosted image URL"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4f46e5';
                  e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Form Action Buttons */}
          <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate('/student/complaints')}
              style={{
                padding: '0.7rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.7rem 1.5rem',
                borderRadius: '8px',
                background: '#4f46e5',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 2px 0 rgba(79, 70, 229, 0.2)',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#4338ca')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#4f46e5')}
            >
              {loading ? 'Submitting...' : 'Register Complaint'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
