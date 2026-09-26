import axios from 'axios';

let rawApiUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5001/api';

if (rawApiUrl && !rawApiUrl.endsWith('/api') && !rawApiUrl.includes('/api/')) {
  rawApiUrl = `${rawApiUrl.replace(/\/$/, '')}/api`;
}

const BASE_URL = rawApiUrl;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Automatically attach JWT from localStorage to outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hostelfix_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response interceptor: handle 401 (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear expired or invalid token
      localStorage.removeItem('hostelfix_token');

      // Only redirect if not already on an authentication page
      const currentPath = window.location.pathname;
      const isPublicAuthPage = [
        '/login',
        '/register',
        '/verify-email',
        '/forgot-password',
        '/reset-password',
        '/admin/staff-register',
        '/staff-portal/register',
      ].includes(currentPath);

      if (!isPublicAuthPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
