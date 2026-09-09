import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f8fafc' }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ color: '#2563eb' }}>HostelFix</strong>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/student/complaints">My Complaints</Link>
          <Link to="/student/mess">Mess Menu</Link>
          <button onClick={logout} style={{ background: 'none', border: '1px solid #e2e8f0', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>
      <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h1>Welcome, {user?.name}</h1>
        <p style={{ color: '#64748b' }}>Room: {user?.roomNumber} | {user?.hostelBlock}</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          {[{label:'My Complaints',color:'#2563eb'},{label:'Pending',color:'#f59e0b'},{label:'Resolved',color:'#10b981'}].map((c) => (
            <div key={c.label} style={{ background: '#fff', borderLeft: `4px solid ${c.color}`, borderRadius: '6px', padding: '1.25rem', minWidth: '180px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>—</div>
              <div>{c.label}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '2rem' }}>
          <Link to="/student/complaints/new" style={{ display: 'inline-block', background: '#2563eb', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}>+ Raise New Complaint</Link>
        </div>
        <p style={{ marginTop: '2rem', color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>Live data available after Phase 3B authentication is complete.</p>
      </div>
    </div>
  );
}
