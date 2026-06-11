import axios from 'axios';
import { toast } from 'sonner';

// Hardcoded production URL to prevent any Vercel environment variable misconfigurations during demo
const api = axios.create({
  baseURL: 'https://unibus-backend-6tm1.onrender.com/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Only toast on successful mutations (POST, PUT, DELETE)
    if (['post', 'put', 'delete'].includes(response.config.method || '') && response.data?.message) {
      toast.success(response.data.message);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized, but skip for admin pages since login is removed
      if (!window.location.pathname.startsWith('/admin')) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error('An unexpected error occurred. Please try again.');
    }
    return Promise.reject(error);
  }
);

export default api;
