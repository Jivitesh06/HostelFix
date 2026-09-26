import api from './api';

export const userService = {
  /**
   * Fetch current authenticated student's full profile.
   * Access: STUDENT
   */
  getProfile: async () => {
    const res = await api.get('/users/profile');
    return res.data.data;
  },

  /**
   * Update current authenticated student's profile information.
   * Access: STUDENT
   */
  updateProfile: async (data) => {
    const res = await api.put('/users/profile', data);
    return res.data.data;
  },

  /**
   * Fetch student details by user ID for Warden inspection.
   * Access: WARDEN
   */
  getStudentById: async (id) => {
    const res = await api.get(`/users/students/${id}`);
    return res.data.data;
  },

  /**
   * Fetch current authenticated warden's profile.
   * Access: WARDEN
   */
  getWardenProfile: async () => {
    const res = await api.get('/users/warden/profile');
    return res.data.data;
  },

  /**
   * Update current authenticated warden's profile.
   * Access: WARDEN
   */
  updateWardenProfile: async (data) => {
    const res = await api.put('/users/warden/profile', data);
    return res.data.data;
  },

  /**
   * Fetch current authenticated staff's profile.
   * Access: STAFF
   */
  getStaffProfile: async () => {
    const res = await api.get('/users/staff/profile');
    return res.data.data;
  },

  /**
   * Update current authenticated staff's profile.
   * Access: STAFF
   */
  updateStaffProfile: async (data) => {
    const res = await api.put('/users/staff/profile', data);
    return res.data.data;
  },

  /**
   * Fetch list of maintenance staff members.
   * Access: WARDEN
   */
  getStaffMembers: async () => {
    const res = await api.get('/users/staff');
    return res.data.data;
  },

  /**
   * Fetch list of students scoped to warden's hostel.
   * Access: WARDEN
   */
  getStudents: async (params = {}) => {
    const res = await api.get('/users/students', { params });
    return res.data.data;
  },

  /**
   * Provision a new maintenance staff / worker account.
   * Access: WARDEN
   */
  createStaff: async (data) => {
    const res = await api.post('/users/staff', data);
    return res.data.data;
  },

  /**
   * Update an existing staff member's details or active status.
   * Access: WARDEN
   */
  updateStaff: async (id, data) => {
    const res = await api.put(`/users/staff/${id}`, data);
    return res.data.data;
  },

  /**
   * Fetch list of all wardens for directory and management.
   * Access: WARDEN
   */
  getWardens: async () => {
    const res = await api.get('/users/wardens');
    return res.data.data;
  },

  /**
   * Provision a new Warden account.
   * Access: WARDEN
   */
  createWarden: async (data) => {
    const res = await api.post('/users/warden', data);
    return res.data.data;
  },

  /**
   * Update an existing warden's details or active status.
   * Access: WARDEN
   */
  updateWarden: async (id, data) => {
    const res = await api.put(`/users/wardens/${id}`, data);
    return res.data.data;
  },
};

export default userService;
