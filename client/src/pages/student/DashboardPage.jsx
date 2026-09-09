import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import complaintService from '../../services/complaintService';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
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

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh', background: '#f8fafc' }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <strong style={{ color: '#2563eb', fontSize: '1.25rem' }}>HostelFix</strong>
          <span style={{ color: '#94a3b8' }}>|</span>
          <span style={{ color: '#475569', fontSize: '0.9rem' }}>Student Portal</span>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <Link to="/student/dashboard" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Dashboard</Link>
          <Link to="/student/complaints" style={{ color: '#475569', textDecoration: 'none', fontSize: '0.9rem' }}>My Complaints</Link>
          <Link to="/student/mess" style={{ color: '#475569', textDecoration: 'none', fontSize: '0.9rem' }}>Mess Menu</Link>
          <button onClick={logout} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.4rem 0.85rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>Logout</button>
        </div>
      </nav>

      <div style={{ padding: '2rem', maxWidth: '960px', margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 0.25rem', color: '#1e293b' }}>Welcome, {user?.name}</h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
          Hostel Resident: Room <strong>{user?.roomNumber}</strong>, <strong>{user?.hostelBlock}</strong>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          <div style={{ background: '#fff', borderLeft: '4px solid #2563eb', borderRadius: '6px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>{loading ? '...' : complaints.length}</div>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Total Complaints</div>
            <Link to="/student/complaints" style={{ display: 'block', marginTop: '0.5rem', color: '#2563eb', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
          </div>

          <div style={{ background: '#fff', borderLeft: '4px solid #f59e0b', borderRadius: '6px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>{loading ? '...' : pendingCount}</div>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Pending Review</div>
          </div>

          <div style={{ background: '#fff', borderLeft: '4px solid #6366f1', borderRadius: '6px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#6366f1' }}>{loading ? '...' : inProgressCount}</div>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>In Resolution</div>
          </div>

          <div style={{ background: '#fff', borderLeft: '4px solid #10b981', borderRadius: '6px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>{loading ? '...' : resolvedCount}</div>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Resolved & Closed</div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/student/complaints/new" style={{ background: '#2563eb', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>
            + Raise New Complaint
          </Link>
          <Link to="/student/complaints" style={{ background: '#fff', color: '#475569', border: '1px solid #cbd5e1', padding: '0.75rem 1.25rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem' }}>
            Browse My Complaints
          </Link>
          <Link to="/student/mess" style={{ background: '#fff', color: '#475569', border: '1px solid #cbd5e1', padding: '0.75rem 1.25rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem' }}>
            🍽️ Weekly Mess Menu & Reviews
          </Link>
        </div>
      </div>
    </div>
  );
}
