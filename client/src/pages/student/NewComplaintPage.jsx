import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['ELECTRICAL', 'PLUMBING', 'CLEANING', 'FURNITURE', 'INTERNET', 'OTHER'];

export default function NewComplaintPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
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
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1>Raise New Complaint</h1>
        <div style={{ background: '#fff', borderRadius: '8px', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Complaint form will be functional after Phase 3B and 3C are complete.</p>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '1rem' }}>Categories: {CATEGORIES.join(', ')}</p>
          <button onClick={() => navigate(-1)} style={{ marginTop: '1.5rem', background: '#e2e8f0', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '6px', cursor: 'pointer' }}>Back</button>
        </div>
      </div>
    </div>
  );
}
