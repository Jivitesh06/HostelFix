import api from './api';

export const authService = {
  // Public Forgot Password request (generic response)
  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  // Public Reset Password with token
  resetPassword: async ({ token, newPassword }) => {
    const res = await api.post('/auth/reset-password', { token, newPassword });
    return res.data;
  },

  // Authenticated Change Password for logged-in user
  changePassword: async ({ currentPassword, newPassword }) => {
    const res = await api.put('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  },
};

export default authService;
