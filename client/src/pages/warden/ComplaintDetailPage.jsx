import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import complaintService from '../../services/complaintService';
import userService from '../../services/userService';
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
  Phone,
  GraduationCap,
  BookOpen,
  Calendar,
  Building2,
  Layers,
  Eye,
  ClipboardList,
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
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [studentDetails, setStudentDetails] = useState(null);
  const [studentLoading, setStudentLoading] = useState(false);

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

  // Open student details modal
  const handleOpenStudentModal = async () => {
    setStudentModalOpen(true);
    if (complaint?.student?.id) {
      setStudentLoading(true);
      try {
        const student = await userService.getStudentById(complaint.student.id);
        setStudentDetails(student);
      } catch (err) {
        setStudentDetails(complaint.student);
      } finally {
        setStudentLoading(false);
      }
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                      Resident Student
                    </span>
                    <button
                      type="button"
                      onClick={handleOpenStudentModal}
                      style={{
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <Eye size={12} />
                      View Profile
                    </button>
                  </div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                    {complaint.student?.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {complaint.student?.email}
                  </div>
                  {complaint.student?.gender && (
                    <div style={{ marginTop: '0.25rem' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '0.1rem 0.45rem',
                          borderRadius: '4px',
                          background: complaint.student.gender === 'FEMALE' ? '#fdf2f8' : '#eff6ff',
                          color: complaint.student.gender === 'FEMALE' ? '#be185d' : '#1d4ed8',
                          border: `1px solid ${complaint.student.gender === 'FEMALE' ? '#fbcfe8' : '#bfdbfe'}`,
                        }}
                      >
                        {complaint.student.gender === 'MALE' ? 'Male Resident' : 'Female Resident'}
                      </span>
                    </div>
                  )}
                  {complaint.student?.mobileNumber && (
                    <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Phone size={12} color="#64748b" />
                      <span>{complaint.student.mobileNumber}</span>
                    </div>
                  )}
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
                    {complaint.student?.hostelName ? ` • ${complaint.student.hostelName}` : ''}
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

      {/* ── Modal 4: Student Resident Profile Details Dialog ──────────── */}
      <Modal
        isOpen={studentModalOpen}
        onClose={() => setStudentModalOpen(false)}
        title="Student Resident Profile"
        subtitle="Official resident identification, academic details, and room allocation"
      >
        {studentLoading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
            Loading student profile...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header with Avatar & Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: '#f8fafc',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                }}
              >
                {(studentDetails?.name || complaint?.student?.name || 'ST')
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((n) => n[0].toUpperCase())
                  .join('')}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                    {studentDetails?.name || complaint?.student?.name}
                  </h3>
                  <span
                    style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                    }}
                  >
                    Resident
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                  {studentDetails?.email || complaint?.student?.email}
                </div>
              </div>
            </div>

            {/* 1. Personal Information */}
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#4f46e5',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.5rem',
                }}
              >
                1. Personal Information
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  background: '#ffffff',
                  border: '1px solid #f1f5f9',
                  padding: '0.75rem',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <span style={detailLabelStyle}>Full Name</span>
                  <div style={detailValueStyle}>{studentDetails?.name || complaint?.student?.name}</div>
                </div>
                <div>
                  <span style={detailLabelStyle}>Gender</span>
                  <div style={detailValueStyle}>
                    {(studentDetails?.gender || complaint?.student?.gender) ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          background: (studentDetails?.gender || complaint?.student?.gender) === 'FEMALE' ? '#fdf2f8' : '#eff6ff',
                          color: (studentDetails?.gender || complaint?.student?.gender) === 'FEMALE' ? '#be185d' : '#1d4ed8',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      >
                        {(studentDetails?.gender || complaint?.student?.gender) === 'MALE' ? 'Male Resident' : (studentDetails?.gender || complaint?.student?.gender) === 'FEMALE' ? 'Female Resident' : (studentDetails?.gender || complaint?.student?.gender)}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not specified</span>
                    )}
                  </div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={detailLabelStyle}>Contact Mobile</span>
                  <div style={detailValueStyle}>
                    {studentDetails?.mobileNumber || complaint?.student?.mobileNumber ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Phone size={13} color="#64748b" />
                        {studentDetails?.mobileNumber || complaint?.student?.mobileNumber}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not provided</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Academic Information */}
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#4f46e5',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.5rem',
                }}
              >
                2. Academic Information
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  background: '#ffffff',
                  border: '1px solid #f1f5f9',
                  padding: '0.75rem',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <span style={detailLabelStyle}>University Roll Number</span>
                  <div style={detailValueStyle}>
                    {studentDetails?.universityRollNumber || complaint?.student?.universityRollNumber ? (
                      <span
                        style={{
                          fontFamily: 'monospace',
                          background: '#f8fafc',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                          border: '1px solid #e2e8f0',
                          fontWeight: 700,
                        }}
                      >
                        {studentDetails?.universityRollNumber || complaint?.student?.universityRollNumber}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not provided</span>
                    )}
                  </div>
                </div>
                <div>
                  <span style={detailLabelStyle}>Year of Study</span>
                  <div style={detailValueStyle}>
                    {studentDetails?.year || complaint?.student?.year ? (
                      <span
                        style={{
                          background: '#f5f3ff',
                          color: '#6d28d9',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}
                      >
                        {studentDetails?.year || complaint?.student?.year}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not specified</span>
                    )}
                  </div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={detailLabelStyle}>Branch / Specialization</span>
                  <div style={detailValueStyle}>
                    {studentDetails?.branch || complaint?.student?.branch || (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not specified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Hostel Information */}
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#4f46e5',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.5rem',
                }}
              >
                3. Hostel Residence Information
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  background: '#ffffff',
                  border: '1px solid #f1f5f9',
                  padding: '0.75rem',
                  borderRadius: '8px',
                }}
              >
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={detailLabelStyle}>Hostel / Hall Name</span>
                  <div style={detailValueStyle}>
                    {studentDetails?.hostelName || complaint?.student?.hostelName || 'Campus Hostel'}
                  </div>
                </div>
                <div>
                  <span style={detailLabelStyle}>Room Number</span>
                  <div style={detailValueStyle}>
                    Room {studentDetails?.roomNumber || complaint?.student?.roomNumber}
                  </div>
                </div>
                <div>
                  <span style={detailLabelStyle}>Hostel Block</span>
                  <div style={detailValueStyle}>
                    {studentDetails?.hostelBlock || complaint?.student?.hostelBlock}
                  </div>
                </div>
              </div>
            </div>

            {/* Total Complaints Submitted badge if available */}
            {typeof studentDetails?.complaintsCount === 'number' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#f8fafc',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.85rem',
                }}
              >
                <span style={{ color: '#64748b', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ClipboardList size={16} color="#64748b" /> Total Maintenance Tickets Submitted
                </span>
                <span
                  style={{
                    background: '#e0e7ff',
                    color: '#3730a3',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  }}
                >
                  {studentDetails.complaintsCount} {studentDetails.complaintsCount === 1 ? 'ticket' : 'tickets'}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setStudentModalOpen(false)}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  background: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close Profile
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}

const detailLabelStyle = {
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  color: '#64748b',
  display: 'block',
  marginBottom: '0.2rem',
  letterSpacing: '0.04em',
};

const detailValueStyle = {
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#0f172a',
};
