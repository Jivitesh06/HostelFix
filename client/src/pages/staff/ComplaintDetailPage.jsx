import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import complaintService from '../../services/complaintService';
import AppShell from '../../components/AppShell';
import StatusBadge from '../../components/StatusBadge';
import CategoryBadge from '../../components/CategoryBadge';
import StatusTimeline from '../../components/StatusTimeline';
import Modal from '../../components/Modal';
import ImageUpload from '../../components/ImageUpload';
import ImagePreviewModal from '../../components/ImagePreviewModal';
import {
  ArrowLeft,
  CheckCircle2,
  PlayCircle,
  AlertCircle,
  Home,
  User,
  ExternalLink,
  Wrench,
  Camera,
  ZoomIn,
} from 'lucide-react';

export default function StaffComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Resolve Modal & Completion Photo State
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [completionPhotoUrl, setCompletionPhotoUrl] = useState('');
  const [completionNote, setCompletionNote] = useState('');
  const [resolveError, setResolveError] = useState('');

  // Lightbox Preview Modal
  const [previewModal, setPreviewModal] = useState({ open: false, src: '', title: '' });

  const loadDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await complaintService.getComplaintById(id);
      setComplaint(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load task details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const handleUpdateStatus = async (nextStatus) => {
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await complaintService.updateComplaintStatus(id, nextStatus);
      setSuccessMsg(`Work status successfully updated to: ${nextStatus}`);
      await loadDetail();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to update status to ${nextStatus}.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!completionPhotoUrl) {
      setResolveError('Please upload a completion photo before marking this complaint as resolved.');
      return;
    }

    setActionLoading(true);
    setResolveError('');
    try {
      await complaintService.updateComplaintStatus(id, {
        status: 'RESOLVED',
        completionPhotoUrl,
        note: completionNote.trim() || 'Work completed and verified by maintenance staff',
      });
      setSuccessMsg('Work order marked as RESOLVED with proof photo!');
      setResolveModalOpen(false);
      await loadDetail();
    } catch (err) {
      setResolveError(err.response?.data?.message || 'Failed to mark task as resolved.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AppShell
      title={complaint ? `Work Order #${complaint.id.slice(-6).toUpperCase()}` : 'Task Details'}
      subtitle={
        complaint
          ? `Assigned to ${user?.name} (${user?.staffCategory || 'Technician'}) • Room ${complaint.student?.roomNumber}${complaint.student?.hostelName ? ` • ${complaint.student.hostelName}` : ''}`
          : ''
      }
      actions={
        <Link
          to="/staff/complaints"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#6b7280',
            fontSize: '0.875rem',
            fontWeight: 600,
            padding: '0.5rem 0.85rem',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            background: '#ffffff',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to My Tasks</span>
        </Link>
      }
    >
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
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

        {loading ? (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '3rem',
              textAlign: 'center',
              color: '#6b7280',
            }}
          >
            Loading task details...
          </div>
        ) : !complaint ? (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '3rem',
              textAlign: 'center',
              color: '#6b7280',
            }}
          >
            Task record not found.
          </div>
        ) : (
          <div>
            {/* ── Action Control Panel ──────────────────────────────────────── */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em' }}>
                  Maintenance Duty Actions
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#171717', marginTop: '0.15rem' }}>
                  Current Status: <span style={{ color: '#059669' }}>{complaint.status}</span>
                </div>
              </div>

              {/* Status transition buttons */}
              <div>
                {complaint.status === 'ASSIGNED' && (
                  <button
                    onClick={() => handleUpdateStatus('IN_PROGRESS')}
                    disabled={actionLoading}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      background: '#0284c7',
                      color: '#ffffff',
                      padding: '0.65rem 1.35rem',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      boxShadow: '0 1px 2px rgba(2, 132, 199, 0.2)',
                    }}
                  >
                    <PlayCircle size={16} />
                    <span>{actionLoading ? 'Updating...' : 'Start Work (In Progress)'}</span>
                  </button>
                )}

                {complaint.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => {
                      setCompletionPhotoUrl('');
                      setCompletionNote('Work completed and fan/appliance repaired.');
                      setResolveError('');
                      setResolveModalOpen(true);
                    }}
                    disabled={actionLoading}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      background: '#059669',
                      color: '#ffffff',
                      padding: '0.65rem 1.35rem',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      boxShadow: '0 1px 2px rgba(5, 150, 105, 0.2)',
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Mark as Resolved</span>
                  </button>
                )}

                {complaint.status === 'RESOLVED' && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#059669',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircle2 size={18} />
                    <span>Work Completed — Awaiting Warden Final Closure</span>
                  </div>
                )}

                {complaint.status === 'CLOSED' && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#64748b',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircle2 size={18} />
                    <span>Case Verified & Closed</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Main Details Card ────────────────────────────────────────── */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                padding: '1.75rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                marginBottom: '1.5rem',
              }}
            >
              {/* Header Badges */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  paddingBottom: '1.25rem',
                  borderBottom: '1px solid #f3f4f6',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CategoryBadge category={complaint.category} />
                  <StatusBadge status={complaint.status} />
                </div>
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                  Work Order ID: #{complaint.id.toUpperCase()}
                </span>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#6b7280',
                    marginBottom: '0.5rem',
                  }}
                >
                  Maintenance Issue Details
                </h4>
                <div
                  style={{
                    background: '#f8f8f8',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '1rem 1.25rem',
                    color: '#171717',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                  }}
                >
                  {complaint.description}
                </div>
              </div>

              {/* Evidence Photo if present */}
              {complaint.imageUrl && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#6b7280',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Student Attached Issue Photo
                  </h4>
                  <div
                    onClick={() =>
                      setPreviewModal({
                        open: true,
                        src: complaint.imageUrl,
                        title: 'Student Issue Photo',
                      })
                    }
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.65rem 1rem',
                      background: '#f8f8f8',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    <img
                      src={complaint.imageUrl}
                      alt="Issue Photo"
                      style={{
                        width: '48px',
                        height: '48px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb',
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#171717', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>Inspect Issue Photo</span>
                        <ZoomIn size={14} color="#6b7280" />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Click to view full size</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Work Completion Photo if already resolved */}
              {complaint.completionPhotoUrl && (
                <div
                  style={{
                    marginBottom: '1.5rem',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '1rem',
                  }}
                >
                  <h4
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#15803d',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Uploaded Work Completion Proof</span>
                  </h4>
                  <div
                    onClick={() =>
                      setPreviewModal({
                        open: true,
                        src: complaint.completionPhotoUrl,
                        title: 'Work Completion Photo',
                      })
                    }
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.5rem 0.85rem',
                      background: '#ffffff',
                      border: '1px solid #86efac',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    <img
                      src={complaint.completionPhotoUrl}
                      alt="Completion Photo"
                      style={{
                        width: '54px',
                        height: '54px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        border: '1px solid #bbf7d0',
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>Completion Proof Photo</span>
                        <ZoomIn size={14} color="#15803d" />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#15803d' }}>Verified by maintenance worker</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Location & Resident Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  background: '#f8f8f8',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                    Target Room
                  </span>
                  <div style={{ fontWeight: 700, color: '#171717', fontSize: '1.1rem', marginTop: '0.15rem' }}>
                    Room {complaint.student?.roomNumber}
                  </div>
                  {complaint.student?.hostelName && (
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      {complaint.student.hostelName}
                    </div>
                  )}
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                    Resident Name
                  </span>
                  <div style={{ fontWeight: 600, color: '#171717', marginTop: '0.15rem' }}>
                    {complaint.student?.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    {complaint.student?.email}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                    Date Registered
                  </span>
                  <div style={{ fontWeight: 600, color: '#171717', marginTop: '0.15rem' }}>
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    {new Date(complaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Timeline Component with visual stepper */}
            <StatusTimeline logs={complaint.statusLogs} currentStatus={complaint.status} />
          </div>
        )}
      </div>

      {/* ── Resolve Modal with Completion Photo Requirement ───────────────── */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => !actionLoading && setResolveModalOpen(false)}
        title="Mark Complaint as Resolved"
      >
        <form onSubmit={handleResolveSubmit}>
          <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.5 }}>
            To mark this task as resolved, please upload a photo proving the work has been completed
            and enter a brief completion note for the student and warden.
          </p>

          {resolveError && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={16} color="#dc2626" />
              <span>{resolveError}</span>
            </div>
          )}

          <div style={{ marginBottom: '1.25rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#171717',
                marginBottom: '0.4rem',
              }}
            >
              Completion Note
            </label>
            <textarea
              rows={3}
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              placeholder="e.g. Replaced faulty capacitor and checked speed regulator"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <ImageUpload
            label="Work Completion Photo"
            folder="complaints/completions"
            value={completionPhotoUrl}
            onChange={({ url }) => {
              setCompletionPhotoUrl(url);
              if (resolveError) setResolveError('');
            }}
            required={true}
            helpText="Photo proof of completed maintenance work (Required, JPG/PNG/WEBP up to 5MB)"
          />

          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end',
              marginTop: '1.5rem',
              borderTop: '1px solid #f3f4f6',
              paddingTop: '1rem',
            }}
          >
            <button
              type="button"
              onClick={() => setResolveModalOpen(false)}
              disabled={actionLoading}
              style={{
                padding: '0.65rem 1.25rem',
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
              disabled={actionLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.35rem',
                borderRadius: '8px',
                border: 'none',
                background: '#c8102e',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: actionLoading ? 'wait' : 'pointer',
                boxShadow: '0 1px 2px rgba(200, 16, 46, 0.2)',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{actionLoading ? 'Uploading & Resolving...' : 'Confirm Resolved'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Lightbox Zoom Modal */}
      <ImagePreviewModal
        isOpen={previewModal.open}
        src={previewModal.src}
        title={previewModal.title}
        onClose={() => setPreviewModal({ open: false, src: '', title: '' })}
      />
    </AppShell>
  );
}
