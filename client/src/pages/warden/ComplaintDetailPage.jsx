import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function WardenComplaintDetail() {
  const { id } = useParams();
  const { logout } = useAuth();
  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f8fafc' }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ color: '#7c3aed' }}>HostelFix — Warden</strong>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/warden/dashboard">Dashboard</Link>
          <Link to="/warden/complaints">All Complaints</Link>
          <button onClick={logout} style={{ background: 'none', border: '1px solid #e2e8f0', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Complaint Detail</h1>
        <p style={{ color: '#64748b' }}>ID: <code>{id}</code></p>
        <div style={{ background: '#fff', borderRadius: '8px', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Approve / Reject / Assign / Close actions available after Phase 3B and 3C.</p>
        </div>
      </div>
    </div>
  );
}
