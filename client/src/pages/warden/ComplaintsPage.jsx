import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import complaintService from '../../services/complaintService';
import AppShell from '../../components/AppShell';
import StatusBadge from '../../components/StatusBadge';
import CategoryBadge from '../../components/CategoryBadge';
import EmptyState from '../../components/EmptyState';
import {
  ClipboardList,
  Filter,
  ArrowRight,
  User,
  Clock,
  AlertCircle,
  Building,
  CheckCircle2,
  Search,
} from 'lucide-react';

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending Review', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved', value: 'RESOLVED' },
  { label: 'Closed', value: 'CLOSED' },
  { label: 'Rejected', value: 'REJECTED' },
];

export default function WardenComplaints() {
  const { user } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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
      setError('Unable to load complaints list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(selectedStatus);
  }, [selectedStatus]);

  // Client-side search filter for resident or description
  const filteredComplaints = complaints.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.description.toLowerCase().includes(q) ||
      c.student?.name?.toLowerCase().includes(q) ||
      c.student?.roomNumber?.toLowerCase().includes(q) ||
      c.student?.hostelBlock?.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  });

  return (
    <AppShell
      title="Hostel Complaints Registry"
      subtitle="Complete database of all resident maintenance requests, status transitions, and staff assignments"
    >
      {/* ── Filter Controls & Search Bar ──────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Status Filter Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
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
                  backgroundColor: isActive ? '#4f46e5' : '#ffffff',
                  color: isActive ? '#ffffff' : '#475569',
                  border: `1px solid ${isActive ? '#4f46e5' : '#e2e8f0'}`,
                  boxShadow: isActive ? '0 1px 2px rgba(79, 70, 229, 0.2)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Quick Search */}
        <div style={{ position: 'relative', width: '260px' }}>
          <div
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search size={14} />
          </div>
          <input
            type="text"
            placeholder="Search student or issue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem 0.45rem 2rem',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.85rem',
              outline: 'none',
              background: '#ffffff',
            }}
          />
        </div>
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

      {/* ── Complaints Admin Data Table ───────────────────────────────── */}
      {loading ? (
        <div style={{ background: '#ffffff', padding: '3.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
          Loading complaints catalog...
        </div>
      ) : filteredComplaints.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={selectedStatus ? `No ${selectedStatus.toLowerCase()} complaints found` : 'No complaints recorded'}
          description={
            selectedStatus
              ? `There are no complaints currently with status: ${selectedStatus}.`
              : 'There are currently no complaints registered in the system.'
          }
        />
      ) : (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            overflowX: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '940px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={thStyle}>Ticket ID & Date</th>
                <th style={thStyle}>Resident & Location</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Issue Description</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Assigned Staff</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Review Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((c, index) => {
                const dateStr = new Date(c.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: index < filteredComplaints.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                  >
                    {/* Ticket ID & Date */}
                    <td style={tdStyle}>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          fontVariantNumeric: 'tabular-nums',
                          display: 'block',
                        }}
                      >
                        #{c.id.slice(-6).toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{dateStr}</span>
                    </td>

                    {/* Resident & Location */}
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>
                        {c.student?.name || 'Resident'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Room {c.student?.roomNumber || '—'}, {c.student?.hostelBlock || ''}
                      </div>
                    </td>

                    {/* Category */}
                    <td style={tdStyle}>
                      <CategoryBadge category={c.category} size="sm" />
                    </td>

                    {/* Description */}
                    <td style={{ ...tdStyle, maxWidth: '280px' }}>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: '#334155',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: 1.4,
                        }}
                        title={c.description}
                      >
                        {c.description}
                      </div>
                    </td>

                    {/* Status */}
                    <td style={tdStyle}>
                      <StatusBadge status={c.status} size="sm" />
                    </td>

                    {/* Assigned Staff */}
                    <td style={tdStyle}>
                      {c.assignedStaff ? (
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                            {c.assignedStaff.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {c.assignedStaff.staffCategory || 'Maintenance'}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Review Action */}
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <Link
                        to={`/warden/complaints/${c.id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.4rem 0.8rem',
                          backgroundColor: '#eef2ff',
                          color: '#4f46e5',
                          border: '1px solid #c7d2fe',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#4f46e5';
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#eef2ff';
                          e.currentTarget.style.color = '#4f46e5';
                        }}
                      >
                        <span>Review</span>
                        <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}

const thStyle = {
  padding: '0.85rem 1.25rem',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const tdStyle = {
  padding: '1rem 1.25rem',
  verticalAlign: 'middle',
};
