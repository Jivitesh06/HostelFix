import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import complaintService from '../../services/complaintService';

export default function StaffDashboard() {
  const { user, logout } = useAuth();
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

  const assignedCount = complaints.filter((c) => c.status === 'ASSIGNED').length;
  const inProgressCount = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter((c) => ['RESOLVED', 'CLOSED'].includes(c.status)).length;

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh', background: '#f8fafc' }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <strong style={{ color: '#059669', fontSize: '1.25rem' }}>HostelFix</strong>
          <span style={{ color: '#94a3b8' }}>|</span>
          <span style={{ color: '#475569', fontSize: '0.9rem' }}>Staff Maintenance Portal</span>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <Link to="/staff/dashboard" style={{ color: '#059669', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Dashboard</Link>
          <Link to="/staff/complaints" style={{ color: '#475569', textDecoration: 'none', fontSize: '0.9rem' }}>My Tasks</Link>
          <button onClick={logout} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.4rem 0.85rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>Logout</button>
        </div>
      </nav>

      <div style={{ padding: '2rem', maxWidth: '960px', margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 0.25rem', color: '#1e293b' }}>Maintenance Duty Dashboard</h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
          Staff: <strong>{user?.name}</strong> &bull; Category: <strong>{user?.staffCategory || 'Maintenance'}</strong>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          <div style={{ background: '#fff', borderLeft: '4px solid #059669', borderRadius: '6px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>{loading ? '...' : complaints.length}</div>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Total Assigned Tasks</div>
            <Link to="/staff/complaints" style={{ display: 'block', marginTop: '0.5rem', color: '#059669', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
          </div>

          <div style={{ background: '#fff', borderLeft: '4px solid #8b5cf6', borderRadius: '6px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#8b5cf6' }}>{loading ? '...' : assignedCount}</div>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>New Assigned (Pending Start)</div>
          </div>

          <div style={{ background: '#fff', borderLeft: '4px solid #3b82f6', borderRadius: '6px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>{loading ? '...' : inProgressCount}</div>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Currently In Progress</div>
          </div>

          <div style={{ background: '#fff', borderLeft: '4px solid #10b981', borderRadius: '6px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>{loading ? '...' : resolvedCount}</div>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Completed & Resolved</div>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <Link to="/staff/complaints" style={{ background: '#059669', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>
            Open Maintenance Task List
          </Link>
        </div>
      </div>
    </div>
  );
}
