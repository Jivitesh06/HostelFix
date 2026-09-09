import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function StudentComplaints() {
  const { logout } = useAuth();
  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f8fafc' }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ color: '#2563eb' }}>HostelFix</strong>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/student/dashboard">Dashboard</Link>
          <Link to="/student/mess">Mess</Link>
          <button onClick={logout} style={{ background: 'none', border: '1px solid #e2e8f0', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>
      <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ margin: 0 }}>My Complaints</h1>
          <Link to="/student/complaints/new" style={{ background: '#2563eb', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}>+ New Complaint</Link>
        </div>
        <div style={{ background: '#fff', borderRadius: '8px', padding: '3rem', textAlign: 'center', color: '#94a3b8', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p>Your complaints will appear here after Phase 3B and 3C are complete.</p>
        </div>
      </div>
    </div>
  );
}
