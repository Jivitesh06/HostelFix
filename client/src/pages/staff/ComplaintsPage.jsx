import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import complaintService from '../../services/complaintService';
import StatusBadge from '../../components/StatusBadge';

const STATUS_FILTERS = [
  { label: 'All Tasks', value: '' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved', value: 'RESOLVED' },
];

export default function StaffComplaints() {
  const { user, logout } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComplaints = async (statusFilter = '') => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await complaintService.getComplaints(params);
      setComplaints(data);
    } catch (err) {
      setError('Unable to load assigned complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(selectedStatus);
  }, [selectedStatus]);

  return (
    <div style={styles.page}>
      {/* Top Navbar */}
      <nav style={styles.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <strong style={{ color: '#059669', fontSize: '1.25rem' }}>HostelFix</strong>
          <span style={{ color: '#94a3b8' }}>|</span>
          <span style={{ color: '#475569', fontSize: '0.9rem' }}>Staff Maintenance Portal</span>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <Link to="/staff/dashboard" style={styles.navLink}>Dashboard</Link>
          <Link to="/staff/complaints" style={styles.navLinkActive}>My Tasks</Link>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.content}>
        <div style={styles.header}>
          <div>
            <h1 style={{ margin: '0 0 0.25rem', color: '#1e293b' }}>Assigned Maintenance Tasks</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
              Maintenance Staff: <strong>{user?.name}</strong> ({user?.staffCategory || 'General Maintenance'}) &bull; Assigned: {complaints.length}
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={styles.filterBar}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setSelectedStatus(f.value)}
              style={selectedStatus === f.value ? styles.filterBtnActive : styles.filterBtn}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {loading ? (
          <div style={styles.centerBox}>
            <p style={{ color: '#64748b' }}>Loading assigned work orders...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div style={styles.emptyBox}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔧</div>
            <h3 style={{ margin: '0 0 0.5rem', color: '#334155' }}>No assigned tasks</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
              {selectedStatus
                ? `No tasks match the filter: ${selectedStatus}`
                : 'You have no complaints currently assigned to you.'}
            </p>
          </div>
        ) : (
          <div style={styles.list}>
            {complaints.map((c) => {
              const dateStr = new Date(c.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div key={c.id} style={styles.card}>
                  <div style={styles.cardTop}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={styles.categoryBadge}>{c.category}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Submitted: {dateStr}</span>
                  </div>

                  <p style={styles.description}>{c.description}</p>

                  <div style={styles.cardFooter}>
                    <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                      <strong>Location:</strong> Room {c.student?.roomNumber}, {c.student?.hostelBlock} &bull; Resident: {c.student?.name}
                    </div>

                    <Link to={`/staff/complaints/${c.id}`} style={styles.actionBtn}>
                      Update Work Status →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' },
  nav: { background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navLink: { color: '#475569', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 },
  navLinkActive: { color: '#059669', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 },
  logoutBtn: { background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.4rem 0.85rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  content: { padding: '2rem', maxWidth: '960px', margin: '0 auto' },
  header: { marginBottom: '1.5rem' },
  filterBar: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
  filterBtn: { background: '#fff', border: '1px solid #cbd5e1', padding: '0.4rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', color: '#475569', cursor: 'pointer' },
  filterBtnActive: { background: '#059669', border: '1px solid #059669', padding: '0.4rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', color: '#fff', fontWeight: 600, cursor: 'pointer' },
  error: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.5rem' },
  centerBox: { background: '#fff', padding: '3rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' },
  emptyBox: { background: '#fff', padding: '3.5rem 2rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: { background: '#fff', borderRadius: '8px', padding: '1.25rem 1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  categoryBadge: { background: '#ecfdf5', color: '#065f46', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 },
  description: { color: '#1e293b', fontSize: '0.95rem', margin: '0 0 0.85rem', lineHeight: 1.5 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' },
  actionBtn: { display: 'inline-block', background: '#059669', color: '#fff', padding: '0.45rem 0.9rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' },
};
