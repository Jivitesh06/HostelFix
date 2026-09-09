import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function StudentMessPage() {
  const { logout } = useAuth();
  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f8fafc' }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ color: '#2563eb' }}>HostelFix</strong>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/student/dashboard">Dashboard</Link>
          <Link to="/student/complaints">My Complaints</Link>
          <button onClick={logout} style={{ background: 'none', border: '1px solid #e2e8f0', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>
      <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h1>Weekly Mess Menu</h1>
        <div style={{ background: '#fff', borderRadius: '8px', padding: '3rem', textAlign: 'center', color: '#94a3b8', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p>Mess menu and feedback form available after Phase 3D.</p>
        </div>
      </div>
    </div>
  );
}
