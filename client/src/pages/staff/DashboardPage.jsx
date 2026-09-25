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
  Wrench,
  Clock,
  PlayCircle,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  MapPin,
  User,
} from 'lucide-react';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await complaintService.getComplaints();
        setComplaints(data);
      } catch (err) {
        console.error('Failed to load staff dashboard tasks', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const totalCount = complaints.length;
  const assignedCount = complaints.filter((c) => c.status === 'ASSIGNED').length;
  const inProgressCount = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter((c) => ['RESOLVED', 'CLOSED'].includes(c.status)).length;

  const activeWorkList = complaints
    .filter((c) => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS')
    .slice(0, 5);

  return (
    <AppShell
      title={`Maintenance Duty — ${user?.name || 'Technician'}`}
      subtitle={`Specialization: ${user?.staffCategory || 'General Maintenance'} • Active Work Orders Dispatch`}
      actions={
        <Link
          to="/staff/complaints"
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
            boxShadow: '0 1px 2px 0 rgba(200, 16, 46, 0.2)',
          }}
        >
          <Wrench size={16} />
          <span>View All Assigned Tasks</span>
        </Link>
      }
    >
      {/* ── 1. KPI Metric Cards ───────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <StatCard
          icon={Wrench}
          title="Total Assigned"
          value={totalCount}
          subtitle="All maintenance work orders"
          accentColor="#c8102e"
          accentBg="#fdecef"
          loading={loading}
        />

        <StatCard
          icon={Clock}
          title="New Assigned (Pending Start)"
          value={assignedCount}
          subtitle="Awaiting technician arrival"
          accentColor="#7c3aed"
          accentBg="#f5f3ff"
          loading={loading}
        />

        <StatCard
          icon={PlayCircle}
          title="Currently In Progress"
          value={inProgressCount}
          subtitle="Active repair work in rooms"
          accentColor="#0284c7"
          accentBg="#f0f9ff"
          loading={loading}
        />

        <StatCard
          icon={CheckCircle2}
          title="Completed & Resolved"
          value={resolvedCount}
          subtitle="Repairs finished successfully"
          accentColor="#10b981"
          accentBg="#ecfdf5"
          loading={loading}
        />
      </div>

      {/* ── 2. Current Active Tasks Queue ─────────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#171717', margin: 0 }}>
              Active Work Orders (Needs Action)
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0.2rem 0 0' }}>
              Maintenance tasks currently assigned to you or in progress
            </p>
          </div>

          <Link
            to="/staff/complaints"
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#c8102e',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <span>All Tasks ({complaints.length})</span>
            <ChevronRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
            Loading active work orders...
          </div>
        ) : activeWorkList.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No active tasks in your queue"
            description="You have completed all currently assigned repairs. New work orders assigned by the warden will appear here."
          />
        ) : (
          <div>
            {activeWorkList.map((c, index) => {
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
                    borderBottom: index < activeWorkList.length - 1 ? '1px solid #f3f4f6' : 'none',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '260px' }}>
                    <CategoryBadge category={c.category} size="sm" />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: '#171717',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {c.description}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.15rem' }}>
                        Room <strong>{c.student?.roomNumber}</strong> &bull; Resident: {c.student?.name} &bull; {dateStr}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <StatusBadge status={c.status} size="sm" />

                    <Link
                      to={`/staff/complaints/${c.id}`}
                      style={{
                        padding: '0.45rem 0.85rem',
                        backgroundColor: '#fdecef',
                        color: '#c8102e',
                        border: '1px solid #fecdd3',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
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
                      <span>Update Status</span>
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
