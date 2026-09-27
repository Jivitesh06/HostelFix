import api from './api';

export const authService = {
  // Public Forgot Password request (dispatches 6-digit OTP to user's email)
  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  // Public Verify Reset OTP (validates 6-digit OTP and returns verificationToken proof)
  verifyResetOtp: async ({ email, otp }) => {
    const res = await api.post('/auth/verify-reset-otp', { email, otp });
    return res.data;
  },

  // Public Resend Reset OTP (with 60-second cooldown rate limit)
  resendResetOtp: async (email) => {
    const res = await api.post('/auth/resend-reset-otp', { email });
    return res.data;
  },

  // Public Reset Password with verified verificationToken proof
  resetPassword: async ({ email, verificationToken, token, newPassword }) => {
    const res = await api.post('/auth/reset-password', {
      email,
      verificationToken: verificationToken || token,
      newPassword,
    });
    return res.data;
  },

  // Authenticated Change Password for logged-in user
  changePassword: async ({ currentPassword, newPassword }) => {
    const res = await api.put('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  },
};

export default authService;
