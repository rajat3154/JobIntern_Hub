import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on 401 error
      localStorage.removeItem('token');
      // Optionally redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 