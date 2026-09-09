import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import complaintService from '../../services/complaintService';
import StatusBadge from '../../components/StatusBadge';
import StatusTimeline from '../../components/StatusTimeline';

export default function StaffComplaintDetail() {
  const { id } = useParams();
  const { logout } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await complaintService.getComplaintById(id);
      setComplaint(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load task details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  // Update status handler
  const handleUpdateStatus = async (nextStatus) => {
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await complaintService.updateComplaintStatus(id, nextStatus);
      setSuccessMsg(`Work status successfully updated to: ${nextStatus}`);
      await loadDetail();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to update status to ${nextStatus}.`);
    } finally {
      setActionLoading(false);
    }
  };

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

      {/* Main Container */}
      <div style={styles.content}>
        <Link to="/staff/complaints" style={styles.backLink}>
          ← Back to Assigned Tasks
        </Link>

        {successMsg && <div style={styles.success}>{successMsg}</div>}
        {error && <div style={styles.error}>{error}</div>}

        {loading ? (
          <div style={styles.card}>
            <p style={{ color: '#64748b', textAlign: 'center' }}>Loading task details...</p>
          </div>
        ) : !complaint ? (
          <div style={styles.card}>
            <p style={{ color: '#64748b', textAlign: 'center' }}>Task record not found.</p>
          </div>
        ) : (
          <div style={styles.card}>
            {/* Header */}
            <div style={styles.header}>
              <div>
                <span style={styles.categoryBadge}>{complaint.category}</span>
                <h1 style={{ margin: '0.5rem 0 0.25rem', color: '#1e293b', fontSize: '1.5rem' }}>
                  Work Order #{complaint.id.slice(-6).toUpperCase()}
                </h1>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                  Registered on {new Date(complaint.createdAt).toLocaleString()}
                </p>
              </div>
              <StatusBadge status={complaint.status} />
            </div>

            {/* Resident & Room Location */}
            <div style={styles.locationBox}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Target Location</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                  Room {complaint.student?.roomNumber}
                </div>
                <div style={{ color: '#475569', fontSize: '0.85rem' }}>
                  {complaint.student?.hostelBlock}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Resident Student</span>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>
                  {complaint.student?.name}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  {complaint.student?.email}
                </div>
              </div>
            </div>

            {/* Work Description */}
            <div style={{ margin: '1.5rem 0' }}>
              <h3 style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Maintenance Issue Description
              </h3>
              <p style={{ color: '#1e293b', lineHeight: 1.6, background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0', margin: 0 }}>
                {complaint.description}
              </p>
            </div>

            {/* Evidence Image */}
            {complaint.imageUrl && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.4rem' }}>
                  Attached Image
                </h3>
                <a href={complaint.imageUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#059669', fontSize: '0.9rem' }}>
                  {complaint.imageUrl}
                </a>
              </div>
            )}

            {/* ── Maintenance Action Panel ─────────────────────────────────── */}
            <div style={styles.actionPanel}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#1e293b' }}>
                Maintenance Progress Controls
              </h3>

              {complaint.status === 'ASSIGNED' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <strong style={{ color: '#1e293b', display: 'block' }}>Ready to Begin Repair Work?</strong>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Marking as 'In Progress' indicates you have arrived at the room and started work.
                    </span>
                  </div>
                  <button
                    onClick={() => handleUpdateStatus('IN_PROGRESS')}
                    disabled={actionLoading}
                    style={styles.startBtn}
                  >
                    {actionLoading ? 'Updating...' : '▶ Start Work (In Progress)'}
                  </button>
                </div>
              )}

              {complaint.status === 'IN_PROGRESS' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <strong style={{ color: '#1e293b', display: 'block' }}>Work Completed?</strong>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Mark this complaint as resolved once the repair/hygiene task is fully finished.
                    </span>
                  </div>
                  <button
                    onClick={() => handleUpdateStatus('RESOLVED')}
                    disabled={actionLoading}
                    style={styles.resolveBtn}
                  >
                    {actionLoading ? 'Updating...' : '✓ Mark as Resolved'}
                  </button>
                </div>
              )}

              {complaint.status === 'RESOLVED' && (
                <div style={{ background: '#ecfdf5', padding: '1rem', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                  <strong style={{ color: '#065f46', display: 'block' }}>
                    ✓ Work marked as Resolved
                  </strong>
                  <span style={{ fontSize: '0.85rem', color: '#047857' }}>
                    Awaiting Warden inspection and final closure.
                  </span>
                </div>
              )}

              {complaint.status === 'CLOSED' && (
                <p style={{ margin: 0, color: '#15803d', fontSize: '0.9rem', fontWeight: 600 }}>
                  ✓ This work order has been verified and closed by the Warden.
                </p>
              )}
            </div>

            {/* Audit Timeline */}
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
  navLinkActive: { color: '#059669', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 },
  logoutBtn: { background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.4rem 0.85rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  content: { padding: '2rem 1.5rem', maxWidth: '800px', margin: '0 auto' },
  backLink: { color: '#059669', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, display: 'inline-block', marginBottom: '1.25rem' },
  card: { background: '#fff', borderRadius: '8px', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
  success: { background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.25rem' },
  error: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.25rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' },
  categoryBadge: { background: '#ecfdf5', color: '#065f46', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 },
  locationBox: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: '#f0fdf4', padding: '1.25rem', borderRadius: '6px', border: '1px solid #bbf7d0', margin: '1.5rem 0' },
  actionPanel: { background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1.5rem', margin: '2rem 0' },
  startBtn: { background: '#2563eb', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' },
  resolveBtn: { background: '#059669', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' },
};
