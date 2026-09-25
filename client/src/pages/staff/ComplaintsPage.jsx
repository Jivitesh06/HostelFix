import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import complaintService from '../../services/complaintService';
import AppShell from '../../components/AppShell';
import StatusBadge from '../../components/StatusBadge';
import CategoryBadge from '../../components/CategoryBadge';
import EmptyState from '../../components/EmptyState';
import {
  Wrench,
  Clock,
  Home,
  User,
  ArrowRight,
  Filter,
  AlertCircle,
} from 'lucide-react';

const STATUS_FILTERS = [
  { label: 'All Tasks', value: '' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved', value: 'RESOLVED' },
];

export default function StaffComplaints() {
  const { user } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComplaints = async (statusFilter = '') => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await complaintService.getComplaints(params);
      setComplaints(data);
    } catch (err) {
      setError('Unable to load assigned complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(selectedStatus);
  }, [selectedStatus]);

  return (
    <AppShell
      title="My Maintenance Work Tasks"
      subtitle={`Assigned to ${user?.name} (${user?.staffCategory || 'Maintenance'}) • Dispatch Queue`}
    >
      {/* ── Filter Bar ──────────────────────────────────────────────── */}
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
            color: '#64748b',
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
                cursor: 'pointer',
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

      {/* ── Main Task List ────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ background: '#ffffff', padding: '3.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center', color: '#6b7280' }}>
          Loading assigned work tasks...
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title={selectedStatus ? `No ${selectedStatus.toLowerCase()} tasks` : 'No maintenance tasks assigned'}
          description={
            selectedStatus
              ? `You have no tasks matching status: ${selectedStatus}.`
              : 'You do not have any complaints currently assigned to your queue.'
          }
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
                }}
              >
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

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.3rem' }}>
                    WORK ORDER #{c.id.slice(-6).toUpperCase()}
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

                {/* Footer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid #f3f4f6',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#374151' }}>
                    <Home size={15} color="#64748b" />
                    <span>
                      Room <strong>{c.student?.roomNumber}</strong> &bull; Resident: {c.student?.name}
                    </span>
                  </div>

                  <Link
                    to={`/staff/complaints/${c.id}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: '#fdecef',
                      color: '#c8102e',
                      border: '1px solid #fecdd3',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#c8102e';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fdecef';
                      e.currentTarget.style.color = '#c8102e';
                    }}
                  >
                    <span>Update Work Status</span>
                    <ArrowRight size={13} />
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
