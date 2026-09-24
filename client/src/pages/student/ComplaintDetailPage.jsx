import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import complaintService from '../../services/complaintService';
import AppShell from '../../components/AppShell';
import StatusBadge from '../../components/StatusBadge';
import CategoryBadge from '../../components/CategoryBadge';
import StatusTimeline from '../../components/StatusTimeline';
import ImagePreviewModal from '../../components/ImagePreviewModal';
import {
  ArrowLeft,
  Clock,
  User,
  Home,
  AlertCircle,
  ExternalLink,
  Wrench,
  FileText,
  CheckCircle2,
  ZoomIn,
} from 'lucide-react';

export default function StudentComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewModal, setPreviewModal] = useState({ open: false, src: '', title: '' });

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await complaintService.getComplaintById(id);
        setComplaint(data);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Unable to load complaint details.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const dateStr = complaint
    ? new Date(complaint.createdAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '';

  return (
    <AppShell
      title={complaint ? `Ticket #${complaint.id.slice(-6).toUpperCase()}` : 'Complaint Detail'}
      subtitle={complaint ? `Submitted on ${dateStr}` : ''}
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
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
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
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '3rem',
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            Loading complaint details...
          </div>
        ) : !complaint ? (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '3rem',
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            Complaint record not found.
          </div>
        ) : (
          <div>
            {/* Overview Card */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
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
                  borderBottom: '1px solid #f1f5f9',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CategoryBadge category={complaint.category} />
                  <StatusBadge status={complaint.status} />
                </div>

                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  ID: #{complaint.id.toUpperCase()}
                </div>
              </div>

              {/* Rejection Notice if REJECTED */}
              {complaint.status === 'REJECTED' && complaint.rejectionReason && (
                <div
                  style={{
                    background: '#fff1f2',
                    border: '1px solid #fecdd3',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1.25rem',
                    color: '#9f1239',
                  }}
                >
                  <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
                    ⚠️ Official Rejection Reason from Warden:
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {complaint.rejectionReason}
                  </p>
                </div>
              )}

              {/* Description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#64748b',
                    marginBottom: '0.5rem',
                  }}
                >
                  Issue Description
                </h4>
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '1rem 1.25rem',
                    color: '#0f172a',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                  }}
                >
                  {complaint.description}
                </div>
              </div>

              {/* Attached Issue Photo */}
              {complaint.imageUrl && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#64748b',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Attached Issue Photo
                  </h4>
                  <div
                    onClick={() =>
                      setPreviewModal({
                        open: true,
                        src: complaint.imageUrl,
                        title: 'Attached Issue Photo',
                      })
                    }
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.65rem 1rem',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
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
                        border: '1px solid #e2e8f0',
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>Inspect Issue Photo</span>
                        <ZoomIn size={14} color="#64748b" />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Click to view full size</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Work Completion Proof (Visible upon Resolution / Closure) */}
              {(complaint.completionPhotoUrl || complaint.status === 'RESOLVED' || complaint.status === 'CLOSED') && (
                <div
                  style={{
                    marginBottom: '1.5rem',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '10px',
                    padding: '1.25rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      color: '#15803d',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '0.65rem',
                    }}
                  >
                    <CheckCircle2 size={18} />
                    <span>Work Completion Proof &amp; Resolution Note</span>
                  </div>

                  {/* Resolution Note from Staff */}
                  {(() => {
                    const resolveLog = complaint.statusLogs?.find((l) => l.newStatus === 'RESOLVED');
                    return resolveLog?.note ? (
                      <p style={{ margin: '0 0 0.85rem', fontSize: '0.9rem', color: '#166534', lineHeight: 1.5 }}>
                        <strong>Staff Note:</strong> &ldquo;{resolveLog.note}&rdquo;
                      </p>
                    ) : null;
                  })()}

                  {complaint.completionPhotoUrl ? (
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
                        padding: '0.6rem 0.95rem',
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
                          <span>View Work Completion Photo</span>
                          <ZoomIn size={14} color="#15803d" />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#15803d' }}>Verified by maintenance technician</span>
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>No completion photo was attached.</span>
                  )}
                </div>
              )}

              {/* Metadata Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                    Location
                  </span>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '0.15rem' }}>
                    Room {complaint.student?.roomNumber}
                  </div>
                  {complaint.student?.hostelName && (
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {complaint.student.hostelName}
                    </div>
                  )}
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                    Assigned Maintenance Staff
                  </span>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '0.15rem' }}>
                    {complaint.assignedStaff ? complaint.assignedStaff.name : 'Pending assignment'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {complaint.assignedStaff ? complaint.assignedStaff.staffCategory || 'Maintenance' : 'Warden review required'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                    Submitted By
                  </span>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '0.15rem' }}>
                    {complaint.student?.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {complaint.student?.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Timeline Component with visual stepper */}
            <StatusTimeline logs={complaint.statusLogs} currentStatus={complaint.status} />
          </div>
        )}
      </div>

      <ImagePreviewModal
        isOpen={previewModal.open}
        src={previewModal.src}
        title={previewModal.title}
        onClose={() => setPreviewModal({ open: false, src: '', title: '' })}
      />
    </AppShell>
  );
}
