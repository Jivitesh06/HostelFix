import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import complaintService from '../../services/complaintService';
import StatusBadge from '../../components/StatusBadge';
import StatusTimeline from '../../components/StatusTimeline';

export default function WardenComplaintDetail() {
  const { id } = useParams();
  const { logout } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await complaintService.getComplaintById(id);
      setComplaint(data);

      // If approved, load staff list for assignment
      if (data.status === 'APPROVED') {
        const staff = await complaintService.getStaffUsers();
        setStaffList(staff);
        if (staff.length > 0) setSelectedStaffId(staff[0].id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Approve action: PENDING -> APPROVED
  const handleApprove = async () => {
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await complaintService.approveComplaint(id);
      setSuccessMsg('Complaint approved successfully! You can now assign it to maintenance staff.');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  // Reject action: PENDING -> REJECTED
  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setError('Please provide an official rejection reason.');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await complaintService.rejectComplaint(id, rejectionReason.trim());
      setSuccessMsg('Complaint rejected with official reason recorded in audit log.');
      setShowRejectForm(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  // Assign action: APPROVED -> ASSIGNED
  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedStaffId) {
      setError('Please select a staff member to assign.');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await complaintService.assignComplaint(id, selectedStaffId);
      setSuccessMsg('Complaint successfully assigned to maintenance staff.');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  // Close action: RESOLVED -> CLOSED
  const handleClose = async () => {
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await complaintService.closeComplaint(id);
      setSuccessMsg('Complaint verified and officially marked as CLOSED.');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to close complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Top Navbar */}
      <nav style={styles.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <strong style={{ color: '#7c3aed', fontSize: '1.25rem' }}>HostelFix</strong>
          <span style={{ color: '#94a3b8' }}>|</span>
          <span style={{ color: '#475569', fontSize: '0.9rem' }}>Warden Portal</span>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <Link to="/warden/dashboard" style={styles.navLink}>Dashboard</Link>
          <Link to="/warden/complaints" style={styles.navLinkActive}>All Complaints</Link>
          <Link to="/warden/mess" style={styles.navLink}>Mess Admin</Link>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      {/* Main Container */}
      <div style={styles.content}>
        <Link to="/warden/complaints" style={styles.backLink}>
          ← Back to All Complaints
        </Link>

        {successMsg && <div style={styles.success}>{successMsg}</div>}
        {error && <div style={styles.error}>{error}</div>}

        {loading ? (
          <div style={styles.card}>
            <p style={{ color: '#64748b', textAlign: 'center' }}>Loading complaint record...</p>
          </div>
        ) : !complaint ? (
          <div style={styles.card}>
            <p style={{ color: '#64748b', textAlign: 'center' }}>Complaint record not found.</p>
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

            {/* Resident Information Banner */}
            <div style={styles.residentBox}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Student</span>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>{complaint.student?.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{complaint.student?.email}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Hostel Location</span>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>Room {complaint.student?.roomNumber}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{complaint.student?.hostelBlock}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Assigned Maintenance</span>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>
                  {complaint.assignedStaff ? complaint.assignedStaff.name : 'None'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {complaint.assignedStaff ? complaint.assignedStaff.staffCategory || 'Staff' : 'Pending assignment'}
                </div>
              </div>
            </div>

            {/* Complaint Description */}
            <div style={{ margin: '1.5rem 0' }}>
              <h3 style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Description
              </h3>
              <p style={{ color: '#1e293b', lineHeight: 1.6, background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0', margin: 0 }}>
                {complaint.description}
              </p>
            </div>

            {/* Attached Image */}
            {complaint.imageUrl && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.4rem' }}>Attached Evidence</h3>
                <a href={complaint.imageUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#7c3aed', fontSize: '0.9rem' }}>
                  {complaint.imageUrl}
                </a>
              </div>
            )}

            {/* Rejection Notice if REJECTED */}
            {complaint.status === 'REJECTED' && complaint.rejectionReason && (
              <div style={styles.rejectionBox}>
                <strong>Rejection Reason:</strong> {complaint.rejectionReason}
              </div>
            )}

            {/* ── Dynamic Action Panels for Warden ────────────────────────── */}
            <div style={styles.actionPanel}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#1e293b' }}>
                Warden Administrative Actions
              </h3>

              {/* 1. Pending Actions */}
              {complaint.status === 'PENDING' && (
                <div>
                  {!showRejectForm ? (
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={handleApprove}
                        disabled={actionLoading}
                        style={styles.approveBtn}
                      >
                        {actionLoading ? 'Processing...' : '✓ Approve Complaint'}
                      </button>
                      <button
                        onClick={() => setShowRejectForm(true)}
                        disabled={actionLoading}
                        style={styles.rejectToggleBtn}
                      >
                        ✕ Reject Complaint
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleReject} style={styles.rejectForm}>
                      <h4 style={{ margin: '0 0 0.5rem', color: '#991b1b' }}>Reject Complaint with Reason</h4>
                      <textarea
                        style={styles.rejectTextarea}
                        rows={3}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="State why this complaint is rejected (e.g. Duplicate issue, Out of hostel jurisdiction, etc.)"
                        required
                      />
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                        <button type="submit" disabled={actionLoading} style={styles.confirmRejectBtn}>
                          {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowRejectForm(false);
                            setRejectionReason('');
                          }}
                          style={styles.cancelBtn}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* 2. Approved Actions: Assign Staff */}
              {complaint.status === 'APPROVED' && (
                <form onSubmit={handleAssign} style={styles.assignForm}>
                  <h4 style={{ margin: '0 0 0.75rem', color: '#1e293b' }}>
                    Assign Approved Complaint to Maintenance Staff
                  </h4>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <select
                      style={styles.staffSelect}
                      value={selectedStaffId}
                      onChange={(e) => setSelectedStaffId(e.target.value)}
                      required
                    >
                      {staffList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.staffCategory || 'General Maintenance'}) — {s.email}
                        </option>
                      ))}
                    </select>

                    <button type="submit" disabled={actionLoading} style={styles.assignBtn}>
                      {actionLoading ? 'Assigning...' : 'Assign to Staff'}
                    </button>
                  </div>
                </form>
              )}

              {/* 3. Resolved Actions: Close */}
              {complaint.status === 'RESOLVED' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: '#ecfdf5', padding: '1rem', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                  <div>
                    <strong style={{ color: '#065f46', display: 'block' }}>Maintenance Work Completed</strong>
                    <span style={{ fontSize: '0.85rem', color: '#047857' }}>
                      Staff member marked this issue as resolved. Verify the room resolution and close the ticket.
                    </span>
                  </div>
                  <button onClick={handleClose} disabled={actionLoading} style={styles.closeBtn}>
                    {actionLoading ? 'Closing...' : '✓ Verify & Close Complaint'}
                  </button>
                </div>
              )}

              {/* 4. Other states info */}
              {(complaint.status === 'ASSIGNED' || complaint.status === 'IN_PROGRESS') && (
                <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>
                  ℹ️ This complaint is currently assigned to <strong>{complaint.assignedStaff?.name}</strong>. Awaiting staff resolution.
                </p>
              )}

              {complaint.status === 'CLOSED' && (
                <p style={{ margin: 0, color: '#15803d', fontSize: '0.9rem', fontWeight: 600 }}>
                  ✓ This complaint has been officially resolved and closed.
                </p>
              )}

              {complaint.status === 'REJECTED' && (
                <p style={{ margin: 0, color: '#b91c1c', fontSize: '0.9rem' }}>
                  ✕ This complaint is closed as rejected.
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
  navLinkActive: { color: '#7c3aed', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 },
  logoutBtn: { background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.4rem 0.85rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  content: { padding: '2rem 1.5rem', maxWidth: '880px', margin: '0 auto' },
  backLink: { color: '#7c3aed', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, display: 'inline-block', marginBottom: '1.25rem' },
  card: { background: '#fff', borderRadius: '8px', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
  success: { background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.25rem' },
  error: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.25rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' },
  categoryBadge: { background: '#f3e8ff', color: '#7c3aed', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 },
  residentBox: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0', margin: '1.5rem 0' },
  rejectionBox: { background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem' },
  actionPanel: { background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1.5rem', margin: '2rem 0' },
  approveBtn: { background: '#10b981', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' },
  rejectToggleBtn: { background: '#ef4444', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' },
  rejectForm: { background: '#fff', padding: '1rem', borderRadius: '6px', border: '1px solid #fca5a5' },
  rejectTextarea: { width: '100%', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box', fontFamily: 'inherit' },
  confirmRejectBtn: { background: '#b91c1c', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' },
  cancelBtn: { background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' },
  assignForm: { background: '#fff', padding: '1.25rem', borderRadius: '6px', border: '1px solid #e2e8f0' },
  staffSelect: { padding: '0.6rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', fontSize: '0.9rem', minWidth: '280px' },
  assignBtn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' },
  closeBtn: { background: '#059669', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' },
};
