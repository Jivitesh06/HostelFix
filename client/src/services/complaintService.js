import api from './api';

export const complaintService = {
  // Create complaint (Student)
  createComplaint: async (data) => {
    const res = await api.post('/complaints', data);
    return res.data.data;
  },

  // List complaints with optional status/category query (Role-scoped)
  getComplaints: async (params = {}) => {
    const res = await api.get('/complaints', { params });
    return res.data.data;
  },

  // Get complaint detail by ID with audit timeline
  getComplaintById: async (id) => {
    const res = await api.get(`/complaints/${id}`);
    return res.data.data;
  },

  // Approve complaint (Warden)
  approveComplaint: async (id) => {
    const res = await api.patch(`/complaints/${id}/approve`);
    return res.data.data;
  },

  // Reject complaint (Warden)
  rejectComplaint: async (id, rejectionReason) => {
    const res = await api.patch(`/complaints/${id}/reject`, { rejectionReason });
    return res.data.data;
  },

  // Assign complaint to staff (Warden)
  assignComplaint: async (id, staffId) => {
    const res = await api.patch(`/complaints/${id}/assign`, { staffId });
    return res.data.data;
  },

  // Update complaint status to IN_PROGRESS or RESOLVED (Staff)
  updateComplaintStatus: async (id, status) => {
    const res = await api.patch(`/complaints/${id}/status`, { status });
    return res.data.data;
  },

  // Close complaint (Warden)
  closeComplaint: async (id) => {
    const res = await api.patch(`/complaints/${id}/close`);
    return res.data.data;
  },

  // Fetch available staff members for assignment dropdown (Warden)
  getStaffUsers: async () => {
    const res = await api.get('/users/staff');
    return res.data.data;
  },
};

export default complaintService;
