import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import complaintService from '../../services/complaintService';
import StatusBadge from '../../components/StatusBadge';
import StatusTimeline from '../../components/StatusTimeline';

export default function StudentComplaintDetail() {
  const { id } = useParams();
  const { logout } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await complaintService.getComplaintById(id);
        setComplaint(data);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Unable to load complaint details.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

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

      {/* Main Container */}
      <div style={styles.content}>
        <Link to="/student/complaints" style={styles.backLink}>
          ← Back to My Complaints
        </Link>

        {error && <div style={styles.error}>{error}</div>}

        {loading ? (
          <div style={styles.card}>
            <p style={{ color: '#64748b', textAlign: 'center' }}>
              Loading complaint details...
            </p>
          </div>
        ) : !complaint ? (
          <div style={styles.card}>
            <p style={{ color: '#64748b', textAlign: 'center' }}>
              Complaint not found.
            </p>
          </div>
        ) : (
          <div style={styles.card}>
            {/* Header */}
            <div style={styles.header}>
              <div>
                <span style={styles.categoryBadge}>{complaint.category}</span>
                <h1 style={{ margin: '0.5rem 0 0.25rem', color: '#1e293b', fontSize: '1.5rem' }}>
                  Complaint #{complaint.id.slice(-6).toUpperCase()}
                </h1>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                  Submitted on {new Date(complaint.createdAt).toLocaleString()}
                </p>
              </div>
              <StatusBadge status={complaint.status} />
            </div>

            {/* Rejection Alert if REJECTED */}
            {complaint.status === 'REJECTED' && complaint.rejectionReason && (
              <div style={styles.rejectionBox}>
                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
                  ⚠️ Complaint Rejected by Warden:
                </strong>
                <span>{complaint.rejectionReason}</span>
              </div>
            )}

            {/* Description */}
            <div style={{ margin: '1.5rem 0' }}>
              <h3 style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Description
              </h3>
              <p style={{ color: '#1e293b', lineHeight: 1.6, background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0', margin: 0 }}>
                {complaint.description}
              </p>
            </div>

            {/* Attached Image if any */}
            {complaint.imageUrl && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '0.4rem' }}>
                  Attached Image
                </h3>
                <a href={complaint.imageUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontSize: '0.9rem' }}>
                  {complaint.imageUrl}
                </a>
              </div>
            )}

            {/* Assignment Info */}
            <div style={styles.infoRow}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Assigned Maintenance Staff</span>
                <strong style={{ color: '#1e293b' }}>
                  {complaint.assignedStaff
                    ? `${complaint.assignedStaff.name} (${complaint.assignedStaff.staffCategory || 'General Maintenance'})`
                    : 'Not assigned yet'}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Room / Location</span>
                <strong style={{ color: '#1e293b' }}>
                  Room {complaint.student?.roomNumber}, {complaint.student?.hostelBlock}
                </strong>
              </div>
            </div>

            {/* Chronological Audit Timeline */}
            <StatusTimeline logs={complaint.statusLogs} />
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
  content: { padding: '2rem 1.5rem', maxWidth: '800px', margin: '0 auto' },
  backLink: { color: '#2563eb', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, display: 'inline-block', marginBottom: '1.25rem' },
  card: { background: '#fff', borderRadius: '8px', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
  error: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.25rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' },
  categoryBadge: { background: '#e0e7ff', color: '#3730a3', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 },
  rejectionBox: { background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '1rem', borderRadius: '6px', margin: '1.25rem 0' },
  infoRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '6px', border: '1px solid #e2e8f0', margin: '1.5rem 0' },
};
