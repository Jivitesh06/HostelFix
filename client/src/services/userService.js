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
   * Fetch list of maintenance staff members.
   * Access: WARDEN
   */
  getStaffMembers: async () => {
    const res = await api.get('/users/staff');
    return res.data.data;
  },
};

export default userService;
