import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import complaintService from '../../services/complaintService';
import AppShell from '../../components/AppShell';
import StatusBadge from '../../components/StatusBadge';
import CategoryBadge from '../../components/CategoryBadge';
import StatusTimeline from '../../components/StatusTimeline';
import {
  ArrowLeft,
  Clock,
  User,
  Home,
  AlertCircle,
  ExternalLink,
  Wrench,
  FileText,
} from 'lucide-react';

export default function StudentComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

              {/* Attached Evidence Link */}
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
                    Attached Evidence Photo
                  </h4>
                  <a
                    href={complaint.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#4f46e5',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      background: '#eef2ff',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #c7d2fe',
                    }}
                  >
                    <span>View Attached Image</span>
                    <ExternalLink size={14} />
                  </a>
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
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {complaint.student?.hostelBlock}
                  </div>
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
    </AppShell>
  );
}
