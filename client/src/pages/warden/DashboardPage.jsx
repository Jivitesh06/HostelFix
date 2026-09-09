import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function WardenDashboard() {
  const { user, logout } = useAuth();
  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f8fafc' }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ color: '#7c3aed' }}>HostelFix — Warden</strong>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/warden/complaints">Complaints</Link>
          <Link to="/warden/mess">Mess</Link>
          <button onClick={logout} style={{ background: 'none', border: '1px solid #e2e8f0', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>
      <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h1>Warden Dashboard</h1>
        <p style={{ color: '#64748b' }}>Welcome, {user?.name}</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          {['All Complaints','Pending Review','In Progress','Resolved'].map((label) => (
            <div key={label} style={{ background: '#fff', borderLeft: '4px solid #7c3aed', borderRadius: '6px', padding: '1.25rem', minWidth: '180px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>—</div>
              <div>{label}</div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: '2rem', color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>Live data after Phase 3B and 3C.</p>
      </div>
    </div>
  );
}
