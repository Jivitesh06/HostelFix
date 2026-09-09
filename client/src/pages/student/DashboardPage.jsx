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
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  Utensils,
  ChevronRight,
  AlertCircle,
  Home,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await complaintService.getComplaints();
        setComplaints(data);
      } catch (err) {
        console.error('Failed to load dashboard complaints', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const pendingCount = complaints.filter((c) => c.status === 'PENDING').length;
  const inProgressCount = complaints.filter((c) =>
    ['APPROVED', 'ASSIGNED', 'IN_PROGRESS'].includes(c.status)
  ).length;
  const resolvedCount = complaints.filter((c) =>
    ['RESOLVED', 'CLOSED'].includes(c.status)
  ).length;

  const recentComplaints = complaints.slice(0, 5);

  return (
    <AppShell
      title={`Welcome back, ${user?.name || 'Resident'}`}
      subtitle={user?.hostelName ? `${user.hostelName} • Room ${user?.roomNumber || '—'}` : `Hostel Room ${user?.roomNumber || '—'}`}
      actions={
        <Link
          to="/student/complaints/new"
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
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4338ca')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
        >
          <PlusCircle size={16} />
          <span>Raise Complaint</span>
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
          icon={FileText}
          title="Total Complaints"
          value={complaints.length}
          subtitle="All issues registered by you"
          accentColor="#4f46e5"
          accentBg="#eef2ff"
          loading={loading}
        />

        <StatCard
          icon={Clock}
          title="Pending Review"
          value={pendingCount}
          subtitle="Waiting for warden approval"
          accentColor="#d97706"
          accentBg="#fef3c7"
          loading={loading}
        />

        <StatCard
          icon={Wrench}
          title="In Resolution"
          value={inProgressCount}
          subtitle="Assigned or work in progress"
          accentColor="#0284c7"
          accentBg="#f0f9ff"
          loading={loading}
        />

        <StatCard
          icon={CheckCircle2}
          title="Resolved & Closed"
          value={resolvedCount}
          subtitle="Successfully completed repairs"
          accentColor="#059669"
          accentBg="#ecfdf5"
          loading={loading}
        />
      </div>

      {/* ── 2. Quick Action Cards ─────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}
      >
        <Link
          to="/student/complaints/new"
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            color: '#ffffff',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>
              + Raise New Complaint
            </div>
            <div style={{ fontSize: '0.8rem', color: '#e0e7ff' }}>
              Report room electrical, plumbing, or hygiene issues
            </div>
          </div>
          <ArrowRight size={20} color="#ffffff" />
        </Link>

        <Link
          to="/student/mess"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.15s ease, border-color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Utensils size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.2rem' }}>
                Weekly Mess Menu
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Check today's meals and rate food quality
              </div>
            </div>
          </div>
          <ChevronRight size={18} color="#94a3b8" />
        </Link>
      </div>

      {/* ── 3. Recent Complaints Activity ─────────────────────────────── */}
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
              Recent Complaints
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0' }}>
              Your latest maintenance requests and current resolution stages
            </p>
          </div>

          {complaints.length > 0 && (
            <Link
              to="/student/complaints"
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <span>View all ({complaints.length})</span>
              <ChevronRight size={15} />
            </Link>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Loading complaints data...
          </div>
        ) : recentComplaints.length === 0 ? (
          <EmptyState
            title="No complaints registered yet"
            description="Whenever you face maintenance, electrical, or cleaning issues in your room, submit a ticket here."
            actionLabel="+ Raise Your First Complaint"
            onAction={() => (window.location.href = '/student/complaints/new')}
          />
        ) : (
          <div>
            {recentComplaints.map((c, index) => {
              const dateStr = new Date(c.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });

              return (
                <Link
                  key={c.id}
                  to={`/student/complaints/${c.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.1rem 1.5rem',
                    borderBottom: index < recentComplaints.length - 1 ? '1px solid #f1f5f9' : 'none',
                    transition: 'background-color 0.15s ease',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
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
                          paddingRight: '1rem',
                        }}
                      >
                        {c.description}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                        ID: #{c.id.slice(-6).toUpperCase()} &bull; Submitted on {dateStr}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                    <StatusBadge status={c.status} size="sm" />
                    <ChevronRight size={16} color="#cbd5e1" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
