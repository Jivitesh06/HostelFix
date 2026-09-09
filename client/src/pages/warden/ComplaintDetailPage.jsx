import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import complaintService from '../../services/complaintService';
import AppShell from '../../components/AppShell';
import StatusBadge from '../../components/StatusBadge';
import CategoryBadge from '../../components/CategoryBadge';
import StatusTimeline from '../../components/StatusTimeline';
import Modal from '../../components/Modal';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  UserPlus,
  Archive,
  AlertCircle,
  ExternalLink,
  User,
  Home,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export default function WardenComplaintDetail() {
  const { id } = useParams();

  const [complaint, setComplaint] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Modals state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);

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
  const handleRejectSubmit = async (e) => {
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
      setRejectModalOpen(false);
      setRejectionReason('');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  // Assign action: APPROVED -> ASSIGNED
  const handleAssignSubmit = async (e) => {
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
      setSuccessMsg('Complaint successfully assigned to maintenance technician.');
      setAssignModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  // Close action: RESOLVED -> CLOSED
  const handleCloseConfirm = async () => {
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await complaintService.closeComplaint(id);
      setSuccessMsg('Complaint verified and officially closed.');
      setCloseModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to close complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AppShell
      title={complaint ? `Review Ticket #${complaint.id.slice(-6).toUpperCase()}` : 'Complaint Review'}
      subtitle={
        complaint
          ? `Submitted by ${complaint.student?.name} (Room ${complaint.student?.roomNumber}, ${complaint.student?.hostelBlock})`
          : ''
      }
      actions={
        <Link
          to="/warden/complaints"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#64748b',
            fontSize: '0.875rem',
            fontWeight: 600,
            padding: '0.5rem 0.85rem',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to All Complaints</span>
        </Link>
      }
    >
      <div style={{ maxWidth: '880px', margin: '0 auto' }}>
        {successMsg && (
          <div
            style={{
              background: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
              padding: '0.85rem 1.25rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <CheckCircle2 size={18} color="#059669" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div
            style={{
              background: '#fff1f2',
              color: '#9f1239',
              border: '1px solid #fecdd3',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <AlertCircle size={16} color="#e11d48" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '3rem',
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            Loading complaint details...
          </div>
        ) : !complaint ? (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '3rem',
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            Complaint record not found.
          </div>
        ) : (
          <div>
            {/* ── Action Bar Banner (Prominent Admin Controls) ─────────────── */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
                  Warden Workflow Control
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.15rem' }}>
                  Current Status: <span style={{ color: '#4f46e5' }}>{complaint.status}</span>
                </div>
              </div>

              {/* Dynamic Action Buttons based on Status */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {complaint.status === 'PENDING' && (
                  <>
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        background: '#059669',
                        color: '#ffffff',
                        padding: '0.65rem 1.25rem',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(5, 150, 105, 0.2)',
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>{actionLoading ? 'Processing...' : 'Approve Complaint'}</span>
                    </button>

                    <button
                      onClick={() => setRejectModalOpen(true)}
                      disabled={actionLoading}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        background: '#fee2e2',
                        color: '#b91c1c',
                        border: '1px solid #fca5a5',
                        padding: '0.65rem 1.15rem',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <XCircle size={16} />
                      <span>Reject with Reason</span>
                    </button>
                  </>
                )}

                {complaint.status === 'APPROVED' && (
                  <button
                    onClick={() => setAssignModalOpen(true)}
                    disabled={actionLoading}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      background: '#4f46e5',
                      color: '#ffffff',
                      padding: '0.65rem 1.35rem',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(79, 70, 229, 0.2)',
                    }}
                  >
                    <UserPlus size={16} />
                    <span>Assign Maintenance Staff</span>
                  </button>
                )}

                {complaint.status === 'RESOLVED' && (
                  <button
                    onClick={() => setCloseModalOpen(true)}
                    disabled={actionLoading}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      background: '#059669',
                      color: '#ffffff',
                      padding: '0.65rem 1.35rem',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(5, 150, 105, 0.2)',
                    }}
                  >
                    <Archive size={16} />
                    <span>Verify & Close Ticket</span>
                  </button>
                )}

                {(complaint.status === 'ASSIGNED' || complaint.status === 'IN_PROGRESS') && (
                  <div
                    style={{
                      fontSize: '0.85rem',
                      color: '#64748b',
                      background: '#f8fafc',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    Assigned to <strong>{complaint.assignedStaff?.name}</strong> • Work in progress
                  </div>
                )}

                {complaint.status === 'CLOSED' && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#059669',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircle2 size={18} />
                    <span>Case Completed & Verified Closed</span>
                  </div>
                )}

                {complaint.status === 'REJECTED' && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#e11d48',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    <XCircle size={18} />
                    <span>Case Formally Rejected</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Main Details Card ────────────────────────────────────────── */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '1.75rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                marginBottom: '1.5rem',
              }}
            >
              {/* Header Badges */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  paddingBottom: '1.25rem',
                  borderBottom: '1px solid #f1f5f9',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CategoryBadge category={complaint.category} />
                  <StatusBadge status={complaint.status} />
                </div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  ID: #{complaint.id.toUpperCase()}
                </span>
              </div>

              {/* Rejection Notice if REJECTED */}
              {complaint.status === 'REJECTED' && complaint.rejectionReason && (
                <div
                  style={{
                    background: '#fff1f2',
                    border: '1px solid #fecdd3',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1.25rem',
                    color: '#9f1239',
                  }}
                >
                  <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
                    ⚠️ Rejection Reason on Record:
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {complaint.rejectionReason}
                  </p>
                </div>
              )}

              {/* Description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#64748b',
                    marginBottom: '0.5rem',
                  }}
                >
                  Maintenance Description
                </h4>
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '1rem 1.25rem',
                    color: '#0f172a',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                  }}
                >
                  {complaint.description}
                </div>
              </div>

              {/* Attached Evidence Link */}
              {complaint.imageUrl && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#64748b',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Attached Evidence Photo
                  </h4>
                  <a
                    href={complaint.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#4f46e5',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      background: '#eef2ff',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #c7d2fe',
                    }}
                  >
                    <span>View Attached Image</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}

              {/* Metadata Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                    Resident Student
                  </span>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '0.15rem' }}>
                    {complaint.student?.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {complaint.student?.email}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                    Room Location
                  </span>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '0.15rem' }}>
                    Room {complaint.student?.roomNumber}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {complaint.student?.hostelBlock}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                    Assigned Maintenance Staff
                  </span>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '0.15rem' }}>
                    {complaint.assignedStaff ? complaint.assignedStaff.name : 'Unassigned'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {complaint.assignedStaff ? complaint.assignedStaff.staffCategory || 'Maintenance' : 'Ready for assignment'}
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Timeline Component with visual stepper */}
            <StatusTimeline logs={complaint.statusLogs} currentStatus={complaint.status} />
          </div>
        )}
      </div>

      {/* ── Modal 1: Reject Complaint Dialog ──────────────────────────── */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Complaint"
        subtitle="Specify official reason for rejecting this maintenance ticket"
      >
        <form onSubmit={handleRejectSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
              Rejection Reason *
            </label>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Issue outside hostel maintenance scope; duplicate ticket; personal appliance issue."
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              style={{
                padding: '0.65rem 1.15rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              style={{
                padding: '0.65rem 1.35rem',
                borderRadius: '8px',
                background: '#e11d48',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal 2: Assign Staff Dialog ──────────────────────────────── */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Maintenance Staff"
        subtitle="Select a technician to dispatch for this approved ticket"
      >
        <form onSubmit={handleAssignSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
              Available Maintenance Technicians *
            </label>

            {staffList.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                No maintenance staff accounts found in database.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {staffList.map((s) => {
                  const isSelected = selectedStaffId === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedStaffId(s.id)}
                      style={{
                        padding: '0.75rem 1rem',
                        border: `1.5px solid ${isSelected ? '#4f46e5' : '#e2e8f0'}`,
                        backgroundColor: isSelected ? '#eef2ff' : '#ffffff',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                          {s.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {s.staffCategory || 'Maintenance'} &bull; {s.email}
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="staffRadio"
                        checked={isSelected}
                        onChange={() => setSelectedStaffId(s.id)}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              style={{
                padding: '0.65rem 1.15rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading || staffList.length === 0}
              style={{
                padding: '0.65rem 1.35rem',
                borderRadius: '8px',
                background: '#4f46e5',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {actionLoading ? 'Assigning...' : 'Dispatch Staff'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal 3: Close Complaint Confirmation Dialog ──────────────── */}
      <Modal
        isOpen={closeModalOpen}
        onClose={() => setCloseModalOpen(false)}
        title="Verify & Close Complaint"
        subtitle="Confirm that maintenance work has been inspected and completed satisfactorily"
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5, margin: 0 }}>
            Closing this ticket confirms that the room issue reported by <strong>{complaint?.student?.name}</strong> has been resolved and verified by hostel administration.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => setCloseModalOpen(false)}
            style={{
              padding: '0.65rem 1.15rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCloseConfirm}
            disabled={actionLoading}
            style={{
              padding: '0.65rem 1.35rem',
              borderRadius: '8px',
              background: '#059669',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {actionLoading ? 'Closing...' : 'Confirm Closure'}
          </button>
        </div>
      </Modal>
    </AppShell>
  );
}
