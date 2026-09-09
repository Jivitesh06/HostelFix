import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import complaintService from '../../services/complaintService';
import AppShell from '../../components/AppShell';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import CategoryBadge from '../../components/CategoryBadge';
import EmptyState from '../../components/EmptyState';
import {
  ShieldAlert,
  ClipboardList,
  Clock,
  UserCheck,
  CheckCircle2,
  Utensils,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';

export default function WardenDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await complaintService.getComplaints();
        setComplaints(data);
      } catch (err) {
        console.error('Failed to load warden dashboard complaints', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'PENDING').length;
  const approvedCount = complaints.filter((c) => c.status === 'APPROVED').length;
  const activeCount = complaints.filter((c) => ['ASSIGNED', 'IN_PROGRESS'].includes(c.status)).length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED').length;
  const closedCount = complaints.filter((c) => c.status === 'CLOSED').length;
  const rejectedCount = complaints.filter((c) => c.status === 'REJECTED').length;

  // Complaints that need urgent warden action (PENDING review, or RESOLVED ready to close)
  const actionRequiredComplaints = complaints
    .filter((c) => c.status === 'PENDING' || c.status === 'RESOLVED' || c.status === 'APPROVED')
    .slice(0, 6);

  return (
    <AppShell
      title="Hostel Operations Control Center"
      subtitle={`Administrator: ${user?.name || 'Warden'} • Centralized Complaint Lifecycle & Mess Administration`}
      actions={
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link
            to="/warden/mess"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: '#ffffff',
              color: '#475569',
              border: '1px solid #cbd5e1',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            <Utensils size={16} />
            <span>Mess Admin</span>
          </Link>

          <Link
            to="/warden/complaints"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              padding: '0.6rem 1.15rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              boxShadow: '0 1px 2px 0 rgba(79, 70, 229, 0.2)',
            }}
          >
            <ClipboardList size={16} />
            <span>Manage All Tickets</span>
          </Link>
        </div>
      }
    >
      {/* ── 1. Metric StatCards ───────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <StatCard
          icon={ClipboardList}
          title="Total Registered"
          value={totalCount}
          subtitle="All hostel maintenance requests"
          accentColor="#4f46e5"
          accentBg="#eef2ff"
          loading={loading}
        />

        <StatCard
          icon={Clock}
          title="Pending Review"
          value={pendingCount}
          subtitle="Awaiting Warden approval / rejection"
          accentColor="#d97706"
          accentBg="#fef3c7"
          loading={loading}
        />

        <StatCard
          icon={UserCheck}
          title="Approved (Ready to Assign)"
          value={approvedCount}
          subtitle="Needs technician assignment"
          accentColor="#2563eb"
          accentBg="#eff6ff"
          loading={loading}
        />

        <StatCard
          icon={CheckCircle2}
          title="Resolved (Pending Close)"
          value={resolvedCount}
          subtitle="Staff completed, ready for verification"
          accentColor="#059669"
          accentBg="#ecfdf5"
          loading={loading}
        />
      </div>

      {/* ── 2. Status Distribution Bar (Pure CSS visualization) ──────── */}
      {totalCount > 0 && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
              Hostel Complaint Status Distribution
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {totalCount} total cases tracked
            </span>
          </div>

          {/* Segmented Bar */}
          <div
            style={{
              height: '10px',
              borderRadius: '9999px',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              overflow: 'hidden',
              marginBottom: '1rem',
            }}
          >
            {pendingCount > 0 && (
              <div
                style={{
                  width: `${(pendingCount / totalCount) * 100}%`,
                  backgroundColor: '#f59e0b',
                  transition: 'width 0.3s ease',
                }}
                title={`Pending: ${pendingCount}`}
              />
            )}
            {approvedCount > 0 && (
              <div
                style={{
                  width: `${(approvedCount / totalCount) * 100}%`,
                  backgroundColor: '#3b82f6',
                  transition: 'width 0.3s ease',
                }}
                title={`Approved: ${approvedCount}`}
              />
            )}
            {activeCount > 0 && (
              <div
                style={{
                  width: `${(activeCount / totalCount) * 100}%`,
                  backgroundColor: '#7c3aed',
                  transition: 'width 0.3s ease',
                }}
                title={`Assigned/In Progress: ${activeCount}`}
              />
            )}
            {resolvedCount > 0 && (
              <div
                style={{
                  width: `${(resolvedCount / totalCount) * 100}%`,
                  backgroundColor: '#10b981',
                  transition: 'width 0.3s ease',
                }}
                title={`Resolved: ${resolvedCount}`}
              />
            )}
            {closedCount > 0 && (
              <div
                style={{
                  width: `${(closedCount / totalCount) * 100}%`,
                  backgroundColor: '#64748b',
                  transition: 'width 0.3s ease',
                }}
                title={`Closed: ${closedCount}`}
              />
            )}
            {rejectedCount > 0 && (
              <div
                style={{
                  width: `${(rejectedCount / totalCount) * 100}%`,
                  backgroundColor: '#ef4444',
                  transition: 'width 0.3s ease',
                }}
                title={`Rejected: ${rejectedCount}`}
              />
            )}
          </div>

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              gap: '1.25rem',
              flexWrap: 'wrap',
              fontSize: '0.75rem',
              color: '#64748b',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              Pending ({pendingCount})
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
              Approved ({approvedCount})
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#7c3aed' }} />
              In Progress ({activeCount})
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              Resolved ({resolvedCount})
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#64748b' }} />
              Closed ({closedCount})
            </span>
            {rejectedCount > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                Rejected ({rejectedCount})
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── 3. Action Required Queue ──────────────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Administration Action Queue
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0' }}>
              Complaints requiring warden review, staff assignment, or final verification
            </p>
          </div>

          <Link
            to="/warden/complaints"
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <span>Open All Tickets</span>
            <ChevronRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
            Loading action queue...
          </div>
        ) : actionRequiredComplaints.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="All tasks are up to date"
            description="There are currently no complaints waiting for warden approval, assignment, or closure."
          />
        ) : (
          <div>
            {actionRequiredComplaints.map((c, index) => {
              const dateStr = new Date(c.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.1rem 1.5rem',
                    borderBottom:
                      index < actionRequiredComplaints.length - 1 ? '1px solid #f1f5f9' : 'none',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '240px' }}>
                    <CategoryBadge category={c.category} size="sm" />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: '#0f172a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {c.description}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                        Resident: <strong>{c.student?.name}</strong> (Room {c.student?.roomNumber}, {c.student?.hostelBlock}) &bull; {dateStr}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <StatusBadge status={c.status} size="sm" />

                    <Link
                      to={`/warden/complaints/${c.id}`}
                      style={{
                        padding: '0.45rem 0.85rem',
                        backgroundColor: '#eef2ff',
                        color: '#4f46e5',
                        border: '1px solid #c7d2fe',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
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
                      <span>Take Action</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
