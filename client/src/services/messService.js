import api from './api';

export const messService = {
  // Get weekly mess schedule with feedback/ratings
  getMenu: async () => {
    const res = await api.get('/mess');
    return res.data.data;
  },

  // Warden creates new meal slot
  createMenuItem: async (data) => {
    const res = await api.post('/mess', data);
    return res.data.data;
  },

  // Warden updates meal items
  updateMenuItem: async (id, data) => {
    const res = await api.put(`/mess/${id}`, data);
    return res.data.data;
  },

  // Warden deletes meal slot
  deleteMenuItem: async (id) => {
    const res = await api.delete(`/mess/${id}`);
    return res.data.data;
  },

  // Student submits feedback for a meal
  submitFeedback: async (id, { rating, comment }) => {
    const res = await api.post(`/mess/${id}/feedback`, { rating, comment });
    return res.data.data;
  },

  // Warden retrieves student feedback list
  getFeedback: async () => {
    const res = await api.get('/mess/feedback');
    return res.data.data;
  },
};

export default messService;
