import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import AppShell from '../../components/AppShell';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import {
  Users,
  UserCheck,
  Wrench,
  Search,
  Plus,
  Edit2,
  Eye,
  AlertCircle,
  CheckCircle2,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Home,
  BookOpen,
  Calendar,
  Lock,
  User,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s]{7,15}$/;
const MIN_PASSWORD_LENGTH = 6;

const STAFF_CATEGORIES = [
  'Electrician',
  'Plumber',
  'Cleaning / Housekeeping',
  'Carpenter / Furniture',
  'Network / Internet Technician',
  'General Maintenance',
  'Painter',
  'Other',
];

export default function UserManagementPage() {
  const { user } = useAuth();

  // Active Tab: 'STUDENTS' or 'STAFF'
  const [activeTab, setActiveTab] = useState('STUDENTS');

  // Students state
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState('');

  // Staff state
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffSearch, setStaffSearch] = useState('');

  // Selected student for Profile Inspection Modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);

  // Add Staff Modal
  const [addStaffModalOpen, setAddStaffModalOpen] = useState(false);
  const [addStaffLoading, setAddStaffLoading] = useState(false);
  const [addStaffForm, setAddStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    mobileNumber: '',
    staffCategory: 'Plumber',
  });

  // Edit Staff Modal
  const [editStaffModalOpen, setEditStaffModalOpen] = useState(false);
  const [editStaffLoading, setEditStaffLoading] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [editStaffForm, setEditStaffForm] = useState({
    name: '',
    mobileNumber: '',
    staffCategory: 'Plumber',
    isActive: true,
  });

  // Feedback states
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load Students
  const loadStudents = async () => {
    setStudentsLoading(true);
    try {
      const data = await userService.getStudents();
      setStudents(data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load students list.');
    } finally {
      setStudentsLoading(false);
    }
  };

  // Load Staff
  const loadStaff = async () => {
    setStaffLoading(true);
    try {
      const data = await userService.getStaffMembers();
      setStaffList(data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load maintenance staff.');
    } finally {
      setStaffLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
    loadStaff();
  }, []);

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.roomNumber?.toLowerCase().includes(q) ||
      s.universityRollNumber?.toLowerCase().includes(q) ||
      s.branch?.toLowerCase().includes(q)
    );
  });

  // Filtered Staff
  const filteredStaff = staffList.filter((s) => {
    if (!staffSearch.trim()) return true;
    const q = staffSearch.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.staffCategory?.toLowerCase().includes(q) ||
      s.mobileNumber?.toLowerCase().includes(q)
    );
  });

  // Handle View Student Profile
  const handleViewStudentProfile = async (studentSummary) => {
    setSelectedStudent(studentSummary);
    setStudentModalOpen(true);
    setStudentDetailsLoading(true);
    try {
      const fullDetails = await userService.getStudentById(studentSummary.id);
      setSelectedStudent(fullDetails);
    } catch (err) {
      // Keep summary if full details request has an error
    } finally {
      setStudentDetailsLoading(false);
    }
  };

  // Handle Add Staff Submit
  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const { name, email, password, mobileNumber, staffCategory } = addStaffForm;

    if (!name.trim() || !email.trim() || !password || !staffCategory) {
      setErrorMsg('Full name, email, password, and specialization trade are required.');
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMsg(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (mobileNumber && mobileNumber.trim() && !PHONE_REGEX.test(mobileNumber.trim())) {
      setErrorMsg('Please enter a valid mobile number (7–15 digits).');
      return;
    }

    setAddStaffLoading(true);
    try {
      await userService.createStaff({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        mobileNumber: mobileNumber.trim() || null,
        staffCategory,
      });

      setSuccessMsg(`Worker account for "${name.trim()}" created successfully!`);
      setAddStaffModalOpen(false);
      setAddStaffForm({
        name: '',
        email: '',
        password: '',
        mobileNumber: '',
        staffCategory: 'Plumber',
      });
      await loadStaff();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create staff account.');
    } finally {
      setAddStaffLoading(false);
    }
  };

  // Open Edit Staff Modal
  const handleOpenEditStaff = (staff) => {
    setEditingStaffId(staff.id);
    setEditStaffForm({
      name: staff.name || '',
      mobileNumber: staff.mobileNumber || '',
      staffCategory: staff.staffCategory || 'Plumber',
      isActive: staff.isActive !== undefined ? staff.isActive : true,
    });
    setEditStaffModalOpen(true);
    setErrorMsg('');
  };

  // Handle Edit Staff Submit
  const handleEditStaffSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const { name, mobileNumber, staffCategory, isActive } = editStaffForm;

    if (!name.trim() || !staffCategory) {
      setErrorMsg('Name and specialization trade are required.');
      return;
    }

    if (mobileNumber && mobileNumber.trim() && !PHONE_REGEX.test(mobileNumber.trim())) {
      setErrorMsg('Please enter a valid mobile number (7–15 digits).');
      return;
    }

    setEditStaffLoading(true);
    try {
      await userService.updateStaff(editingStaffId, {
        name: name.trim(),
        mobileNumber: mobileNumber.trim() || null,
        staffCategory,
        isActive,
      });

      setSuccessMsg('Staff member details updated successfully.');
      setEditStaffModalOpen(false);
      await loadStaff();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update staff member.');
    } finally {
      setEditStaffLoading(false);
    }
  };

  return (
    <AppShell
      title="User Management"
      subtitle={`Resident student registry and maintenance staff directory${user?.hostelName ? ` • ${user.hostelName}` : ''}`}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Jurisdiction Notice */}
        {user?.hostelName && (
          <div
            style={{
              background: '#eef2ff',
              border: '1px solid #c7d2fe',
              padding: '0.85rem 1.25rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              color: '#312e81',
            }}
          >
            <Building2 size={18} color="#4f46e5" />
            <div>
              <strong>Active Hostel Scope: {user.hostelName}.</strong> You are viewing resident students
              assigned to your hall. Maintenance staff are shared campus-wide across residence facilities.
            </div>
          </div>
        )}

        {/* Global Success / Error Banners */}
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
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={18} color="#059669" />
              <span>{successMsg}</span>
            </div>
            <button
              onClick={() => setSuccessMsg('')}
              style={{ background: 'none', border: 'none', color: '#065f46', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              padding: '0.85rem 1.25rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <AlertCircle size={18} color="#dc2626" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg('')}
              style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab Switcher & Action Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* Tab Buttons */}
          <div
            style={{
              display: 'inline-flex',
              background: '#ffffff',
              padding: '0.35rem',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            }}
          >
            <button
              onClick={() => setActiveTab('STUDENTS')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'STUDENTS' ? '#4f46e5' : 'transparent',
                color: activeTab === 'STUDENTS' ? '#ffffff' : '#64748b',
                fontWeight: activeTab === 'STUDENTS' ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <UserCheck size={16} />
              <span>Resident Students</span>
              <span
                style={{
                  background: activeTab === 'STUDENTS' ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                  color: activeTab === 'STUDENTS' ? '#ffffff' : '#475569',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {students.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('STAFF')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'STAFF' ? '#4f46e5' : 'transparent',
                color: activeTab === 'STAFF' ? '#ffffff' : '#64748b',
                fontWeight: activeTab === 'STAFF' ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Wrench size={16} />
              <span>Maintenance Staff</span>
              <span
                style={{
                  background: activeTab === 'STAFF' ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                  color: activeTab === 'STAFF' ? '#ffffff' : '#475569',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {staffList.length}
              </span>
            </button>
          </div>

          {/* Action button: Only on STAFF tab */}
          {activeTab === 'STAFF' && (
            <button
              onClick={() => {
                setErrorMsg('');
                setAddStaffModalOpen(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                background: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.25)',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4338ca')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
            >
              <Plus size={16} />
              <span>Add Staff Member</span>
            </button>
          )}
        </div>

        {/* ── TAB 1: RESIDENT STUDENTS ────────────────────────────────────── */}
        {activeTab === 'STUDENTS' && (
          <div>
            {/* Search filter bar */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1rem',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <Search size={18} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search students by name, roll number, room, or branch..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.9rem',
                  color: '#0f172a',
                  background: 'transparent',
                }}
              />
              {studentSearch && (
                <button
                  onClick={() => setStudentSearch('')}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#64748b',
                    fontSize: '0.75rem',
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Students Table */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
              }}
            >
              {studentsLoading ? (
                <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
                  Loading resident students...
                </div>
              ) : filteredStudents.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title={studentSearch ? 'No matching students found' : 'No students found'}
                  description={
                    studentSearch
                      ? `No residents in ${user?.hostelName || 'the hostel'} matched "${studentSearch}".`
                      : `No student accounts are currently registered under ${user?.hostelName || 'your hostel'}.`
                  }
                />
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={tableHeaderStyle}>Resident Student</th>
                        <th style={tableHeaderStyle}>Room Number</th>
                        <th style={tableHeaderStyle}>Roll Number & Branch</th>
                        <th style={tableHeaderStyle}>Year</th>
                        <th style={tableHeaderStyle}>Mobile</th>
                        <th style={tableHeaderStyle}>Status</th>
                        <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((st) => (
                        <tr
                          key={st.id}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {/* Student Name & Email */}
                          <td style={tableCellStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '50%',
                                  background: st.gender === 'FEMALE' ? '#fdf2f8' : '#eff6ff',
                                  color: st.gender === 'FEMALE' ? '#db2777' : '#2563eb',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  fontSize: '0.85rem',
                                  border: `1px solid ${st.gender === 'FEMALE' ? '#fbcfe8' : '#bfdbfe'}`,
                                  flexShrink: 0,
                                }}
                              >
                                {st.name ? st.name.charAt(0).toUpperCase() : 'S'}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                                  {st.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  {st.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Room Number */}
                          <td style={tableCellStyle}>
                            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>
                              Room {st.roomNumber || '—'}
                            </div>
                          </td>

                          {/* Roll Number & Branch */}
                          <td style={tableCellStyle}>
                            <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                              {st.universityRollNumber || '—'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {st.branch || 'General'}
                            </div>
                          </td>

                          {/* Year */}
                          <td style={tableCellStyle}>
                            <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                              {st.year || '—'}
                            </span>
                          </td>

                          {/* Mobile */}
                          <td style={tableCellStyle}>
                            <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                              {st.mobileNumber || '—'}
                            </span>
                          </td>

                          {/* Status */}
                          <td style={tableCellStyle}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                background: '#ecfdf5',
                                color: '#065f46',
                                border: '1px solid #a7f3d0',
                                padding: '0.15rem 0.55rem',
                                borderRadius: '9999px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                              Active
                            </span>
                          </td>

                          {/* Actions: View Profile */}
                          <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                            <button
                              onClick={() => handleViewStudentProfile(st)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.45rem 0.75rem',
                                background: '#f8fafc',
                                color: '#4f46e5',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#eef2ff';
                                e.currentTarget.style.borderColor = '#c7d2fe';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                              }}
                            >
                              <Eye size={14} />
                              <span>View Profile</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: MAINTENANCE STAFF ────────────────────────────────────── */}
        {activeTab === 'STAFF' && (
          <div>
            {/* Search filter bar */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1rem',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <Search size={18} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search staff by worker name, trade category, or email..."
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.9rem',
                  color: '#0f172a',
                  background: 'transparent',
                }}
              />
              {staffSearch && (
                <button
                  onClick={() => setStaffSearch('')}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#64748b',
                    fontSize: '0.75rem',
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Staff Table */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
              }}
            >
              {staffLoading ? (
                <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
                  Loading maintenance staff directory...
                </div>
              ) : filteredStaff.length === 0 ? (
                <EmptyState
                  icon={Wrench}
                  title={staffSearch ? 'No matching workers found' : 'No staff registered'}
                  description={
                    staffSearch
                      ? `No maintenance workers matched "${staffSearch}".`
                      : 'No maintenance technicians or workers are registered in the system.'
                  }
                  action={
                    <button
                      onClick={() => setAddStaffModalOpen(true)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#4f46e5',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                      }}
                    >
                      + Add Staff Member
                    </button>
                  }
                />
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={tableHeaderStyle}>Worker / Staff Name</th>
                        <th style={tableHeaderStyle}>Specialization Trade</th>
                        <th style={tableHeaderStyle}>Contact Mobile</th>
                        <th style={tableHeaderStyle}>Assigned Tasks</th>
                        <th style={tableHeaderStyle}>Status</th>
                        <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStaff.map((staff) => (
                        <tr
                          key={staff.id}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {/* Name & Email */}
                          <td style={tableCellStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '8px',
                                  background: '#ecfdf5',
                                  color: '#059669',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  fontSize: '0.85rem',
                                  border: '1px solid #a7f3d0',
                                  flexShrink: 0,
                                }}
                              >
                                <Wrench size={16} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                                  {staff.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  {staff.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Specialization Trade */}
                          <td style={tableCellStyle}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                background: '#f0fdf4',
                                color: '#166534',
                                border: '1px solid #bbf7d0',
                                padding: '0.2rem 0.65rem',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                              }}
                            >
                              {staff.staffCategory || 'General Maintenance'}
                            </span>
                          </td>

                          {/* Contact Mobile */}
                          <td style={tableCellStyle}>
                            <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                              {staff.mobileNumber || '—'}
                            </span>
                          </td>

                          {/* Workload / Assigned Tasks */}
                          <td style={tableCellStyle}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: '#475569',
                              }}
                            >
                              <Clock size={13} color="#94a3b8" />
                              {staff.assignedCount !== undefined ? `${staff.assignedCount} work orders` : 'Active'}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td style={tableCellStyle}>
                            {staff.isActive !== false ? (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  background: '#ecfdf5',
                                  color: '#065f46',
                                  border: '1px solid #a7f3d0',
                                  padding: '0.15rem 0.55rem',
                                  borderRadius: '9999px',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                }}
                              >
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                                Active
                              </span>
                            ) : (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  background: '#f1f5f9',
                                  color: '#64748b',
                                  border: '1px solid #cbd5e1',
                                  padding: '0.15rem 0.55rem',
                                  borderRadius: '9999px',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                }}
                              >
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8' }} />
                                Inactive
                              </span>
                            )}
                          </td>

                          {/* Edit Action */}
                          <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                            <button
                              onClick={() => handleOpenEditStaff(staff)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.45rem 0.75rem',
                                background: '#ffffff',
                                color: '#334155',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f1f5f9';
                                e.currentTarget.style.borderColor = '#94a3b8';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#ffffff';
                                e.currentTarget.style.borderColor = '#cbd5e1';
                              }}
                            >
                              <Edit2 size={13} />
                              <span>Edit</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL 1: STUDENT RESIDENT PROFILE INSPECTION ──────────────────── */}
      <Modal
        isOpen={studentModalOpen}
        onClose={() => setStudentModalOpen(false)}
        title="Student Resident Profile"
        subtitle="Official resident identification, academic details, and room allocation"
      >
        {studentDetailsLoading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
            Loading student profile...
          </div>
        ) : selectedStudent ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header Avatar Box */}
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
                {(selectedStudent.name || 'ST')
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((n) => n[0].toUpperCase())
                  .join('')}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                    {selectedStudent.name}
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
                  {selectedStudent.email}
                </div>
              </div>
            </div>

            {/* 1. Personal Information */}
            <div>
              <div style={sectionHeadingStyle}>1. Personal Information</div>
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
                  <div style={detailValueStyle}>{selectedStudent.name}</div>
                </div>
                <div>
                  <span style={detailLabelStyle}>Gender</span>
                  <div style={detailValueStyle}>{selectedStudent.gender || 'Not specified'}</div>
                </div>
                <div>
                  <span style={detailLabelStyle}>Contact Mobile</span>
                  <div style={detailValueStyle}>{selectedStudent.mobileNumber || 'Not provided'}</div>
                </div>
                <div>
                  <span style={detailLabelStyle}>Account Status</span>
                  <div style={detailValueStyle}>Active Resident</div>
                </div>
              </div>
            </div>

            {/* 2. Academic Information */}
            <div>
              <div style={sectionHeadingStyle}>2. Academic Information</div>
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
                  <span style={detailLabelStyle}>University Roll No</span>
                  <div style={detailValueStyle}>{selectedStudent.universityRollNumber || 'Not provided'}</div>
                </div>
                <div>
                  <span style={detailLabelStyle}>Year of Study</span>
                  <div style={detailValueStyle}>{selectedStudent.year || 'Not specified'}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={detailLabelStyle}>Branch / Program</span>
                  <div style={detailValueStyle}>{selectedStudent.branch || 'Not specified'}</div>
                </div>
              </div>
            </div>

            {/* 3. Hostel Residence */}
            <div>
              <div style={sectionHeadingStyle}>3. Hostel Residence</div>
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
                  <span style={detailLabelStyle}>Hostel / Hall</span>
                  <div style={detailValueStyle}>{selectedStudent.hostelName || 'Unassigned'}</div>
                </div>
                <div>
                  <span style={detailLabelStyle}>Room Number</span>
                  <div style={{ ...detailValueStyle, color: '#4f46e5', fontWeight: 700 }}>
                    {selectedStudent.roomNumber || 'Unassigned'}
                  </div>
                </div>
                <div>
                  <span style={detailLabelStyle}>Complaints Filed</span>
                  <div style={detailValueStyle}>
                    {selectedStudent.complaintsCount !== undefined
                      ? `${selectedStudent.complaintsCount} tickets`
                      : '—'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                onClick={() => setStudentModalOpen(false)}
                style={{
                  padding: '0.55rem 1.25rem',
                  background: '#f1f5f9',
                  color: '#334155',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* ── MODAL 2: ADD MAINTENANCE WORKER ───────────────────────────────── */}
      <Modal
        isOpen={addStaffModalOpen}
        onClose={() => setAddStaffModalOpen(false)}
        title="Add Maintenance Staff Member"
        subtitle="Provision a new technician account for work order dispatching"
      >
        <form onSubmit={handleAddStaffSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={fieldLabelStyle}>Full Name *</label>
            <div style={{ position: 'relative' }}>
              <div style={iconWrapperStyle}><User size={15} /></div>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={addStaffForm.name}
                onChange={(e) => setAddStaffForm({ ...addStaffForm, name: e.target.value })}
                style={modalInputStyle}
              />
            </div>
          </div>

          <div>
            <label style={fieldLabelStyle}>Official Email Address *</label>
            <div style={{ position: 'relative' }}>
              <div style={iconWrapperStyle}><Mail size={15} /></div>
              <input
                type="email"
                required
                placeholder="worker@hostelfix.demo"
                value={addStaffForm.email}
                onChange={(e) => setAddStaffForm({ ...addStaffForm, email: e.target.value })}
                style={modalInputStyle}
              />
            </div>
          </div>

          <div>
            <label style={fieldLabelStyle}>Initial Password *</label>
            <div style={{ position: 'relative' }}>
              <div style={iconWrapperStyle}><Lock size={15} /></div>
              <input
                type="password"
                required
                placeholder="Min 6 characters"
                value={addStaffForm.password}
                onChange={(e) => setAddStaffForm({ ...addStaffForm, password: e.target.value })}
                style={modalInputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={fieldLabelStyle}>Trade / Specialization *</label>
              <select
                value={addStaffForm.staffCategory}
                onChange={(e) => setAddStaffForm({ ...addStaffForm, staffCategory: e.target.value })}
                style={modalSelectStyle}
              >
                {STAFF_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={fieldLabelStyle}>Contact Mobile</label>
              <div style={{ position: 'relative' }}>
                <div style={iconWrapperStyle}><Phone size={15} /></div>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={addStaffForm.mobileNumber}
                  onChange={(e) => setAddStaffForm({ ...addStaffForm, mobileNumber: e.target.value })}
                  style={modalInputStyle}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setAddStaffModalOpen(false)}
              style={{
                padding: '0.55rem 1rem',
                background: '#f1f5f9',
                color: '#475569',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addStaffLoading}
              style={{
                padding: '0.55rem 1.25rem',
                background: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: addStaffLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {addStaffLoading ? 'Creating Worker...' : 'Create Staff Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL 3: EDIT MAINTENANCE WORKER ───────────────────────────────── */}
      <Modal
        isOpen={editStaffModalOpen}
        onClose={() => setEditStaffModalOpen(false)}
        title="Edit Staff Member"
        subtitle="Update worker details, trade specialization, or active duty status"
      >
        <form onSubmit={handleEditStaffSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={fieldLabelStyle}>Full Name *</label>
            <div style={{ position: 'relative' }}>
              <div style={iconWrapperStyle}><User size={15} /></div>
              <input
                type="text"
                required
                value={editStaffForm.name}
                onChange={(e) => setEditStaffForm({ ...editStaffForm, name: e.target.value })}
                style={modalInputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={fieldLabelStyle}>Trade / Specialization *</label>
              <select
                value={editStaffForm.staffCategory}
                onChange={(e) => setEditStaffForm({ ...editStaffForm, staffCategory: e.target.value })}
                style={modalSelectStyle}
              >
                {STAFF_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={fieldLabelStyle}>Contact Mobile</label>
              <div style={{ position: 'relative' }}>
                <div style={iconWrapperStyle}><Phone size={15} /></div>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={editStaffForm.mobileNumber}
                  onChange={(e) => setEditStaffForm({ ...editStaffForm, mobileNumber: e.target.value })}
                  style={modalInputStyle}
                />
              </div>
            </div>
          </div>

          <div>
            <label style={fieldLabelStyle}>Duty Status</label>
            <select
              value={editStaffForm.isActive ? 'true' : 'false'}
              onChange={(e) => setEditStaffForm({ ...editStaffForm, isActive: e.target.value === 'true' })}
              style={modalSelectStyle}
            >
              <option value="true">Active (Available for Assignment)</option>
              <option value="false">Inactive (On Leave / Deactivated)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setEditStaffModalOpen(false)}
              style={{
                padding: '0.55rem 1rem',
                background: '#f1f5f9',
                color: '#475569',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editStaffLoading}
              style={{
                padding: '0.55rem 1.25rem',
                background: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: editStaffLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {editStaffLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

const tableHeaderStyle = {
  padding: '0.85rem 1.25rem',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const tableCellStyle = {
  padding: '1rem 1.25rem',
  verticalAlign: 'middle',
};

const sectionHeadingStyle = {
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#4f46e5',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '0.4rem',
};

const detailLabelStyle = {
  display: 'block',
  fontSize: '0.72rem',
  color: '#64748b',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: '0.2rem',
};

const detailValueStyle = {
  fontSize: '0.875rem',
  color: '#0f172a',
  fontWeight: 600,
};

const fieldLabelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#334155',
  marginBottom: '0.35rem',
};

const iconWrapperStyle = {
  position: 'absolute',
  left: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#94a3b8',
  display: 'flex',
  alignItems: 'center',
};

const modalInputStyle = {
  width: '100%',
  padding: '0.6rem 0.75rem 0.6rem 2.2rem',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const modalSelectStyle = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
  cursor: 'pointer',
  background: '#ffffff',
};
