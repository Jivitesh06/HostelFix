import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import complaintService from '../../services/complaintService';
import AppShell from '../../components/AppShell';
import StatusBadge from '../../components/StatusBadge';
import CategoryBadge from '../../components/CategoryBadge';
import EmptyState from '../../components/EmptyState';
import {
  PlusCircle,
  Clock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Filter,
} from 'lucide-react';

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved', value: 'RESOLVED' },
  { label: 'Closed', value: 'CLOSED' },
  { label: 'Rejected', value: 'REJECTED' },
];

export default function StudentComplaints() {
  const { user } = useAuth();
  const location = useLocation();

  const [complaints, setComplaints] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bannerMsg, setBannerMsg] = useState(location.state?.message || '');

  const fetchComplaints = async (statusFilter = '') => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await complaintService.getComplaints(params);
      setComplaints(data);
    } catch (err) {
      setError('Unable to load complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(selectedStatus);
  }, [selectedStatus]);

  return (
    <AppShell
      title="My Maintenance Complaints"
      subtitle={`Track status, assigned staff, and resolution history for Room ${user?.roomNumber || '—'}`}
      actions={
        <Link
          to="/student/complaints/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            backgroundColor: '#c8102e',
            color: '#ffffff',
            padding: '0.6rem 1.15rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            boxShadow: '0 1px 2px rgba(200, 16, 46, 0.2)',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#a50d25')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#c8102e')}
        >
          <PlusCircle size={16} />
          <span>Raise Complaint</span>
        </Link>
      }
    >
      {/* Success banner from redirect */}
      {bannerMsg && (
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
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={18} color="#059669" />
            <span>{bannerMsg}</span>
          </div>
          <button
            onClick={() => setBannerMsg('')}
            style={{ color: '#059669', fontSize: '1rem', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '1.75rem',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginRight: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          <Filter size={14} /> Filter:
        </span>

        {STATUS_FILTERS.map((f) => {
          const isActive = selectedStatus === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setSelectedStatus(f.value)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: isActive ? 600 : 500,
                backgroundColor: isActive ? '#c8102e' : '#ffffff',
                color: isActive ? '#ffffff' : '#374151',
                border: `1px solid ${isActive ? '#c8102e' : '#e5e7eb'}`,
                boxShadow: isActive ? '0 1px 2px rgba(200, 16, 46, 0.2)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

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

      {/* Main Content List */}
      {loading ? (
        <div style={{ background: '#ffffff', padding: '3.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center', color: '#6b7280' }}>
          Loading your complaints catalog...
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          title={selectedStatus ? `No ${selectedStatus.toLowerCase()} complaints` : 'No complaints submitted yet'}
          description={
            selectedStatus
              ? `You do not have any complaints matching status: ${selectedStatus}.`
              : 'Whenever an issue occurs in your room or common area, report it here.'
          }
          actionLabel="+ Raise New Complaint"
          onAction={() => (window.location.href = '/student/complaints/new')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {complaints.map((c) => {
            const dateStr = new Date(c.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={c.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    marginBottom: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CategoryBadge category={c.category} />
                    <StatusBadge status={c.status} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#6b7280' }}>
                    <Clock size={13} />
                    <span>Submitted on {dateStr}</span>
                  </div>
                </div>

                {/* Complaint ID & Description */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.3rem' }}>
                    TICKET #{c.id.slice(-6).toUpperCase()}
                  </div>
                  <p
                    style={{
                      fontSize: '0.95rem',
                      color: '#171717',
                      lineHeight: 1.55,
                      margin: 0,
                    }}
                  >
                    {c.description}
                  </p>
                </div>

                {/* Rejection alert if REJECTED */}
                {c.status === 'REJECTED' && c.rejectionReason && (
                  <div
                    style={{
                      background: '#fff1f2',
                      border: '1px solid #fecdd3',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      marginBottom: '1rem',
                      fontSize: '0.85rem',
                      color: '#9f1239',
                    }}
                  >
                    <strong>Warden Rejection Reason:</strong> {c.rejectionReason}
                  </div>
                )}

                {/* Card footer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid #e5e7eb',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
                    <User size={15} color="#9ca3af" />
                    {c.assignedStaff ? (
                      <span>
                        Assigned to: <strong style={{ color: '#171717' }}>{c.assignedStaff.name}</strong> ({c.assignedStaff.staffCategory || 'Maintenance'})
                      </span>
                    ) : (
                      <span style={{ fontStyle: 'italic', color: '#6b7280' }}>Staff: Pending assignment</span>
                    )}
                  </div>

                  <Link
                    to={`/student/complaints/${c.id}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: '#c8102e',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#a50d25')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#c8102e')}
                  >
                    <span>View Status Timeline</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
