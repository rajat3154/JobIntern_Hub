import axios from 'axios';
import store from '../redux/store';

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
    const state = store.getState();
    const token = state.auth.token;
    console.log("Axios request interceptor - token:", token ? "exists" : "none");
    console.log("Request URL:", config.url);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Added Authorization header");
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
      // Clear token on 401 error but don't redirect automatically
      localStorage.removeItem('token');
      console.log('Token cleared due to 401 error');
    }
    return Promise.reject(error);
  }
);

export default api; 