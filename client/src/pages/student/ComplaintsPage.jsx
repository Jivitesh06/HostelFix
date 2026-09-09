import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import complaintService from '../../services/complaintService';
import StatusBadge from '../../components/StatusBadge';

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved', value: 'RESOLVED' },
  { label: 'Closed', value: 'CLOSED' },
  { label: 'Rejected', value: 'REJECTED' },
];

export default function StudentComplaints() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [complaints, setComplaints] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bannerMsg, setBannerMsg] = useState(location.state?.message || '');

  const fetchComplaints = async (statusFilter = '') => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await complaintService.getComplaints(params);
      setComplaints(data);
    } catch (err) {
      setError('Unable to load complaints. Please try again.');
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
          <strong style={{ color: '#2563eb', fontSize: '1.25rem' }}>HostelFix</strong>
          <span style={{ color: '#94a3b8' }}>|</span>
          <span style={{ color: '#475569', fontSize: '0.9rem' }}>Student Portal</span>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <Link to="/student/dashboard" style={styles.navLink}>Dashboard</Link>
          <Link to="/student/complaints" style={styles.navLinkActive}>My Complaints</Link>
          <Link to="/student/mess" style={styles.navLink}>Mess Menu</Link>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.content}>
        {bannerMsg && (
          <div style={styles.successBanner}>
            <span>{bannerMsg}</span>
            <button onClick={() => setBannerMsg('')} style={styles.dismissBtn}>✕</button>
          </div>
        )}

        <div style={styles.header}>
          <div>
            <h1 style={{ margin: '0 0 0.25rem', color: '#1e293b' }}>My Complaints</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
              Complaints submitted by {user?.name} (Room {user?.roomNumber}, {user?.hostelBlock})
            </p>
          </div>
          <Link to="/student/complaints/new" style={styles.newBtn}>
            + Raise New Complaint
          </Link>
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
            <p style={{ color: '#64748b' }}>Loading your complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div style={styles.emptyBox}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📝</div>
            <h3 style={{ margin: '0 0 0.5rem', color: '#334155' }}>No complaints found</h3>
            <p style={{ margin: '0 0 1.25rem', color: '#64748b', fontSize: '0.9rem' }}>
              {selectedStatus
                ? `You have no complaints with status: ${selectedStatus}.`
                : 'You have not submitted any hostel maintenance complaints yet.'}
            </p>
            <Link to="/student/complaints/new" style={styles.newBtn}>
              + Raise New Complaint
            </Link>
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
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{dateStr}</span>
                  </div>

                  <p style={styles.description}>{c.description}</p>

                  {c.rejectionReason && (
                    <div style={styles.rejectionNotice}>
                      <strong>Rejection Note:</strong> {c.rejectionReason}
                    </div>
                  )}

                  <div style={styles.cardFooter}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      {c.assignedStaff ? (
                        <span>
                          Assigned to: <strong>{c.assignedStaff.name}</strong> ({c.assignedStaff.staffCategory || 'Staff'})
                        </span>
                      ) : (
                        <span>Assigned to: <em>Not yet assigned</em></span>
                      )}
                    </div>

                    <Link to={`/student/complaints/${c.id}`} style={styles.detailLink}>
                      View Status Timeline →
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
  navLinkActive: { color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 },
  logoutBtn: { background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.4rem 0.85rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  content: { padding: '2rem', maxWidth: '960px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' },
  newBtn: { display: 'inline-block', background: '#2563eb', color: '#fff', padding: '0.65rem 1.25rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' },
  successBanner: { background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  dismissBtn: { background: 'none', border: 'none', color: '#166534', cursor: 'pointer', fontSize: '1rem' },
  filterBar: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
  filterBtn: { background: '#fff', border: '1px solid #cbd5e1', padding: '0.4rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', color: '#475569', cursor: 'pointer' },
  filterBtnActive: { background: '#2563eb', border: '1px solid #2563eb', padding: '0.4rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', color: '#fff', fontWeight: 600, cursor: 'pointer' },
  error: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.5rem' },
  centerBox: { background: '#fff', padding: '3rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' },
  emptyBox: { background: '#fff', padding: '3.5rem 2rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: { background: '#fff', borderRadius: '8px', padding: '1.25rem 1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  categoryBadge: { background: '#f1f5f9', color: '#334155', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 },
  description: { color: '#1e293b', fontSize: '0.95rem', margin: '0 0 0.85rem', lineHeight: 1.5 },
  rejectionNotice: { background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '0.85rem' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' },
  detailLink: { color: '#2563eb', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 },
};
