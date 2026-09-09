import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import complaintService from '../../services/complaintService';
import AppShell from '../../components/AppShell';
import StatusBadge from '../../components/StatusBadge';
import CategoryBadge from '../../components/CategoryBadge';
import StatusTimeline from '../../components/StatusTimeline';
import {
  ArrowLeft,
  CheckCircle2,
  PlayCircle,
  AlertCircle,
  Home,
  User,
  ExternalLink,
  Wrench,
} from 'lucide-react';

export default function StaffComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  return (
    <AppShell
      title={complaint ? `Work Order #${complaint.id.slice(-6).toUpperCase()}` : 'Task Details'}
      subtitle={
        complaint
          ? `Assigned to ${user?.name} (${user?.staffCategory || 'Technician'}) • Room ${complaint.student?.roomNumber}, ${complaint.student?.hostelBlock}`
          : ''
      }
      actions={
        <Link
          to="/staff/complaints"
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
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '3rem',
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            Loading task details...
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
            Task record not found.
          </div>
        ) : (
          <div>
            {/* ── Action Control Panel ──────────────────────────────────────── */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
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
                <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
                  Maintenance Duty Actions
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.15rem' }}>
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
                      boxShadow: '0 1px 2px rgba(2, 132, 199, 0.2)',
                    }}
                  >
                    <PlayCircle size={16} />
                    <span>{actionLoading ? 'Updating...' : 'Start Work (In Progress)'}</span>
                  </button>
                )}

                {complaint.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleUpdateStatus('RESOLVED')}
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
                      boxShadow: '0 1px 2px rgba(5, 150, 105, 0.2)',
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>{actionLoading ? 'Updating...' : 'Mark as Resolved'}</span>
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
                    <span>Resolved & Awaiting Warden Closure</span>
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
                    <span>Closed & Verified</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Main Details Card ────────────────────────────────────────── */}
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
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  TICKET #{complaint.id.toUpperCase()}
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
                    color: '#64748b',
                    marginBottom: '0.5rem',
                  }}
                >
                  Maintenance Issue Details
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

              {/* Evidence Photo if present */}
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
                    Attached Photo
                  </h4>
                  <a
                    href={complaint.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#059669',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      background: '#ecfdf5',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #a7f3d0',
                    }}
                  >
                    <span>View Evidence Photo</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}

              {/* Location & Resident Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#047857', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                    Target Room
                  </span>
                  <div style={{ fontWeight: 700, color: '#065f46', fontSize: '1.1rem', marginTop: '0.15rem' }}>
                    Room {complaint.student?.roomNumber}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#047857' }}>
                    {complaint.student?.hostelBlock}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#047857', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                    Resident Name
                  </span>
                  <div style={{ fontWeight: 600, color: '#065f46', marginTop: '0.15rem' }}>
                    {complaint.student?.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#047857' }}>
                    {complaint.student?.email}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#047857', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                    Date Registered
                  </span>
                  <div style={{ fontWeight: 600, color: '#065f46', marginTop: '0.15rem' }}>
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#047857' }}>
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
    </AppShell>
  );
}
